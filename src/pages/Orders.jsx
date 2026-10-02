import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5001";

const ORDER_STATUSES = [
  "PLACED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("all");

  // Sorting
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("adminToken");

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch orders"
        );
      }

      setOrders(
        Array.isArray(data)
          ? data
          : data.orders || []
      );
    } catch (err) {
      setError(
        err.message || "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const getOrderId = (order) => {
    return (
      order.orderNumber ||
      order.orderId ||
      order._id ||
      "-"
    );
  };

  const getCustomerName = (order) => {
    return (
      order.customer?.fullName ||
      order.customer?.name ||
      order.customerName ||
      order.user?.name ||
      order.buyer?.name ||
      "-"
    );
  };

  const getCustomerEmail = (order) => {
    return (
      order.customer?.email ||
      order.customerEmail ||
      order.user?.email ||
      order.buyer?.email ||
      "-"
    );
  };

  const getCustomerPhone = (order) => {
    return (
      order.customer?.phone ||
      order.customerPhone ||
      order.user?.phone ||
      order.buyer?.phone ||
      "-"
    );
  };

  const getOrderTotal = (order) => {
    return Number(
      order.totalAmount ??
        order.total ??
        order.grandTotal ??
        0
    );
  };

  const getPaymentMethod = (order) => {
    return (
      order.paymentMethod ||
      order.payment?.method ||
      "-"
    );
  };

  const getPaymentStatus = (order) => {
    return (
      order.paymentStatus ||
      order.payment?.status ||
      "PENDING"
    );
  };

  const getOrderStatus = (order) => {
    return (
      order.orderStatus ||
      order.status ||
      "PLACED"
    );
  };

  const getOrderItems = (order) => {
    if (Array.isArray(order.items)) {
      return order.items;
    }

    if (Array.isArray(order.products)) {
      return order.products;
    }

    return [];
  };

  const getProductNames = (order) => {
    const items = getOrderItems(order);

    if (items.length === 0) {
      return "-";
    }

    return items
      .map(
        (item) =>
          item.name ||
          item.productName ||
          item.product?.name ||
          "-"
      )
      .filter(Boolean)
      .join(", ");
  };

  const getItemCount = (order) => {
    const items = getOrderItems(order);

    return items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 1),
      0
    );
  };

  const getOrderDate = (order) => {
    return (
      order.createdAt ||
      order.orderDate ||
      order.date ||
      null
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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

  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const updateOrderStatus = async (
    orderId,
    currentStatus,
    newStatus
  ) => {
    if (currentStatus === newStatus) {
      return;
    }

    const confirmed =
      window.confirm(
        `Change order status from ${currentStatus} to ${newStatus}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          // IMPORTANT:
          // Backend expects "orderStatus"
          body: JSON.stringify({
            orderStatus: newStatus,
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

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order._id === orderId
                ? {
                    ...order,
                    orderStatus: newStatus,
                    status: newStatus,
                  }
                : order
          )
      );

      alert(
        `Order status updated to ${newStatus}.`
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update order status"
      );
    }
  };

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredOrders = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    const filtered = orders.filter(
      (order) => {
        const orderId =
          getOrderId(order)
            .toString()
            .toLowerCase();

        const customerName =
          getCustomerName(order)
            .toLowerCase();

        const customerEmail =
          getCustomerEmail(order)
            .toLowerCase();

        const customerPhone =
          getCustomerPhone(order)
            .toLowerCase();

        const productNames =
          getProductNames(order)
            .toLowerCase();

        const paymentMethod =
          getPaymentMethod(order)
            .toString()
            .toLowerCase();

        const paymentStatus =
          getPaymentStatus(order)
            .toString()
            .toLowerCase();

        const orderStatus =
          getOrderStatus(order)
            .toString()
            .toLowerCase();

        const matchesSearch =
          !search ||
          orderId.includes(search) ||
          customerName.includes(search) ||
          customerEmail.includes(search) ||
          customerPhone.includes(search) ||
          productNames.includes(search);

        const matchesStatus =
          statusFilter === "all" ||
          getOrderStatus(order) ===
            statusFilter;

        const matchesPaymentMethod =
          paymentMethodFilter ===
            "all" ||
          paymentMethod.toUpperCase() ===
            paymentMethodFilter.toUpperCase();

        const matchesPaymentStatus =
          paymentStatusFilter ===
            "all" ||
          paymentStatus.toUpperCase() ===
            paymentStatusFilter.toUpperCase();

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPaymentMethod &&
          matchesPaymentStatus
        );
      }
    );

    return [...filtered].sort(
      (a, b) => {
        switch (sortBy) {
          case "oldest":
            return (
              new Date(
                getOrderDate(a) || 0
              ) -
              new Date(
                getOrderDate(b) || 0
              )
            );

          case "amount-low":
            return (
              getOrderTotal(a) -
              getOrderTotal(b)
            );

          case "amount-high":
            return (
              getOrderTotal(b) -
              getOrderTotal(a)
            );

          case "customer":
            return getCustomerName(
              a
            ).localeCompare(
              getCustomerName(b)
            );

          case "newest":
          default:
            return (
              new Date(
                getOrderDate(b) || 0
              ) -
              new Date(
                getOrderDate(a) || 0
              )
            );
        }
      }
    );
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentMethodFilter,
    paymentStatusFilter,
    sortBy,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
        itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedOrders =
    filteredOrders.slice(
      startIndex,
      endIndex
    );

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setPaymentStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalOrders =
    orders.length;

  const placedOrders =
    orders.filter(
      (order) =>
        getOrderStatus(order) ===
        "PLACED"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        getOrderStatus(order) ===
        "SHIPPED"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        getOrderStatus(order) ===
        "DELIVERED"
    ).length;

  const cancelledOrders =
    orders.filter(
      (order) =>
        getOrderStatus(order) ===
        "CANCELLED"
    ).length;

  const paidOrders =
    orders.filter(
      (order) =>
        getPaymentStatus(order).toUpperCase() ===
        "PAID"
    ).length;

  const pendingPayments =
    orders.filter(
      (order) =>
        getPaymentStatus(order).toUpperCase() ===
        "PENDING"
    ).length;

  const totalSales =
    orders
      .filter(
        (order) =>
          getOrderStatus(order) !==
          "CANCELLED"
      )
      .reduce(
        (total, order) =>
          total +
          getOrderTotal(order),
        0
      );

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    return status
      .toLowerCase()
      .replace(/ /g, "-");
  };

  const getPaymentStatusClass = (
    status
  ) => {
    return status
      .toLowerCase()
      .replace(/ /g, "-");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>
            Orders
          </h1>

          <p>
            Manage customer orders,
            payments and delivery status.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">
          <strong>
            {totalOrders}
          </strong>
          <span>
            Total Orders
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {placedOrders}
          </strong>
          <span>
            Placed
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {shippedOrders}
          </strong>
          <span>
            Shipped
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {deliveredOrders}
          </strong>
          <span>
            Delivered
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {cancelledOrders}
          </strong>
          <span>
            Cancelled
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {paidOrders}
          </strong>
          <span>
            Paid
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {pendingPayments}
          </strong>
          <span>
            Pending Payments
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {formatCurrency(
              totalSales
            )}
          </strong>
          <span>
            Total Sales
          </span>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}

      <div className="filter-card">

        <div className="filter-header">

          <div>
            <h2>
              Search & Filters
            </h2>

            <p>
              Search orders and filter
              by status and payment.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>

        <div className="order-filter-grid">

          {/* Search */}

          <div className="filter-field order-search-field">

            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Order ID, customer, phone or product..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            />

          </div>

          {/* Order Status */}

          <div className="filter-field">

            <label>
              Order Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >
              <option value="all">
                All Statuses
              </option>

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

          {/* Payment Method */}

          <div className="filter-field">

            <label>
              Payment Method
            </label>

            <select
              value={
                paymentMethodFilter
              }
              onChange={(event) => {
                setPaymentMethodFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option value="all">
                All Methods
              </option>

              <option value="COD">
                Cash on Delivery
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="WALLET">
                Wallet
              </option>

            </select>

          </div>

          {/* Payment Status */}

          <div className="filter-field">

            <label>
              Payment Status
            </label>

            <select
              value={
                paymentStatusFilter
              }
              onChange={(event) => {
                setPaymentStatusFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option value="all">
                All Payment Status
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="FAILED">
                Failed
              </option>

            </select>

          </div>

          {/* Sort */}

          <div className="filter-field">

            <label>
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="amount-high">
                Amount High to Low
              </option>

              <option value="amount-low">
                Amount Low to High
              </option>

              <option value="customer">
                Customer A-Z
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* ORDERS TABLE */}

      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>
              All Orders
            </h2>

            <p>
              Showing{" "}
              {filteredOrders.length}{" "}
              matching orders.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading orders...
          </div>
        ) : filteredOrders.length ===
          0 ? (
          <div className="empty-state">

            <p>
              No orders match the
              selected filters.
            </p>

            <button
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        ) : (
          <>

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
                      Products
                    </th>

                    <th>
                      Items
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Order Status
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedOrders.map(
                    (order) => {
                      const orderStatus =
                        getOrderStatus(
                          order
                        );

                      const paymentStatus =
                        getPaymentStatus(
                          order
                        );

                      return (
                        <tr
                          key={
                            order._id
                          }
                        >

                          {/* ORDER */}

                          <td>

                            <Link
                              to={`/orders/${order._id}`}
                              className="order-number-link"
                            >
                              {getOrderId(
                                order
                              )}
                            </Link>

                          </td>

                          {/* CUSTOMER */}

                          <td>

                            <div className="customer-cell">

                              <strong>
                                {getCustomerName(
                                  order
                                )}
                              </strong>

                              <span>
                                {getCustomerEmail(
                                  order
                                )}
                              </span>

                              <span>
                                {getCustomerPhone(
                                  order
                                )}
                              </span>

                            </div>

                          </td>

                          {/* PRODUCTS */}

                          <td>

                            <div className="order-products-cell">

                              <span>
                                {getProductNames(
                                  order
                                )}
                              </span>

                            </div>

                          </td>

                          {/* ITEMS */}

                          <td>
                            {getItemCount(
                              order
                            )}
                          </td>

                          {/* TOTAL */}

                          <td>

                            <strong>
                              {formatCurrency(
                                getOrderTotal(
                                  order
                                )
                              )}
                            </strong>

                          </td>

                          {/* PAYMENT */}

                          <td>

                            <div className="payment-cell">

                              <span>
                                {getPaymentMethod(
                                  order
                                )}
                              </span>

                              <span
                                className={`payment-status-badge ${getPaymentStatusClass(
                                  paymentStatus
                                )}`}
                              >
                                {
                                  paymentStatus
                                }
                              </span>

                            </div>

                          </td>

                          {/* ORDER STATUS */}

                          <td>

                            <div className="order-status-cell">

                              <span
                                className={`order-status-badge ${getStatusClass(
                                  orderStatus
                                )}`}
                              >
                                {
                                  orderStatus
                                }
                              </span>

                              <select
                                value={
                                  orderStatus
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateOrderStatus(
                                    order._id,
                                    orderStatus,
                                    event
                                      .target
                                      .value
                                  )
                                }
                              >

                                {ORDER_STATUSES.map(
                                  (
                                    status
                                  ) => (
                                    <option
                                      key={
                                        status
                                      }
                                      value={
                                        status
                                      }
                                    >
                                      {
                                        status
                                      }
                                    </option>
                                  )
                                )}

                              </select>

                            </div>

                          </td>

                          {/* DATE */}

                          <td>

                            <span
                              title={formatDateTime(
                                getOrderDate(
                                  order
                                )
                              )}
                            >
                              {formatDate(
                                getOrderDate(
                                  order
                                )
                              )}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td>

                            <Link
                              to={`/orders/${order._id}`}
                              className="view-button"
                            >
                              View
                            </Link>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            <div className="pagination-container">

              <div className="pagination-info">

                Showing{" "}

                <strong>
                  {startIndex + 1}
                </strong>

                {" - "}

                <strong>
                  {Math.min(
                    endIndex,
                    filteredOrders.length
                  )}
                </strong>

                {" of "}

                <strong>
                  {filteredOrders.length}
                </strong>

              </div>

              <div className="pagination-controls">

                <button
                  className="pagination-button"
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  onClick={() =>
                    goToPage(
                      safeCurrentPage -
                        1
                    )
                  }
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`pagination-number ${
                      page ===
                      safeCurrentPage
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      goToPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="pagination-button"
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    goToPage(
                      safeCurrentPage +
                        1
                    )
                  }
                >
                  Next
                </button>

              </div>

              <div className="items-per-page">

                <label>
                  Per page
                </label>

                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(
                      Number(
                        event.target.value
                      )
                    );
                    setCurrentPage(1);
                  }}
                >

                  <option value="5">
                    5
                  </option>

                  <option value="10">
                    10
                  </option>

                  <option value="20">
                    20
                  </option>

                  <option value="50">
                    50
                  </option>

                </select>

              </div>

            </div>

          </>
        )}

      </div>

    </div>
  );
}

export default Orders;