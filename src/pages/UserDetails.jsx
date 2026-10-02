import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5001";

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const token = localStorage.getItem("adminToken");

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch user details"
        );
      }

      setUser(
        data.user || data
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to fetch user details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const updateStatus = async () => {
    if (!user) {
      return;
    }

    const newStatus = !user.isActive;

    const actionText = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingStatus(true);

      const response = await fetch(
        `${API_URL}/api/admin/users/${id}/status`,
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
            "Failed to update account status"
        );
      }

      setUser(
        data.user || {
          ...user,
          isActive: newStatus,
        }
      );

      alert(
        `Account ${
          newStatus
            ? "activated"
            : "deactivated"
        } successfully.`
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update account status"
      );
    } finally {
      setUpdatingStatus(false);
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

    return parsedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
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

  if (loading) {
    return (
      <div className="page-container">

        <div className="page-header">

          <div>
            <h1>
              User Details
            </h1>

            <p>
              Loading account information...
            </p>
          </div>

        </div>

        <div className="dashboard-loading">
          Loading user...
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">

        <div className="page-header">

          <div>
            <h1>
              User Details
            </h1>

            <p>
              Unable to load this account.
            </p>
          </div>

        </div>

        <div className="error-box">
          {error}
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/users")}
        >
          ← Back to Users
        </button>

      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">

        <div className="empty-state">
          User not found.
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/users")}
        >
          ← Back to Users
        </button>

      </div>
    );
  }

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <div className="breadcrumb">
            <Link to="/users">
              Users
            </Link>

            <span>
              /
            </span>

            <span>
              User Details
            </span>
          </div>

          <h1>
            User Details
          </h1>

          <p>
            View and manage account information.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/users")}
        >
          ← Back to Users
        </button>

      </div>

      {/* PROFILE HEADER */}

      <div className="user-profile-header">

        <div className="user-avatar">
          {user.name
            ? user.name
                .charAt(0)
                .toUpperCase()
            : "U"}
        </div>

        <div className="user-profile-main">

          <h2>
            {user.name || "Unknown User"}
          </h2>

          <p>
            {user.email || "-"}
          </p>

          <div className="user-profile-badges">

            <span
              className={`role-badge ${getRoleClass(
                user.role
              )}`}
            >
              {user.role || "unknown"}
            </span>

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

          </div>

        </div>

        <div className="user-profile-action">

          <button
            className={
              user.isActive
                ? "danger-button"
                : "activate-button"
            }
            onClick={updateStatus}
            disabled={updatingStatus}
          >
            {updatingStatus
              ? "Updating..."
              : user.isActive
              ? "Deactivate Account"
              : "Activate Account"}
          </button>

        </div>

      </div>

      {/* BASIC INFORMATION */}

      <div className="details-two-column">

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Basic Information
              </h2>

              <p>
                Personal account information
              </p>
            </div>

          </div>

          <div className="details-list">

            <div className="details-row">
              <span>
                Full Name
              </span>

              <strong>
                {user.name || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Email
              </span>

              <strong>
                {user.email || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Phone
              </span>

              <strong>
                {user.phone || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Role
              </span>

              <strong>
                {user.role || "-"}
              </strong>
            </div>

          </div>

        </div>

        {/* ACCOUNT */}

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Account Information
              </h2>

              <p>
                Account status and dates
              </p>
            </div>

          </div>

          <div className="details-list">

            <div className="details-row">
              <span>
                Account Status
              </span>

              <strong>
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
              </strong>
            </div>

            <div className="details-row">
              <span>
                User ID
              </span>

              <strong className="id-value">
                {user._id || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Created
              </span>

              <strong>
                {formatDate(
                  user.createdAt
                )}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Last Updated
              </span>

              <strong>
                {formatDate(
                  user.updatedAt
                )}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* ADDRESS */}

      <div className="details-card address-card">

        <div className="details-card-header">

          <div>
            <h2>
              Address Information
            </h2>

            <p>
              Saved delivery address
            </p>
          </div>

        </div>

        <div className="address-grid">

          <div className="address-item address-full">

            <span>
              Address
            </span>

            <strong>
              {user.address || "-"}
            </strong>

          </div>

          <div className="address-item">

            <span>
              City
            </span>

            <strong>
              {user.city || "-"}
            </strong>

          </div>

          <div className="address-item">

            <span>
              Pincode
            </span>

            <strong>
              {user.pincode || "-"}
            </strong>

          </div>

        </div>

      </div>

      {/* ADMIN ACTIONS */}

      <div className="details-card admin-actions-card">

        <div className="details-card-header">

          <div>
            <h2>
              Admin Actions
            </h2>

            <p>
              Manage this user account.
            </p>
          </div>

        </div>

        <div className="admin-actions">

          <button
            className={
              user.isActive
                ? "danger-button"
                : "activate-button"
            }
            onClick={updateStatus}
            disabled={updatingStatus}
          >
            {updatingStatus
              ? "Updating..."
              : user.isActive
              ? "Deactivate User"
              : "Activate User"}
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/users")}
          >
            Back to Users
          </button>

        </div>

      </div>

    </div>
  );
}

export default UserDetails;