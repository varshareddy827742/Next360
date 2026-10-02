import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Dashboard() {
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD SELLER INFORMATION
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("sellerToken");

    const storedSeller =
      localStorage.getItem("sellerUser");

    // No login session
    if (!token || !storedSeller) {
      navigate("/login");
      return;
    }

    try {
      setSeller(JSON.parse(storedSeller));
    } catch (error) {
      localStorage.removeItem("sellerUser");
      localStorage.removeItem("sellerToken");

      navigate("/login");
      return;
    }

    // Load seller orders
    fetchOrders(token);
  }, [navigate]);

  // =====================================================
  // FETCH SELLER ORDERS
  // =====================================================

  const fetchOrders = async (token) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/orders/seller`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // Token expired
      if (response.status === 401) {
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerUser");

        navigate("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      setError(
        error.message || "Failed to load seller data"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerUser");

    navigate("/login");
  };

  // =====================================================
  // ORDER STATISTICS
  // =====================================================

  const placedOrders = orders.filter(
    (order) =>
      order.orderStatus === "PLACED"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.orderStatus === "SHIPPED"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.orderStatus === "DELIVERED"
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (!seller) {
    return (
      <div style={styles.loading}>
        Loading dashboard...
      </div>
    );
  }

  // =====================================================
  // DASHBOARD UI
  // =====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <header style={styles.header}>

        <div>
          <h1 style={styles.logo}>
            Next360
          </h1>

          <span style={styles.headerSubtitle}>
            Seller Dashboard
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logout}
        >
          Logout
        </button>

      </header>

      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <main style={styles.container}>

        {/* =================================================
            WELCOME
        ================================================= */}

        <div style={styles.welcome}>

          <h2>
            Welcome,{" "}
            {seller.name || "Seller"}!
          </h2>

          <p>
            Manage your products,
            orders and seller
            profile from here.
          </p>

        </div>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* =================================================
            ORDER STATISTICS
        ================================================= */}

        <div style={styles.statsGrid}>

          {/* TOTAL ORDERS */}

          <div style={styles.statCard}>
            <h3>
              Orders
            </h3>

            <p style={styles.statNumber}>
              {orders.length}
            </p>
          </div>

          {/* PLACED */}

          <div style={styles.statCard}>
            <h3>
              Placed
            </h3>

            <p style={styles.statNumber}>
              {placedOrders}
            </p>
          </div>

          {/* SHIPPED */}

          <div style={styles.statCard}>
            <h3>
              Shipped
            </h3>

            <p style={styles.statNumber}>
              {shippedOrders}
            </p>
          </div>

          {/* DELIVERED */}

          <div style={styles.statCard}>
            <h3>
              Delivered
            </h3>

            <p style={styles.statNumber}>
              {deliveredOrders}
            </p>
          </div>

        </div>

        {/* =================================================
            SELLER INFORMATION
        ================================================= */}

        <section style={styles.section}>

          <h2>
            Seller Information
          </h2>

          <div style={styles.infoGrid}>

            {/* NAME */}

            <div>
              <strong>
                Name
              </strong>

              <p>
                {seller.name ||
                  "Not available"}
              </p>
            </div>

            {/* EMAIL */}

            <div>
              <strong>
                Email
              </strong>

              <p>
                {seller.email ||
                  "Not available"}
              </p>
            </div>

            {/* PHONE */}

            <div>
              <strong>
                Phone
              </strong>

              <p>
                {seller.phone ||
                  "Not available"}
              </p>
            </div>

            {/* ROLE */}

            <div>
              <strong>
                Role
              </strong>

              <p>
                {seller.role ||
                  "seller"}
              </p>
            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section style={styles.section}>

          <h2>
            Quick Actions
          </h2>

          <div style={styles.actionsGrid}>

            {/* ADD PRODUCT */}

            <button
              onClick={() =>
                navigate("/add-product")
              }
              style={styles.actionButton}
            >
              ➕ Add Product
            </button>

            {/* MY PRODUCTS */}

            <button
              onClick={() =>
                navigate("/my-products")
              }
              style={styles.actionButton}
            >
              📦 My Products
            </button>

            {/* MY ORDERS */}

            <button
              onClick={() =>
                navigate("/my-orders")
              }
              style={styles.actionButton}
            >
              🛒 My Orders
            </button>

            {/* PROFILE */}

            <button
              onClick={() =>
                navigate("/profile")
              }
              style={styles.actionButton}
            >
              👤 Profile
            </button>

          </div>

        </section>

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <h2>
              Recent Orders
            </h2>

            {orders.length > 0 && (
              <span style={styles.orderCount}>
                {orders.length} Orders
              </span>
            )}

          </div>

          {/* LOADING */}

          {loading && (
            <p>
              Loading orders...
            </p>
          )}

          {/* NO ORDERS */}

          {!loading &&
            orders.length === 0 && (
              <div style={styles.noOrders}>

                <div style={styles.noOrdersIcon}>
                  🛒
                </div>

                <p>
                  No orders found
                  for your products.
                </p>

                <button
                  onClick={() =>
                    navigate("/my-orders")
                  }
                  style={styles.viewOrdersButton}
                >
                  View My Orders
                </button>

              </div>
            )}

          {/* ORDERS */}

          {!loading &&
            orders.length > 0 && (
              <div style={styles.orders}>

                {orders
                  .slice(0, 5)
                  .map((order) => (
                    <div
                      key={order._id}
                      style={styles.orderCard}
                    >

                      <div>

                        <strong>
                          Order #
                          {order._id
                            ? order._id.slice(-6)
                            : "N/A"}
                        </strong>

                        <p>
                          Status:{" "}
                          <span
                            style={
                              styles.orderStatus
                            }
                          >
                            {order.orderStatus}
                          </span>
                        </p>

                      </div>

                      <div style={styles.orderAmount}>

                        <strong>
                          ₹
                          {Number(
                            order.totalAmount || 0
                          ).toLocaleString("en-IN")}
                        </strong>

                      </div>

                    </div>
                  ))}

                {/* VIEW ALL ORDERS */}

                <button
                  onClick={() =>
                    navigate("/my-orders")
                  }
                  style={styles.viewOrdersButton}
                >
                  View All Orders →
                </button>

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7f5",
    fontFamily: "Arial, sans-serif",
  },

  // ---------------------------------------------------
  // HEADER
  // ---------------------------------------------------

  header: {
    background: "#1b5e20",
    color: "#fff",
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    margin: 0,
  },

  headerSubtitle: {
    fontSize: "13px",
    opacity: 0.8,
  },

  logout: {
    background: "#fff",
    color: "#1b5e20",
    border: "none",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  // ---------------------------------------------------
  // MAIN
  // ---------------------------------------------------

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  // ---------------------------------------------------
  // WELCOME
  // ---------------------------------------------------

  welcome: {
    marginBottom: "25px",
  },

  // ---------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2e7d32",
    margin: "10px 0 0",
  },

  // ---------------------------------------------------
  // SECTION
  // ---------------------------------------------------

  section: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  // ---------------------------------------------------
  // SELLER INFORMATION
  // ---------------------------------------------------

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",
    gap: "20px",
  },

  // ---------------------------------------------------
  // QUICK ACTIONS
  // ---------------------------------------------------

  actionsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",
    gap: "15px",
  },

  actionButton: {
    padding: "16px",
    border: "none",
    borderRadius: "9px",
    background: "#2e7d32",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },

  // ---------------------------------------------------
  // ORDERS
  // ---------------------------------------------------

  orders: {
    borderTop: "1px solid #eee",
  },

  orderCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 5px",
    borderBottom: "1px solid #eee",
  },

  orderAmount: {
    fontSize: "17px",
    color: "#1b5e20",
  },

  orderStatus: {
    fontWeight: "bold",
    color: "#2e7d32",
  },

  orderCount: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  noOrders: {
    textAlign: "center",
    padding: "30px",
    color: "#777",
  },

  noOrdersIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  viewOrdersButton: {
    marginTop: "15px",
    padding: "11px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#2e7d32",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  // ---------------------------------------------------
  // ERROR
  // ---------------------------------------------------

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  // ---------------------------------------------------
  // LOADING
  // ---------------------------------------------------

  loading: {
    padding: "50px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
};

export default Dashboard;