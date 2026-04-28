// src/pages/Auth.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function Auth() {
  const navigate = useNavigate();

  const [mode, setMode]               = useState("login");
  const [role, setRole]               = useState("caregiver");
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [caregiverEmail, setCaregiverEmail] = useState(""); // only for senior register
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (mode === "register" && role === "senior" && !caregiverEmail.trim()) {
      setError("Please enter your caregiver's email to link your account.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "register"
        ? `${API}/auth/register`
        : `${API}/auth/login`;

      const body = mode === "register"
        ? { name: name.trim(), email: email.trim(), password, role, caregiverEmail: caregiverEmail.trim() }
        : { email: email.trim(), password, role };

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      // Save token and full user object including caregiverId
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));

      if (data.user.role === "caregiver") {
        navigate("/caregiver-dashboard");
      } else {
        navigate("/senior-dashboard");
      }

    } catch (err) {
      setError("Cannot reach server. Make sure backend is running on port 5000.");
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setCaregiverEmail("");
  }

  return (
    <div style={st.page}>
      <div style={st.card}>

        <div style={st.logo}>
          <span style={st.heart}>♥</span>
          <span style={st.logoText}>CareSync</span>
        </div>
        <p style={st.tagline}>Elder care, made simple.</p>

        {/* Tabs */}
        <div style={st.tabs}>
          <button type="button"
            style={{ ...st.tab, ...(mode === "login" ? st.tabActive : {}) }}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button type="button"
            style={{ ...st.tab, ...(mode === "register" ? st.tabActive : {}) }}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={st.form}>

          {/* Name — register only */}
          {mode === "register" && (
            <div style={st.field}>
              <label style={st.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                style={st.input}
              />
            </div>
          )}

          <div style={st.field}>
            <label style={st.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              style={st.input}
              autoComplete="email"
            />
          </div>

          <div style={st.field}>
            <label style={st.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={st.input}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {/* Role picker */}
          <div style={st.field}>
            <label style={st.label}>{mode === "login" ? "Login as" : "I am a"}</label>
            <div style={st.roleRow}>
              <button type="button"
                onClick={() => setRole("caregiver")}
                style={{ ...st.roleBtn, ...(role === "caregiver" ? st.roleBtnActive : {}) }}
              >
                👤 Caregiver
              </button>
              <button type="button"
                onClick={() => setRole("senior")}
                style={{ ...st.roleBtn, ...(role === "senior" ? st.roleBtnActive : {}) }}
              >
                🧓 Senior
              </button>
            </div>
          </div>

          {/* Caregiver email — only when registering as senior */}
          {mode === "register" && role === "senior" && (
            <div style={st.field}>
              <label style={st.label}>Your Caregiver's Email</label>
              <input
                type="email"
                value={caregiverEmail}
                onChange={e => setCaregiverEmail(e.target.value)}
                placeholder="caregiver@email.com"
                style={st.input}
              />
              <span style={st.hint}>
                Your caregiver must register first. Enter their email to link your account.
              </span>
            </div>
          )}

          {/* Error */}
          {error && <div style={st.error}>⚠️ {error}</div>}

          {/* Submit */}
          <button
            type="submit"
            style={{ ...st.submit, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

        </form>

        <p style={st.switchText}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <span style={st.switchLink} onClick={switchMode}>
            {mode === "login" ? "Register" : "Sign In"}
          </span>
        </p>

      </div>
    </div>
  );
}

const st = {
  page:          { minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card:          { background: "#fff", borderRadius: "16px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  logo:          { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  heart:         { fontSize: "20px", color: "#e05c5c" },
  logoText:      { fontSize: "20px", fontWeight: "700", color: "#1a1a2e" },
  tagline:       { color: "#9ca3af", fontSize: "13px", margin: "0 0 24px" },
  tabs:          { display: "flex", borderBottom: "2px solid #f0f0f0", marginBottom: "24px" },
  tab:           { flex: 1, padding: "10px", background: "none", border: "none", borderBottom: "2px solid transparent", marginBottom: "-2px", cursor: "pointer", fontSize: "14px", color: "#9ca3af", fontWeight: "500" },
  tabActive:     { color: "#1a1a2e", borderBottomColor: "#1a1a2e" },
  form:          { display: "flex", flexDirection: "column", gap: "16px" },
  field:         { display: "flex", flexDirection: "column", gap: "6px" },
  label:         { fontSize: "13px", fontWeight: "600", color: "#444" },
  input:         { padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fafafa", color: "#1a1a2e", boxSizing: "border-box", width: "100%" },
  hint:          { fontSize: "11px", color: "#9ca3af", lineHeight: "1.5" },
  roleRow:       { display: "flex", gap: "10px" },
  roleBtn:       { flex: 1, padding: "10px", border: "1.5px solid #e8e8e8", borderRadius: "8px", background: "#fafafa", cursor: "pointer", fontSize: "13px", color: "#666", fontWeight: "500" },
  roleBtnActive: { border: "1.5px solid #1a1a2e", background: "#1a1a2e", color: "#fff" },
  error:         { background: "#fff0f0", color: "#d93025", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", lineHeight: "1.5" },
  submit:        { padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "4px" },
  switchText:    { textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "20px", marginBottom: 0 },
  switchLink:    { color: "#1a1a2e", fontWeight: "600", cursor: "pointer", textDecoration: "underline" },
};