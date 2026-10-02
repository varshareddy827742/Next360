import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response");
      }

      if (data.user.role !== "seller") {
        throw new Error(
          "Only seller accounts can access this dashboard"
        );
      }

      localStorage.setItem(
        "sellerToken",
        data.token
      );

      localStorage.setItem(
        "sellerUser",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");

    } catch (error) {
      setError(
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        <h1 style={styles.title}>
          Next360
        </h1>

        <p style={styles.subtitle}>
          Seller Dashboard
        </p>

        <form onSubmit={handleLogin}>

          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            placeholder="seller2026@next360.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
          />

          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={styles.input}
          />

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Logging in..."
              : "SELLER LOGIN"}
          </button>

        </form>

      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f7f3",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "400px",
    padding: "35px",
    background: "#ffffff",
    borderRadius: "15px",
    boxShadow:
      "0 5px 25px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "5px",
    color: "#1b5e20",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#666",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "18px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2e7d32",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "10px",
    borderRadius: "7px",
    marginBottom: "15px",
  },
};

export default Login;