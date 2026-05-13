import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts & Utility Components
import MainLayout from "@/layouts/MainLayout";
import PremiumLayout from "@/layouts/PremiumLayout";
import SellerLayout from "@/layouts/SellerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import SuspenseFallback from "@/components/routing/SuspenseFallback";
import ScrollToTop from "@/components/routing/ScrollToTop";
import ProtectedRoute from "@/components/routing/ProtectedRoute";

// ==========================================
// LAZY LOADED ROUTE CHUNKS
// ==========================================

// Core Pages
const Index = lazy(() => import("@/pages/Index"));
const PremiumHomePage = lazy(() => import("@/pages/PremiumHomePage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const TodaysDealsPage = lazy(() => import("@/pages/TodaysDealsPage"));

// Corporate / Info Pages (14 Core)
const Careers = lazy(() => import("@/pages/info/Careers"));
const Blog = lazy(() => import("@/pages/info/Blog"));
const About = lazy(() => import("@/pages/info/About"));
const InvestorRelations = lazy(() => import("@/pages/info/InvestorRelations"));
const Technology = lazy(() => import("@/pages/info/Technology"));
const VeloraScience = lazy(() => import("@/pages/info/VeloraScience"));
const SellPage = lazy(() => import("@/pages/info/SellPage"));
const SellBusiness = lazy(() => import("@/pages/info/SellBusiness"));
const CustomerServicePage = lazy(() => import("@/pages/info/CustomerServicePage"));
const RegistryPage = lazy(() => import("@/pages/info/RegistryPage"));
const GiftCardsPage = lazy(() => import("@/pages/info/GiftCardsPage"));
const Advertise = lazy(() => import("@/pages/info/Advertise"));
const Affiliate = lazy(() => import("@/pages/info/Affiliate"));
const SelfPublish = lazy(() => import("@/pages/info/SelfPublish"));
const PickupHub = lazy(() => import("@/pages/info/PickupHub"));
const BusinessCard = lazy(() => import("@/pages/info/BusinessCard"));
const ShopWithPoints = lazy(() => import("@/pages/info/ShopWithPoints"));
const ReloadBalance = lazy(() => import("@/pages/info/ReloadBalance"));
const CurrencyConverter = lazy(() => import("@/pages/info/CurrencyConverter"));
const Account = lazy(() => import("@/pages/info/Account"));
const Orders = lazy(() => import("@/pages/info/Orders"));
const Shipping = lazy(() => import("@/pages/info/Shipping"));
const Returns = lazy(() => import("@/pages/info/Returns"));
const Help = lazy(() => import("@/pages/info/Help"));
const Conditions = lazy(() => import("@/pages/info/Conditions"));
const Privacy = lazy(() => import("@/pages/info/Privacy"));
const DataDisclosure = lazy(() => import("@/pages/info/DataDisclosure"));
const AdPreferences = lazy(() => import("@/pages/info/AdPreferences"));

// Ecosystem Subsidiaries (12)
const VeloraMusic = lazy(() => import("@/pages/info/VeloraMusic"));
const VeloraAds = lazy(() => import("@/pages/info/VeloraAds"));
const VeloraWebServices = lazy(() => import("@/pages/info/VeloraWebServices"));
const VeloraPrime = lazy(() => import("@/pages/info/VeloraPrime"));
const VeloraPublishing = lazy(() => import("@/pages/info/VeloraPublishing"));
const VeloraBusiness = lazy(() => import("@/pages/info/VeloraBusiness"));
const VeloraGlobal = lazy(() => import("@/pages/info/VeloraGlobal"));
const VeloraCloud = lazy(() => import("@/pages/info/VeloraCloud"));
const VeloraStudios = lazy(() => import("@/pages/info/VeloraStudios"));
const VeloraReviews = lazy(() => import("@/pages/info/VeloraReviews"));
const VeloraDevices = lazy(() => import("@/pages/info/VeloraDevices"));
const VeloraSubscriptions = lazy(() => import("@/pages/info/VeloraSubscriptions"));

// Seller Endpoints (Named exports wrapped in default objects)
const SellerDashboard = lazy(() => import("@/pages/seller/SellerDashboard"));
const SellerProducts = lazy(() => import("@/pages/seller/SellerPlaceholders").then(m => ({ default: m.SellerProducts })));
const SellerOrders = lazy(() => import("@/pages/seller/SellerPlaceholders").then(m => ({ default: m.SellerOrders })));
const SellerAnalytics = lazy(() => import("@/pages/seller/SellerPlaceholders").then(m => ({ default: m.SellerAnalytics })));
const SellerPayouts = lazy(() => import("@/pages/seller/SellerPlaceholders").then(m => ({ default: m.SellerPayouts })));
const SellerApiKeys = lazy(() => import("@/pages/seller/SellerPlaceholders").then(m => ({ default: m.SellerApiKeys })));

// Admin Endpoints
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminSellers = lazy(() => import("@/pages/admin/AdminPlaceholders").then(m => ({ default: m.AdminSellers })));
const AdminOrders = lazy(() => import("@/pages/admin/AdminPlaceholders").then(m => ({ default: m.AdminOrders })));
const AdminCommission = lazy(() => import("@/pages/admin/AdminPlaceholders").then(m => ({ default: m.AdminCommission })));
const AdminAuditLogs = lazy(() => import("@/pages/admin/AdminPlaceholders").then(m => ({ default: m.AdminAuditLogs })));
const AdminTenants = lazy(() => import("@/pages/admin/AdminPlaceholders").then(m => ({ default: m.AdminTenants })));


export const AppRouter = () => {
    return (
        <>
            <ScrollToTop />
            <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                    {/* Premium Routes with New Design */}
                    <Route element={<PremiumLayout />}>
                        <Route index element={<PremiumHomePage />} />
                        <Route path="product/:id" element={<ProductDetailPage />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="search" element={<SearchPage />} />
                        <Route path="category/:slug" element={<CategoryPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<LoginPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="deals" element={<TodaysDealsPage />} />

                        {/* Information & Legal Routes */}
                        <Route path="careers" element={<Careers />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="about" element={<About />} />
                        <Route path="investor-relations" element={<InvestorRelations />} />
                        <Route path="technology" element={<Technology />} />
                        <Route path="velora-science" element={<VeloraScience />} />
                        <Route path="sell" element={<SellPage />} />
                        <Route path="sell-business" element={<SellBusiness />} />
                        <Route path="customer-service" element={<CustomerServicePage />} />
                        <Route path="registry" element={<RegistryPage />} />
                        <Route path="gift-cards" element={<GiftCardsPage />} />
                        <Route path="advertise" element={<Advertise />} />
                        <Route path="affiliate" element={<Affiliate />} />
                        <Route path="self-publish" element={<SelfPublish />} />
                        <Route path="pickup-hub" element={<PickupHub />} />
                        <Route path="business-card" element={<BusinessCard />} />
                        <Route path="shop-with-points" element={<ShopWithPoints />} />
                        <Route path="reload-balance" element={<ReloadBalance />} />
                        <Route path="currency-converter" element={<CurrencyConverter />} />
                        <Route path="account" element={<Account />} />
                        <Route path="info/orders" element={<Orders />} />
                        <Route path="shipping" element={<Shipping />} />
                        <Route path="returns" element={<Returns />} />
                        <Route path="help" element={<Help />} />
                        <Route path="conditions" element={<Conditions />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="data-disclosure" element={<DataDisclosure />} />
                        <Route path="ad-preferences" element={<AdPreferences />} />

                        {/* Ecosystem Subsidiaries */}
                        <Route path="velora-music" element={<VeloraMusic />} />
                        <Route path="velora-ads" element={<VeloraAds />} />
                        <Route path="velora-web-services" element={<VeloraWebServices />} />
                        <Route path="velora-prime" element={<VeloraPrime />} />
                        <Route path="velora-publishing" element={<VeloraPublishing />} />
                        <Route path="velora-business" element={<VeloraBusiness />} />
                        <Route path="velora-global" element={<VeloraGlobal />} />
                        <Route path="velora-cloud" element={<VeloraCloud />} />
                        <Route path="velora-studios" element={<VeloraStudios />} />
                        <Route path="velora-reviews" element={<VeloraReviews />} />
                        <Route path="velora-devices" element={<VeloraDevices />} />
                        <Route path="velora-subscriptions" element={<VeloraSubscriptions />} />
                    </Route>

                    {/* Public Top-Level Routes (Legacy) */}
                    <Route path="/legacy" element={<MainLayout />}>
                        <Route index element={<Index />} />
                        <Route path="product/:id" element={<ProductDetailPage />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="search" element={<SearchPage />} />
                        <Route path="category/:slug" element={<CategoryPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<LoginPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="deals" element={<TodaysDealsPage />} />

                        {/* Testing Route */}
                        <Route path="route-test" element={<div>Test Route Works</div>} />
                    </Route>

                    {/* Secure Seller Area */}
                    <Route element={<ProtectedRoute role="seller"><SellerLayout /></ProtectedRoute>}>
                        <Route path="seller/dashboard" element={<SellerDashboard />} />
                        <Route path="seller/products" element={<SellerProducts />} />
                        <Route path="seller/orders" element={<SellerOrders />} />
                        <Route path="seller/analytics" element={<SellerAnalytics />} />
                        <Route path="seller/payouts" element={<SellerPayouts />} />
                        <Route path="seller/api-keys" element={<SellerApiKeys />} />
                    </Route>

                    {/* Secure Admin Area */}
                    <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                        <Route path="admin/dashboard" element={<AdminDashboard />} />
                        <Route path="admin/sellers" element={<AdminSellers />} />
                        <Route path="admin/orders" element={<AdminOrders />} />
                        <Route path="admin/commission" element={<AdminCommission />} />
                        <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
                        <Route path="admin/tenants" element={<AdminTenants />} />
                    </Route>

                    {/* Fallback Reference */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </>
    );
};

export default AppRouter;
