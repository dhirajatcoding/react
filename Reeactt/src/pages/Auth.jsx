import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate(); // gives us the redirect function

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "caregiver" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "register" && !form.name) {
      setError("Please enter your name.");
      return;
    }

    setError("");

    
    localStorage.setItem("user", JSON.stringify({
      name: mode === "register" ? form.name : form.email.split("@")[0],
      email: form.email,
      role: form.role,
    }));

    
    if (form.role === "caregiver") {
      navigate("/caregiver-dashboard");
    } else {
      navigate("/senior-dashboard");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <span style={styles.heart}>♥</span>
          <span style={styles.logoText}>CareSync</span>
        </div>
        <p style={styles.tagline}>Elder care, made simple.</p>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            style={{ ...styles.tab, ...(mode === "register" ? styles.tabActive : {}) }}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {mode === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" style={styles.input} />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" style={styles.input} />
          </div>

          {/* Role picker — only on register */}
          {mode === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>I am a</label>
              <div style={styles.roleRow}>
                <button type="button"
                  onClick={() => setForm({ ...form, role: "caregiver" })}
                  style={{ ...styles.roleBtn, ...(form.role === "caregiver" ? styles.roleBtnActive : {}) }}
                >
                  👤 Caregiver
                </button>
                <button type="button"
                  onClick={() => setForm({ ...form, role: "senior" })}
                  style={{ ...styles.roleBtn, ...(form.role === "senior" ? styles.roleBtnActive : {}) }}
                >
                  🧓 Senior
                </button>
              </div>
            </div>
          )}

          {/* Role picker on login too — so they can pick which dashboard to go to */}
          {mode === "login" && (
            <div style={styles.field}>
              <label style={styles.label}>Login as</label>
              <div style={styles.roleRow}>
                <button type="button"
                  onClick={() => setForm({ ...form, role: "caregiver" })}
                  style={{ ...styles.roleBtn, ...(form.role === "caregiver" ? styles.roleBtnActive : {}) }}
                >
                  👤 Caregiver
                </button>
                <button type="button"
                  onClick={() => setForm({ ...form, role: "senior" })}
                  style={{ ...styles.roleBtn, ...(form.role === "senior" ? styles.roleBtnActive : {}) }}
                >
                  🧓 Senior
                </button>
              </div>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submit}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

        </form>

        <p style={styles.switchText}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <span style={styles.switchLink}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Register" : "Sign In"}
          </span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page:     { minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card:     { background: "#fff", borderRadius: "16px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  logo:     { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  heart:    { fontSize: "20px", color: "#e05c5c" },
  logoText: { fontSize: "20px", fontWeight: "700", color: "#1a1a2e" },
  tagline:  { color: "#9ca3af", fontSize: "13px", margin: "0 0 24px" },
  tabs:     { display: "flex", borderBottom: "2px solid #f0f0f0", marginBottom: "24px" },
  tab:      { flex: 1, padding: "10px", background: "none", border: "none", borderBottom: "2px solid transparent", marginBottom: "-2px", cursor: "pointer", fontSize: "14px", color: "#9ca3af", fontWeight: "500" },
  tabActive:{ color: "#1a1a2e", borderBottomColor: "#1a1a2e" },
  form:     { display: "flex", flexDirection: "column", gap: "16px" },
  field:    { display: "flex", flexDirection: "column", gap: "6px" },
  label:    { fontSize: "13px", fontWeight: "600", color: "#444" },
  input:    { padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fafafa", color: "#1a1a2e" },
  roleRow:  { display: "flex", gap: "10px" },
  roleBtn:  { flex: 1, padding: "10px", border: "1.5px solid #e8e8e8", borderRadius: "8px", background: "#fafafa", cursor: "pointer", fontSize: "13px", color: "#666", fontWeight: "500" },
  roleBtnActive: { border: "1.5px solid #1a1a2e", background: "#1a1a2e", color: "#fff" },
  error:    { background: "#fff0f0", color: "#d93025", borderRadius: "6px", padding: "8px 12px", fontSize: "13px" },
  submit:   { padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "4px" },
  switchText: { textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "20px" },
  switchLink: { color: "#1a1a2e", fontWeight: "600", cursor: "pointer", textDecoration: "underline" },
};