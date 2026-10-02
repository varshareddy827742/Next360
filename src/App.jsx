import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";

import Sellers from "./pages/Sellers";
import SellerDetails from "./pages/SellerDetails";

import Buyers from "./pages/Buyers";
import BuyerDetails from "./pages/BuyerDetails";

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

import PendingApprovals from "./pages/PendingApprovals";

import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";


/* =========================
   Protected Route
========================= */

function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("adminToken");

  const adminUser =
    localStorage.getItem("adminUser");

  if (!token || !adminUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  try {
    const user =
      JSON.parse(adminUser);

    if (user.role !== "admin") {
      localStorage.removeItem(
        "adminToken"
      );

      localStorage.removeItem(
        "adminUser"
      );

      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }
  } catch (error) {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUser"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


/* =========================
   App
========================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Users
        ========================= */}

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UserDetails />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Sellers
        ========================= */}

        <Route
          path="/sellers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Sellers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sellers/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SellerDetails />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Buyers
        ========================= */}

        <Route
          path="/buyers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Buyers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyers/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <BuyerDetails />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Products
        ========================= */}

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Products />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProductDetails />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Pending Approvals
        ========================= */}

        <Route
          path="/pending-approvals"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PendingApprovals />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Orders
        ========================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Orders />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <OrderDetails />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        {/* Unknown Route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;