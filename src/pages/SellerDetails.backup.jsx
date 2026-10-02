import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "http://localhost:5001";

function SellerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const token =
    localStorage.getItem("adminToken");

  // =====================================================
  // FETCH SELLER
  // =====================================================

  const fetchSeller = async () => {
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
            "Failed to fetch seller"
        );
      }

      const user =
        data.user || data;

      if (user.role !== "seller") {
        throw new Error(
          "This account is not a seller."
        );
      }

      setSeller(user);
    } catch (err) {
      setError(
        err.message ||
          "Failed to fetch seller"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeller();
  }, [id]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
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
      Number.isNaN(
        parsedDate.getTime()
      )
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

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateSellerStatus = async () => {
    if (!seller) {
      return;
    }

    const newStatus =
      !seller.isActive;

    const actionText = newStatus
      ? "activate"
      : "deactivate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionText} this seller?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `${API_URL}/api/admin/users/${seller._id}/status`,
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update seller status"
        );
      }

      setSeller((previousSeller) => ({
        ...previousSeller,
        isActive: newStatus,
      }));

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
          Loading seller details...
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
              Seller Details
            </h1>

            <p>
              Unable to load seller
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
            navigate("/sellers")
          }
        >
          Back to Sellers
        </button>

      </div>
    );
  }

  if (!seller) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Seller not found.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* BREADCRUMB */}

      <div className="breadcrumb">

        <Link to="/sellers">
          Sellers
        </Link>

        <span>
          /
        </span>

        <span>
          {seller.name || "Seller"}
        </span>

      </div>

      {/* HEADER */}

      <div className="user-profile-header">

        <div className="user-avatar">
          {(seller.name ||
            "S")
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="user-profile-main">

          <h1>
            {seller.name ||
              "Unnamed Seller"}
          </h1>

          <p>
            {seller.email || "-"}
          </p>

          <div className="user-profile-badges">

            <span className="role-badge seller">
              Seller
            </span>

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

          </div>

        </div>

        <div className="user-profile-action">

          <button
            className={
              seller.isActive
                ? "danger-button"
                : "activate-button"
            }
            onClick={
              updateSellerStatus
            }
            disabled={updating}
          >
            {updating
              ? "Updating..."
              : seller.isActive
              ? "Deactivate Seller"
              : "Activate Seller"}
          </button>

        </div>

      </div>

      {/* BASIC INFORMATION */}

      <div className="details-two-column">

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Seller Information
              </h2>

              <p>
                Basic seller account
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
                {seller.name || "-"}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Email
              </span>

              <strong>
                {seller.email || "-"}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Phone
              </span>

              <strong>
                {seller.phone || "-"}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Role
              </span>

              <strong>
                {seller.role || "-"}
              </strong>

            </div>

          </div>

        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Account Information
              </h2>

              <p>
                Seller account status
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
                  seller.isActive
                    ? "active"
                    : "inactive"
                }`}
              >
                {seller.isActive
                  ? "Active"
                  : "Inactive"}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Seller ID
              </span>

              <strong className="id-value">
                {seller._id || "-"}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Created
              </span>

              <strong>
                {formatDateTime(
                  seller.createdAt
                )}
              </strong>

            </div>

            <div className="details-row">

              <span>
                Last Updated
              </span>

              <strong>
                {formatDateTime(
                  seller.updatedAt
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
              Seller Address
            </h2>

            <p>
              Address information
              registered with the
              seller account.
            </p>
          </div>

        </div>

        <div className="address-grid">

          <div className="address-item address-full">

            <span>
              Address
            </span>

            <strong>
              {seller.address || "-"}
            </strong>

          </div>

          <div className="address-item">

            <span>
              City
            </span>

            <strong>
              {seller.city || "-"}
            </strong>

          </div>

          <div className="address-item">

            <span>
              Pincode
            </span>

            <strong>
              {seller.pincode || "-"}
            </strong>

          </div>

        </div>

      </div>

      {/* SELLER MANAGEMENT */}

      <div className="admin-actions-card">

        <div className="details-card-header">

          <div>
            <h2>
              Seller Management
            </h2>

            <p>
              Administrative actions
              for this seller account.
            </p>
          </div>

        </div>

        <div className="admin-actions">

          <button
            className={
              seller.isActive
                ? "danger-button"
                : "activate-button"
            }
            onClick={
              updateSellerStatus
            }
            disabled={updating}
          >
            {updating
              ? "Updating..."
              : seller.isActive
              ? "Deactivate Seller"
              : "Activate Seller"}
          </button>

          <Link
            to="/sellers"
            className="secondary-button"
          >
            Back to Sellers
          </Link>

        </div>

      </div>

    </div>
  );
}

export default SellerDetails;