import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

async function hmacBase64(secret:string,value:string){
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const signature=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value));
 return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function rpcReceipt(supabaseUrl:string,serviceKey:string,orderId:string,receiptToken:string){
 const response=await fetch(`${supabaseUrl}/rest/v1/rpc/get_guest_order_receipt`,{method:"POST",headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,"Content-Type":"application/json"},body:JSON.stringify({p_order_id:orderId,p_receipt_token:receiptToken})});
 if(!response.ok) return null;
 return await response.json();
}

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 const rawBody=await req.text();
 try{
  const supabaseUrl=Deno.env.get("SUPABASE_URL")!;
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const clientId=Deno.env.get("CASHFREE_CLIENT_ID");
  const clientSecret=Deno.env.get("CASHFREE_CLIENT_SECRET");
  const environment=Deno.env.get("CASHFREE_ENVIRONMENT")||"sandbox";
  if(!clientId||!clientSecret) throw new Error("Cashfree credentials are not configured");

  const webhookSignature=req.headers.get("x-webhook-signature");
  if(webhookSignature){
   const timestamp=req.headers.get("x-webhook-timestamp");
   if(!timestamp) return json({error:"Missing webhook timestamp"},401);
   const expected=await hmacBase64(clientSecret,timestamp+rawBody);
   if(expected!==webhookSignature) return json({error:"Invalid webhook signature"},401);
   const payload=JSON.parse(rawBody);
   const gatewayOrderId=payload?.data?.order?.order_id;
   const payment=payload?.data?.payment;
   if(!gatewayOrderId||!payment?.payment_status) return json({error:"Invalid webhook payload"},400);
   const read=await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(gatewayOrderId)}&select=id,total,payment_status`,{headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`}});
   const rows=await read.json();
   const order=rows?.[0];
   if(!order) return json({ok:true,ignored:true});
   const paymentStatus=String(payment.payment_status).toUpperCase();
   if(paymentStatus==="SUCCESS"){
    const amount=Number(payment.payment_amount);
    if(!Number.isFinite(amount)||Math.abs(amount-Number(order.total))>0.01) return json({error:"Payment amount mismatch"},400);
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order.id)}`,{method:"PATCH",headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({payment_status:"paid",payment_transaction_id:String(payment.cf_payment_id||""),payment_gateway_status:paymentStatus,payment_updated_at:new Date().toISOString(),updated_at:new Date().toISOString()})});
   }else if(order.payment_status!=="paid"){
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order.id)}`,{method:"PATCH",headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({payment_transaction_id:payment.cf_payment_id?String(payment.cf_payment_id):null,payment_gateway_status:paymentStatus,payment_updated_at:new Date().toISOString(),updated_at:new Date().toISOString()})});
   }
   return json({ok:true});
  }

  const auth=req.headers.get("Authorization");
  if(!auth) return json({error:"Unauthorized"},401);
  const body=JSON.parse(rawBody||"{}");
  const action=body.action||"create";
  const orderId=String(body.order_id||"");
  const receiptToken=String(body.receipt_token||"");
  if(!orderId||receiptToken.length<32) throw new Error("order_id and receipt_token are required");
  const receipt=await rpcReceipt(supabaseUrl,serviceKey,orderId,receiptToken);
  if(!receipt?.order) return json({error:"Invalid order receipt"},403);
  const order=receipt.order;
  if(order.payment_status==="paid") return json({paid:true,order_id:orderId});

  const gatewayOrderId=`leshe_${orderId.replaceAll("-","")}`;
  const base=environment==="production"?"https://api.cashfree.com/pg/orders":"https://sandbox.cashfree.com/pg/orders";

  if(action==="verify"){
   const cf=await fetch(`${base}/${encodeURIComponent(gatewayOrderId)}`,{headers:{"x-client-id":clientId,"x-client-secret":clientSecret,"x-api-version":"2025-01-01"}});
   const data=await cf.json();
   if(!cf.ok) throw new Error(data?.message||"Cashfree order verification failed");
   const status=String(data?.order_status||"PENDING").toUpperCase();
   if(status==="PAID"){
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,{method:"PATCH",headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({payment_status:"paid",payment_gateway_status:status,payment_updated_at:new Date().toISOString(),updated_at:new Date().toISOString()})});
   }
   return json({order_id:orderId,order_status:status,paid:status==="PAID"});
  }

  if(order.payment_session_id && order.payment_gateway_status==="ACTIVE") return json({order_id:orderId,gateway_order_id:order.gateway_order_id||gatewayOrderId,payment_session_id:order.payment_session_id});
  const siteUrl=Deno.env.get("SITE_URL")||"https://leshesaree.vercel.app";
  const returnUrl=`${siteUrl}/order/${encodeURIComponent(orderId)}?token=${encodeURIComponent(receiptToken)}&payment=verify`;
  const payload={order_id:gatewayOrderId,order_amount:Number(order.total),order_currency:"INR",customer_details:{customer_id:`customer_${orderId.replaceAll("-","")}`,customer_name:order.customer_name,customer_email:order.email,customer_phone:order.phone},order_meta:{return_url:returnUrl,notify_url:`${supabaseUrl}/functions/v1/cashfree-create-order`}};
  const cf=await fetch(base,{method:"POST",headers:{"Content-Type":"application/json","x-client-id":clientId,"x-client-secret":clientSecret,"x-api-version":"2025-01-01","x-idempotency-key":orderId},body:JSON.stringify(payload)});
  const data=await cf.json();
  if(!cf.ok) throw new Error(data?.message||"Cashfree order creation failed");
  await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,{method:"PATCH",headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({payment_provider:"cashfree",gateway_order_id:data.order_id,payment_session_id:data.payment_session_id,payment_gateway_status:"ACTIVE",payment_updated_at:new Date().toISOString()})});
  return json({order_id:orderId,gateway_order_id:data.order_id,payment_session_id:data.payment_session_id});
 }catch(e){return json({error:e instanceof Error?e.message:"Payment initialization failed"},400)}
});
