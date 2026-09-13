import Link from "next/link";

const nav = [
  ["Dashboard", "/admin"],
  ["Products", "/admin/products"],
  ["Categories", "/admin/categories"],
  ["Inventory", "/admin/inventory"],
  ["Orders", "/admin/orders"],
  ["Customers", "/admin/customers"],
  ["Website / CMS", "/admin/cms"],
  ["Settings", "/admin/settings"],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-logo" href="/">LE SHE<br/><span>SAREE</span></Link><div className="admin-kicker">CONTROL ROOM / 2026</div><nav>{nav.map(([label, href]) => <Link key={href} href={href}>{label}<b>↗</b></Link>)}</nav><Link className="admin-store" href="/">View store →</Link></aside><main className="admin-main">{children}</main></div>;
}
