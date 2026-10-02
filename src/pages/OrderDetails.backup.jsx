import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5001";

const ORDER_STATUSES = [
  "PLACED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("adminToken");

  // =====================================================
  // FETCH ORDER
  // =====================================================

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch order"
        );
      }

      setOrder(data.order || data);
    } catch (err) {
      setError(
        err.message || "Failed to fetch order"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getOrderNumber = () => {
    return (
      order?.orderNumber ||
      order?.orderId ||
      order?._id ||
      "-"
    );
  };

  const getCustomerName = () => {
    return (
      order?.customer?.fullName ||
      order?.customer?.name ||
      order?.customerName ||
      order?.user?.name ||
      order?.buyer?.name ||
      "-"
    );
  };

  const getCustomerEmail = () => {
    return (
      order?.customer?.email ||
      order?.customerEmail ||
      order?.user?.email ||
      order?.buyer?.email ||
      "-"
    );
  };

  const getCustomerPhone = () => {
    return (
      order?.customer?.phone ||
      order?.customerPhone ||
      order?.user?.phone ||
      order?.buyer?.phone ||
      "-"
    );
  };

  const getAddress = () => {
    const customer = order?.customer || {};

    return {
      fullName:
        customer.fullName ||
        customer.name ||
        order?.customerName ||
        "-",

      phone:
        customer.phone ||
        order?.customerPhone ||
        "-",

      address:
        customer.address ||
        order?.address ||
        order?.deliveryAddress?.address ||
        "-",

      city:
        customer.city ||
        order?.city ||
        order?.deliveryAddress?.city ||
        "-",

      pincode:
        customer.pincode ||
        order?.pincode ||
        order?.deliveryAddress?.pincode ||
        "-",
    };
  };

  const getItems = () => {
    if (Array.isArray(order?.items)) {
      return order.items;
    }

    if (Array.isArray(order?.products)) {
      return order.products;
    }

    return [];
  };

  const getItemName = (item) => {
    return (
      item?.name ||
      item?.productName ||
      item?.product?.name ||
      "-"
    );
  };

  const getItemSeller = (item) => {
    return (
      item?.seller ||
      item?.sellerName ||
      item?.seller?.name ||
      "-"
    );
  };

  const getItemPrice = (item) => {
    return Number(
      item?.price ??
        item?.unitPrice ??
        item?.product?.price ??
        0
    );
  };

  const getItemQuantity = (item) => {
    return Number(item?.quantity || 1);
  };

  const getItemTotal = (item) => {
    return (
      getItemPrice(item) *
      getItemQuantity(item)
    );
  };

  const getPaymentMethod = () => {
    return (
      order?.paymentMethod ||
      order?.payment?.method ||
      "-"
    );
  };

  const getPaymentStatus = () => {
    return (
      order?.paymentStatus ||
      order?.payment?.status ||
      "PENDING"
    );
  };

  const getOrderStatus = () => {
    return (
      order?.orderStatus ||
      order?.status ||
      "PLACED"
    );
  };

  const getSubtotal = () => {
    if (order?.subtotal !== undefined) {
      return Number(order.subtotal);
    }

    return getItems().reduce(
      (total, item) =>
        total + getItemTotal(item),
      0
    );
  };

  const getDeliveryCharge = () => {
    return Number(
      order?.deliveryCharge ??
        order?.shippingCharge ??
        order?.deliveryFee ??
        0
    );
  };

  const getTotal = () => {
    return Number(
      order?.totalAmount ??
        order?.total ??
        order?.grandTotal ??
        getSubtotal() +
          getDeliveryCharge()
    );
  };

  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (status) => {
    return String(status)
      .toLowerCase()
      .replace(/ /g, "-");
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (newStatus) => {
    const currentStatus =
      getOrderStatus();

    if (newStatus === currentStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Change order status from ${currentStatus} to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `${API_URL}/api/admin/orders/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update order status"
        );
      }

      setOrder((previousOrder) => ({
        ...previousOrder,
        orderStatus: newStatus,
        status: newStatus,
      }));

      alert(
        `Order status updated to ${newStatus}.`
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Loading order details...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="page-container">

        <div className="page-header">
          <div>
            <h1>
              Order Details
            </h1>

            <p>
              Unable to load the order.
            </p>
          </div>
        </div>

        <div className="error-box">
          {error}
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/orders")
          }
        >
          Back to Orders
        </button>

      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Order not found.
        </div>
      </div>
    );
  }

  const address = getAddress();
  const items = getItems();
  const orderStatus = getOrderStatus();
  const paymentStatus =
    getPaymentStatus();

  return (
    <div className="page-container">

      {/* BREADCRUMB */}

      <div className="breadcrumb">
        <Link to="/orders">
          Orders
        </Link>

        <span>
          /
        </span>

        <span>
          {getOrderNumber()}
        </span>
      </div>

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>
            Order {getOrderNumber()}
          </h1>

          <p>
            Placed on{" "}
            {formatDateTime(
              order.createdAt ||
                order.orderDate ||
                order.date
            )}
          </p>
        </div>

        <div className="order-details-header-actions">

          <button
            className="secondary-button"
            onClick={fetchOrder}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/orders")
            }
          >
            Back to Orders
          </button>

        </div>

      </div>

      {/* STATUS / PAYMENT SUMMARY */}

      <div className="order-detail-summary-grid">

        <div className="order-detail-summary-card">

          <span>
            Order Status
          </span>

          <strong
            className={`order-status-badge ${getStatusClass(
              orderStatus
            )}`}
          >
            {orderStatus}
          </strong>

        </div>

        <div className="order-detail-summary-card">

          <span>
            Payment Method
          </span>

          <strong>
            {getPaymentMethod()}
          </strong>

        </div>

        <div className="order-detail-summary-card">

          <span>
            Payment Status
          </span>

          <strong
            className={`payment-status-badge ${getStatusClass(
              paymentStatus
            )}`}
          >
            {paymentStatus}
          </strong>

        </div>

        <div className="order-detail-summary-card">

          <span>
            Order Total
          </span>

          <strong>
            {formatCurrency(
              getTotal()
            )}
          </strong>

        </div>

      </div>

      {/* STATUS MANAGEMENT */}

      <div className="details-card">

        <div className="details-card-header">

          <div>
            <h2>
              Order Status Management
            </h2>

            <p>
              Update the current order
              delivery status.
            </p>
          </div>

        </div>

        <div className="order-status-management">

          <div>
            <label>
              Current Status
            </label>

            <span
              className={`order-status-badge ${getStatusClass(
                orderStatus
              )}`}
            >
              {orderStatus}
            </span>
          </div>

          <div>
            <label>
              Change Status
            </label>

            <select
              value={orderStatus}
              disabled={updating}
              onChange={(event) =>
                updateStatus(
                  event.target.value
                )
              }
            >

              {ORDER_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>
          </div>

        </div>

      </div>

      {/* TWO COLUMN AREA */}

      <div className="details-two-column">

        {/* CUSTOMER */}

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Customer Information
              </h2>

              <p>
                Customer associated
                with this order.
              </p>
            </div>

          </div>

          <div className="details-list">

            <div className="details-row">

              <span>
                Full Name
              </span>

              <strong>
                {getCustomerName()}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Email
              </span>

              <strong>
                {getCustomerEmail()}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Phone
              </span>

              <strong>
                {getCustomerPhone()}
              </strong>

            </div>

          </div>

        </div>

        {/* DELIVERY ADDRESS */}

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Delivery Address
              </h2>

              <p>
                Address used for
                this order.
              </p>
            </div>

          </div>

          <div className="details-list">

            <div className="details-row">

              <span>
                Name
              </span>

              <strong>
                {address.fullName}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Phone
              </span>

              <strong>
                {address.phone}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Address
              </span>

              <strong>
                {address.address}
              </strong>

            </div>

            <div className="details-row">

              <span>
                City
              </span>

              <strong>
                {address.city}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Pincode
              </span>

              <strong>
                {address.pincode}
              </strong>

            </div>

          </div>

        </div>

      </div>

      {/* ORDER ITEMS */}

      <div className="details-card">

        <div className="details-card-header">

          <div>
            <h2>
              Ordered Products
            </h2>

            <p>
              Products included in
              this order.
            </p>
          </div>

          <strong>
            {items.length} product
            {items.length === 1
              ? ""
              : "s"}
          </strong>

        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            No products found for
            this order.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Seller
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(
                  (item, index) => (
                    <tr
                      key={
                        item._id ||
                        item.productId ||
                        index
                      }
                    >

                      <td>

                        <strong>
                          {getItemName(
                            item
                          )}
                        </strong>

                      </td>

                      <td>
                        {getItemSeller(
                          item
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          getItemPrice(
                            item
                          )
                        )}
                      </td>

                      <td>
                        {getItemQuantity(
                          item
                        )}
                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            getItemTotal(
                              item
                            )
                          )}
                        </strong>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ORDER SUMMARY */}

      <div className="details-card">

        <div className="details-card-header">

          <div>
            <h2>
              Order Summary
            </h2>

            <p>
              Complete payment
              breakdown.
            </p>
          </div>

        </div>

        <div className="order-summary-details">

          <div>
            <span>
              Subtotal
            </span>

            <strong>
              {formatCurrency(
                getSubtotal()
              )}
            </strong>
          </div>

          <div>
            <span>
              Delivery Charge
            </span>

            <strong>
              {formatCurrency(
                getDeliveryCharge()
              )}
            </strong>
          </div>

          <div className="order-summary-total">

            <span>
              Total
            </span>

            <strong>
              {formatCurrency(
                getTotal()
              )}
            </strong>

          </div>

        </div>

      </div>

      {/* PAYMENT INFORMATION */}

      <div className="details-card">

        <div className="details-card-header">

          <div>
            <h2>
              Payment Information
            </h2>

            <p>
              Payment details
              associated with this
              order.
            </p>
          </div>

        </div>

        <div className="details-list">

          <div className="details-row">

            <span>
              Payment Method
            </span>

            <strong>
              {getPaymentMethod()}
            </strong>

          </div>

          <div className="details-row">

            <span>
              Payment Status
            </span>

            <strong
              className={`payment-status-badge ${getStatusClass(
                paymentStatus
              )}`}
            >
              {paymentStatus}
            </strong>

          </div>

          {order.payment?.transactionId && (
            <div className="details-row">

              <span>
                Transaction ID
              </span>

              <strong className="id-value">
                {
                  order.payment
                    .transactionId
                }
              </strong>

            </div>
          )}

          {order.payment?.createdAt && (
            <div className="details-row">

              <span>
                Payment Date
              </span>

              <strong>
                {formatDateTime(
                  order.payment
                    .createdAt
                )}
              </strong>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default OrderDetails;