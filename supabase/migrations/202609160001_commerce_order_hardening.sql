-- LE SHE SAREE commerce hardening
-- Keeps authenticated orders linked to the customer and makes promotion rules authoritative.
-- Also exposes shipment/payment fields through the secure guest receipt.

-- The live project already contains these functions; keep this file as the source-of-truth
-- migration for the hardened definitions applied to Supabase.

CREATE OR REPLACE FUNCTION public.place_order_with_promo(p_customer_name text, p_email text, p_phone text, p_address text, p_city text, p_pin_code text, p_items jsonb, p_promo_code text DEFAULT NULL::text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
declare v_order uuid; v_sub numeric:=0; v_discount numeric:=0; v_shipping numeric:=0; v_item jsonb; v_product products%rowtype; v_qty integer; v_size text; v_campaign marketing_campaigns%rowtype; v_receipt_token text := encode(gen_random_bytes(32),'hex'); v_customer_id uuid := auth.uid(); v_campaign_uses integer:=0; v_customer_uses integer:=0;
begin
if coalesce(trim(p_customer_name),'')='' or coalesce(trim(p_email),'')='' or coalesce(trim(p_phone),'')='' or coalesce(trim(p_address),'')='' or coalesce(trim(p_city),'')='' or coalesce(trim(p_pin_code),'')='' then raise exception 'Customer details are required'; end if;
if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Cart is empty'; end if;
for v_item in select value from jsonb_array_elements(p_items) loop
 v_qty:=coalesce((v_item->>'quantity')::integer,0); if v_qty<1 then raise exception 'Invalid quantity'; end if;
 select * into v_product from public.products where id=(v_item->>'product_id')::uuid and is_active=true for update;
 if not found then raise exception 'Product is unavailable'; end if;
 if v_product.stock<v_qty then raise exception 'Insufficient stock for %',v_product.name; end if;
 v_size:=nullif(trim(v_item->>'size'),''); if v_size is not null and cardinality(v_product.sizes)>0 and not(v_size=any(v_product.sizes)) then raise exception 'Invalid size for %',v_product.name; end if;
 v_sub:=v_sub+(v_product.price*v_qty);
end loop;
if coalesce(trim(p_promo_code),'')<>'' then
 select * into v_campaign from public.marketing_campaigns where upper(code)=upper(trim(p_promo_code)) and is_active=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now()) order by priority asc,created_at desc limit 1;
 if not found then raise exception 'Invalid or expired promotion code'; end if;
 if v_sub < coalesce(v_campaign.minimum_order_amount,0) then raise exception 'Minimum order amount for this promotion is %',v_campaign.minimum_order_amount; end if;
 if v_campaign.usage_limit is not null then select count(*)::int into v_campaign_uses from public.orders where discount_code=upper(trim(p_promo_code)) and status<>'cancelled'; if v_campaign_uses>=v_campaign.usage_limit then raise exception 'This promotion has reached its usage limit'; end if; end if;
 if v_campaign.per_customer_limit is not null then
   if v_customer_id is not null then select count(*)::int into v_customer_uses from public.orders where discount_code=upper(trim(p_promo_code)) and customer_id=v_customer_id and status<>'cancelled';
   else select count(*)::int into v_customer_uses from public.orders where discount_code=upper(trim(p_promo_code)) and lower(email)=lower(trim(p_email)) and status<>'cancelled'; end if;
   if v_customer_uses>=v_campaign.per_customer_limit then raise exception 'This promotion has reached its limit for this customer'; end if;
 end if;
 v_discount:=round(greatest(0,least(v_sub,coalesce(v_campaign.maximum_discount_amount,v_sub),v_sub*coalesce(v_campaign.discount_percent,0)/100)),2);
end if;
insert into public.orders(customer_id,customer_name,email,phone,address,city,pin_code,status,payment_status,subtotal,shipping_fee,total,discount_code,discount_amount,receipt_token_hash) values(v_customer_id,trim(p_customer_name),trim(p_email),trim(p_phone),trim(p_address),trim(p_city),trim(p_pin_code),'pending','pending',v_sub,v_shipping,v_sub-v_discount+v_shipping,case when coalesce(trim(p_promo_code),'')='' then null else upper(trim(p_promo_code)) end,v_discount,encode(digest(v_receipt_token,'sha256'),'hex')) returning id into v_order;
for v_item in select value from jsonb_array_elements(p_items) loop
 v_qty:=(v_item->>'quantity')::integer; v_size:=nullif(trim(v_item->>'size'),'');
 select * into v_product from public.products where id=(v_item->>'product_id')::uuid and is_active=true for update;
 insert into public.order_items(order_id,product_id,product_name,quantity,unit_price,size) values(v_order,v_product.id,v_product.name,v_qty,v_product.price,v_size);
 update public.products set stock=stock-v_qty,updated_at=now() where id=v_product.id;
end loop;
return jsonb_build_object('id',v_order,'receipt_token',v_receipt_token);
end; $function$;

CREATE OR REPLACE FUNCTION public.get_guest_order_receipt(p_order_id uuid, p_receipt_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
declare v_order jsonb; v_items jsonb;
begin
if coalesce(length(trim(p_receipt_token)),0)<32 then raise exception 'Invalid receipt token'; end if;
select jsonb_build_object('id',o.id,'customer_name',o.customer_name,'status',o.status,'payment_status',o.payment_status,'subtotal',o.subtotal,'shipping_fee',o.shipping_fee,'total',o.total,'discount_code',o.discount_code,'discount_amount',o.discount_amount,'created_at',o.created_at,'updated_at',o.updated_at,'shipping_provider',o.shipping_provider,'tracking_number',o.tracking_number,'tracking_url',o.tracking_url,'estimated_delivery',o.estimated_delivery,'shipped_at',o.shipped_at,'delivered_at',o.delivered_at) into v_order from public.orders o where o.id=p_order_id and o.receipt_token_hash=encode(digest(p_receipt_token,'sha256'),'hex');
if v_order is null then raise exception 'Order receipt not found'; end if;
select coalesce(jsonb_agg(jsonb_build_object('id',oi.id,'product_name',oi.product_name,'quantity',oi.quantity,'unit_price',oi.unit_price,'size',oi.size) order by oi.created_at),'[]'::jsonb) into v_items from public.order_items oi where oi.order_id=p_order_id;
return jsonb_build_object('order',v_order,'items',v_items);
end; $function$;