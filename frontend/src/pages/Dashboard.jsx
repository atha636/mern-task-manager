import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

// ── Status helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: {
    dot: "#EF9F27",
    badge: { background: "#FAEEDA", color: "#854F0B" },
  },
  "In Progress": {
    dot: "#378ADD",
    badge: { background: "#E6F1FB", color: "#185FA5" },
  },
  Completed: {
    dot: "#639922",
    badge: { background: "#EAF3DE", color: "#3B6D11" },
  },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Component ───────────────────────────────────────────────────────────────
function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
  });

  // Read user from localStorage (saved at login)
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data.tasks);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", description: "", status: "Pending" });
  };

  const createTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/tasks", formData);
      setTasks([res.data.task, ...tasks]);
      resetForm();
      toast.success("Task added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.put(`/tasks/${editId}`, formData);
      setTasks(tasks.map((t) => (t._id === editId ? res.data.updatedTask : t)));
      resetForm();
      toast.success("Task updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stats
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={s.brandName}>TaskFlow</span>
          </div>

          <div style={s.headerRight}>
            <div style={s.avatar}>{getInitials(user.name)}</div>
            <span style={s.userName}>{user.name || "User"}</span>
            <button onClick={logout} style={s.logoutBtn}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main style={s.body}>
        {/* Stats */}
        <div style={s.stats}>
          <div style={s.statCard}>
            <p style={s.statLabel}>TOTAL TASKS</p>
            <p style={s.statValue}>{total}</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>IN PROGRESS</p>
            <p style={s.statValue}>{inProgress}</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>COMPLETED</p>
            <p style={s.statValue}>{completed}</p>
          </div>
        </div>

        {/* Form */}
        <div style={s.section}>
          <p style={s.sectionTitle}>
            {editId ? "Edit task" : "New task"}
          </p>
          <div style={s.formCard}>
            <form onSubmit={editId ? updateTask : createTask}>
              <div style={s.formRow}>
                <div style={{ flex: 2 }}>
                  <label style={s.label}>TITLE</label>
                  <input
                    style={s.input}
                    type="text"
                    name="title"
                    placeholder="What needs to be done?"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>STATUS</label>
                  <select
                    style={s.input}
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={s.label}>DESCRIPTION</label>
                <textarea
                  style={{ ...s.input, minHeight: "78px", resize: "vertical" }}
                  name="description"
                  placeholder="Add some details..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={s.formFooter}>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={s.cancelBtn}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                >
                  {submitting
                    ? editId
                      ? "Saving..."
                      : "Adding..."
                    : editId
                    ? "Save changes"
                    : "Add task"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Task list */}
        <div style={s.section}>
          <p style={s.sectionTitle}>Your tasks</p>

          {loading ? (
            <div style={s.emptyState}>Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div style={s.emptyState}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth="1.5" style={{ marginBottom: "10px" }}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <p style={{ color: "#888780", fontSize: "14px" }}>
                No tasks yet. Add your first one above.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tasks.map((task) => {
                const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
                return (
                  <div
                    key={task._id}
                    style={{
                      ...s.taskCard,
                      borderLeft: `3px solid ${cfg.dot}`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={s.taskHeader}>
                        <h4 style={s.taskTitle}>{task.title}</h4>
                        <span
                          style={{
                            ...s.badge,
                            background: cfg.badge.background,
                            color: cfg.badge.color,
                          }}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p style={s.taskDesc}>{task.description}</p>
                      <p style={s.taskMeta}>{timeAgo(task.createdAt)}</p>
                    </div>

                    <div style={s.taskActions}>
                      <button
                        onClick={() => handleEdit(task)}
                        style={s.iconBtn}
                        title="Edit task"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTask(task._id)}
                        style={{ ...s.iconBtn, color: "#A32D2D" }}
                        title="Delete task"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F4F0",
    fontFamily: "inherit",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #E8E6DF",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "54px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },
  brandIcon: {
    width: "28px",
    height: "28px",
    backgroundColor: "#534AB7",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#EEEDFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#534AB7",
  },
  userName: {
    fontSize: "13px",
    color: "#5F5E5A",
    fontWeight: "500",
  },
  logoutBtn: {
    padding: "5px 13px",
    border: "1px solid #E8E6DF",
    borderRadius: "7px",
    backgroundColor: "transparent",
    fontSize: "12px",
    color: "#5F5E5A",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  body: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "1.75rem 1.5rem 3rem",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "1.75rem",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #E8E6DF",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
  },
  statLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#888780",
    letterSpacing: "0.07em",
    marginBottom: "6px",
  },
  statValue: {
    fontSize: "26px",
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  section: {
    marginBottom: "1.75rem",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "10px",
    letterSpacing: "-0.01em",
  },
  formCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #E8E6DF",
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
  },
  formRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: "700",
    color: "#888780",
    letterSpacing: "0.07em",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    backgroundColor: "#F9F8F5",
    border: "1px solid #E8E6DF",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#1a1a1a",
    outline: "none",
    fontFamily: "inherit",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  cancelBtn: {
    padding: "8px 18px",
    border: "1px solid #E8E6DF",
    borderRadius: "8px",
    backgroundColor: "transparent",
    fontSize: "13px",
    fontWeight: "500",
    color: "#5F5E5A",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitBtn: {
    padding: "8px 20px",
    backgroundColor: "#534AB7",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  emptyState: {
    backgroundColor: "#ffffff",
    border: "1px solid #E8E6DF",
    borderRadius: "14px",
    padding: "2.5rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  taskCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #E8E6DF",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    borderLeftWidth: "3px",
  },
  taskHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "5px",
    flexWrap: "wrap",
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: "-0.01em",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 9px",
    borderRadius: "20px",
    letterSpacing: "0.01em",
  },
  taskDesc: {
    fontSize: "13px",
    color: "#5F5E5A",
    marginBottom: "6px",
    lineHeight: "1.5",
  },
  taskMeta: {
    fontSize: "11px",
    color: "#B4B2A9",
  },
  taskActions: {
    display: "flex",
    gap: "6px",
    flexShrink: 0,
    paddingTop: "2px",
  },
  iconBtn: {
    width: "30px",
    height: "30px",
    border: "1px solid #E8E6DF",
    borderRadius: "7px",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#5F5E5A",
  },
};

export default Dashboard;