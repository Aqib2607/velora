import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingCart, Percent, FileText, Building, ChevronLeft } from "lucide-react";

const adminNav = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Sellers", to: "/admin/sellers", icon: Users },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Commission", to: "/admin/commission", icon: Percent },
  { label: "Audit Logs", to: "/admin/audit-logs", icon: FileText },
  { label: "Tenants", to: "/admin/tenants", icon: Building },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>
        <div className="p-3">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</p>
          <nav className="space-y-1">
            {adminNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === item.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex-1 overflow-auto bg-surface">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
