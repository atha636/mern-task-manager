import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending:      { dot: "#EF9F27", badge: { background: "#FAEEDA", color: "#854F0B" } },
  "In Progress":{ dot: "#378ADD", badge: { background: "#E6F1FB", color: "#185FA5" } },
  Completed:    { dot: "#639922", badge: { background: "#EAF3DE", color: "#3B6D11" } },
};

const FILTERS = ["All", "Pending", "In Progress", "Completed"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ── Helper: delay ─────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 14, color = "#ffffff" }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
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
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Confirmation Popup ────────────────────────────────────────────────────────
function ConfirmPopup({ title, message, confirmLabel, confirmDanger, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await delay(1000);
    onConfirm();
    // Note: don't setLoading(false) here — popup unmounts after onConfirm
  };

  return (
    <div style={popup.overlay}>
      <div style={popup.box}>
        <h3 style={popup.title}>{title}</h3>
        <p style={popup.message}>{message}</p>
        <div style={popup.actions}>
          <button onClick={onCancel} style={popup.cancelBtn} disabled={loading}>Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              ...popup.confirmBtn,
              backgroundColor: confirmDanger ? "var(--danger)" : "var(--accent)",
              opacity: loading ? 0.85 : 1,
              display: "flex",
              alignItems: "center",
              gap: "7px",
              minWidth: "90px",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <>
                <Spinner size={13} color="#fff" />
                {confirmDanger ? "Deleting..." : "Signing out..."}
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const popup = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "var(--popup-overlay)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "1rem",
  },
  box: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "1.5rem 1.75rem",
    width: "100%",
    maxWidth: "360px",
    boxShadow: "var(--popup-shadow)",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "8px",
    letterSpacing: "-0.01em",
  },
  message: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginBottom: "1.5rem",
    lineHeight: "1.5",
  },
  actions: { display: "flex", gap: "8px", justifyContent: "flex-end" },
  cancelBtn: {
    padding: "8px 18px",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    backgroundColor: "transparent",
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  confirmBtn: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const { dark, toggle } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", status: "Pending" });
  const [formErrors, setFormErrors] = useState({});

  // Edit button loading per task
  const [editLoadingId, setEditLoadingId] = useState(null);
  // Delete button loading per task (icon button)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Filter & search state
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Popup state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ── Filtered + searched tasks ─────────────────────────────────────────────
  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesFilter = activeFilter === "All" || t.status === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, searchQuery]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
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

  useEffect(() => { fetchTasks(); }, []);

  // ── Form ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required";
    else if (formData.title.trim().length < 3) errs.title = "Title must be at least 3 characters";
    if (!formData.description.trim()) errs.description = "Description is required";
    else if (formData.description.trim().length < 5) errs.description = "Description must be at least 5 characters";
    return errs;
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", description: "", status: "Pending" });
    setFormErrors({});
  };

  const createTask = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await delay(1000); // 1 sec loading feel
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
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await delay(1000); // 1 sec loading feel
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

  // ── Delete ────────────────────────────────────────────────────────────────
  const doDelete = async () => {
    try {
      await API.delete(`/tasks/${deleteTargetId}`);
      setTasks(tasks.filter((t) => t._id !== deleteTargetId));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleteTargetId(null);
    }
  };

  // Edit button: 1 sec delay before opening form
  const handleEdit = async (task) => {
    setEditLoadingId(task._id);
    await delay(1000);
    setEditLoadingId(null);
    setEditId(task._id);
    setFormData({ title: task.title, description: task.description, status: task.status });
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete icon button: show loading on icon, then open confirm popup
  const handleDeleteClick = async (taskId) => {
    setDeleteLoadingId(taskId);
    await delay(1000);
    setDeleteLoadingId(null);
    setDeleteTargetId(taskId);
  };

  // Stats
  const total      = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed  = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div style={s.page}>

      {/* ── Logout popup ── */}
      {showLogoutConfirm && (
        <ConfirmPopup
          title="Sign out?"
          message="You'll need to sign in again to access your tasks."
          confirmLabel="Sign out"
          confirmDanger={false}
          onConfirm={doLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {/* ── Delete popup ── */}
      {deleteTargetId && (
        <ConfirmPopup
          title="Delete task?"
          message="This action cannot be undone. The task will be permanently removed."
          confirmLabel="Delete"
          confirmDanger={true}
          onConfirm={doDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={s.brandName}>TaskFlow</span>
          </div>
          <div style={s.headerRight}>
            <button onClick={toggle} style={s.themeBtn} title="Toggle theme">
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <div style={s.avatar}>{getInitials(user.name)}</div>
            <span style={s.userName}>{user.name || "User"}</span>
            <button onClick={() => setShowLogoutConfirm(true)} style={s.logoutBtn}>
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
          <p style={s.sectionTitle}>{editId ? "Edit task" : "New task"}</p>
          <div style={s.formCard}>
            <form onSubmit={editId ? updateTask : createTask} noValidate>
              <div style={s.formRow}>
                <div style={{ flex: 2 }}>
                  <label style={s.label}>TITLE</label>
                  <input
                    style={{ ...s.input, ...(formErrors.title ? s.inputError : {}) }}
                    type="text"
                    name="title"
                    placeholder="What needs to be done?"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {formErrors.title && <p style={s.errorMsg}>{formErrors.title}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>STATUS</label>
                  <select style={s.input} name="status" value={formData.status} onChange={handleChange}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: formErrors.description ? "0.25rem" : "1rem" }}>
                <label style={s.label}>DESCRIPTION</label>
                <textarea
                  style={{
                    ...s.input,
                    minHeight: "78px",
                    resize: "vertical",
                    ...(formErrors.description ? s.inputError : {}),
                  }}
                  name="description"
                  placeholder="Add some details..."
                  value={formData.description}
                  onChange={handleChange}
                />
                {formErrors.description && (
                  <p style={{ ...s.errorMsg, marginBottom: "0.75rem" }}>{formErrors.description}</p>
                )}
              </div>

              <div style={s.formFooter}>
                {editId && (
                  <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
                )}
                <button
                  type="submit"
                  style={{
                    ...s.submitBtn,
                    opacity: submitting ? 0.85 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    minWidth: "110px",
                    justifyContent: "center",
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner size={13} color="#fff" />
                      {editId ? "Saving..." : "Adding..."}
                    </>
                  ) : (
                    editId ? "Save changes" : "Add task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div style={s.section}>
          <p style={s.sectionTitle}>Your tasks</p>

          <div style={s.searchFilterRow}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}><SearchIcon /></span>
              <input
                style={s.searchInput}
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={s.clearBtn}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div style={s.filterPills}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    ...s.pill,
                    ...(activeFilter === f ? s.pillActive : {}),
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {(searchQuery || activeFilter !== "All") && (
            <p style={s.resultCount}>
              {visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""} found
            </p>
          )}

          {/* Task list */}
          {loading ? (
            <div style={s.emptyState}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading tasks...</p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div style={s.emptyState}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="var(--text-faint)" strokeWidth="1.5" style={{ marginBottom: "10px" }}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                {tasks.length === 0
                  ? "No tasks yet. Add your first one above."
                  : "No tasks match your search or filter."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {visibleTasks.map((task) => {
                const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
                const isEditLoading = editLoadingId === task._id;
                const isDeleteLoading = deleteLoadingId === task._id;

                return (
                  <div
                    key={task._id}
                    style={{ ...s.taskCard, borderLeft: `3px solid ${cfg.dot}` }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={s.taskHeader}>
                        <h4 style={s.taskTitle}>{task.title}</h4>
                        <span style={{ ...s.badge, background: cfg.badge.background, color: cfg.badge.color }}>
                          {task.status}
                        </span>
                      </div>
                      <p style={s.taskDesc}>{task.description}</p>
                      <p style={s.taskMeta}>{timeAgo(task.createdAt)}</p>
                    </div>

                    <div style={s.taskActions}>
                      {/* Edit button */}
                      <button
                        onClick={() => handleEdit(task)}
                        disabled={isEditLoading || isDeleteLoading}
                        style={{
                          ...s.iconBtn,
                          opacity: isEditLoading ? 0.7 : 1,
                          backgroundColor: isEditLoading ? "var(--bg-input)" : "transparent",
                        }}
                        title="Edit task"
                      >
                        {isEditLoading ? (
                          <Spinner size={13} color="var(--text-secondary)" />
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        )}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteClick(task._id)}
                        disabled={isDeleteLoading || isEditLoading}
                        style={{
                          ...s.iconBtn,
                          color: "var(--danger)",
                          opacity: isDeleteLoading ? 0.7 : 1,
                          backgroundColor: isDeleteLoading ? "var(--bg-input)" : "transparent",
                        }}
                        title="Delete task"
                      >
                        {isDeleteLoading ? (
                          <Spinner size={13} color="var(--danger)" />
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        )}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", backgroundColor: "var(--bg-page)", fontFamily: "inherit" },
  header: {
    backgroundColor: "var(--bg-card)",
    borderBottom: "1px solid var(--border)",
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
  brand: { display: "flex", alignItems: "center", gap: "9px" },
  brandIcon: {
    width: "28px", height: "28px",
    backgroundColor: "var(--accent)",
    borderRadius: "7px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.02em" },
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  themeBtn: {
    width: "32px", height: "32px",
    borderRadius: "7px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg-input)",
    color: "var(--toggle-icon)",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: "32px", height: "32px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-avatar)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "600", color: "var(--accent-text)",
  },
  userName: { fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" },
  logoutBtn: {
    padding: "5px 13px",
    border: "1px solid var(--border)",
    borderRadius: "7px",
    backgroundColor: "transparent",
    fontSize: "12px", color: "var(--text-secondary)",
    cursor: "pointer", fontFamily: "inherit",
  },
  body: { maxWidth: "900px", margin: "0 auto", padding: "1.75rem 1.5rem 3rem" },
  stats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.75rem" },
  statCard: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
  },
  statLabel: { fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.07em", marginBottom: "6px" },
  statValue: { fontSize: "26px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.02em" },
  section: { marginBottom: "1.75rem" },
  sectionTitle: { fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px", letterSpacing: "-0.01em" },
  formCard: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
  },
  formRow: { display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" },
  label: { display: "block", fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.07em", marginBottom: "6px" },
  input: {
    width: "100%", padding: "9px 12px",
    backgroundColor: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontSize: "14px", color: "var(--text-primary)",
    outline: "none", fontFamily: "inherit",
  },
  inputError: { borderColor: "var(--danger)" },
  errorMsg: { fontSize: "12px", color: "var(--danger)", marginTop: "5px", marginBottom: "0" },
  formFooter: { display: "flex", justifyContent: "flex-end", gap: "8px" },
  cancelBtn: {
    padding: "8px 18px",
    border: "1px solid var(--border)",
    borderRadius: "8px", backgroundColor: "transparent",
    fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)",
    cursor: "pointer", fontFamily: "inherit",
  },
  submitBtn: {
    padding: "8px 20px",
    backgroundColor: "var(--accent)", border: "none",
    borderRadius: "8px", color: "#ffffff",
    fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
  },
  searchFilterRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: {
    position: "relative",
    flex: 1,
    minWidth: "180px",
  },
  searchIcon: {
    position: "absolute",
    left: "11px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "8px 34px 8px 34px",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontSize: "13px",
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "inherit",
  },
  clearBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    fontSize: "12px",
    padding: "0",
    lineHeight: 1,
  },
  filterPills: { display: "flex", gap: "6px", flexWrap: "wrap" },
  pill: {
    padding: "6px 13px",
    borderRadius: "20px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg-card)",
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  pillActive: {
    backgroundColor: "var(--accent)",
    borderColor: "var(--accent)",
    color: "#ffffff",
  },
  resultCount: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginBottom: "10px",
  },
  emptyState: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "2.5rem",
    textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  taskCard: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    display: "flex", alignItems: "flex-start", gap: "1rem",
    borderLeftWidth: "3px",
  },
  taskHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px", flexWrap: "wrap" },
  taskTitle: { fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.01em" },
  badge: { fontSize: "11px", fontWeight: "600", padding: "2px 9px", borderRadius: "20px", letterSpacing: "0.01em" },
  taskDesc: { fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", lineHeight: "1.5" },
  taskMeta: { fontSize: "11px", color: "var(--text-faint)" },
  taskActions: { display: "flex", gap: "6px", flexShrink: 0, paddingTop: "2px" },
  iconBtn: {
    width: "30px", height: "30px",
    border: "1px solid var(--border)",
    borderRadius: "7px", backgroundColor: "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "var(--text-secondary)",
    transition: "opacity 0.2s",
  },
};

export default Dashboard;