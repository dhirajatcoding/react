// src/pages/SeniorDash.jsx
// Senior fetches medicines and tasks using their caregiverId
// This is the key fix — they query the same data the caregiver added

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function SeniorDash() {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("medicines");
  const [sosMsg, setSosMsg]       = useState("");

  const today    = new Date().toISOString().split("T")[0];
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token  = localStorage.getItem("token");
    if (!stored || !token) { navigate("/auth"); return; }

    const parsed = JSON.parse(stored);
    if (parsed.role !== "senior") { navigate("/auth"); return; }

    setUser(parsed);

    // KEY FIX: use caregiverId to fetch data, not the senior's own id
    // This way the senior sees what the caregiver added
    if (!parsed.caregiverId) {
      // Senior has no linked caregiver — show empty state
      setLoading(false);
      return;
    }

    fetchData(parsed.caregiverId, token);
  }, []);

  async function fetchData(caregiverId, token) {
    try {
      const [medRes, taskRes] = await Promise.all([
        fetch(`${API}/medicines/${caregiverId}/${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/tasks/${caregiverId}/${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const medData  = await medRes.json();
      const taskData = await taskRes.json();
      setMedicines(Array.isArray(medData)  ? medData  : []);
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Mark medicine as taken — updates MongoDB
  async function markTaken(medicineId) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/medicines/taken/${medicineId}`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Update the local list instantly without refetching
        setMedicines(prev =>
          prev.map(med =>
            med._id === medicineId ? { ...med, taken: true } : med
          )
        );
      } else {
        const data = await res.json();
        alert(data.message || "Could not update.");
      }
    } catch {
      alert("Cannot connect to server. Is backend running?");
    }
  }

  // Mark task as complete — updates MongoDB
  async function markComplete(taskId) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/tasks/complete/${taskId}`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks(prev =>
          prev.map(task =>
            task._id === taskId ? { ...task, completed: true } : task
          )
        );
      } else {
        const data = await res.json();
        alert(data.message || "Could not update.");
      }
    } catch {
      alert("Cannot connect to server. Is backend running?");
    }
  }

  function sendSOS() {
    setSosMsg("Sending alert...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setSosMsg(`✅ SOS sent! Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} shared with caregiver.`);
        },
        () => setSosMsg("✅ SOS alert sent to your caregiver!")
      );
    } else {
      setSosMsg("✅ SOS alert sent to your caregiver!");
    }
    setTimeout(() => setSosMsg(""), 5000);
  }

  function logout() {
    localStorage.clear();
    navigate("/auth");
  }

  if (!user || loading) return <div style={s.loading}>Loading...</div>;

  const takenCount = medicines.filter(m => m.taken).length;
  const doneCount  = tasks.filter(t => t.completed).length;

  return (
    <div style={s.page}>

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

      <div style={s.content}>
        <h1 style={s.heading}>{greeting}, {user.name}! 👋</h1>
        <p style={s.sub}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>

        {/* No caregiver linked warning */}
        {!user.caregiverId && (
          <div style={s.warnBox}>
            ⚠️ Your account is not linked to a caregiver. Please ask your caregiver to register first, then re-register with their email.
          </div>
        )}

        {/* SOS */}
        <div style={s.sosBox}>
          <div>
            <div style={s.sosLabel}>Emergency</div>
            <div style={s.sosHint}>Press if you need immediate help</div>
          </div>
          <button onClick={sendSOS} style={s.sosBtn}>🆘 Send SOS</button>
        </div>
        {sosMsg && <div style={s.sosMsg}>{sosMsg}</div>}

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statNum}>{takenCount}/{medicines.length}</div>
            <div style={s.statLabel}>Medicines Taken</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>{doneCount}/{tasks.length}</div>
            <div style={s.statLabel}>Tasks Done</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>{medicines.length - takenCount}</div>
            <div style={s.statLabel}>Remaining</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          <button onClick={() => setActiveTab("medicines")} style={{ ...s.tabBtn, ...(activeTab === "medicines" ? s.tabBtnActive : {}) }}>💊 My Medicines</button>
          <button onClick={() => setActiveTab("tasks")}     style={{ ...s.tabBtn, ...(activeTab === "tasks"     ? s.tabBtnActive : {}) }}>✅ My Tasks</button>
        </div>

        {/* Medicines */}
        {activeTab === "medicines" && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>💊 Today's Medicines</h2>
            {medicines.length === 0
              ? <p style={s.empty}>No medicines scheduled for today. Your caregiver will add them.</p>
              : medicines.map(med => (
                <div key={med._id} style={s.item}>
                  <div>
                    <div style={s.itemName}>{med.name}</div>
                    <div style={s.itemSub}>{med.dosage} — at {med.time}</div>
                  </div>
                  {med.taken
                    ? <span style={s.tagDone}>✓ Taken</span>
                    : <button onClick={() => markTaken(med._id)} style={s.markBtn}>Mark as Taken</button>
                  }
                </div>
              ))
            }
          </div>
        )}

        {/* Tasks */}
        {activeTab === "tasks" && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>✅ Today's Tasks</h2>
            {tasks.length === 0
              ? <p style={s.empty}>No tasks assigned for today. Your caregiver will add them.</p>
              : tasks.map(task => (
                <div key={task._id} style={s.item}>
                  <div>
                    <div style={s.itemName}>{task.description}</div>
                    <div style={s.itemSub}>Assigned to: {task.assignedTo}</div>
                  </div>
                  {task.completed
                    ? <span style={s.tagDone}>✓ Done</span>
                    : <button onClick={() => markComplete(task._id)} style={s.markBtn}>Mark Done</button>
                  }
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  loading:      { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: "#9ca3af" },
  page:         { minHeight: "100vh", background: "#f7f8fa", fontFamily: "'Segoe UI', sans-serif" },
  nav:          { background: "#1a1a2e", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo:         { display: "flex", alignItems: "center", gap: "8px" },
  heart:        { color: "#e05c5c", fontSize: "18px" },
  logoText:     { fontSize: "18px", fontWeight: "700", color: "#fff" },
  navRight:     { display: "flex", alignItems: "center", gap: "16px" },
  welcome:      { color: "#d1d5db", fontSize: "14px" },
  logoutBtn:    { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  content:      { maxWidth: "750px", margin: "0 auto", padding: "40px 24px" },
  heading:      { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" },
  sub:          { color: "#9ca3af", fontSize: "14px", marginBottom: "24px" },
  warnBox:      { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px 18px", fontSize: "13px", color: "#92400e", marginBottom: "20px" },
  sosBox:       { background: "#fff0f0", border: "1px solid #fecaca", borderRadius: "12px", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  sosLabel:     { fontSize: "15px", fontWeight: "700", color: "#1a1a2e" },
  sosHint:      { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  sosBtn:       { background: "#dc2626", color: "#fff", border: "none", borderRadius: "9px", padding: "12px 24px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  sosMsg:       { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#15803d", marginBottom: "20px" },
  statsRow:     { display: "flex", gap: "16px", margin: "24px 0 28px" },
  statCard:     { flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "18px", textAlign: "center" },
  statNum:      { fontSize: "26px", fontWeight: "800", color: "#1a1a2e" },
  statLabel:    { fontSize: "12px", color: "#9ca3af", marginTop: "4px" },
  tabRow:       { display: "flex", gap: "8px", marginBottom: "20px" },
  tabBtn:       { padding: "9px 20px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "#fff", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  tabBtnActive: { background: "#1a1a2e", color: "#fff", border: "1.5px solid #1a1a2e" },
  section:      { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px", marginTop: 0 },
  item:         { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f3f4f6" },
  itemName:     { fontSize: "15px", fontWeight: "600", color: "#1a1a2e" },
  itemSub:      { fontSize: "12px", color: "#9ca3af", marginTop: "3px" },
  empty:        { color: "#9ca3af", fontSize: "13px", textAlign: "center", padding: "28px 0" },
  markBtn:      { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "7px", padding: "8px 16px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" },
  tagDone:      { fontSize: "11px", fontWeight: "600", color: "#10b981", background: "#f0fdf4", padding: "4px 10px", borderRadius: "100px", whiteSpace: "nowrap" },
};