import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] =
    useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const token = localStorage.getItem("adminToken");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch products"
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || []
      );
    } catch (err) {
      setError(
        err.message || "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Approve product
  const approveProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this Organic product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}/approve`,
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

      alert("Product approved successfully.");

      fetchProducts();
    } catch (err) {
      alert(
        err.message || "Failed to approve product"
      );
    }
  };

  // Reject product
  const rejectProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this Organic product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}/reject`,
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

      alert("Product rejected successfully.");

      fetchProducts();
    } catch (err) {
      alert(
        err.message || "Failed to reject product"
      );
    }
  };

  // Product type class
  const getTypeClass = (type) => {
    if (type === "Organic") {
      return "organic";
    }

    if (type === "Natural") {
      return "natural";
    }

    return "eco";
  };

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set();

    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });

    return Array.from(categorySet).sort();
  }, [products]);

  // Filter + Search + Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const category =
          product.category?.toLowerCase() || "";

        const seller =
          product.seller?.toLowerCase() || "";

        const type =
          product.type?.toLowerCase() || "";

        return (
          name.includes(searchValue) ||
          category.includes(searchValue) ||
          seller.includes(searchValue) ||
          type.includes(searchValue)
        );
      });
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      result = result.filter(
        (product) =>
          product.category === categoryFilter
      );
    }

    // Product type filter
    if (typeFilter !== "ALL") {
      result = result.filter(
        (product) =>
          product.type === typeFilter
      );
    }

    // Verification filter
    if (verificationFilter === "VERIFIED") {
      result = result.filter(
        (product) => product.verified === true
      );
    }

    if (verificationFilter === "PENDING") {
      result = result.filter(
        (product) => product.verified === false
      );
    }

    // Stock filter
    if (stockFilter === "IN_STOCK") {
      result = result.filter(
        (product) =>
          Number(product.stock || 0) > 0
      );
    }

    if (stockFilter === "OUT_OF_STOCK") {
      result = result.filter(
        (product) =>
          Number(product.stock || 0) === 0
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "OLDEST":
          return (
            new Date(a.createdAt || 0) -
            new Date(b.createdAt || 0)
          );

        case "PRICE_LOW":
          return (
            Number(a.price || 0) -
            Number(b.price || 0)
          );

        case "PRICE_HIGH":
          return (
            Number(b.price || 0) -
            Number(a.price || 0)
          );

        case "STOCK_HIGH":
          return (
            Number(b.stock || 0) -
            Number(a.stock || 0)
          );

        case "STOCK_LOW":
          return (
            Number(a.stock || 0) -
            Number(b.stock || 0)
          );

        case "NEWEST":
        default:
          return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
          );
      }
    });

    return result;
  }, [
    products,
    search,
    categoryFilter,
    typeFilter,
    verificationFilter,
    stockFilter,
    sortBy,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setVerificationFilter("ALL");
    setStockFilter("ALL");
    setSortBy("NEWEST");
  };

  // Summary counts
  const totalProducts = products.length;

  const verifiedProducts = products.filter(
    (product) => product.verified
  ).length;

  const pendingOrganicProducts = products.filter(
    (product) =>
      product.type === "Organic" &&
      !product.verified
  ).length;

  const organicProducts = products.filter(
    (product) =>
      product.type === "Organic"
  ).length;

  const naturalProducts = products.filter(
    (product) =>
      product.type === "Natural"
  ).length;

  const ecoFriendlyProducts = products.filter(
    (product) =>
      product.type === "Eco-Friendly"
  ).length;

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Products</h1>

          <p>
            Manage and review all Next360 products.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchProducts}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="summary-grid">

        <div className="summary-card">
          <strong>
            {totalProducts}
          </strong>

          <span>
            Total Products
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {verifiedProducts}
          </strong>

          <span>
            Verified
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {organicProducts}
          </strong>

          <span>
            Organic
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {pendingOrganicProducts}
          </strong>

          <span>
            Pending Organic
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {naturalProducts}
          </strong>

          <span>
            Natural
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {ecoFriendlyProducts}
          </strong>

          <span>
            Eco-Friendly
          </span>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}
      <div className="product-filter-card">

        <div className="product-filter-header">
          <div>
            <h2>
              Search & Filters
            </h2>

            <p>
              Find products quickly using the
              options below.
            </p>
          </div>

          <button
            className="reset-filter-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>

        <div className="product-filter-grid">

          {/* SEARCH */}
          <div className="filter-field search-field">
            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Search product, seller, category..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {/* CATEGORY */}
          <div className="filter-field">
            <label>
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          {/* TYPE */}
          <div className="filter-field">
            <label>
              Product Type
            </label>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Types
              </option>

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

          {/* VERIFICATION */}
          <div className="filter-field">
            <label>
              Verification
            </label>

            <select
              value={verificationFilter}
              onChange={(event) =>
                setVerificationFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All
              </option>

              <option value="VERIFIED">
                Verified
              </option>

              <option value="PENDING">
                Pending
              </option>
            </select>
          </div>

          {/* STOCK */}
          <div className="filter-field">
            <label>
              Stock
            </label>

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Stock
              </option>

              <option value="IN_STOCK">
                In Stock
              </option>

              <option value="OUT_OF_STOCK">
                Out of Stock
              </option>
            </select>
          </div>

          {/* SORT */}
          <div className="filter-field">
            <label>
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
            >
              <option value="NEWEST">
                Newest First
              </option>

              <option value="OLDEST">
                Oldest First
              </option>

              <option value="PRICE_LOW">
                Price: Low → High
              </option>

              <option value="PRICE_HIGH">
                Price: High → Low
              </option>

              <option value="STOCK_HIGH">
                Stock: High → Low
              </option>

              <option value="STOCK_LOW">
                Stock: Low → High
              </option>
            </select>
          </div>

        </div>

        {/* RESULT COUNT */}
        <div className="filter-result-count">
          Showing{" "}
          <strong>
            {filteredProducts.length}
          </strong>{" "}
          of{" "}
          <strong>
            {products.length}
          </strong>{" "}
          products
        </div>

      </div>

      {/* PRODUCT TABLE */}
      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h2>
              All Products
            </h2>

            <p>
              Click a product name to view
              complete product details.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">

            <div className="empty-state-icon">
              🔍
            </div>

            <h3>
              No products found
            </h3>

            <p>
              Try changing your search or
              filters.
            </p>

            <button
              className="secondary-button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>

          </div>
        ) : (
          <div className="table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Seller
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Verification
                  </th>

                  <th>
                    Certificate
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (
                    <tr
                      key={product._id}
                    >

                      {/* PRODUCT */}
                      <td>
                        <Link
                          to={`/products/${product._id}`}
                          className="product-name-link"
                        >
                          {product.name}
                        </Link>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        {product.category}
                      </td>

                      {/* PRICE */}
                      <td>
                        <strong>
                          ₹
                          {Number(
                            product.price || 0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      {/* TYPE */}
                      <td>
                        <span
                          className={`product-type-badge ${getTypeClass(
                            product.type
                          )}`}
                        >
                          {product.type}
                        </span>
                      </td>

                      {/* SELLER */}
                      <td>
                        {product.seller ||
                          "-"}
                      </td>

                      {/* STOCK */}
                      <td>
                        <span
                          className={
                            Number(
                              product.stock ||
                                0
                            ) === 0
                              ? "stock-empty"
                              : "stock-available"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* VERIFICATION */}
                      <td>
                        <span
                          className={`verification-badge ${
                            product.verified
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {product.verified
                            ? "✓ Verified"
                            : "Pending"}
                        </span>
                      </td>

                      {/* CERTIFICATE */}
                      <td>
                        {product.type !==
                        "Organic" ? (
                          <span className="certificate-not-required">
                            Not Required
                          </span>
                        ) : product.certificate ? (
                          <span className="certificate-available">
                            Available
                          </span>
                        ) : (
                          <span className="certificate-missing">
                            Missing
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td>
                        {product.type ===
                          "Organic" &&
                        !product.verified ? (

                          <div className="table-actions">

                            <button
                              className="approve-button small"
                              onClick={() =>
                                approveProduct(
                                  product._id
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="reject-button small"
                              onClick={() =>
                                rejectProduct(
                                  product._id
                                )
                              }
                            >
                              Reject
                            </button>

                          </div>

                        ) : (

                          <Link
                            to={`/products/${product._id}`}
                            className="view-button"
                          >
                            View
                          </Link>

                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Products;import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("all");
  const [typeFilter, setTypeFilter] =
    useState("all");
  const [verificationFilter, setVerificationFilter] =
    useState("all");
  const [stockFilter, setStockFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  const token =
    localStorage.getItem("adminToken");

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/products`,
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
            "Failed to fetch products"
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =====================================================
     APPROVE PRODUCT
  ===================================================== */

  const approveProduct = async (
    productId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this Organic product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}/approve`,
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
          data.message ||
            "Failed to approve product"
        );
      }

      setProducts((previousProducts) =>
        previousProducts.map(
          (product) =>
            product._id === productId
              ? {
                  ...product,
                  verified: true,
                }
              : product
        )
      );

      alert(
        "Product approved successfully."
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to approve product"
      );
    }
  };

  /* =====================================================
     REJECT PRODUCT
  ===================================================== */

  const rejectProduct = async (
    productId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this Organic product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}/reject`,
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
          data.message ||
            "Failed to reject product"
        );
      }

      setProducts((previousProducts) =>
        previousProducts.map(
          (product) =>
            product._id === productId
              ? {
                  ...product,
                  verified: false,
                }
              : product
        )
      );

      alert(
        "Product rejected successfully."
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to reject product"
      );
    }
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

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

  /* =====================================================
     PRODUCT TYPE CLASS
  ===================================================== */

  const getProductTypeClass = (
    type
  ) => {
    switch (type) {
      case "Organic":
        return "organic";

      case "Natural":
        return "natural";

      case "Eco-Friendly":
        return "eco";

      default:
        return "";
    }
  };

  /* =====================================================
     CERTIFICATE STATUS
  ===================================================== */

  const getCertificateStatus = (
    product
  ) => {
    if (product.type !== "Organic") {
      return "Not Required";
    }

    if (
      product.certificate &&
      product.certificate.trim()
    ) {
      return "Available";
    }

    return "Missing";
  };

  /* =====================================================
     STOCK STATUS
  ===================================================== */

  const getStockStatus = (
    stock
  ) => {
    if (
      stock === undefined ||
      stock === null
    ) {
      return "Unknown";
    }

    if (stock <= 0) {
      return "Out of Stock";
    }

    if (stock <= 10) {
      return "Low Stock";
    }

    return "In Stock";
  };

  /* =====================================================
     UNIQUE CATEGORIES
  ===================================================== */

  const categories = useMemo(() => {
    const values = products
      .map(
        (product) =>
          product.category
      )
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [products]);

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    const filtered = products.filter(
      (product) => {
        const matchesSearch =
          !search ||
          product.name
            ?.toLowerCase()
            .includes(search) ||
          product.category
            ?.toLowerCase()
            .includes(search) ||
          product.type
            ?.toLowerCase()
            .includes(search) ||
          product.seller
            ?.toLowerCase()
            .includes(search);

        const matchesCategory =
          categoryFilter === "all" ||
          product.category ===
            categoryFilter;

        const matchesType =
          typeFilter === "all" ||
          product.type === typeFilter;

        const matchesVerification =
          verificationFilter ===
            "all" ||
          (verificationFilter ===
            "verified" &&
            product.verified) ||
          (verificationFilter ===
            "pending" &&
            !product.verified);

        let matchesStock = true;

        if (stockFilter === "in-stock") {
          matchesStock =
            Number(product.stock) > 10;
        }

        if (stockFilter === "low-stock") {
          matchesStock =
            Number(product.stock) > 0 &&
            Number(product.stock) <= 10;
        }

        if (stockFilter === "out-of-stock") {
          matchesStock =
            Number(product.stock) <= 0;
        }

        return (
          matchesSearch &&
          matchesCategory &&
          matchesType &&
          matchesVerification &&
          matchesStock
        );
      }
    );

    return [...filtered].sort(
      (a, b) => {
        switch (sortBy) {
          case "oldest":
            return (
              new Date(
                a.createdAt || 0
              ) -
              new Date(
                b.createdAt || 0
              )
            );

          case "price-low":
            return (
              Number(a.price || 0) -
              Number(b.price || 0)
            );

          case "price-high":
            return (
              Number(b.price || 0) -
              Number(a.price || 0)
            );

          case "stock-low":
            return (
              Number(a.stock || 0) -
              Number(b.stock || 0)
            );

          case "stock-high":
            return (
              Number(b.stock || 0) -
              Number(a.stock || 0)
            );

          case "name":
            return (
              (a.name || "")
                .toLowerCase()
                .localeCompare(
                  (b.name || "")
                    .toLowerCase()
                )
            );

          case "newest":
          default:
            return (
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
            );
        }
      }
    );
  }, [
    products,
    searchTerm,
    categoryFilter,
    typeFilter,
    verificationFilter,
    stockFilter,
    sortBy,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
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

  const paginatedProducts =
    filteredProducts.slice(
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

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setVerificationFilter("all");
    setStockFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  /* =====================================================
     FILTER HANDLER
  ===================================================== */

  const updateFilter = (
    setter,
    value
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  /* =====================================================
     SUMMARY DATA
  ===================================================== */

  const totalProducts =
    products.length;

  const verifiedProducts =
    products.filter(
      (product) =>
        product.verified
    ).length;

  const pendingOrganic =
    products.filter(
      (product) =>
        product.type === "Organic" &&
        !product.verified
    ).length;

  const organicProducts =
    products.filter(
      (product) =>
        product.type === "Organic"
    ).length;

  const naturalProducts =
    products.filter(
      (product) =>
        product.type === "Natural"
    ).length;

  const ecoProducts =
    products.filter(
      (product) =>
        product.type ===
        "Eco-Friendly"
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(product.stock) <= 0
    ).length;

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(product.stock) > 0 &&
        Number(product.stock) <= 10
    ).length;

  return (
    <div className="page-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>
          <h1>
            Products
          </h1>

          <p>
            Manage products, verification,
            stock and Organic approvals.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchProducts}
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

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="summary-grid">

        <div className="summary-card">
          <strong>
            {totalProducts}
          </strong>
          <span>
            Total Products
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {verifiedProducts}
          </strong>
          <span>
            Verified
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {pendingOrganic}
          </strong>
          <span>
            Pending Organic
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {organicProducts}
          </strong>
          <span>
            Organic
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {naturalProducts}
          </strong>
          <span>
            Natural
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {ecoProducts}
          </strong>
          <span>
            Eco-Friendly
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {lowStockProducts}
          </strong>
          <span>
            Low Stock
          </span>
        </div>

        <div className="summary-card">
          <strong>
            {outOfStockProducts}
          </strong>
          <span>
            Out of Stock
          </span>
        </div>

      </div>

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <div className="filter-card">

        <div className="filter-header">

          <div>
            <h2>
              Search & Filters
            </h2>

            <p>
              Search and filter products
              by category, type,
              verification and stock.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>

        <div className="product-filter-grid">

          {/* Search */}

          <div className="filter-field product-search-field">

            <label>
              Search Product
            </label>

            <input
              type="text"
              placeholder="Search product, category or seller..."
              value={searchTerm}
              onChange={(event) =>
                updateFilter(
                  setSearchTerm,
                  event.target.value
                )
              }
            />

          </div>

          {/* Category */}

          <div className="filter-field">

            <label>
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                updateFilter(
                  setCategoryFilter,
                  event.target.value
                )
              }
            >

              <option value="all">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>

          {/* Type */}

          <div className="filter-field">

            <label>
              Product Type
            </label>

            <select
              value={typeFilter}
              onChange={(event) =>
                updateFilter(
                  setTypeFilter,
                  event.target.value
                )
              }
            >

              <option value="all">
                All Types
              </option>

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

          {/* Verification */}

          <div className="filter-field">

            <label>
              Verification
            </label>

            <select
              value={
                verificationFilter
              }
              onChange={(event) =>
                updateFilter(
                  setVerificationFilter,
                  event.target.value
                )
              }
            >

              <option value="all">
                All Products
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="pending">
                Pending / Unverified
              </option>

            </select>

          </div>

          {/* Stock */}

          <div className="filter-field">

            <label>
              Stock
            </label>

            <select
              value={stockFilter}
              onChange={(event) =>
                updateFilter(
                  setStockFilter,
                  event.target.value
                )
              }
            >

              <option value="all">
                All Stock
              </option>

              <option value="in-stock">
                In Stock
              </option>

              <option value="low-stock">
                Low Stock
              </option>

              <option value="out-of-stock">
                Out of Stock
              </option>

            </select>

          </div>

          {/* Sort */}

          <div className="filter-field">

            <label>
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(event) =>
                updateFilter(
                  setSortBy,
                  event.target.value
                )
              }
            >

              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="name">
                Name A-Z
              </option>

              <option value="price-low">
                Price Low to High
              </option>

              <option value="price-high">
                Price High to Low
              </option>

              <option value="stock-low">
                Stock Low to High
              </option>

              <option value="stock-high">
                Stock High to Low
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          PRODUCTS TABLE
      ================================================= */}

      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h2>
              All Products
            </h2>

            <p>
              Showing{" "}
              {filteredProducts.length}{" "}
              matching products.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">

            <p>
              No products match the
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
                      Product
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Seller
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Verification
                    </th>

                    <th>
                      Certificate
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

                  {paginatedProducts.map(
                    (product) => (
                      <tr
                        key={product._id}
                      >

                        {/* Product */}

                        <td>

                          <Link
                            to={`/products/${product._id}`}
                            className="product-name-link"
                          >
                            {product.name ||
                              "-"}
                          </Link>

                        </td>

                        {/* Category */}

                        <td>
                          {product.category ||
                            "-"}
                        </td>

                        {/* Type */}

                        <td>

                          <span
                            className={`product-type-badge ${getProductTypeClass(
                              product.type
                            )}`}
                          >
                            {product.type ||
                              "-"}
                          </span>

                        </td>

                        {/* Seller */}

                        <td>
                          {product.seller ||
                            "-"}
                        </td>

                        {/* Price */}

                        <td>
                          ₹
                          {Number(
                            product.price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* Stock */}

                        <td>

                          <div className="stock-cell">

                            <strong>
                              {product.stock ??
                                0}
                            </strong>

                            <span
                              className={`stock-status ${
                                getStockStatus(
                                  product.stock
                                )
                                  .toLowerCase()
                                  .replace(
                                    " ",
                                    "-"
                                  )
                              }`}
                            >
                              {getStockStatus(
                                product.stock
                              )}
                            </span>

                          </div>

                        </td>

                        {/* Verification */}

                        <td>

                          <span
                            className={`verification-badge ${
                              product.verified
                                ? "verified"
                                : "pending"
                            }`}
                          >
                            {product.verified
                              ? "Verified"
                              : "Pending"}
                          </span>

                        </td>

                        {/* Certificate */}

                        <td>

                          <span
                            className={`certificate-status ${
                              getCertificateStatus(
                                product
                              )
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )
                            }`}
                          >
                            {getCertificateStatus(
                              product
                            )}
                          </span>

                        </td>

                        {/* Created */}

                        <td>
                          {formatDate(
                            product.createdAt
                          )}
                        </td>

                        {/* Actions */}

                        <td>

                          <div className="table-actions">

                            <Link
                              to={`/products/${product._id}`}
                              className="view-button"
                            >
                              View
                            </Link>

                            {product.type ===
                              "Organic" &&
                              !product.verified && (
                                <>
                                  <button
                                    className="activate-button small"
                                    onClick={() =>
                                      approveProduct(
                                        product._id
                                      )
                                    }
                                  >
                                    Approve
                                  </button>

                                  <button
                                    className="danger-button small"
                                    onClick={() =>
                                      rejectProduct(
                                        product._id
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

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
                    filteredProducts.length
                  )}
                </strong>

                {" of "}

                <strong>
                  {filteredProducts.length}
                </strong>

              </div>

              <div className="pagination-controls">

                <button
                  className="pagination-button"
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  onClick={() =>
                    goToPage(
                      safeCurrentPage -
                        1
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
                      safeCurrentPage +
                        1
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

export default Products;