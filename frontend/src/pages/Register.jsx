import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post("/auth/register", formData);
      toast.success(response.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={styles.brandName}>TaskFlow</span>
        </div>

        <div style={styles.card}>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Get started for free</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>FULL NAME</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>PHONE NUMBER</label>
              <input
                style={styles.input}
                type="text"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>PASSWORD</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/" style={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F4F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  container: {
    width: "100%",
    maxWidth: "440px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "1.75rem",
    justifyContent: "center",
  },
  brandIcon: {
    width: "34px",
    height: "34px",
    backgroundColor: "#534AB7",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #E8E6DF",
    borderRadius: "16px",
    padding: "2.25rem 2rem",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "6px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888780",
    marginBottom: "1.75rem",
  },
  field: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    color: "#888780",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 13px",
    backgroundColor: "#F9F8F5",
    border: "1px solid #E8E6DF",
    borderRadius: "9px",
    fontSize: "14px",
    color: "#1a1a1a",
    outline: "none",
    fontFamily: "inherit",
  },
  btn: {
    width: "100%",
    padding: "11px",
    backgroundColor: "#534AB7",
    border: "none",
    borderRadius: "9px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
    letterSpacing: "0.01em",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "#888780",
    marginTop: "1.25rem",
  },
  link: {
    color: "#534AB7",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Register;