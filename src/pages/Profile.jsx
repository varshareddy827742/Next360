import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Profile() {
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token =
      localStorage.getItem("sellerToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load profile"
        );
      }

      setSeller(data.user);

      localStorage.setItem(
        "sellerUser",
        JSON.stringify(data.user)
      );

    } catch (error) {
      setError(
        error.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerUser");

    navigate("/login");
  };

  if (loading) {
    return (
      <div style={styles.center}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <header style={styles.header}>

        <h1>Seller Profile</h1>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          style={styles.headerButton}
        >
          Dashboard
        </button>

      </header>

      <main style={styles.container}>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {seller && (
          <div style={styles.card}>

            <div style={styles.avatar}>
              {(seller.name || "S")
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2>
              {seller.name || "Seller"}
            </h2>

            <div style={styles.info}>

              <div>
                <strong>Email</strong>
                <p>
                  {seller.email ||
                    "Not available"}
                </p>
              </div>

              <div>
                <strong>Phone</strong>
                <p>
                  {seller.phone ||
                    "Not available"}
                </p>
              </div>

              <div>
                <strong>Role</strong>
                <p>
                  {seller.role ||
                    "seller"}
                </p>
              </div>

              <div>
                <strong>Address</strong>
                <p>
                  {seller.address ||
                    "Not available"}
                </p>
              </div>

              <div>
                <strong>City</strong>
                <p>
                  {seller.city ||
                    "Not available"}
                </p>
              </div>

              <div>
                <strong>Pincode</strong>
                <p>
                  {seller.pincode ||
                    "Not available"}
                </p>
              </div>

            </div>

            <button
              onClick={handleLogout}
              style={styles.logout}
            >
              Logout
            </button>

          </div>
        )}

      </main>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f5",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    background: "#1b5e20",
    color: "#fff",
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerButton: {
    background: "#fff",
    color: "#1b5e20",
    border: "none",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
  },

  card: {
    background: "#fff",
    padding: "35px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow:
      "0 3px 15px rgba(0,0,0,0.08)",
  },

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#2e7d32",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: "32px",
    fontWeight: "bold",
  },

  info: {
    textAlign: "left",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "30px",
  },

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  logout: {
    marginTop: "30px",
    padding: "12px 25px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },

  center: {
    padding: "50px",
    textAlign: "center",
  },
};

export default Profile;