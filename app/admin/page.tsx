const stats = [
  ["12", "Products"], ["04", "Categories"], ["00", "Orders today"], ["₹ 0", "Revenue today"],
];
const queue = ["Products", "Categories", "Inventory", "Orders", "Customers", "Homepage / CMS"];

export default function AdminDashboard() {
  return <div className="admin-dashboard"><header className="admin-header"><div><span>01 — DASHBOARD</span><h1>GOOD<br/><i>MORNING.</i></h1></div><div className="admin-status"><span className="status-dot"/> SYSTEM READY<br/><small>SUPABASE / CONNECTOR PENDING</small></div></header><section className="stat-grid">{stats.map(([value,label])=><div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</section><section className="admin-section"><div className="admin-section-title"><span>QUICK CONTROL</span><span>STORE / CORE</span></div><div className="control-list">{queue.map((item,index)=><a href={`/admin/${item.toLowerCase().replaceAll(" ","-").replace("/","-")}`} key={item}><span>0{index+1}</span><strong>{item}</strong><b>→</b></a>)}</div></section><section className="admin-note"><span>NEXT LAYER</span><p>Connect Supabase to turn this control room into the live source for products, stock, orders, customers and the animated storefront.</p></section></div>;
}
