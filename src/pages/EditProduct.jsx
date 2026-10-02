import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "http://localhost:5001";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    type: "Organic",
    seller: "",
    certificate: "",
    stock: "",
    images: "",
  });

  useEffect(() => {
    const token =
      localStorage.getItem("sellerToken");

    const storedSeller =
      localStorage.getItem("sellerUser");

    if (!token || !storedSeller) {
      navigate("/login");
      return;
    }

    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    fetchProduct(token);
  }, [id, navigate]);

  const fetchProduct = async (token) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "sellerToken"
        );
        localStorage.removeItem(
          "sellerUser"
        );

        navigate("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load product"
        );
      }

      const product = data.product;

      setFormData({
        name: product.name || "",
        category: product.category || "",
        price:
          product.price !== undefined
            ? String(product.price)
            : "",
        description:
          product.description || "",
        type: product.type || "Organic",
        seller: product.seller || "",
        certificate:
          product.certificate || "",
        stock:
          product.stock !== undefined
            ? String(product.stock)
            : "",
        images: Array.isArray(product.images)
          ? product.images.join(", ")
          : "",
      });
    } catch (error) {
      console.error(
        "Fetch product error:",
        error
      );

      setError(
        error.message ||
          "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleTypeChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      type: value,
      certificate:
        value === "Organic"
          ? previous.certificate
          : "",
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token =
      localStorage.getItem("sellerToken");

    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (!formData.price) {
      setError("Price is required.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError(
        "Price cannot be negative."
      );
      return;
    }

    if (!formData.seller.trim()) {
      setError("Seller name is required.");
      return;
    }

    if (!formData.stock) {
      setError("Stock is required.");
      return;
    }

    if (Number(formData.stock) < 0) {
      setError(
        "Stock cannot be negative."
      );
      return;
    }

    if (
      formData.type === "Organic" &&
      !formData.certificate.trim()
    ) {
      setError(
        "NPOP certificate is required for Organic products."
      );
      return;
    }

    try {
      setSaving(true);

      const images = formData.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        category:
          formData.category.trim(),
        price: Number(formData.price),
        description:
          formData.description.trim(),
        type: formData.type,
        seller: formData.seller.trim(),
        certificate:
          formData.type === "Organic"
            ? formData.certificate.trim()
            : "",
        stock: Number(formData.stock),
        images,
      };

      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "sellerToken"
        );
        localStorage.removeItem(
          "sellerUser"
        );

        navigate("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update product"
        );
      }

      setSuccess(
        "Product updated successfully!"
      );

      // Wait briefly so seller can see success message
      setTimeout(() => {
        navigate("/my-products");
      }, 1000);
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setError(
        error.message ||
          "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-products");
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>

          <h2>
            Loading Product...
          </h2>

          <p>
            Please wait while we load the
            product details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>
            Next360
          </h1>

          <span
            style={styles.headerSubtitle}
          >
            Seller Dashboard
          </span>
        </div>

        <button
          onClick={handleCancel}
          style={styles.backButton}
        >
          ← My Products
        </button>
      </header>

      {/* Main */}
      <main style={styles.container}>
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>
            Edit Product
          </h2>

          <p style={styles.pageDescription}>
            Update your product information
            below.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={styles.success}>
            ✓ {success}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          {/* Basic Information */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Product Information
            </h3>

            <div style={styles.formGrid}>
              {/* Product Name */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  style={styles.input}
                />
              </div>

              {/* Category */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category *
                </label>

                <input
                  type="text"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={handleChange}
                  placeholder="Example: Spices"
                  style={styles.input}
                />
              </div>

              {/* Price */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Price (₹) *
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  style={styles.input}
                />
              </div>

              {/* Stock */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Stock *
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  min="0"
                  step="1"
                  style={styles.input}
                />
              </div>

              {/* Seller */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Seller Name *
                </label>

                <input
                  type="text"
                  name="seller"
                  value={formData.seller}
                  onChange={handleChange}
                  placeholder="Seller name"
                  style={styles.input}
                />
              </div>

              {/* Product Type */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Product Type *
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={
                    handleTypeChange
                  }
                  style={styles.input}
                >
                  <option value="Organic">
                    Organic
                  </option>

                  <option value="Natural">
                    Natural
                  </option>

                  <option value="Eco-Friendly">
                    Eco-Friendly
                  </option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Enter product description"
                rows="5"
                style={styles.textarea}
              />
            </div>
          </section>

          {/* Organic Certificate */}
          {formData.type ===
            "Organic" && (
            <section style={styles.section}>
              <h3
                style={
                  styles.sectionTitle
                }
              >
                Organic Certification
              </h3>

              <div
                style={
                  styles.certificateInfo
                }
              >
                <strong>
                  NPOP Certificate
                </strong>

                <p>
                  Organic products require
                  an NPOP certificate for
                  verification.
                </p>
              </div>

              <div
                style={styles.formGroup}
              >
                <label
                  style={styles.label}
                >
                  Certificate URL / Reference *
                </label>

                <input
                  type="text"
                  name="certificate"
                  value={
                    formData.certificate
                  }
                  onChange={handleChange}
                  placeholder="Enter certificate URL or reference"
                  style={styles.input}
                />
              </div>
            </section>
          )}

          {/* Images */}
          <section style={styles.section}>
            <h3
              style={styles.sectionTitle}
            >
              Product Images
            </h3>

            <div
              style={styles.formGroup}
            >
              <label
                style={styles.label}
              >
                Image URLs
              </label>

              <input
                type="text"
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="Enter image URLs separated by commas"
                style={styles.input}
              />

              <p
                style={
                  styles.helperText
                }
              >
                If you have multiple images,
                separate their URLs with
                commas.
              </p>
            </div>
          </section>

          {/* Important Note */}
          <div style={styles.warning}>
            <strong>
              Important:
            </strong>

            <span>
              {" "}
              Editing an Organic product
              will require admin
              verification again.
            </span>
          </div>

          {/* Buttons */}
          <div style={styles.buttons}>
            <button
              type="button"
              onClick={handleCancel}
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                ...styles.saveButton,
                opacity: saving
                  ? 0.7
                  : 1,
              }}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "✓ Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f5",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  header: {
    background: "#1b5e20",
    color: "#fff",
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },

  logo: {
    margin: 0,
    fontSize: "28px",
  },

  headerSubtitle: {
    display: "block",
    marginTop: "3px",
    fontSize: "13px",
    opacity: 0.8,
  },

  backButton: {
    background: "#fff",
    color: "#1b5e20",
    border: "none",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  pageHeader: {
    marginBottom: "25px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "30px",
    color: "#222",
  },

  pageDescription: {
    marginTop: "8px",
    color: "#666",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  section: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1b5e20",
    fontSize: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,1fr)",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "18px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #d5d5d5",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #d5d5d5",
    borderRadius: "7px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  helperText: {
    margin: 0,
    color: "#777",
    fontSize: "12px",
  },

  certificateInfo: {
    background: "#f1f8f2",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    color: "#2e7d32",
  },

  certificateInfoP: {
    margin: "5px 0 0",
  },

  warning: {
    background: "#fff8e1",
    color: "#8a6500",
    padding: "15px",
    borderRadius: "8px",
    border:
      "1px solid #ffe082",
    fontSize: "14px",
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },

  cancelButton: {
    background: "#fff",
    color: "#555",
    border:
      "1px solid #ccc",
    padding: "13px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  saveButton: {
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "13px 28px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "20px",
    border:
      "1px solid #ffcdd2",
  },

  success: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "20px",
    border:
      "1px solid #c8e6c9",
    fontWeight: "bold",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f5f7f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  loadingCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  spinner: {
    width: "35px",
    height: "35px",
    border:
      "4px solid #e0e0e0",
    borderTop:
      "4px solid #2e7d32",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation:
      "spin 1s linear infinite",
  },
};

export default EditProduct;