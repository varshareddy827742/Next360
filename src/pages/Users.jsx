import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch users"
        );
      }

      setUsers(
        Array.isArray(data)
          ? data
          : data.users || []
      );
    } catch (err) {
      setError(
        err.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserStatus = async (
    userId,
    currentStatus
  ) => {
    const newStatus = !currentStatus;

    const actionText = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this user?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/status`,
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
            "Failed to update user status"
        );
      }

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: newStatus,
              }
            : user
        )
      );

      alert(
        `User ${
          newStatus
            ? "activated"
            : "deactivated"
        } successfully.`
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update user status"
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

  const getRoleClass = (role) => {
    switch (role) {
      case "admin":
        return "admin";

      case "seller":
        return "seller";

      case "buyer":
        return "buyer";

      default:
        return "";
    }
  };

  /*
   * Search + Filters
   */
  const filteredUsers = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name
          ?.toLowerCase()
          .includes(search) ||
        user.email
          ?.toLowerCase()
          .includes(search) ||
        user.phone
          ?.toLowerCase()
          .includes(search);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.isActive) ||
        (statusFilter === "inactive" &&
          !user.isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
  ]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
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

  const paginatedUsers =
    filteredUsers.slice(
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

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (
    value
  ) => {
    setItemsPerPage(
      Number(value)
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "admin"
  ).length;

  const sellerUsers = users.filter(
    (user) => user.role === "seller"
  ).length;

  const buyerUsers = users.filter(
    (user) => user.role === "buyer"
  ).length;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1>Users</h1>

          <p>
            Manage all Next360 user
            accounts.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchUsers}
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
            {totalUsers}
          </strong>
          <span>Total Users</span>
        </div>

        <div className="summary-card">
          <strong>
            {activeUsers}
          </strong>
          <span>Active</span>
        </div>

        <div className="summary-card">
          <strong>
            {inactiveUsers}
          </strong>
          <span>Inactive</span>
        </div>

        <div className="summary-card">
          <strong>
            {adminUsers}
          </strong>
          <span>Admins</span>
        </div>

        <div className="summary-card">
          <strong>
            {sellerUsers}
          </strong>
          <span>Sellers</span>
        </div>

        <div className="summary-card">
          <strong>
            {buyerUsers}
          </strong>
          <span>Buyers</span>
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
              Find users by name,
              email, phone, role or
              status.
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

          <div className="filter-field search-field">

            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Search name, email or phone..."
              value={searchTerm}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value
                )
              }
            />

          </div>

          <div className="filter-field">

            <label>
              Role
            </label>

            <select
              value={roleFilter}
              onChange={(event) =>
                handleRoleChange(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Roles
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="seller">
                Seller
              </option>

              <option value="buyer">
                Buyer
              </option>
            </select>

          </div>

          <div className="filter-field">

            <label>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(
                  event.target.value
                )
              }
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

      {/* Users Table */}
      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>
              All Users
            </h2>

            <p>
              Showing{" "}
              {filteredUsers.length}{" "}
              matching users.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">

            <p>
              No users match the
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedUsers.map(
                    (user) => (
                      <tr
                        key={user._id}
                      >

                        <td>
                          <Link
                            to={`/users/${user._id}`}
                            className="user-name-link"
                          >
                            {user.name ||
                              "-"}
                          </Link>
                        </td>

                        <td>
                          {user.email ||
                            "-"}
                        </td>

                        <td>
                          {user.phone ||
                            "-"}
                        </td>

                        <td>
                          <span
                            className={`role-badge ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {user.role ||
                              "Unknown"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`user-status-badge ${
                              user.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {user.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        <td>
                          <div className="table-actions">

                            <Link
                              to={`/users/${user._id}`}
                              className="view-button"
                            >
                              View
                            </Link>

                            <button
                              className={
                                user.isActive
                                  ? "danger-button small"
                                  : "activate-button small"
                              }
                              onClick={() =>
                                updateUserStatus(
                                  user._id,
                                  user.isActive
                                )
                              }
                            >
                              {user.isActive
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
                    filteredUsers.length
                  )}
                </strong>
                {" of "}
                <strong>
                  {filteredUsers.length}
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
                  onChange={(event) =>
                    handleItemsPerPageChange(
                      event.target.value
                    )
                  }
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

export default Users;