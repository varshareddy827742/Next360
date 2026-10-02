import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function MyProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [stockValues, setStockValues] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingStockId, setUpdatingStockId] =
    useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("sellerToken");

    const storedSeller =
      localStorage.getItem("sellerUser");

    if (!token || !storedSeller) {
      navigate("/login");
      return;
    }

    fetchProducts(token);
  }, [navigate]);

  const fetchProducts = async (token) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products/seller`,
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
            "Failed to load products"
        );
      }

      const productList =
        data.products || [];

      setProducts(productList);

      // Create editable stock values
      const initialStock = {};

      productList.forEach((product) => {
        initialStock[product._id] =
          String(product.stock ?? 0);
      });

      setStockValues(initialStock);
    } catch (error) {
      console.error(
        "Fetch products error:",
        error
      );

      setError(
        error.message ||
          "Failed to load your products"
      );
    } finally {
      setLoading(false);
    }
  };

  const getProductStatus = (product) => {
    if (product.type === "Organic") {
      if (product.verified) {
        return {
          text: "Verified",
          className: "verified",
        };
      }

      return {
        text: "Pending Verification",
        className: "pending",
      };
    }

    return {
      text: "Active",
      className: "active",
    };
  };

  const handleEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // STOCK MANAGEMENT
  // ==========================================

  const handleStockChange = (
    productId,
    value
  ) => {
    // Allow empty value while typing
    if (value === "") {
      setStockValues((previous) => ({
        ...previous,
        [productId]: "",
      }));

      return;
    }

    // Only allow numbers
    if (!/^\d+$/.test(value)) {
      return;
    }

    setStockValues((previous) => ({
      ...previous,
      [productId]: value,
    }));

    setError("");
    setSuccess("");
  };

  const increaseStock = (productId) => {
    const currentValue =
      Number(stockValues[productId] || 0);

    setStockValues((previous) => ({
      ...previous,
      [productId]: String(
        currentValue + 1
      ),
    }));

    setError("");
    setSuccess("");
  };

  const decreaseStock = (productId) => {
    const currentValue =
      Number(stockValues[productId] || 0);

    if (currentValue <= 0) {
      return;
    }

    setStockValues((previous) => ({
      ...previous,
      [productId]: String(
        currentValue - 1
      ),
    }));

    setError("");
    setSuccess("");
  };

  const updateStock = async (product) => {
    const token =
      localStorage.getItem("sellerToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const newStock = Number(
      stockValues[product._id]
    );

    if (
      stockValues[product._id] === "" ||
      !Number.isInteger(newStock) ||
      newStock < 0
    ) {
      setError(
        `Please enter a valid stock quantity for ${product.name}.`
      );

      return;
    }

    try {
      setUpdatingStockId(product._id);

      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/products/${product._id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            stock: newStock,
          }),
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
            "Failed to update stock"
        );
      }

      // Update product locally
      setProducts((previous) =>
        previous.map((item) =>
          item._id === product._id
            ? {
                ...item,
                stock: newStock,
              }
            : item
        )
      );

      setStockValues((previous) => ({
        ...previous,
        [product._id]: String(
          newStock
        ),
      }));

      setSuccess(
        `Stock updated successfully for ${product.name}.`
      );
    } catch (error) {
      console.error(
        "Update stock error:",
        error
      );

      setError(
        error.message ||
          "Failed to update stock"
      );
    } finally {
      setUpdatingStockId(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>

          <h2>
            Loading Products...
          </h2>

          <p>
            Please wait while we fetch your
            products.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div style={styles.page}>
      {/* HEADER */}
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

        <div
          style={styles.headerActions}
        >
          <button
            onClick={handleDashboard}
            style={styles.dashboardButton}
          >
            Dashboard
          </button>

          <button
            onClick={handleAddProduct}
            style={styles.addHeaderButton}
          >
            + Add Product
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={styles.container}>
        {/* PAGE HEADER */}
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.pageTitle}>
              My Products
            </h2>

            <p
              style={
                styles.pageDescription
              }
            >
              Manage your products and stock
              from here.
            </p>
          </div>

          <button
            onClick={handleAddProduct}
            style={styles.addProductButton}
          >
            + Add New Product
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            <div>
              <strong>
                Error:
              </strong>{" "}
              {error}
            </div>

            <button
              onClick={() => {
                const token =
                  localStorage.getItem(
                    "sellerToken"
                  );

                if (token) {
                  fetchProducts(token);
                }
              }}
              style={styles.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div style={styles.success}>
            ✓ {success}
          </div>
        )}

        {/* SUMMARY */}
        <div style={styles.summaryCard}>
          <div>
            <span
              style={styles.summaryLabel}
            >
              Total Products
            </span>

            <strong
              style={styles.summaryValue}
            >
              {products.length}
            </strong>
          </div>

          <div>
            <span
              style={styles.summaryLabel}
            >
              Verified Organic
            </span>

            <strong
              style={styles.summaryValue}
            >
              {
                products.filter(
                  (product) =>
                    product.type ===
                      "Organic" &&
                    product.verified ===
                      true
                ).length
              }
            </strong>
          </div>

          <div>
            <span
              style={styles.summaryLabel}
            >
              Pending Organic
            </span>

            <strong
              style={styles.summaryValue}
            >
              {
                products.filter(
                  (product) =>
                    product.type ===
                      "Organic" &&
                    product.verified ===
                      false
                ).length
              }
            </strong>
          </div>

          <div>
            <span
              style={styles.summaryLabel}
            >
              Out of Stock
            </span>

            <strong
              style={{
                ...styles.summaryValue,
                color: "#c62828",
              }}
            >
              {
                products.filter(
                  (product) =>
                    Number(
                      product.stock
                    ) === 0
                ).length
              }
            </strong>
          </div>
        </div>

        {/* PRODUCTS */}
        {products.length === 0 ? (
          <section
            style={styles.emptySection}
          >
            <div
              style={styles.emptyIcon}
            >
              📦
            </div>

            <h2
              style={styles.emptyTitle}
            >
              No Products Yet
            </h2>

            <p
              style={styles.emptyText}
            >
              You have not added any
              products to Next360 yet.
            </p>

            <button
              onClick={handleAddProduct}
              style={styles.emptyButton}
            >
              + Add Your First Product
            </button>
          </section>
        ) : (
          <section>
            <div
              style={styles.productsGrid}
            >
              {products.map((product) => {
                const status =
                  getProductStatus(
                    product
                  );

                const currentStock =
                  Number(
                    stockValues[
                      product._id
                    ] ?? product.stock ?? 0
                  );

                const isUpdating =
                  updatingStockId ===
                  product._id;

                return (
                  <div
                    key={product._id}
                    style={
                      styles.productCard
                    }
                  >
                    {/* PRODUCT TOP */}
                    <div
                      style={
                        styles.productTop
                      }
                    >
                      <div>
                        <h3
                          style={
                            styles.productName
                          }
                        >
                          {product.name}
                        </h3>

                        <p
                          style={
                            styles.productCategory
                          }
                        >
                          {product.category}
                        </p>
                      </div>

                      <span
                        style={{
                          ...styles.typeBadge,

                          ...(product.type ===
                          "Organic"
                            ? styles.organicBadge
                            : product.type ===
                              "Natural"
                            ? styles.naturalBadge
                            : styles.ecoBadge),
                        }}
                      >
                        {product.type}
                      </span>
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div
                      style={
                        styles.productDetails
                      }
                    >
                      <div
                        style={
                          styles.detailItem
                        }
                      >
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          Price
                        </span>

                        <strong
                          style={
                            styles.price
                          }
                        >
                          ₹{product.price}
                        </strong>
                      </div>

                      <div
                        style={
                          styles.detailItem
                        }
                      >
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          Current Stock
                        </span>

                        <strong
                          style={{
                            ...styles.stock,

                            color:
                              Number(
                                product.stock
                              ) === 0
                                ? "#c62828"
                                : Number(
                                    product.stock
                                  ) <= 5
                                ? "#ef6c00"
                                : "#2e7d32",
                          }}
                        >
                          {product.stock}
                        </strong>
                      </div>

                      <div
                        style={
                          styles.detailItem
                        }
                      >
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          Added On
                        </span>

                        <strong
                          style={
                            styles.detailValue
                          }
                        >
                          {formatDate(
                            product.createdAt
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* STOCK MANAGEMENT */}
                    <div
                      style={
                        styles.stockSection
                      }
                    >
                      <h4
                        style={
                          styles.stockTitle
                        }
                      >
                        📦 Manage Stock
                      </h4>

                      <div
                        style={
                          styles.stockControls
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            decreaseStock(
                              product._id
                            )
                          }
                          disabled={
                            currentStock <= 0 ||
                            isUpdating
                          }
                          style={{
                            ...styles.stockButton,
                            opacity:
                              currentStock <=
                                0 ||
                              isUpdating
                                ? 0.5
                                : 1,
                          }}
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            stockValues[
                              product._id
                            ] ?? ""
                          }
                          onChange={(event) =>
                            handleStockChange(
                              product._id,
                              event.target
                                .value
                            )
                          }
                          disabled={
                            isUpdating
                          }
                          style={
                            styles.stockInput
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            increaseStock(
                              product._id
                            )
                          }
                          disabled={
                            isUpdating
                          }
                          style={{
                            ...styles.stockButton,
                            opacity:
                              isUpdating
                                ? 0.5
                                : 1,
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateStock(
                            product
                          )
                        }
                        disabled={
                          isUpdating
                        }
                        style={{
                          ...styles.updateStockButton,
                          opacity:
                            isUpdating
                              ? 0.7
                              : 1,
                        }}
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Update Stock"}
                      </button>

                      {currentStock ===
                        0 && (
                        <p
                          style={
                            styles.outOfStockText
                          }
                        >
                          ⚠ This product is
                          currently out of
                          stock.
                        </p>
                      )}

                      {currentStock > 0 &&
                        currentStock <=
                          5 && (
                          <p
                            style={
                              styles.lowStockText
                            }
                          >
                            ⚠ Low stock —
                            only{" "}
                            {currentStock}{" "}
                            left.
                          </p>
                        )}
                    </div>

                    {/* STATUS */}
                    <div
                      style={
                        styles.statusSection
                      }
                    >
                      <span
                        style={
                          styles.statusLabel
                        }
                      >
                        Product Status
                      </span>

                      <span
                        style={{
                          ...styles.statusBadge,

                          ...(status.className ===
                          "verified"
                            ? styles.verifiedBadge
                            : status.className ===
                              "pending"
                            ? styles.pendingBadge
                            : styles.activeBadge),
                        }}
                      >
                        {status.className ===
                        "verified"
                          ? "✓ "
                          : status.className ===
                            "pending"
                          ? "⏳ "
                          : "✓ "}

                        {status.text}
                      </span>
                    </div>

                    {/* CERTIFICATE */}
                    {product.type ===
                      "Organic" && (
                      <div
                        style={
                          styles.certificateSection
                        }
                      >
                        <span
                          style={
                            styles.certificateLabel
                          }
                        >
                          NPOP Certificate
                        </span>

                        {product.certificate ? (
                          <span
                            style={
                              styles.certificateSubmitted
                            }
                          >
                            ✓ Certificate
                            Submitted
                          </span>
                        ) : (
                          <span
                            style={
                              styles.certificateMissing
                            }
                          >
                            ⚠ Certificate Not
                            Submitted
                          </span>
                        )}
                      </div>
                    )}

                    {/* DESCRIPTION */}
                    {product.description && (
                      <div
                        style={
                          styles.descriptionSection
                        }
                      >
                        <span
                          style={
                            styles.descriptionLabel
                          }
                        >
                          Description
                        </span>

                        <p
                          style={
                            styles.description
                          }
                        >
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* PRODUCT ID */}
                    <div
                      style={
                        styles.productId
                      }
                    >
                      Product ID:{" "}
                      {product._id}
                    </div>

                    {/* EDIT */}
                    <div
                      style={styles.actions}
                    >
                      <button
                        onClick={() =>
                          handleEditProduct(
                            product._id
                          )
                        }
                        style={
                          styles.editButton
                        }
                      >
                        ✏️ Edit Product
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

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

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  dashboardButton: {
    background:
      "rgba(255,255,255,0.15)",
    color: "#fff",
    border:
      "1px solid rgba(255,255,255,0.4)",
    padding: "10px 16px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  addHeaderButton: {
    background: "#fff",
    color: "#1b5e20",
    border: "none",
    padding: "10px 16px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  pageTitle: {
    margin: 0,
    color: "#1b1b1b",
    fontSize: "30px",
  },

  pageDescription: {
    marginTop: "8px",
    color: "#666",
    fontSize: "15px",
  },

  addProductButton: {
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "13px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
    border:
      "1px solid #ffcdd2",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  retryButton: {
    background: "#c62828",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  success: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "15px",
    border:
      "1px solid #c8e6c9",
    fontWeight: "bold",
  },

  summaryCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "25px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  summaryLabel: {
    display: "block",
    color: "#777",
    fontSize: "13px",
    marginBottom: "7px",
  },

  summaryValue: {
    fontSize: "25px",
    color: "#1b5e20",
  },

  productsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(340px,1fr))",
    gap: "20px",
  },

  productCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid #eee",
  },

  productTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
  },

  productName: {
    margin: 0,
    color: "#222",
    fontSize: "20px",
  },

  productCategory: {
    margin: "6px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  typeBadge: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  organicBadge: {
    background: "#e8f5e9",
    color: "#2e7d32",
  },

  naturalBadge: {
    background: "#fff3e0",
    color: "#ef6c00",
  },

  ecoBadge: {
    background: "#e3f2fd",
    color: "#1565c0",
  },

  productDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3,1fr)",
    gap: "10px",
    marginBottom: "18px",
  },

  detailItem: {
    background: "#f8f9f8",
    padding: "12px",
    borderRadius: "8px",
  },

  detailLabel: {
    display: "block",
    color: "#777",
    fontSize: "12px",
    marginBottom: "5px",
  },

  price: {
    fontSize: "18px",
    color: "#1b5e20",
  },

  stock: {
    fontSize: "18px",
  },

  detailValue: {
    fontSize: "13px",
    color: "#333",
  },

  /* STOCK */

  stockSection: {
    background: "#f8faf8",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "18px",
    border:
      "1px solid #e1e8e1",
  },

  stockTitle: {
    margin: "0 0 14px",
    color: "#1b5e20",
    fontSize: "15px",
  },

  stockControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  stockButton: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "7px",
    background: "#2e7d32",
    color: "#fff",
    fontSize: "24px",
    lineHeight: "1",
    cursor: "pointer",
    fontWeight: "bold",
  },

  stockInput: {
    width: "100px",
    height: "40px",
    boxSizing: "border-box",
    textAlign: "center",
    border:
      "1px solid #ccc",
    borderRadius: "7px",
    fontSize: "17px",
    fontWeight: "bold",
    outline: "none",
  },

  updateStockButton: {
    width: "100%",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "11px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  outOfStockText: {
    margin:
      "10px 0 0",
    textAlign: "center",
    color: "#c62828",
    fontSize: "12px",
    fontWeight: "bold",
  },

  lowStockText: {
    margin:
      "10px 0 0",
    textAlign: "center",
    color: "#ef6c00",
    fontSize: "12px",
    fontWeight: "bold",
  },

  /* STATUS */

  statusSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderTop:
      "1px solid #eee",
    borderBottom:
      "1px solid #eee",
    gap: "10px",
  },

  statusLabel: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "bold",
  },

  statusBadge: {
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  verifiedBadge: {
    background: "#e8f5e9",
    color: "#2e7d32",
  },

  pendingBadge: {
    background: "#fff8e1",
    color: "#f57f17",
  },

  activeBadge: {
    background: "#e3f2fd",
    color: "#1565c0",
  },

  /* CERTIFICATE */

  certificateSection: {
    padding: "15px 0",
    borderBottom:
      "1px solid #eee",
  },

  certificateLabel: {
    display: "block",
    fontSize: "13px",
    color: "#666",
    fontWeight: "bold",
    marginBottom: "7px",
  },

  certificateSubmitted: {
    color: "#2e7d32",
    fontSize: "13px",
    fontWeight: "bold",
  },

  certificateMissing: {
    color: "#c62828",
    fontSize: "13px",
    fontWeight: "bold",
  },

  /* DESCRIPTION */

  descriptionSection: {
    padding: "15px 0",
  },

  descriptionLabel: {
    display: "block",
    fontSize: "13px",
    color: "#666",
    fontWeight: "bold",
    marginBottom: "6px",
  },

  description: {
    margin: 0,
    color: "#555",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  productId: {
    marginTop: "10px",
    color: "#999",
    fontSize: "10px",
    wordBreak: "break-all",
  },

  actions: {
    marginTop: "18px",
  },

  editButton: {
    width: "100%",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "13px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  /* EMPTY */

  emptySection: {
    background: "#fff",
    borderRadius: "12px",
    padding: "60px 20px",
    textAlign: "center",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  emptyIcon: {
    fontSize: "55px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: "0 0 10px",
    color: "#222",
  },

  emptyText: {
    color: "#777",
    marginBottom: "20px",
  },

  emptyButton: {
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  /* LOADING */

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

export default MyProducts;