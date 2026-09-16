"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import AdminGuard from "./AdminGuard";
import {getSupabaseBrowserClient} from "@/lib/supabase-browser";
import "./admin-final-polish.css";
import "./admin-storefront.css";
import "./admin-ui-v2.css";
import "./admin-readable.css";
import "./admin-final-readable.css";

const nav=[["Dashboard","/admin"],["Products","/admin/products"],["Categories","/admin/categories"],["Inventory","/admin/inventory"],["Orders","/admin/orders"],["Customers","/admin/customers"],["Marketing","/admin/marketing"],["Reviews","/admin/reviews"],["Payments","/admin/payments"],["Shipping","/admin/shipping"],["SEO / Analytics","/admin/analytics"],["Website / CMS","/admin/cms"],["Settings","/admin/settings"]];

export default function AdminLayout({children}:{children:React.ReactNode}){
 const pathname=usePathname(); const router=useRouter();
 const publicAdminRoute=pathname==="/admin/login"||pathname==="/admin/auth/callback";
 if(publicAdminRoute)return <>{children}</>;
 async function signOut(){const s=getSupabaseBrowserClient();if(s)await s.auth.signOut();router.replace("/admin/login");}
 return <AdminGuard><div className="admin-shell"><aside className="admin-sidebar"><div className="admin-sidebar-top"><Link className="admin-logo" href="/">LE SHE<br/><span>SAREE</span></Link><button className="admin-mobile-close" aria-label="Close menu">×</button></div><div className="admin-kicker">CONTROL ROOM / 2026</div><nav aria-label="Admin navigation">{nav.map(([label,href],index)=>{const active=href==="/admin"?pathname==="/admin":pathname.startsWith(href);return <Link className={active?"active":""} key={href} href={href}><span className="nav-number">{String(index+1).padStart(2,"0")}</span><span>{label}</span><b>↗</b></Link>})}</nav><div className="admin-sidebar-actions"><Link className="admin-store" href="/">View store →</Link><button className="admin-signout" onClick={signOut}>Sign out <span>↗</span></button></div></aside><main className="admin-main"><div className="admin-mobile-bar"><Link href="/" className="admin-mobile-logo">LE SHE / <b>SAREE</b></Link><span>CONTROL ROOM</span></div>{children}</main></div></AdminGuard>;
}
