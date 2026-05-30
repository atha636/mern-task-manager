import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

function EyeOpen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateLogin({ email, password }) {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

function Login() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    const fieldErrors = {};
    if (!formData.email.trim()) {
      fieldErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      fieldErrors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      fieldErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <button onClick={toggle} style={s.themeBtn} title="Toggle theme">
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div style={s.container}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={s.brandName}>TaskFlow</span>
        </div>

        <div style={s.card}>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to your account to continue </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>EMAIL ADDRESS</label>
              <input
                style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p style={s.errorMsg}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>PASSWORD</label>
              <div style={s.inputWrap}>
                <input
                  style={{
                    ...s.input,
                    paddingRight: "42px",
                    ...(errors.password ? s.inputError : {}),
                  }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={s.eyeBtn}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errors.password && <p style={s.errorMsg}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={s.footer}>
            Don't have an account?{" "}
            <Link to="/register" style={s.link}>Create One</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "var(--bg-page)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    position: "relative",
  },
  themeBtn: {
    position: "fixed",
    top: "1.25rem",
    right: "1.25rem",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg-card)",
    color: "var(--toggle-icon)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: { width: "100%", maxWidth: "420px" },
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
    backgroundColor: "var(--accent)",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  card: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "2.25rem 2rem",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "6px",
    letterSpacing: "-0.02em",
  },
  subtitle: { fontSize: "14px", color: "var(--text-muted)", marginBottom: "1.75rem" },
  field: { marginBottom: "1.1rem" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-muted)",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%",
    padding: "10px 13px",
    backgroundColor: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "9px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "inherit",
  },
  inputError: {
    borderColor: "var(--danger)",
  },
  errorMsg: {
    fontSize: "12px",
    color: "var(--danger)",
    marginTop: "5px",
    marginBottom: "0",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    padding: "0",
  },
  btn: {
    width: "100%",
    padding: "11px",
    backgroundColor: "var(--accent)",
    border: "none",
    borderRadius: "9px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
    letterSpacing: "0.01em",
    fontFamily: "inherit",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "var(--text-muted)",
    marginTop: "1.25rem",
  },
  link: { color: "var(--accent-text)", fontWeight: "600", textDecoration: "none" },
};

export default Login;