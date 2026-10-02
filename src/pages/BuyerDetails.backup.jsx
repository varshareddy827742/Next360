import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "http://localhost:5001";

function BuyerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const token =
    localStorage.getItem("adminToken");

  const fetchBuyer = async () => {
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
            "Failed to fetch buyer"
        );
      }

      const user = data.user || data;

      if (user.role !== "buyer") {
        throw new Error(
          "This account is not a buyer."
        );
      }

      setBuyer(user);
    } catch (err) {
      setError(
        err.message ||
          "Failed to fetch buyer"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyer();
  }, [id]);

  const formatDateTime = (date) => {
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
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const updateBuyerStatus = async () => {
    if (!buyer) {
      return;
    }

    const newStatus = !buyer.isActive;

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
      setUpdating(true);

      const response = await fetch(
        `${API_URL}/api/admin/users/${buyer._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
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

      setBuyer((previousBuyer) => ({
        ...previousBuyer,
        isActive: newStatus,
      }));

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
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Loading buyer details...
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
              Buyer Details
            </h1>

            <p>
              Unable to load buyer
              information.
            </p>
          </div>
        </div>

        <div className="error-box">
          {error}
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/buyers")
          }
        >
          Back to Buyers
        </button>

      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Buyer not found.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* BREADCRUMB */}

      <div className="breadcrumb">

        <Link to="/buyers">
          Buyers
        </Link>

        <span>/</span>

        <span>
          {buyer.name || "Buyer"}
        </span>

      </div>

      {/* PROFILE HEADER */}

      <div className="user-profile-header">

        <div className="user-avatar">
          {(buyer.name || "B")
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="user-profile-main">

          <h1>
            {buyer.name ||
              "Unnamed Buyer"}
          </h1>

          <p>
            {buyer.email || "-"}
          </p>

          <div className="user-profile-badges">

            <span className="role-badge buyer">
              Buyer
            </span>

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

          </div>

        </div>

        <div className="user-profile-action">

          <button
            className={
              buyer.isActive
                ? "danger-button"
                : "activate-button"
            }
            onClick={updateBuyerStatus}
            disabled={updating}
          >
            {updating
              ? "Updating..."
              : buyer.isActive
              ? "Deactivate Buyer"
              : "Activate Buyer"}
          </button>

        </div>

      </div>

      {/* BASIC + ACCOUNT INFORMATION */}

      <div className="details-two-column">

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Buyer Information
              </h2>

              <p>
                Basic buyer account
                information.
              </p>
            </div>

          </div>

          <div className="details-list">

            <div className="details-row">
              <span>
                Full Name
              </span>

              <strong>
                {buyer.name || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Email
              </span>

              <strong>
                {buyer.email || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Phone
              </span>

              <strong>
                {buyer.phone || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Role
              </span>

              <strong>
                {buyer.role || "-"}
              </strong>
            </div>

          </div>

        </div>

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Account Information
              </h2>

              <p>
                Buyer account status
                and dates.
              </p>
            </div>

          </div>

          <div className="details-list">

            <div className="details-row">
              <span>
                Status
              </span>

              <strong
                className={`user-status-badge ${
                  buyer.isActive
                    ? "active"
                    : "inactive"
                }`}
              >
                {buyer.isActive
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Buyer ID
              </span>

              <strong className="id-value">
                {buyer._id || "-"}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Created
              </span>

              <strong>
                {formatDateTime(
                  buyer.createdAt
                )}
              </strong>
            </div>

            <div className="details-row">
              <span>
                Last Updated
              </span>

              <strong>
                {formatDateTime(
                  buyer.updatedAt
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
              Buyer Address
            </h2>

            <p>
              Address information
              registered with the
              buyer account.
            </p>
          </div>

        </div>

        <div className="address-grid">

          <div className="address-item address-full">

            <span>
              Address
            </span>

            <strong>
              {buyer.address || "-"}
            </strong>

          </div>

          <div className="address-item">

            <span>
              City
            </span>

            <strong>
              {buyer.city || "-"}
            </strong>

          </div>

          <div className="address-item">

            <span>
              Pincode
            </span>

            <strong>
              {buyer.pincode || "-"}
            </strong>

          </div>

        </div>

      </div>

      {/* ADMIN ACTIONS */}

      <div className="admin-actions-card">

        <div className="details-card-header">

          <div>
            <h2>
              Buyer Management
            </h2>

            <p>
              Administrative actions
              for this buyer account.
            </p>
          </div>

        </div>

        <div className="admin-actions">

          <button
            className={
              buyer.isActive
                ? "danger-button"
                : "activate-button"
            }
            onClick={updateBuyerStatus}
            disabled={updating}
          >
            {updating
              ? "Updating..."
              : buyer.isActive
              ? "Deactivate Buyer"
              : "Activate Buyer"}
          </button>

          <Link
            to="/buyers"
            className="secondary-button"
          >
            Back to Buyers
          </Link>

        </div>

      </div>

    </div>
  );
}

export default BuyerDetails;