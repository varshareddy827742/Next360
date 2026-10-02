import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("adminToken");

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/buyers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch buyers"
        );
      }

      setBuyers(
        Array.isArray(data)
          ? data
          : data.buyers || []
      );
    } catch (err) {
      setError(
        err.message || "Failed to fetch buyers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const updateBuyerStatus = async (
    buyerId,
    currentStatus
  ) => {
    const newStatus = !currentStatus;

    const actionText = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this buyer?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${buyerId}/status`,
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
            "Failed to update buyer status"
        );
      }

      setBuyers((previousBuyers) =>
        previousBuyers.map((buyer) =>
          buyer._id === buyerId
            ? {
                ...buyer,
                isActive: newStatus,
              }
            : buyer
        )
      );

      alert(
        `Buyer ${
          newStatus
            ? "activated"
            : "deactivated"
        } successfully.`
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update buyer status"
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
  const filteredBuyers = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return buyers.filter((buyer) => {
      const matchesSearch =
        !search ||
        buyer.name
          ?.toLowerCase()
          .includes(search) ||
        buyer.email
          ?.toLowerCase()
          .includes(search) ||
        buyer.phone
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          buyer.isActive) ||
        (statusFilter === "inactive" &&
          !buyer.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    buyers,
    searchTerm,
    statusFilter,
  ]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBuyers.length /
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

  const paginatedBuyers =
    filteredBuyers.slice(
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

  const totalBuyers = buyers.length;

  const activeBuyers = buyers.filter(
    (buyer) => buyer.isActive
  ).length;

  const inactiveBuyers = buyers.filter(
    (buyer) => !buyer.isActive
  ).length;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1>Buyers</h1>

          <p>
            Manage all Next360 buyer
            accounts.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchBuyers}
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
            {totalBuyers}
          </strong>

          <span>
            Total Buyers
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {activeBuyers}
          </strong>

          <span>
            Active Buyers
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {inactiveBuyers}
          </strong>

          <span>
            Inactive Buyers
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
              Find buyers by name,
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
              placeholder="Search buyer name, email or phone..."
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

      {/* Buyers Table */}
      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>
              All Buyers
            </h2>

            <p>
              Showing{" "}
              {filteredBuyers.length}{" "}
              matching buyers.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading buyers...
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="empty-state">

            <p>
              No buyers match the
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
                      Buyer Name
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

                  {paginatedBuyers.map(
                    (buyer) => (
                      <tr
                        key={buyer._id}
                      >

                        <td>

                          <Link
                            to={`/buyers/${buyer._id}`}
                            className="user-name-link"
                          >
                            {buyer.name ||
                              "-"}
                          </Link>

                        </td>

                        <td>
                          {buyer.email ||
                            "-"}
                        </td>

                        <td>
                          {buyer.phone ||
                            "-"}
                        </td>

                        <td>

                          <span
                            className={`user-status-badge ${
                              buyer.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {buyer.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        <td>
                          {formatDate(
                            buyer.createdAt
                          )}
                        </td>

                        <td>

                          <div className="table-actions">

                            <Link
                              to={`/buyers/${buyer._id}`}
                              className="view-button"
                            >
                              View
                            </Link>

                            <button
                              className={
                                buyer.isActive
                                  ? "danger-button small"
                                  : "activate-button small"
                              }
                              onClick={() =>
                                updateBuyerStatus(
                                  buyer._id,
                                  buyer.isActive
                                )
                              }
                            >
                              {buyer.isActive
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
                    filteredBuyers.length
                  )}
                </strong>

                {" of "}

                <strong>
                  {filteredBuyers.length}
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

export default Buyers;