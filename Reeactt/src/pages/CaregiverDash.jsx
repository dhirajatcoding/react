// src/pages/CaregiverDash.jsx
// Caregiver adds medicines and tasks under their OWN id
// Seniors linked to this caregiver will see these items

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function CaregiverDash() {
  const navigate = useNavigate();

  const [user, setUser]                 = useState(null);
  const [medicines, setMedicines]       = useState([]);
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("medicines");
  const [showMedForm, setShowMedForm]   = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [medMsg, setMedMsg]             = useState("");
  const [taskMsg, setTaskMsg]           = useState("");
  const [medForm, setMedForm]           = useState({ name: "", dosage: "", time: "" });
  const [taskForm, setTaskForm]         = useState({ description: "", assignedTo: "" });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token  = localStorage.getItem("token");
    if (!stored || !token) { navigate("/auth"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "caregiver") { navigate("/auth"); return; }
    setUser(parsed);
    // Caregiver fetches data using their OWN id as the seniorId
    // Seniors linked to this caregiver use this same id to fetch
    fetchData(parsed.id, token);
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

  async function handleAddMedicine(e) {
    e.preventDefault();
    setMedMsg("");
    if (!medForm.name || !medForm.dosage || !medForm.time) {
      setMedMsg("Please fill all fields.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/medicines/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          seniorId: user.id,  // caregiver's own id — seniors will query by this
          name:     medForm.name,
          dosage:   medForm.dosage,
          time:     medForm.time,
          date:     today,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMedicines([...medicines, data.medicine]);
        setMedForm({ name: "", dosage: "", time: "" });
        setShowMedForm(false);
      } else {
        setMedMsg(data.message || "Failed to add.");
      }
    } catch {
      setMedMsg("Cannot connect to server.");
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    setTaskMsg("");
    if (!taskForm.description || !taskForm.assignedTo) {
      setTaskMsg("Please fill all fields.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/tasks/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          seniorId:    user.id,
          description: taskForm.description,
          assignedTo:  taskForm.assignedTo,
          date:        today,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([...tasks, data.task]);
        setTaskForm({ description: "", assignedTo: "" });
        setShowTaskForm(false);
      } else {
        setTaskMsg(data.message || "Failed to add.");
      }
    } catch {
      setTaskMsg("Cannot connect to server.");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/auth");
  }

  if (!user || loading) return <div style={s.loading}>Loading...</div>;

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
        <h1 style={s.heading}>Caregiver Dashboard</h1>
        <p style={s.sub}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statNum}>{medicines.length}</div>
            <div style={s.statLabel}>Medicines Today</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>{medicines.filter(m => m.taken).length}/{medicines.length}</div>
            <div style={s.statLabel}>Medicines Taken</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>{tasks.filter(t => t.completed).length}/{tasks.length}</div>
            <div style={s.statLabel}>Tasks Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          <button onClick={() => setActiveTab("medicines")} style={{ ...s.tabBtn, ...(activeTab === "medicines" ? s.tabBtnActive : {}) }}>💊 Medicines</button>
          <button onClick={() => setActiveTab("tasks")}     style={{ ...s.tabBtn, ...(activeTab === "tasks"     ? s.tabBtnActive : {}) }}>✅ Tasks</button>
        </div>

        {/* Medicines Tab */}
        {activeTab === "medicines" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Today's Medicines</h2>
              <button onClick={() => { setShowMedForm(!showMedForm); setMedMsg(""); }} style={s.addBtn}>
                {showMedForm ? "✕ Cancel" : "+ Add Medicine"}
              </button>
            </div>

            {showMedForm && (
              <form onSubmit={handleAddMedicine} style={s.form}>
                <div style={s.formRow}>
                  <div style={s.field}>
                    <label style={s.label}>Medicine Name</label>
                    <input style={s.input} placeholder="e.g. Aspirin" value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Dosage</label>
                    <input style={s.input} placeholder="e.g. 500mg" value={medForm.dosage} onChange={e => setMedForm({ ...medForm, dosage: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Time</label>
                    <input style={s.input} placeholder="e.g. 8:00 AM" value={medForm.time} onChange={e => setMedForm({ ...medForm, time: e.target.value })} />
                  </div>
                </div>
                {medMsg && <p style={s.errMsg}>{medMsg}</p>}
                <button type="submit" style={s.submitBtn}>Save Medicine</button>
              </form>
            )}

            {medicines.length === 0
              ? <p style={s.empty}>No medicines added yet.</p>
              : medicines.map(med => (
                <div key={med._id} style={s.item}>
                  <div>
                    <div style={s.itemName}>{med.name} — {med.dosage}</div>
                    <div style={s.itemSub}>Scheduled at {med.time}</div>
                  </div>
                  {med.taken
                    ? <span style={s.tagDone}>✓ Taken</span>
                    : <span style={s.tagPending}>Pending</span>
                  }
                </div>
              ))
            }
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Today's Tasks</h2>
              <button onClick={() => { setShowTaskForm(!showTaskForm); setTaskMsg(""); }} style={s.addBtn}>
                {showTaskForm ? "✕ Cancel" : "+ Add Task"}
              </button>
            </div>

            {showTaskForm && (
              <form onSubmit={handleAddTask} style={s.form}>
                <div style={s.formRow}>
                  <div style={s.field}>
                    <label style={s.label}>Task Description</label>
                    <input style={s.input} placeholder="e.g. Morning walk" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Assign To</label>
                    <input style={s.input} placeholder="e.g. Margaret" value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })} />
                  </div>
                </div>
                {taskMsg && <p style={s.errMsg}>{taskMsg}</p>}
                <button type="submit" style={s.submitBtn}>Save Task</button>
              </form>
            )}

            {tasks.length === 0
              ? <p style={s.empty}>No tasks added yet.</p>
              : tasks.map(task => (
                <div key={task._id} style={s.item}>
                  <div>
                    <div style={s.itemName}>{task.description}</div>
                    <div style={s.itemSub}>Assigned to: {task.assignedTo}</div>
                  </div>
                  {task.completed
                    ? <span style={s.tagDone}>✓ Done</span>
                    : <span style={s.tagPending}>Pending</span>
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
  sub:          { color: "#9ca3af", fontSize: "14px", marginBottom: "32px" },
  statsRow:     { display: "flex", gap: "16px", marginBottom: "28px" },
  statCard:     { flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", textAlign: "center" },
  statNum:      { fontSize: "28px", fontWeight: "800", color: "#1a1a2e" },
  statLabel:    { fontSize: "12px", color: "#9ca3af", marginTop: "4px" },
  tabRow:       { display: "flex", gap: "8px", marginBottom: "20px" },
  tabBtn:       { padding: "9px 20px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "#fff", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  tabBtnActive: { background: "#1a1a2e", color: "#fff", border: "1.5px solid #1a1a2e" },
  section:      { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginBottom: "20px" },
  sectionHeader:{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  addBtn:       { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "7px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  form:         { background: "#f7f8fa", borderRadius: "10px", padding: "20px", marginBottom: "20px", border: "1px solid #e5e7eb" },
  formRow:      { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "12px" },
  field:        { display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "160px" },
  label:        { fontSize: "12px", fontWeight: "600", color: "#374151" },
  input:        { padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "7px", fontSize: "13px", outline: "none", background: "#fff", color: "#1a1a2e" },
  submitBtn:    { background: "#10b981", color: "#fff", border: "none", borderRadius: "7px", padding: "10px 22px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  errMsg:       { color: "#d93025", fontSize: "12px", marginBottom: "8px", background: "#fff0f0", padding: "6px 10px", borderRadius: "6px" },
  item:         { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
  itemName:     { fontSize: "14px", fontWeight: "600", color: "#1a1a2e" },
  itemSub:      { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  empty:        { color: "#9ca3af", fontSize: "13px", textAlign: "center", padding: "24px 0" },
  tagDone:      { fontSize: "11px", fontWeight: "600", color: "#10b981", background: "#f0fdf4", padding: "4px 10px", borderRadius: "100px" },
  tagPending:   { fontSize: "11px", fontWeight: "600", color: "#f59e0b", background: "#fffbeb", padding: "4px 10px", borderRadius: "100px" },
};