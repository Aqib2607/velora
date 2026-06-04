import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import {
    BarChart3, Users, DollarSign, Settings, ShoppingCart, Menu, X,
    Home, Shield, ChevronLeft, FileText, Building2, Activity
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { icon: Home, label: "Dashboard", to: "/admin/dashboard" },
    { icon: Users, label: "Sellers", to: "/admin/sellers" },
    { icon: ShoppingCart, label: "Orders", to: "/admin/orders" },
    { icon: DollarSign, label: "Commission", to: "/admin/commission" },
    { icon: FileText, label: "Audit Logs", to: "/admin/audit-logs" },
    { icon: Building2, label: "Tenants", to: "/admin/tenants" },
    { icon: Settings, label: "Settings", to: "/admin/settings" },
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-surface">
            {/* ── Sidebar — Desktop ─────────────────── */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/80 backdrop-blur-sm sticky top-0 h-screen">
                {/* Brand */}
                <div className="p-6 border-b border-border/50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 rounded-2xl bg-foreground flex items-center justify-center shadow-sm">
                            <Shield className="h-5 w-5 text-background" />
                        </div>
                        <div>
                            <span className="font-display font-bold text-lg">Admin</span>
                            <p className="text-[10px] text-muted-foreground tracking-widest uppercase -mt-0.5">Control Center</p>
                        </div>
                    </Link>
                </div>

                {/* System Status */}
                <div className="px-6 py-3 border-b border-border/50 flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse-subtle" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">All systems operational</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">Menu</p>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-foreground/5 text-foreground border-l-2 border-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-border/50">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Store
                    </Link>
                </div>
            </aside>

            {/* ── Sidebar — Mobile ───────────────────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            className="fixed left-0 top-0 bottom-0 w-72 bg-card z-50 lg:hidden shadow-lg"
                            initial={{ x: -288 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ type: "spring", damping: 30 }}
                        >
                            <div className="p-5 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-foreground flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-background" />
                                    </div>
                                    <span className="font-display font-bold">Admin</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-muted/50">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <nav className="p-4 space-y-1">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.to;
                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-foreground/5 text-foreground"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main Content ───────────────────────── */}
            <main className="flex-1 min-w-0">
                <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="font-display font-bold text-sm">Admin Panel</span>
                </div>

                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
