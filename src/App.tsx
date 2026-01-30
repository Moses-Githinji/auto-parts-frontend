import { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useCartStore } from "./stores/cartStore";
import { AppShell } from "./layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { PartDetailPage } from "./pages/PartDetailPage";
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
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { EmailVerificationPage } from "./pages/auth/EmailVerificationPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";

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
      { path: "forgot-password", element: <ResetPasswordPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "parts/:partNumber", element: <PartDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "account/*", element: <AccountPage /> },
      // Vendor routes
      { path: "vendor", element: <VendorDashboardPage /> },
      { path: "vendor/orders", element: <VendorOrdersPage /> },
      { path: "vendor/catalog", element: <VendorCatalogPage /> },
      { path: "vendor/analytics", element: <VendorAnalyticsPage /> },
      { path: "vendor/settings", element: <VendorSettingsPage /> },
      // Admin routes
      { path: "admin", element: <AdminDashboardPage /> },
      { path: "admin/vendors", element: <AdminVendorsPage /> },
      { path: "admin/disputes", element: <AdminDisputesPage /> },
      { path: "admin/reports", element: <AdminReportsPage /> },
    ],
  },
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
      <CartRehydrate />
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
