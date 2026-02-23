import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import SellerLayout from "@/layouts/SellerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Index from "./pages/Index";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import { SellerProducts, SellerOrders, SellerAnalytics, SellerPayouts, SellerApiKeys } from "./pages/seller/SellerPlaceholders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminSellers, AdminOrders, AdminCommission, AdminAuditLogs, AdminTenants } from "./pages/admin/AdminPlaceholders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>

          {/* Seller routes */}
          <Route element={<SellerLayout />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/analytics" element={<SellerAnalytics />} />
            <Route path="/seller/payouts" element={<SellerPayouts />} />
            <Route path="/seller/api-keys" element={<SellerApiKeys />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/sellers" element={<AdminSellers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/commission" element={<AdminCommission />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/tenants" element={<AdminTenants />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
