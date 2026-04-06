
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CaregiverDash() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Read user from localStorage that Auth.jsx saved
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/auth"); // not logged in, send back
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "caregiver") {
      navigate("/auth"); // wrong role
      return;
    }
    setUser(parsed);
  }, []);

  function logout() {
    localStorage.removeItem("user");
    navigate("/auth");
  }

  if (!user) return null; // wait until user loads

  return (
    <div style={s.page}>

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <span style={s.heart}>♥</span>
          <span style={s.logoText}>CareSync</span>
        </div>
        <div style={s.navRight}>
          <span style={s.welcome}>Hi, {user.name}</span>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main content */}
      <div style={s.content}>

        <h1 style={s.heading}>Caregiver Dashboard</h1>
        <p style={s.sub}>Here's what's happening today.</p>

        {/* Stats row */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statNum}>3</div>
            <div style={s.statLabel}>Medicines Today</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>1</div>
            <div style={s.statLabel}>Appointment This Week</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>4</div>
            <div style={s.statLabel}>Tasks Assigned</div>
          </div>
        </div>

        {/* Medicine section */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>💊 Medicines</h2>
          <div style={s.item}>
            <span>Morning Aspirin — 8:00 AM</span>
            <span style={s.tagDone}>✓ Taken</span>
          </div>
          <div style={s.item}>
            <span>Metformin 500mg — 2:00 PM</span>
            <span style={s.tagPending}>Pending</span>
          </div>
          <div style={s.item}>
            <span>Night Vitamin D — 9:00 PM</span>
            <span style={s.tagPending}>Pending</span>
          </div>
        </div>

        {/* Tasks section */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>✅ Tasks</h2>
          <div style={s.item}>
            <span>Morning walk</span>
            <span style={s.tagDone}>✓ Done</span>
          </div>
          <div style={s.item}>
            <span>Lunch preparation</span>
            <span style={s.tagPending}>Pending</span>
          </div>
          <div style={s.item}>
            <span>Evening check-in call</span>
            <span style={s.tagPending}>Pending</span>
          </div>
        </div>

        {/* Appointments section */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📅 Upcoming Appointments</h2>
          <div style={s.item}>
            <span>Dr. Patel — Friday, 10:00 AM</span>
            <span style={s.tagUpcoming}>Upcoming</span>
          </div>
        </div>

      </div>
    </div>
  );
}

const s = {
  page:    { minHeight: "100vh", background: "#f7f8fa", fontFamily: "'Segoe UI', sans-serif" },
  nav:     { background: "#1a1a2e", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo:    { display: "flex", alignItems: "center", gap: "8px" },
  heart:   { color: "#e05c5c", fontSize: "18px" },
  logoText:{ fontSize: "18px", fontWeight: "700", color: "#fff" },
  navRight:{ display: "flex", alignItems: "center", gap: "16px" },
  welcome: { color: "#d1d5db", fontSize: "14px" },
  logoutBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },

  content: { maxWidth: "700px", margin: "0 auto", padding: "40px 24px" },
  heading: { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" },
  sub:     { color: "#9ca3af", fontSize: "14px", marginBottom: "32px" },

  statsRow:  { display: "flex", gap: "16px", marginBottom: "32px" },
  statCard:  { flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", textAlign: "center" },
  statNum:   { fontSize: "32px", fontWeight: "800", color: "#1a1a2e" },
  statLabel: { fontSize: "12px", color: "#9ca3af", marginTop: "4px" },

  section:      { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px 24px", marginBottom: "20px" },
  sectionTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },
  item:         { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px", color: "#374151" },

  tagDone:    { fontSize: "11px", fontWeight: "600", color: "#10b981", background: "#f0fdf4", padding: "3px 10px", borderRadius: "100px" },
  tagPending: { fontSize: "11px", fontWeight: "600", color: "#f59e0b", background: "#fffbeb", padding: "3px 10px", borderRadius: "100px" },
  tagUpcoming:{ fontSize: "11px", fontWeight: "600", color: "#3b82f6", background: "#eff6ff", padding: "3px 10px", borderRadius: "100px" },
};