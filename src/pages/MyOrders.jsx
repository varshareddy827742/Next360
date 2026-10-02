import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const token = localStorage.getItem("sellerToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/orders/seller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

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
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerUser");
        navigate("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update order"
        );
      }

      alert(
        `Order status updated to ${newStatus}`
      );

      await fetchOrders();
    } catch (error) {
      alert(
        error.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "PLACED") return "placed";
    if (status === "SHIPPED") return "shipped";
    if (status === "DELIVERED") return "delivered";
    if (status === "CANCELLED") return "cancelled";

    return "";
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading Orders...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              My Orders
            </h1>

            <p style={styles.subtitle}>
              Manage orders containing your products
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div style={styles.empty}>
            <h2>No Orders Yet</h2>

            <p>
              Orders containing your products
              will appear here.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div style={styles.orders}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={styles.orderCard}
              >

                <div style={styles.orderHeader}>
                  <div>
                    <h2 style={styles.orderId}>
                      Order #
                      {order._id.slice(-6).toUpperCase()}
                    </h2>

                    <p style={styles.date}>
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={getStatusClass(
                      order.orderStatus
                    )}
                    style={{
                      ...styles.status,
                      ...getStatusStyle(
                        order.orderStatus
                      ),
                    }}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div style={styles.section}>
                  <h3>Customer Details</h3>

                  <p>
                    <strong>Name:</strong>{" "}
                    {order.customer?.fullName ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {order.customer?.phone ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {order.customer?.address ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>City:</strong>{" "}
                    {order.customer?.city ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Pincode:</strong>{" "}
                    {order.customer?.pincode ||
                      "N/A"}
                  </p>
                </div>

                <div style={styles.section}>
                  <h3>Your Products</h3>

                  {order.items
                    ?.filter(
                      (item) =>
                        item.sellerId
                          ?.toString() ===
                        JSON.parse(
                          localStorage.getItem(
                            "sellerUser"
                          ) || "{}"
                        )._id
                    )
                    .map((item, index) => (
                      <div
                        key={index}
                        style={styles.product}
                      >
                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <p>
                            Quantity:{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <strong>
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                </div>

                <div style={styles.summary}>
                  <div>
                    <span>
                      Payment:
                    </span>

                    <strong>
                      {order.paymentMethod}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment Status:
                    </span>

                    <strong>
                      {order.paymentStatus}
                    </strong>
                  </div>

                  <div style={styles.total}>
                    <span>
                      Order Total:
                    </span>

                    <strong>
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div style={styles.actions}>
                  <h3>
                    Update Order Status
                  </h3>

                  <div style={styles.buttons}>

                    {order.orderStatus ===
                      "PLACED" && (
                      <button
                        style={
                          styles.shipButton
                        }
                        disabled={
                          updatingOrderId ===
                          order._id
                        }
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "SHIPPED"
                          )
                        }
                      >
                        {updatingOrderId ===
                        order._id
                          ? "Updating..."
                          : "MARK AS SHIPPED"}
                      </button>
                    )}

                    {order.orderStatus ===
                      "SHIPPED" && (
                      <button
                        style={
                          styles.deliveredButton
                        }
                        disabled={
                          updatingOrderId ===
                          order._id
                        }
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "DELIVERED"
                          )
                        }
                      >
                        {updatingOrderId ===
                        order._id
                          ? "Updating..."
                          : "MARK AS DELIVERED"}
                      </button>
                    )}

                    {order.orderStatus ===
                      "DELIVERED" && (
                      <div
                        style={
                          styles.completed
                        }
                      >
                        ✓ Order Delivered
                      </div>
                    )}

                    {order.orderStatus ===
                      "CANCELLED" && (
                      <div
                        style={
                          styles.cancelled
                        }
                      >
                        Order Cancelled
                      </div>
                    )}

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const getStatusStyle = (status) => {
  if (status === "PLACED") {
    return {
      background: "#fff3cd",
      color: "#856404",
    };
  }

  if (status === "SHIPPED") {
    return {
      background: "#cfe2ff",
      color: "#084298",
    };
  }

  if (status === "DELIVERED") {
    return {
      background: "#d1e7dd",
      color: "#0f5132",
    };
  }

  if (status === "CANCELLED") {
    return {
      background: "#f8d7da",
      color: "#842029",
    };
  }

  return {};
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f5",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    color: "#1b5e20",
  },

  subtitle: {
    color: "#666",
    marginTop: "8px",
  },

  backButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#333",
    color: "#fff",
    cursor: "pointer",
  },

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  empty: {
    background: "#fff",
    padding: "50px",
    textAlign: "center",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  orders: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  orderCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow:
      "0 2px 12px rgba(0,0,0,0.08)",
  },

  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },

  orderId: {
    margin: 0,
    color: "#333",
  },

  date: {
    color: "#777",
    fontSize: "14px",
  },

  status: {
    padding: "7px 13px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  section: {
    marginTop: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  },

  product: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    background: "#f8f8f8",
    borderRadius: "8px",
    marginBottom: "8px",
  },

  summary: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  total: {
    fontSize: "18px",
    paddingTop: "10px",
    borderTop: "1px solid #ddd",
  },

  actions: {
    marginTop: "25px",
  },

  buttons: {
    marginTop: "12px",
  },

  shipButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#1976d2",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  deliveredButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#2e7d32",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  completed: {
    padding: "12px",
    color: "#2e7d32",
    fontWeight: "bold",
  },

  cancelled: {
    padding: "12px",
    color: "#c62828",
    fontWeight: "bold",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
};

export default MyOrders;
