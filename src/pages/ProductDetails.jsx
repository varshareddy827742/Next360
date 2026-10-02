import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5001";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("adminToken");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load product"
        );
      }

      setProduct(data.product || data);
    } catch (err) {
      setError(
        err.message || "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const approveProduct = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Approve "${product.name}" as a verified Organic product?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/products/${product._id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to approve product"
        );
      }

      setProduct(data.product || data);

      alert("Product approved successfully.");
    } catch (err) {
      alert(
        err.message || "Failed to approve product"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const rejectProduct = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Reject "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/products/${product._id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to reject product"
        );
      }

      setProduct(data.product || data);

      alert("Product rejected successfully.");
    } catch (err) {
      alert(
        err.message || "Failed to reject product"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Product Details</h1>
            <p>Loading product information...</p>
          </div>
        </div>

        <div className="empty-state">
          Loading product...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Product Details</h1>
            <p>Unable to load this product.</p>
          </div>
        </div>

        <div className="error-box">
          {error}
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Product not found.
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const isOrganic = product.type === "Organic";

  const isPendingOrganic =
    isOrganic && product.verified === false;

  const createdDate = product.createdAt
    ? new Date(product.createdAt).toLocaleString()
    : "-";

  const updatedDate = product.updatedAt
    ? new Date(product.updatedAt).toLocaleString()
    : "-";

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header product-details-header">
        <div>
          <button
            className="back-button"
            onClick={() => navigate("/products")}
          >
            ← Back to Products
          </button>

          <h1>{product.name}</h1>

          <p>
            Complete information about this product
          </p>
        </div>

        <div className="product-header-badges">
          <span
            className={`product-type-badge ${product.type
              .toLowerCase()
              .replace("-", "")}`}
          >
            {product.type}
          </span>

          {product.verified ? (
            <span className="verification-badge verified">
              ✓ Verified
            </span>
          ) : (
            <span className="verification-badge pending">
              Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* ACTION BAR */}
      {isOrganic && (
        <div className="product-action-bar">
          <div>
            <strong>
              Organic Product Verification
            </strong>

            <span>
              {product.verified
                ? "This Organic product has been verified."
                : "This Organic product is waiting for admin approval."}
            </span>
          </div>

          {isPendingOrganic && (
            <div className="product-action-buttons">
              <button
                className="approve-button"
                onClick={approveProduct}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "✓ Approve Product"}
              </button>

              <button
                className="reject-button"
                onClick={rejectProduct}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "✕ Reject Product"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MAIN PRODUCT SECTION */}
      <div className="product-details-main-grid">
        {/* IMAGES */}
        <div className="details-card product-images-card">
          <div className="details-card-header">
            <h2>Product Images</h2>

            <span>
              {images.length} image(s)
            </span>
          </div>

          <div className="product-images-container">
            {images.length === 0 ? (
              <div className="no-image-box">
                <div className="no-image-icon">
                  📦
                </div>

                <p>No product images available.</p>
              </div>
            ) : (
              <div className="product-image-grid">
                {images.map((image, index) => (
                  <div
                    className="product-image-box"
                    key={`${image}-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="details-card">
          <div className="details-card-header">
            <h2>Product Information</h2>
          </div>

          <div className="details-content">
            <div className="detail-row">
              <span>Product Name</span>
              <strong>{product.name}</strong>
            </div>

            <div className="detail-row">
              <span>Category</span>
              <strong>{product.category}</strong>
            </div>

            <div className="detail-row">
              <span>Product Type</span>
              <strong>{product.type}</strong>
            </div>

            <div className="detail-row">
              <span>Price</span>
              <strong>
                ₹{Number(product.price || 0).toFixed(2)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Stock</span>
              <strong>{product.stock}</strong>
            </div>

            <div className="detail-row">
              <span>Verification</span>

              <strong
                className={
                  product.verified
                    ? "text-verified"
                    : "text-pending"
                }
              >
                {product.verified
                  ? "Verified"
                  : "Not Verified"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* SELLER + STOCK */}
      <div className="product-info-grid">
        <div className="details-card">
          <div className="details-card-header">
            <h2>Seller Information</h2>
          </div>

          <div className="details-content">
            <div className="detail-row">
              <span>Seller</span>
              <strong>
                {product.seller || "-"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Seller ID</span>
              <strong>
                {product.sellerId || "-"}
              </strong>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="details-card-header">
            <h2>Inventory</h2>
          </div>

          <div className="details-content">
            <div className="detail-row">
              <span>Available Stock</span>

              <strong
                className={
                  Number(product.stock) > 0
                    ? "text-stock-available"
                    : "text-stock-empty"
                }
              >
                {product.stock}
              </strong>
            </div>

            <div className="detail-row">
              <span>Stock Status</span>

              <strong>
                {Number(product.stock) > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="details-card product-description-card">
        <div className="details-card-header">
          <h2>Product Description</h2>
        </div>

        <div className="product-description">
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p className="muted-text">
              No description provided.
            </p>
          )}
        </div>
      </div>

      {/* CERTIFICATE */}
      <div className="details-card certificate-card">
        <div className="details-card-header">
          <div>
            <h2>Organic Certification</h2>

            <span>
              Required only for Organic products
            </span>
          </div>

          {isOrganic ? (
            product.certificate ? (
              <span className="certificate-status available">
                Certificate Available
              </span>
            ) : (
              <span className="certificate-status missing">
                Certificate Missing
              </span>
            )
          ) : (
            <span className="certificate-status not-required">
              Not Required
            </span>
          )}
        </div>

        <div className="certificate-content">
          {!isOrganic ? (
            <div className="certificate-message">
              <div className="certificate-icon">
                ✓
              </div>

              <div>
                <strong>
                  Certificate Not Required
                </strong>

                <p>
                  {product.type} products do not
                  require Organic certification.
                </p>
              </div>
            </div>
          ) : !product.certificate ? (
            <div className="certificate-message warning">
              <div className="certificate-icon">
                !
              </div>

              <div>
                <strong>
                  Certificate Not Available
                </strong>

                <p>
                  This Organic product does not
                  currently have a certificate
                  reference.
                </p>
              </div>
            </div>
          ) : (
            <div className="certificate-viewer">
              <div className="certificate-reference">
                <span>Certificate Reference</span>

                <strong>
                  {product.certificate}
                </strong>
              </div>

              {product.certificate.startsWith(
                "http://"
              ) ||
              product.certificate.startsWith(
                "https://"
              ) ? (
                <div className="certificate-preview">
                  <iframe
                    src={product.certificate}
                    title="Organic Certificate"
                  />

                  <a
                    href={product.certificate}
                    target="_blank"
                    rel="noreferrer"
                    className="certificate-open-button"
                  >
                    Open Certificate
                  </a>
                </div>
              ) : (
                <div className="certificate-document">
                  <div className="certificate-document-icon">
                    📄
                  </div>

                  <div>
                    <strong>
                      Certificate Reference
                    </strong>

                    <p>
                      {product.certificate}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DATES */}
      <div className="details-card product-dates-card">
        <div className="details-card-header">
          <h2>Product Record</h2>
        </div>

        <div className="details-content">
          <div className="detail-row">
            <span>Created</span>
            <strong>{createdDate}</strong>
          </div>

          <div className="detail-row">
            <span>Last Updated</span>
            <strong>{updatedDate}</strong>
          </div>

          <div className="detail-row">
            <span>Product ID</span>
            <strong>{product._id}</strong>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="details-footer-actions">
        <Link
          to="/products"
          className="secondary-button"
        >
          ← Back to Products
        </Link>
      </div>
    </div>
  );
}

export default ProductDetails;