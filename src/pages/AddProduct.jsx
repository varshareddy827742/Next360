import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // If user changes from Organic
    // to another type, remove certificate.

    if (
      name === "type" &&
      value !== "Organic"
    ) {
      setForm((previous) => ({
        ...previous,
        type: value,
        certificate: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token =
      localStorage.getItem(
        "sellerToken"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!form.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!form.category.trim()) {
      setError(
        "Category is required."
      );
      return;
    }

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (!form.seller.trim()) {
      setError(
        "Seller name is required."
      );
      return;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      setError(
        "Please enter a valid stock quantity."
      );
      return;
    }

    // Organic certificate required

    if (
      form.type === "Organic" &&
      !form.certificate.trim()
    ) {
      setError(
        "Organic products require a certificate."
      );
      return;
    }

    try {
      setLoading(true);

      const imageArray =
        form.images
          .split(",")
          .map((image) =>
            image.trim()
          )
          .filter(Boolean);

      const productData = {
        name:
          form.name.trim(),

        category:
          form.category.trim(),

        price:
          Number(form.price),

        description:
          form.description.trim(),

        type:
          form.type,

        seller:
          form.seller.trim(),

        certificate:
          form.type === "Organic"
            ? form.certificate.trim()
            : "",

        stock:
          Number(form.stock),

        images:
          imageArray,
      };

      const response =
        await fetch(
          `${API_URL}/api/products`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                productData
              ),
          }
        );

      const data =
        await response.json();

      // -----------------------------------------------
      // TOKEN EXPIRED
      // -----------------------------------------------

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "sellerToken"
        );

        localStorage.removeItem(
          "sellerUser"
        );

        setError(
          "Your session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to create product"
        );
      }

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      if (
        form.type === "Organic"
      ) {
        setMessage(
          "Product added successfully. Organic product is waiting for admin verification."
        );
      } else {
        setMessage(
          "Product added successfully."
        );
      }

      // Reset form

      setForm({
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

    } catch (error) {

      setError(
        error.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <header style={styles.header}>

        <div>
          <h1 style={styles.logo}>
            Next360
          </h1>

          <span>
            Seller Dashboard
          </span>
        </div>

        <button
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
          style={
            styles.dashboardButton
          }
        >
          ← Dashboard
        </button>

      </header>

      {/* MAIN */}

      <main
        style={styles.container}
      >

        <div style={styles.card}>

          <h2 style={styles.heading}>
            Add New Product
          </h2>

          <p
            style={
              styles.description
            }
          >
            Add your product
            information below.
          </p>

          {message && (
            <div
              style={
                styles.success
              }
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={styles.error}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* NAME */}

            <label
              style={styles.label}
            >
              Product Name *
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="Organic Turmeric Powder"
              style={
                styles.input
              }
            />

            {/* CATEGORY */}

            <label
              style={styles.label}
            >
              Category *
            </label>

            <input
              type="text"
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              placeholder="Spices"
              style={
                styles.input
              }
            />

            {/* PRICE */}

            <label
              style={styles.label}
            >
              Price (₹) *
            </label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={
                handleChange
              }
              placeholder="250"
              min="0"
              style={
                styles.input
              }
            />

            {/* DESCRIPTION */}

            <label
              style={styles.label}
            >
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe your product..."
              rows="5"
              style={
                styles.textarea
              }
            />

            {/* TYPE */}

            <label
              style={styles.label}
            >
              Product Type *
            </label>

            <select
              name="type"
              value={form.type}
              onChange={
                handleChange
              }
              style={
                styles.input
              }
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

            {/* CLASSIFICATION INFO */}

            <div
              style={
                form.type ===
                "Organic"
                  ? styles.organicInfo
                  : styles.normalInfo
              }
            >

              {form.type ===
                "Organic" && (
                <>
                  <strong>
                    🌱 Organic Product
                  </strong>

                  <p>
                    Certificate required.
                    Admin verification is
                    required before the
                    product becomes buyer-visible.
                  </p>
                </>
              )}

              {form.type ===
                "Natural" && (
                <>
                  <strong>
                    🌿 Natural Product
                  </strong>

                  <p>
                    Organic certificate is
                    not required.
                  </p>
                </>
              )}

              {form.type ===
                "Eco-Friendly" && (
                <>
                  <strong>
                    ♻️ Eco-Friendly Product
                  </strong>

                  <p>
                    Organic certificate is
                    not required.
                  </p>
                </>
              )}

            </div>

            {/* SELLER */}

            <label
              style={styles.label}
            >
              Seller Name *
            </label>

            <input
              type="text"
              name="seller"
              value={form.seller}
              onChange={
                handleChange
              }
              placeholder="Green Farms"
              style={
                styles.input
              }
            />

            {/* CERTIFICATE */}

            {form.type ===
              "Organic" && (
              <>

                <label
                  style={
                    styles.label
                  }
                >
                  Organic Certificate *
                </label>

                <input
                  type="text"
                  name="certificate"
                  value={
                    form.certificate
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="NPOP Certificate URL or reference"
                  style={
                    styles.input
                  }
                />

                <p
                  style={
                    styles.helper
                  }
                >
                  The certificate is required
                  for Organic products.
                </p>

              </>
            )}

            {form.type !==
              "Organic" && (
              <div
                style={
                  styles.noCertificate
                }
              >
                Certificate not required
                for {form.type} products.
              </div>
            )}

            {/* STOCK */}

            <label
              style={styles.label}
            >
              Stock Quantity *
            </label>

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={
                handleChange
              }
              placeholder="50"
              min="0"
              style={
                styles.input
              }
            />

            {/* IMAGES */}

            <label
              style={styles.label}
            >
              Product Images
            </label>

            <input
              type="text"
              name="images"
              value={form.images}
              onChange={
                handleChange
              }
              placeholder="Image URL 1, Image URL 2"
              style={
                styles.input
              }
            />

            <p
              style={
                styles.helper
              }
            >
              Separate multiple image
              URLs with commas.
            </p>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              style={
                styles.submitButton
              }
            >
              {loading
                ? "Adding Product..."
                : "ADD PRODUCT"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f5",
    fontFamily:
      "Arial, sans-serif",
  },

  header: {
    background: "#1b5e20",
    color: "#fff",
    padding:
      "18px 40px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  logo: {
    margin: 0,
    marginBottom: "3px",
  },

  dashboardButton: {
    background: "#fff",
    color: "#1b5e20",
    border: "none",
    padding:
      "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  container: {
    maxWidth: "850px",
    margin: "0 auto",
    padding:
      "35px 20px",
  },

  card: {
    background: "#fff",
    padding: "35px",
    borderRadius: "15px",
    boxShadow:
      "0 3px 15px rgba(0,0,0,0.08)",
  },

  heading: {
    marginBottom: "5px",
    color: "#1b5e20",
  },

  description: {
    color: "#666",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "7px",
    marginTop: "18px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #ccc",
    borderRadius: "7px",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #ccc",
    borderRadius: "7px",
    fontSize: "15px",
    resize: "vertical",
  },

  helper: {
    fontSize: "13px",
    color: "#777",
    marginTop: "6px",
  },

  organicInfo: {
    background: "#f1f8e9",
    color: "#33691e",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "15px",
    border:
      "1px solid #c5e1a5",
  },

  normalInfo: {
    background: "#f5f5f5",
    color: "#555",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "15px",
  },

  noCertificate: {
    background: "#f5f5f5",
    padding: "12px",
    borderRadius: "7px",
    marginTop: "10px",
    color: "#666",
  },

  submitButton: {
    width: "100%",
    marginTop: "30px",
    padding: "14px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  success: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "13px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "13px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
};

export default AddProduct;