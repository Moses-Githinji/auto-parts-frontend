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
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";

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
      { path: "search", element: <SearchPage /> },
      { path: "parts/:partNumber", element: <PartDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "account/*", element: <AccountPage /> },
      { path: "vendor/*", element: <VendorDashboardPage /> },
      { path: "admin/*", element: <AdminDashboardPage /> },
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
