import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  Calendar, FileText, QrCode, Settings, TrendingUp, Users, Trash2
} from "lucide-react";
import { MOCK_CHART_DATA, PIE_DATA, CHART_COLORS } from "../constants";
import { api } from "../api/client";

export default function DashboardView({ user, events, navigate, transactions, onEventsRefresh, showToast }) {
  const [deletingId, setDeletingId] = useState(null);

  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return (
      <div className="p-20 text-center">
        <div className="text-xl font-bold mb-2">Access Denied</div>
        <p className="text-slate-500">This dashboard is for Organizers and Admins only.</p>
        {user && (
          <p className="text-sm text-slate-400 mt-1">Your role: <strong className="capitalize">{user.role}</strong></p>
        )}
      </div>
    );
  }

  const totalRev = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalReg = events.reduce((sum, e) => sum + (e.registered || 0), 0);

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Delete event "${eventTitle}"?\n\nThis will also remove all associated payment records. This cannot be undone.`)) return;
    setDeletingId(eventId);
    try {
      const result = await api.deleteEvent(eventId);
      if (showToast) showToast(`"${eventTitle}" deleted. ${result.transactionsRemoved || 0} transactions removed.`, "success");
      if (onEventsRefresh) await onEventsRefresh();
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to delete event", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const statusColor = (s) => {
    if (s === "Sold Out") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (s === "Upcoming") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Organizer Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user.name}.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {user.role === "admin" && (
            <>
              <button
                onClick={() => navigate("transactions")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
              >
                <FileText size={18} /> Transactions
              </button>
              <button
                onClick={() => navigate("settings")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
              >
                <Settings size={18} /> Payment Settings
              </button>
            </>
          )}
          <button
            onClick={() => navigate("create-event")}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700"
          >
            + Create Event
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Revenue",        value: `₹${totalRev.toLocaleString()}`, icon: TrendingUp, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-500" },
          { title: "Total Registrations",  value: totalReg,                        icon: Users,      bg: "bg-blue-100 dark:bg-blue-900/30",    color: "text-blue-500" },
          { title: "Active Events",        value: events.length,                   icon: Calendar,   bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-500" },
          { title: "Transactions",         value: transactions.length,             icon: QrCode,     bg: "bg-amber-100 dark:bg-amber-900/30",   color: "text-amber-500" }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold mb-6">Revenue Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold mb-6">Events by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Events Table with Delete */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold">Manage Events</h3>
          {user.role === "admin" && (
            <span className="text-xs text-slate-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full font-semibold">
              Admin — can delete any event
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <th className="p-4 font-medium">Event Name</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Registrations</th>
                <th className="p-4 font-medium">Fee</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No events yet. Create your first event!</td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-semibold">{e.title}</td>
                    <td className="p-4 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-4">{e.registered}/{e.capacity}</td>
                    <td className="p-4">{e.fee === 0 ? <span className="text-green-500 font-semibold">Free</span> : `₹${e.fee}`}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(e.status)}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteEvent(e.id, e.title)}
                        disabled={deletingId === e.id}
                        title="Delete event"
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
