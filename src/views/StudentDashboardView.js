import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Ticket, Star, ArrowRight, User,
  Clock, MapPin, CheckCircle, Download, Eye, QrCode,
  RefreshCw, AlertCircle, Inbox
} from "lucide-react";

export default function StudentDashboardView({
  user,
  events,
  tickets = [],         // ← comes from App.js (lifted state, always fresh)
  navigate,
  refreshTickets        // ← callback to re-fetch from API
}) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  const upcomingEvents = events.slice(0, 4);
  const attendedCount = tickets.filter((t) => t.checkedIn).length;

  // ── Manual refresh ───────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshTickets();
    } catch {
      setError("Could not refresh tickets. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrint = () => window.print();

  // ── Full Ticket Modal ────────────────────────────────────
  if (selectedTicket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => setSelectedTicket(null)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold no-print transition-colors"
        >
          ← Back to My Tickets
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative print-ticket">
          <div className="absolute top-1/2 -left-5 w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-full -translate-y-1/2 z-10" />
          <div className="absolute top-1/2 -right-5 w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-full -translate-y-1/2 z-10" />
          <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600" />

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 min-w-0 mr-4">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold mb-2">
                  {selectedTicket.eventCategory || "Event"}
                </span>
                <h2 className="text-2xl font-extrabold">{selectedTicket.eventTitle}</h2>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                  <User size={13} /> {selectedTicket.userName || user.name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400 font-mono mb-1">TICKET ID</div>
                <div className="font-extrabold text-lg font-mono text-blue-600 dark:text-blue-400">{selectedTicket.ticketId}</div>
                <div className={`mt-2 px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                  selectedTicket.paymentStatus === "free"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  {selectedTicket.paymentStatus === "free" ? "FREE" : `₹${selectedTicket.amount} PAID`}
                </div>
                {selectedTicket.checkedIn && (
                  <div className="mt-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 inline-block">
                    ✓ ATTENDED
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 mb-6">
              <div>
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={11} /> DATE</div>
                <div className="font-bold text-sm">
                  {selectedTicket.eventDate
                    ? new Date(selectedTicket.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock size={11} /> TIME</div>
                <div className="font-bold text-sm">{selectedTicket.eventTime || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin size={11} /> VENUE</div>
                <div className="font-bold text-sm truncate">{selectedTicket.eventVenue || "—"}</div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-8" />

          <div className="p-8 flex flex-col items-center bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-800/20 dark:to-slate-900">
            <p className="text-sm text-slate-500 mb-5 flex items-center gap-2">
              <QrCode size={16} /> Show this QR at venue entry
            </p>
            {selectedTicket.qrCodeDataUrl ? (
              <div className="w-44 h-44 p-2 bg-white rounded-2xl shadow-md border border-slate-100">
                <img src={selectedTicket.qrCodeDataUrl} alt="QR Code" className="w-full h-full" />
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <div className="text-center px-4">
                  <QrCode size={24} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">QR not available</p>
                </div>
              </div>
            )}
            <p className="font-mono text-xs text-slate-400 mt-4 tracking-wider">{selectedTicket.ticketId}</p>
            <p className="text-xs text-slate-400 mt-1">
              Registered: {selectedTicket.createdAt
                ? new Date(selectedTicket.createdAt).toLocaleString("en-IN")
                : "—"}
            </p>
          </div>

          <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600" />
        </div>

        <div className="mt-6 flex gap-3 justify-center flex-wrap no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={16} /> Print Ticket
          </button>
          <button
            onClick={() => setSelectedTicket(null)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            <Ticket size={16} /> All Tickets
          </button>
        </div>

        <style>{`
          @media print {
            body > * { display: none !important; }
            .print-ticket { display: block !important; }
            .no-print { display: none !important; }
            nav { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  // ── Main Dashboard ───────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold">My Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Welcome back, <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user.name}</span>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle size={12} /> Student Account
            </span>
          </div>
          <button
            onClick={() => navigate("events")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-blue-500/25 transition-all"
          >
            Browse Events <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { title: "My Tickets",    value: tickets.length,  icon: Ticket,   bg: "bg-blue-100 dark:bg-blue-900/30",    color: "text-blue-500" },
          { title: "Events Available", value: events.length, icon: Calendar, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-500" },
          { title: "Attended",      value: attendedCount,    icon: Star,     bg: "bg-amber-100 dark:bg-amber-900/30",  color: "text-amber-500" }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── My Tickets (2/3 width) ───────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Ticket size={20} className="text-blue-500" /> My Tickets
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {tickets.length}
                </span>
              </h3>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                title="Refresh tickets"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-6 mt-4 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
                <button onClick={handleRefresh} className="ml-auto font-semibold underline">Retry</button>
              </div>
            )}

            {/* Empty state */}
            {tickets.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Inbox size={32} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-lg mb-1">No Tickets Yet</h3>
                <p className="text-slate-500 mb-6 text-sm">Register for an event to get your first ticket with QR code!</p>
                <button
                  onClick={() => navigate("events")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Browse Events <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence initial={false}>
                  {tickets.map((ticket, i) => (
                    <motion.div
                      key={ticket._id || ticket.ticketId}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* QR thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        {ticket.qrCodeDataUrl ? (
                          <img src={ticket.qrCodeDataUrl} alt="QR" className="w-full h-full" />
                        ) : (
                          <QrCode size={20} className="text-slate-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{ticket.eventTitle || "Event"}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={11} />
                            {ticket.eventDate
                              ? new Date(ticket.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </span>
                          {ticket.eventTime && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={11} /> {ticket.eventTime}
                            </span>
                          )}
                          {ticket.eventVenue && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={11} /> {ticket.eventVenue}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="font-mono text-xs text-slate-400">{ticket.ticketId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            ticket.paymentStatus === "free"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            {ticket.paymentStatus === "free" ? "Free" : `₹${ticket.amount} Paid`}
                          </span>
                          {ticket.checkedIn && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              ✓ Attended
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View button */}
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="shrink-0 p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        title="View ticket"
                      >
                        <Eye size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────── */}
        <div className="space-y-6">

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" /> Events
              </h3>
              <button
                onClick={() => navigate("events")}
                className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700 transition-colors"
              >
                All <ArrowRight size={13} />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingEvents.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No events yet.</div>
              ) : (
                upcomingEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => navigate("event-detail", event)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <Calendar size={16} className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{event.title}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {event.fee === 0 ? "Free" : `₹${event.fee}`}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <User size={17} className="text-slate-500" /> Profile
            </h3>
            <div className="space-y-3">
              {[
                { label: "Name",  value: user.name },
                { label: "Email", value: user.email },
                { label: "Role",  value: user.role }
              ].map((f) => (
                <div key={f.label} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                  <p className="font-semibold text-sm truncate capitalize">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
