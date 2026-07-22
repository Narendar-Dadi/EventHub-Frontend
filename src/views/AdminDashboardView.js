import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, UserPlus, Trash2, Calendar, TrendingUp, Settings,
  FileText, CheckCircle, XCircle, Clock, Eye, EyeOff, Briefcase,
  AlertTriangle, RefreshCw, QrCode
} from "lucide-react";
import { api } from "../api/client";

const STATUS_BADGE = {
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};
const ROLE_BADGE = {
  admin:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  organizer: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  student:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
};

const TABS = [
  { id: "overview",   label: "Overview",           icon: TrendingUp },
  { id: "organizers", label: "Organizer Requests",  icon: Briefcase },
  { id: "users",      label: "All Users",           icon: Users },
  { id: "create",     label: "Create Account",      icon: UserPlus }
];

export default function AdminDashboardView({ user, events, navigate, transactions, showToast }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers]         = useState([]);
  const [orgRequests, setOrgRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingOrgs, setLoadingOrgs]   = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "organizer" });
  const [creating, setCreating]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch { showToast("Failed to load users", "error"); }
    finally { setLoadingUsers(false); }
  }, [showToast]);

  const fetchOrgRequests = useCallback(async () => {
    setLoadingOrgs(true);
    try {
      const data = await api.getOrganizerRequests();
      setOrgRequests(data.requests || []);
    } catch { showToast("Failed to load organizer requests", "error"); }
    finally { setLoadingOrgs(false); }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === "users" || activeTab === "overview") fetchUsers();
    if (activeTab === "organizers" || activeTab === "overview") fetchOrgRequests();
  }, [activeTab, fetchUsers, fetchOrgRequests]);

  const totalRev = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const totalReg = events.reduce((s, e) => s + (e.registered || 0), 0);
  const pendingCount = orgRequests.filter((r) => r.status === "pending").length;

  const handleApprove = async (id, name) => {
    setProcessingId(id);
    try {
      await api.approveOrganizer(id);
      showToast(`✅ ${name} approved as Organizer`, "success");
      setOrgRequests((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: "approved" } : r)
      );
    } catch (err) { showToast(err.message, "error"); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (id, name) => {
    setProcessingId(id);
    try {
      await api.rejectOrganizer(id);
      showToast(`${name}'s application rejected`, "info");
      setOrgRequests((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: "rejected" } : r)
      );
    } catch (err) { showToast(err.message, "error"); }
    finally { setProcessingId(null); }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      await api.deleteUser(userId);
      showToast("User deleted", "success");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) { showToast(err.message, "error"); }
    finally { setDeletingId(null); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createUser(createForm);
      showToast(`${createForm.role} account created!`, "success");
      setCreateForm({ name: "", email: "", password: "", role: "organizer" });
      fetchUsers();
    } catch (err) { showToast(err.message, "error"); }
    finally { setCreating(false); }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Welcome, <span className="font-semibold text-red-500">{user.name}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <Shield size={11} /> Super Admin
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => navigate("qr-scanner")} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm">
            <QrCode size={16} /> QR Scanner
          </button>
          <button onClick={() => navigate("dashboard")} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm">
            <Calendar size={16} /> Organizer View
          </button>
          <button onClick={() => navigate("transactions")} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm hover:border-blue-400">
            <FileText size={16} /> Transactions
          </button>
          <button onClick={() => navigate("settings")} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm hover:border-blue-400">
            <Settings size={16} /> Payment Settings
          </button>
        </div>
      </motion.div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-8 border-b border-slate-200 dark:border-slate-800 pb-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isPending = tab.id === "organizers" && pendingCount > 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all -mb-px relative ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={16} /> {tab.label}
              {isPending && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Overview Tab ───────────────────────────────── */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { title: "Total Revenue",    value: `₹${totalRev.toLocaleString()}`, icon: TrendingUp,  bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-500" },
                { title: "Total Users",       value: users.length,                   icon: Users,        bg: "bg-blue-100 dark:bg-blue-900/30",    color: "text-blue-500" },
                { title: "Active Events",     value: events.length,                  icon: Calendar,     bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-500" },
                { title: "Pending Approvals", value: pendingCount,                   icon: Clock,        bg: "bg-amber-100 dark:bg-amber-900/30",   color: "text-amber-500" }
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} mb-4`}>
                    <kpi.icon className={kpi.color} size={24} />
                  </div>
                  <div className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</div>
                  <div className="text-3xl font-bold">{kpi.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Pending organizer requests alert */}
            {pendingCount > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-6 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-700 dark:text-amber-400">
                    {pendingCount} Organizer {pendingCount === 1 ? "Request" : "Requests"} Awaiting Approval
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-500">Review and approve organizer applications to grant event management access.</p>
                </div>
                <button onClick={() => setActiveTab("organizers")}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shrink-0"
                >
                  Review Now
                </button>
              </motion.div>
            )}

            {/* Recent organizer requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase size={18} className="text-purple-500" /> Recent Organizer Requests</h3>
                  <button onClick={() => setActiveTab("organizers")} className="text-sm text-blue-600 font-semibold">View All</button>
                </div>
                {orgRequests.length === 0
                  ? <p className="p-8 text-center text-slate-400">No organizer requests yet.</p>
                  : orgRequests.slice(0, 4).map((r) => (
                    <div key={r._id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 font-bold text-sm">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{r.name}</p>
                        <p className="text-xs text-slate-400 truncate">{r.email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    </div>
                  ))
                }
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Users size={18} className="text-blue-500" /> Recent Users</h3>
                  <button onClick={() => setActiveTab("users")} className="text-sm text-blue-600 font-semibold">View All</button>
                </div>
                {users.slice(0, 5).map((u) => (
                  <div key={u._id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Organizer Requests Tab ─────────────────────── */}
        {activeTab === "organizers" && (
          <motion.div key="organizers" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase size={20} className="text-purple-500" /> Organizer Requests
                </h3>
                <button onClick={fetchOrgRequests} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Refresh">
                  <RefreshCw size={16} className={loadingOrgs ? "animate-spin" : ""} />
                </button>
              </div>

              {loadingOrgs ? (
                <div className="p-12 text-center text-slate-400">Loading requests...</div>
              ) : orgRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No organizer requests yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 font-medium">Applicant</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Applied</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgRequests.map((r) => (
                        <tr key={r._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-sm">
                                {r.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold">{r.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500">{r.email}</td>
                          <td className="p-4 text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize inline-flex items-center gap-1 ${STATUS_BADGE[r.status]}`}>
                              {r.status === "pending" && <Clock size={11} />}
                              {r.status === "approved" && <CheckCircle size={11} />}
                              {r.status === "rejected" && <XCircle size={11} />}
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {r.status !== "approved" && (
                                <button
                                  onClick={() => handleApprove(r._id, r.name)}
                                  disabled={processingId === r._id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                                >
                                  <CheckCircle size={13} />
                                  {processingId === r._id ? "..." : "Approve"}
                                </button>
                              )}
                              {r.status !== "rejected" && (
                                <button
                                  onClick={() => handleReject(r._id, r.name)}
                                  disabled={processingId === r._id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold disabled:opacity-50 border border-red-200 dark:border-red-800 transition-colors"
                                >
                                  <XCircle size={13} />
                                  {processingId === r._id ? "..." : "Reject"}
                                </button>
                              )}
                              {r.status === "approved" && r.status !== "rejected" && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <CheckCircle size={12} className="text-green-500" /> Approved
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── All Users Tab ──────────────────────────────── */}
        {activeTab === "users" && (
          <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2"><Users size={20} className="text-blue-500" /> All Users ({users.length})</h3>
                <button onClick={fetchUsers} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <RefreshCw size={16} className={loadingUsers ? "animate-spin" : ""} />
                </button>
              </div>
              {loadingUsers ? (
                <div className="p-12 text-center text-slate-400">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Joined</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-4 font-semibold">{u.name}</td>
                          <td className="p-4 text-slate-500">{u.email}</td>
                          <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                          <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_BADGE[u.status] || STATUS_BADGE.approved}`}>{u.status || "approved"}</span></td>
                          <td className="p-4 text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                          <td className="p-4">
                            {u._id !== user._id ? (
                              <button onClick={() => handleDeleteUser(u._id, u.name)} disabled={deletingId === u._id}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors">
                                <Trash2 size={15} />
                              </button>
                            ) : <span className="text-xs text-slate-400 px-2">(You)</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Create Account Tab ─────────────────────────── */}
        {activeTab === "create" && (
          <motion.div key="create" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-2xl"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><UserPlus size={20} className="text-blue-500" /> Create Account</h3>
              <p className="text-slate-500 text-sm mb-6">Admin-created accounts are immediately approved and can log in right away.</p>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl mb-6 text-sm text-blue-700 dark:text-blue-300">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-blue-500" />
                <p>Role is stored exactly as selected in MongoDB. The created account will have <strong>status: approved</strong> and can log in immediately.</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <input required type="text" placeholder="Jane Organizer" value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input required type="email" placeholder="jane@smarthub.edu" value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} placeholder="Min 6 characters" minLength={6}
                        value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        className={`${inputClass} pr-12`} />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Role</label>
                    <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className={inputClass}>
                      <option value="organizer">Organizer (Approved)</option>
                      <option value="admin">Admin</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={creating}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
                  <UserPlus size={18} />
                  {creating ? "Creating..." : `Create ${createForm.role.charAt(0).toUpperCase() + createForm.role.slice(1)} Account`}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
