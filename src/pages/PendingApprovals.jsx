import { useEffect, useState } from "react";

const API_URL = "http://localhost:5001";

function PendingApprovals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/products/pending`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load pending products"
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleAction = async (
    product,
    action
  ) => {
    const actionText =
      action === "approve"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(product._id);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/admin/products/${product._id}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(data.message || "Access denied.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${actionText} product`
        );
      }

      // Remove the product from this page
      // because it is no longer pending.
      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item._id !== product._id
        )
      );

      alert(
        action === "approve"
          ? "Product approved successfully."
          : "Product rejected successfully."
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Pending Approvals</h1>
        <p>
          Loading pending Organic products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">

        <h1>Pending Approvals</h1>

        <div className="page-error">

          <p>{error}</p>

          <button
            className="action-button"
            onClick={fetchPendingProducts}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">

        <div>
          <h1>Pending Approvals</h1>

          <p>
            Review Organic products waiting
            for admin approval.
          </p>
        </div>

        <button
          className="action-button"
          onClick={fetchPendingProducts}
        >
          Refresh
        </button>

      </div>

      <div className="approval-summary">

        <div className="approval-count">
          <strong>{products.length}</strong>

          <span>
            Pending Organic Products
          </span>
        </div>

      </div>

      {products.length === 0 ? (
        <div className="empty-approval">

          <div className="empty-icon">
            ✓
          </div>

          <h2>
            No Pending Approvals
          </h2>

          <p>
            There are currently no Organic
            products waiting for approval.
          </p>

        </div>
      ) : (
        <div className="approval-list">

          {products.map((product) => (
            <div
              className="approval-card"
              key={product._id}
            >

              <div className="approval-card-header">

                <div>
                  <h2>{product.name}</h2>

                  <span className="product-type-badge organic">
                    Organic
                  </span>
                </div>

                <span className="status-badge inactive">
                  Pending
                </span>

              </div>

              <div className="approval-details">

                <div className="detail-item">
                  <span>Category</span>
                  <strong>
                    {product.category || "-"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Price</span>
                  <strong>
                    ₹{product.price}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Stock</span>
                  <strong>
                    {product.stock ?? 0}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Seller</span>
                  <strong>
                    {product.seller || "-"}
                  </strong>
                </div>

              </div>

              <div className="certificate-box">

                <span>
                  NPOP Certificate
                </span>

                {product.certificate ? (
                  <strong>
                    {product.certificate}
                  </strong>
                ) : (
                  <strong className="missing-certificate">
                    Certificate not provided
                  </strong>
                )}

              </div>

              {product.description && (
                <div className="description-box">

                  <span>Description</span>

                  <p>
                    {product.description}
                  </p>

                </div>
              )}

              <div className="approval-actions">

                <button
                  className="approval-button approve"
                  onClick={() =>
                    handleAction(
                      product,
                      "approve"
                    )
                  }
                  disabled={
                    updatingId === product._id
                  }
                >
                  {updatingId === product._id
                    ? "Processing..."
                    : "Approve Product"}
                </button>

                <button
                  className="approval-button reject"
                  onClick={() =>
                    handleAction(
                      product,
                      "reject"
                    )
                  }
                  disabled={
                    updatingId === product._id
                  }
                >
                  Reject Product
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default PendingApprovals;