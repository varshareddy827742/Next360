import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        dashboardResponse,
        ordersResponse,
        productsResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/admin/dashboard`,
          {
            headers,
          }
        ),

        fetch(
          `${API_URL}/api/admin/orders`,
          {
            headers,
          }
        ),

        fetch(
          `${API_URL}/api/admin/products`,
          {
            headers,
          }
        ),
      ]);

      const dashboardData =
        await dashboardResponse.json();

      const ordersData =
        await ordersResponse.json();

      const productsData =
        await productsResponse.json();

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardData.message ||
            "Failed to load dashboard"
        );
      }

      if (!ordersResponse.ok) {
        throw new Error(
          ordersData.message ||
            "Failed to load orders"
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          productsData.message ||
            "Failed to load products"
        );
      }

      setDashboard(
        dashboardData.dashboard ||
          dashboardData
      );

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : ordersData.orders || []
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData.products || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 5);
  }, [orders]);

  /* ==========================================
     ACTION CENTER COUNTS
  ========================================== */

  const pendingOrganicProducts =
    products.filter(
      (product) =>
        product.type === "Organic" &&
        product.verified === false
    );

  const placedOrders =
    orders.filter(
      (order) =>
        order.orderStatus === "PLACED"
    );

  const pendingPaymentOrders =
    orders.filter(
      (order) =>
        order.paymentStatus === "PENDING"
    );

  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(product.stock || 0) === 0
    );

  const actionCount =
    pendingOrganicProducts.length +
    placedOrders.length +
    pendingPaymentOrders.length +
    outOfStockProducts.length;

  const getStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return "placed";

      case "SHIPPED":
        return "shipped";

      case "DELIVERED":
        return "delivered";

      case "CANCELLED":
        return "cancelled";

      default:
        return "";
    }
  };

  const getCustomerName = (order) => {
    return (
      order.customer?.fullName ||
      order.customer?.name ||
      order.customerName ||
      order.name ||
      "-"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>

            <p>
              Next360 Admin Dashboard
            </p>
          </div>
        </div>

        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>

            <p>
              Next360 Admin Dashboard
            </p>
          </div>
        </div>

        <div className="error-box">
          {error}
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
        >
          Try Again
        </button>
      </div>
    );
  }

  const users =
    dashboard?.users || {};

  const productStats =
    dashboard?.products || {};

  const orderStats =
    dashboard?.orders || {};

  const payments =
    dashboard?.payments || {};

  const sales =
    dashboard?.sales || {};

  return (
    <div className="page-container">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="page-header">
        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Overview of your Next360
            marketplace
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* =====================================
          ADMIN ACTION CENTER
      ====================================== */}

      <div className="action-center">

        <div className="action-center-header">

          <div>
            <h2>
              Admin Action Center
            </h2>

            <p>
              Items that may require your
              attention
            </p>
          </div>

          <div className="action-total">
            {actionCount}
            <span>
              pending actions
            </span>
          </div>

        </div>

        <div className="action-alert-grid">

          {/* PENDING ORGANIC */}
          <Link
            to="/pending-approvals"
            className="action-alert-card organic-alert"
          >
            <div className="action-alert-icon">
              ⚠
            </div>

            <div className="action-alert-content">
              <span>
                Pending Organic Approvals
              </span>

              <strong>
                {pendingOrganicProducts.length}
              </strong>

              <small>
                Review Organic products
              </small>
            </div>

            <div className="action-alert-arrow">
              →
            </div>
          </Link>

          {/* PLACED ORDERS */}
          <Link
            to="/orders"
            className="action-alert-card order-alert"
          >
            <div className="action-alert-icon">
              🛒
            </div>

            <div className="action-alert-content">
              <span>
                Orders Awaiting Processing
              </span>

              <strong>
                {placedOrders.length}
              </strong>

              <small>
                Orders currently PLACED
              </small>
            </div>

            <div className="action-alert-arrow">
              →
            </div>
          </Link>

          {/* PENDING PAYMENTS */}
          <Link
            to="/orders"
            className="action-alert-card payment-alert"
          >
            <div className="action-alert-icon">
              ₹
            </div>

            <div className="action-alert-content">
              <span>
                Pending Payments
              </span>

              <strong>
                {pendingPaymentOrders.length}
              </strong>

              <small>
                Payments with PENDING status
              </small>
            </div>

            <div className="action-alert-arrow">
              →
            </div>
          </Link>

          {/* OUT OF STOCK */}
          <Link
            to="/products"
            className="action-alert-card stock-alert"
          >
            <div className="action-alert-icon">
              📦
            </div>

            <div className="action-alert-content">
              <span>
                Out of Stock Products
              </span>

              <strong>
                {outOfStockProducts.length}
              </strong>

              <small>
                Products with zero stock
              </small>
            </div>

            <div className="action-alert-arrow">
              →
            </div>
          </Link>

        </div>
      </div>

      {/* =====================================
          OVERVIEW
      ====================================== */}

      <div className="dashboard-section">

        <div className="section-title">
          <h2>
            Overview
          </h2>

          <span>
            Marketplace summary
          </span>
        </div>

        <div className="dashboard-stat-grid">

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              👥
            </div>

            <div>
              <span>
                Total Users
              </span>

              <strong>
                {users.total || 0}
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              📦
            </div>

            <div>
              <span>
                Total Products
              </span>

              <strong>
                {productStats.total || 0}
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              🛒
            </div>

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {orderStats.total || 0}
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              ₹
            </div>

            <div>
              <span>
                Total Sales
              </span>

              <strong>
                ₹
                {Number(
                  sales.total || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* =====================================
          USERS + PRODUCTS
      ====================================== */}

      <div className="dashboard-two-column">

        {/* USERS */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                User Analytics
              </h2>

              <p>
                Buyer and seller accounts
              </p>
            </div>

          </div>

          <div className="analytics-list">

            <div className="analytics-row">

              <div className="analytics-label">
                <span>
                  Buyers
                </span>

                <strong>
                  {users.buyers || 0}
                </strong>
              </div>

              <div className="analytics-bar">

                <div
                  className="analytics-bar-fill buyer-bar"
                  style={{
                    width: `${
                      users.total
                        ? Math.min(
                            100,
                            (users.buyers /
                              users.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            <div className="analytics-row">

              <div className="analytics-label">
                <span>
                  Sellers
                </span>

                <strong>
                  {users.sellers || 0}
                </strong>
              </div>

              <div className="analytics-bar">

                <div
                  className="analytics-bar-fill seller-bar"
                  style={{
                    width: `${
                      users.total
                        ? Math.min(
                            100,
                            (users.sellers /
                              users.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>
        </div>

        {/* PRODUCTS */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Product Analytics
              </h2>

              <p>
                Product verification
              </p>
            </div>

          </div>

          <div className="analytics-list">

            <div className="analytics-row">

              <div className="analytics-label">
                <span>
                  Verified Products
                </span>

                <strong>
                  {productStats.verified ||
                    0}
                </strong>
              </div>

              <div className="analytics-bar">

                <div
                  className="analytics-bar-fill verified-bar"
                  style={{
                    width: `${
                      productStats.total
                        ? Math.min(
                            100,
                            (productStats.verified /
                              productStats.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            <div className="analytics-row">

              <div className="analytics-label">
                <span>
                  Pending Organic
                </span>

                <strong>
                  {productStats.pendingOrganic ||
                    0}
                </strong>
              </div>

              <div className="analytics-bar">

                <div
                  className="analytics-bar-fill pending-bar"
                  style={{
                    width: `${
                      productStats.total
                        ? Math.min(
                            100,
                            (productStats.pendingOrganic /
                              productStats.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* =====================================
          ORDERS + PAYMENTS
      ====================================== */}

      <div className="dashboard-two-column">

        {/* ORDERS */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Order Analytics
              </h2>

              <p>
                Current order status
              </p>
            </div>

          </div>

          <div className="dashboard-order-grid">

            <div className="dashboard-mini-card placed">
              <span>
                Placed
              </span>

              <strong>
                {orderStats.pending ||
                  0}
              </strong>
            </div>

            <div className="dashboard-mini-card shipped">
              <span>
                Shipped
              </span>

              <strong>
                {orderStats.shipped ||
                  0}
              </strong>
            </div>

            <div className="dashboard-mini-card delivered">
              <span>
                Delivered
              </span>

              <strong>
                {orderStats.delivered ||
                  0}
              </strong>
            </div>

            <div className="dashboard-mini-card cancelled">
              <span>
                Cancelled
              </span>

              <strong>
                {orderStats.cancelled ||
                  0}
              </strong>
            </div>

          </div>
        </div>

        {/* PAYMENTS */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Payment Analytics
              </h2>

              <p>
                Payment processing status
              </p>
            </div>

          </div>

          <div className="dashboard-payment-summary">

            <div className="payment-summary-item">

              <div>
                <span>
                  Paid Payments
                </span>

                <strong>
                  {payments.paid || 0}
                </strong>
              </div>

              <div className="payment-summary-icon paid">
                ✓
              </div>

            </div>

            <div className="payment-summary-item">

              <div>
                <span>
                  Pending Payments
                </span>

                <strong>
                  {payments.pending ||
                    0}
                </strong>
              </div>

              <div className="payment-summary-icon pending">
                !
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* =====================================
          SALES
      ====================================== */}

      <div className="dashboard-panel sales-panel">

        <div className="dashboard-panel-header">

          <div>
            <h2>
              Sales & Commission
            </h2>

            <p>
              Marketplace financial summary
            </p>
          </div>

        </div>

        <div className="sales-grid">

          <div className="sales-card">
            <span>
              Total Sales
            </span>

            <strong>
              ₹
              {Number(
                sales.total || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="sales-card">
            <span>
              Commission Rate
            </span>

            <strong>
              {sales.commissionRate ||
                0}
              %
            </strong>
          </div>

          <div className="sales-card">
            <span>
              Commission
            </span>

            <strong>
              ₹
              {Number(
                sales.commissionAmount ||
                  0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="sales-card">
            <span>
              Seller Earnings
            </span>

            <strong>
              ₹
              {Number(
                sales.sellerEarnings ||
                  0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>
      </div>

      {/* =====================================
          RECENT ORDERS
      ====================================== */}

      <div className="dashboard-panel recent-orders-panel">

        <div className="dashboard-panel-header">

          <div>
            <h2>
              Recent Orders
            </h2>

            <p>
              Latest customer orders
            </p>
          </div>

          <Link
            to="/orders"
            className="dashboard-view-all"
          >
            View All Orders →
          </Link>

        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            No orders available.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>
                </tr>

              </thead>

              <tbody>

                {recentOrders.map(
                  (order) => (
                    <tr
                      key={order._id}
                    >

                      <td>
                        <Link
                          to={`/orders/${order._id}`}
                          className="order-number-link"
                        >
                          {order.orderNumber ||
                            `#${order._id}`}
                        </Link>
                      </td>

                      <td>
                        <strong>
                          {getCustomerName(
                            order
                          )}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            order.totalAmount ||
                              0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        {order.paymentMethod ||
                          "-"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus ||
                            "-"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;