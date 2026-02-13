import { useEffect } from "react";
import { NotificationProvider } from "./components/providers/NotificationProvider";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useCartStore } from "./stores/cartStore";
import { AppShell } from "./layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import ProductDetailPage from "./pages/parts/[id]";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { AccountPage } from "./pages/account/AccountPage";
import { VendorDashboardPage } from "./pages/vendor/VendorDashboardPage";
import { VendorOrdersPage } from "./pages/vendor/VendorOrdersPage";
import { VendorCatalogPage } from "./pages/vendor/VendorCatalogPage";
import { VendorAnalyticsPage } from "./pages/vendor/VendorAnalyticsPage";
import { VendorSettingsPage } from "./pages/vendor/VendorSettingsPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminVendorsPage } from "./pages/admin/AdminVendorsPage";
import { AdminDisputesPage } from "./pages/admin/AdminDisputesPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminEarningsPage } from "./pages/admin/AdminEarningsPage";
import { AdminDeliveryReportsPage } from "./pages/admin/AdminDeliveryReportsPage";
import { AdminIntegrationsPage } from "./pages/admin/AdminIntegrationsPage";
import { AdminWebhooksPage } from "./pages/admin/AdminWebhooksPage";
import { AdminBlogsPage } from "./pages/admin/AdminBlogsPage";
import { AdminCommissionConfigPage } from "./pages/admin/AdminCommissionConfigPage";
import { AdminRidersPage } from "./pages/admin/AdminRidersPage";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { EmailVerificationPage } from "./pages/auth/EmailVerificationPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { TrackingPage } from "./pages/TrackingPage";

import { DeliveryDashboardPage } from "./pages/delivery/DeliveryDashboardPage";
import { ActiveDeliveriesPage } from "./pages/delivery/ActiveDeliveriesPage";
import { QRScannerPage } from "./pages/delivery/QRScannerPage";
import { DeliveryHistoryPage } from "./pages/delivery/DeliveryHistoryPage";
import { BlogListPage } from "./pages/blog/BlogListPage";
import { BlogPostPage } from "./pages/blog/BlogPostPage";
import { PaymentStatusPage } from "./pages/PaymentStatusPage";
import { VendorEarningsPage } from "./pages/vendor/VendorEarningsPage";
import { AdminCommissionsPage } from "./pages/admin/AdminCommissionsPage";
import { AdminFinancesPage } from "./pages/admin/AdminFinancesPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppShell>
        <Outlet />
      </AppShell>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "email-verification", element: <EmailVerificationPage /> },
      { path: "verify-email", element: <EmailVerificationPage /> },
      { path: "forgot-password", element: <ResetPasswordPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "parts/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "payment/status/:transactionId", element: <PaymentStatusPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:orderId/confirm", element: <OrderConfirmationPage /> },
      { path: "account/*", element: <AccountPage /> },
      // Blog routes
      { path: "blog", element: <BlogListPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      // Vendor routes
      { path: "vendor", element: <VendorDashboardPage /> },
      { path: "vendor/orders", element: <VendorOrdersPage /> },
      { path: "vendor/catalog", element: <VendorCatalogPage /> },
      { path: "vendor/analytics", element: <VendorAnalyticsPage /> },
      { path: "vendor/earnings", element: <VendorEarningsPage /> },
      { path: "vendor/settings", element: <VendorSettingsPage /> },
      // Admin routes
      { path: "admin", element: <AdminDashboardPage /> },
      { path: "admin/vendors", element: <AdminVendorsPage /> },
      { path: "admin/riders", element: <AdminRidersPage /> },
      { path: "admin/disputes", element: <AdminDisputesPage /> },
      { path: "admin/reports", element: <AdminReportsPage /> },
      { path: "admin/earnings", element: <AdminEarningsPage /> },
      { path: "admin/commissions", element: <AdminCommissionsPage /> },
      { path: "admin/finances", element: <AdminFinancesPage /> },
      { path: "admin/delivery-reports", element: <AdminDeliveryReportsPage /> },
      { path: "admin/blogs", element: <AdminBlogsPage /> },
      // Commission Settings route
      {
        path: "admin/commission-config",
        element: <AdminCommissionConfigPage />,
      },
      // Integrations routes (with dropdown)
      {
        path: "admin/integrations",
        element: <AdminIntegrationsPage />,
        children: [
          { index: true, element: <AdminWebhooksPage /> },
          { path: "webhooks", element: <AdminWebhooksPage /> },
        ],
      },
      // Delivery routes
      { path: "delivery", element: <DeliveryDashboardPage /> },
      { path: "delivery/active", element: <ActiveDeliveriesPage /> },
      { path: "delivery/history", element: <DeliveryHistoryPage /> },
      { path: "delivery/scan", element: <QRScannerPage /> },
    ],
  },
  // Tracking route (public - no AppShell)
  { path: "/tracking/:trackingId", element: <TrackingPage /> },
]);

function CartRehydrate() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <CartRehydrate />
        <SpeedInsights />
        <RouterProvider router={router} />
      </NotificationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
