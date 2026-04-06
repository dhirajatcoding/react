
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SeniorDash() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Read user from localStorage
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/auth");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "senior") {
      navigate("/auth");
      return;
    }
    setUser(parsed);
  }, []);

  function logout() {
    localStorage.removeItem("user");
    navigate("/auth");
  }

  if (!user) return null;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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

        <h1 style={s.heading}>{greeting}, {user.name}! 👋</h1>
        <p style={s.sub}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

        {/* SOS Button */}
        <div style={s.sosWrap}>
          <button style={s.sosBtn}>🆘 Emergency SOS</button>
          <p style={s.sosNote}>Press if you need immediate help</p>
        </div>

        {/* Today's medicines */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>💊 Today's Medicines</h2>
          <div style={s.item}>
            <div>
              <div style={s.itemName}>Morning Aspirin</div>
              <div style={s.itemTime}>8:00 AM</div>
            </div>
            <span style={s.tagDone}>✓ Taken</span>
          </div>
          <div style={s.item}>
            <div>
              <div style={s.itemName}>Metformin 500mg</div>
              <div style={s.itemTime}>2:00 PM</div>
            </div>
            <button style={s.markBtn}>Mark as Taken</button>
          </div>
          <div style={s.item}>
            <div>
              <div style={s.itemName}>Night Vitamin D</div>
              <div style={s.itemTime}>9:00 PM</div>
            </div>
            <button style={s.markBtn}>Mark as Taken</button>
          </div>
        </div>

        {/* Tasks */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>✅ My Tasks</h2>
          <div style={s.item}>
            <div style={s.itemName}>Morning walk</div>
            <span style={s.tagDone}>✓ Done</span>
          </div>
          <div style={s.item}>
            <div style={s.itemName}>Evening check-in call</div>
            <button style={s.markBtn}>Mark Done</button>
          </div>
        </div>

        {/* Next appointment */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📅 Next Appointment</h2>
          <div style={s.item}>
            <div>
              <div style={s.itemName}>Dr. Patel</div>
              <div style={s.itemTime}>Friday, 10:00 AM</div>
            </div>
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

  sosWrap: { marginBottom: "32px" },
  sosBtn:  { background: "#dc2626", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 28px", fontSize: "17px", fontWeight: "700", cursor: "pointer" },
  sosNote: { color: "#9ca3af", fontSize: "12px", marginTop: "8px" },

  section:      { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px 24px", marginBottom: "20px" },
  sectionTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },
  item:         { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
  itemName:     { fontSize: "15px", fontWeight: "600", color: "#1a1a2e" },
  itemTime:     { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },

  markBtn:    { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  tagDone:    { fontSize: "11px", fontWeight: "600", color: "#10b981", background: "#f0fdf4", padding: "3px 10px", borderRadius: "100px" },
  tagUpcoming:{ fontSize: "11px", fontWeight: "600", color: "#3b82f6", background: "#eff6ff", padding: "3px 10px", borderRadius: "100px" },
};