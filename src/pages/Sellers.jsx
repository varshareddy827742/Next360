import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("adminToken");

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/sellers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch sellers"
        );
      }

      setSellers(
        Array.isArray(data)
          ? data
          : data.sellers || []
      );
    } catch (err) {
      setError(
        err.message || "Failed to fetch sellers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const updateSellerStatus = async (
    sellerId,
    currentStatus
  ) => {
    const newStatus = !currentStatus;

    const actionText = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this seller?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${sellerId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update seller status"
        );
      }

      setSellers((previousSellers) =>
        previousSellers.map((seller) =>
          seller._id === sellerId
            ? {
                ...seller,
                isActive: newStatus,
              }
            : seller
        )
      );

      alert(
        `Seller ${
          newStatus
            ? "activated"
            : "deactivated"
        } successfully.`
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update seller status"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN"
    );
  };

  /*
   * Search and filtering
   */
  const filteredSellers = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return sellers.filter((seller) => {
      const matchesSearch =
        !search ||
        seller.name
          ?.toLowerCase()
          .includes(search) ||
        seller.email
          ?.toLowerCase()
          .includes(search) ||
        seller.phone
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          seller.isActive) ||
        (statusFilter === "inactive" &&
          !seller.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    sellers,
    searchTerm,
    statusFilter,
  ]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSellers.length /
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

  const paginatedSellers =
    filteredSellers.slice(
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const totalSellers = sellers.length;

  const activeSellers = sellers.filter(
    (seller) => seller.isActive
  ).length;

  const inactiveSellers = sellers.filter(
    (seller) => !seller.isActive
  ).length;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1>Sellers</h1>

          <p>
            Manage all Next360 seller
            accounts.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchSellers}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="summary-grid">

        <div className="summary-card">
          <strong>
            {totalSellers}
          </strong>

          <span>
            Total Sellers
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {activeSellers}
          </strong>

          <span>
            Active Sellers
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {inactiveSellers}
          </strong>

          <span>
            Inactive Sellers
          </span>
        </div>

      </div>

      {/* Search & Filters */}
      <div className="filter-card">

        <div className="filter-header">

          <div>
            <h2>
              Search & Filters
            </h2>

            <p>
              Find sellers by name,
              email, phone or status.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>

        <div className="filter-grid">

          <div className="filter-field">

            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Search seller name, email or phone..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            />

          </div>

          <div className="filter-field">

            <label>
              Status
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
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* Seller Table */}
      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>
              All Sellers
            </h2>

            <p>
              Showing{" "}
              {filteredSellers.length}{" "}
              matching sellers.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading sellers...
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="empty-state">

            <p>
              No sellers match the
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
                      Seller Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {paginatedSellers.map(
                    (seller) => (
                      <tr
                        key={seller._id}
                      >

                        <td>
                          <Link
                            to={`/sellers/${seller._id}`}
                            className="user-name-link"
                          >
                            {seller.name ||
                              "-"}
                          </Link>
                        </td>

                        <td>
                          {seller.email ||
                            "-"}
                        </td>

                        <td>
                          {seller.phone ||
                            "-"}
                        </td>

                        <td>

                          <span
                            className={`user-status-badge ${
                              seller.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {seller.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        <td>
                          {formatDate(
                            seller.createdAt
                          )}
                        </td>

                        <td>

                          <div className="table-actions">

                            <Link
                              to={`/sellers/${seller._id}`}
                              className="view-button"
                            >
                              View
                            </Link>

                            <button
                              className={
                                seller.isActive
                                  ? "danger-button small"
                                  : "activate-button small"
                              }
                              onClick={() =>
                                updateSellerStatus(
                                  seller._id,
                                  seller.isActive
                                )
                              }
                            >
                              {seller.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Pagination */}
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
                    filteredSellers.length
                  )}
                </strong>

                {" of "}

                <strong>
                  {filteredSellers.length}
                </strong>

              </div>

              <div className="pagination-controls">

                <button
                  className="pagination-button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    goToPage(
                      safeCurrentPage - 1
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
                      safeCurrentPage + 1
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

export default Sellers;