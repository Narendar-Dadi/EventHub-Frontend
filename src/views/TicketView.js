import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Calendar, CheckCircle, Clock, Download, MapPin,
  Ticket, User, CreditCard, QrCode
} from "lucide-react";

export default function TicketView({ ticket, navigate, user }) {
  const printRef = useRef();

  if (!ticket) return null;

  const {
    event,
    ticketId,
    qrCodeDataUrl,
    paymentId,
    amount,
    paymentStatus,
    date
  } = ticket;

  const isPaid = paymentStatus !== "free" && amount > 0;

  const handlePrint = () => window.print();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success header */}
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
        <div className="inline-flex w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-4 shadow-lg shadow-green-500/20">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Registration Successful!</h1>
        <p className="text-slate-500">
          {isPaid
            ? `Payment of ₹${amount} confirmed. Your ticket is ready.`
            : "You're registered for free. Your ticket is ready."}
        </p>
      </motion.div>

      {/* Ticket Card */}
      <motion.div
        ref={printRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative print-ticket"
      >
        {/* Punch holes */}
        <div className="absolute top-1/2 -left-5 w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-full -translate-y-1/2 border-r border-slate-200 dark:border-slate-800 z-10" />
        <div className="absolute top-1/2 -right-5 w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-full -translate-y-1/2 border-l border-slate-200 dark:border-slate-800 z-10" />

        {/* Top gradient strip */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600" />

        {/* Main ticket body */}
        <div className="p-8">
          {/* Event title + ticket ID */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 min-w-0 mr-4">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold mb-2">
                {event?.category || "Event"}
              </span>
              <h2 className="text-2xl font-extrabold leading-tight">{event?.title}</h2>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                <User size={13} /> {user?.name || "Attendee"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400 font-mono mb-1">TICKET ID</div>
              <div className="font-extrabold text-lg font-mono text-blue-600 dark:text-blue-400">{ticketId}</div>
              <div className={`mt-2 px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                isPaid
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}>
                {isPaid ? `₹${amount} PAID` : "FREE"}
              </div>
            </div>
          </div>

          {/* Event details grid */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 mb-6">
            <div>
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={11} /> DATE</div>
              <div className="font-bold text-sm">{event?.date ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock size={11} /> TIME</div>
              <div className="font-bold text-sm">{event?.time || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin size={11} /> VENUE</div>
              <div className="font-bold text-sm truncate">{event?.venue || "—"}</div>
            </div>
          </div>

          {/* Payment info if paid */}
          {isPaid && paymentId && (
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 mb-6 flex items-center gap-3">
              <CreditCard size={16} className="text-slate-400 shrink-0" />
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Payment ID:</span>{" "}
                <span className="font-mono">{paymentId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dashed divider */}
        <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-8" />

        {/* QR section */}
        <div className="p-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/20 dark:to-slate-900 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
            <QrCode size={16} /> Scan QR at venue entry
          </div>

          {qrCodeDataUrl ? (
            <div className="w-44 h-44 p-2 bg-white rounded-2xl shadow-md border border-slate-100 dark:border-slate-700">
              <img
                src={qrCodeDataUrl}
                alt={`QR Code for ${ticketId}`}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="w-44 h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <p className="text-xs text-slate-400 text-center px-4">QR not available</p>
            </div>
          )}

          <p className="font-mono text-xs text-slate-400 mt-4 tracking-wider">{ticketId}</p>
          <p className="text-xs text-slate-400 mt-1">
            Registered: {date ? new Date(date).toLocaleString("en-IN") : "—"}
          </p>

          {/* EventHub branding */}
          <div className="mt-6 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
              <Ticket size={11} className="text-white" />
            </div>
            <span className="text-xs font-bold text-slate-400">
              Event<span className="text-blue-600">Hub</span> · Smart College Event Management
            </span>
          </div>
        </div>

        {/* Bottom gradient strip */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600" />
      </motion.div>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4 flex-wrap no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Download size={18} /> Print / Save Ticket
        </button>
        <button
          onClick={() => navigate("student-dashboard")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          <Ticket size={18} /> My Tickets
        </button>
        <button
          onClick={() => navigate("events")}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Explore Events
        </button>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-ticket { display: block !important; }
          .no-print { display: none !important; }
          nav, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
}
