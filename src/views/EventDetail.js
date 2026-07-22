import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, MapPin, Ticket } from "lucide-react";

export default function EventDetail({ event, onRegister, navigate }) {
  const isSoldOut = event.status === "Sold Out" || event.registered >= event.capacity;
  const progress = (event.registered / event.capacity) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("events")}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
      >
        <ArrowRight size={18} className="rotate-180" /> Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden h-[400px] shadow-lg"
          >
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">
                {event.category}
              </span>
              {isSoldOut && (
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-bold">
                  Sold Out
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{event.title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{event.description}</p>
            <h3 className="text-2xl font-bold mb-4">About the Event</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Organized by {event.organizer}. Join us for an incredible experience at {event.title}.
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-24 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <div className="text-3xl font-extrabold mb-6">
              {event.fee === 0 ? "Free Entry" : `₹${event.fee}`}
            </div>
            <div className="space-y-5 mb-8">
              {[
                { icon: Calendar, label: "Date", value: new Date(event.date).toLocaleDateString() },
                { icon: Clock, label: "Time", value: event.time },
                { icon: MapPin, label: "Venue", value: event.venue }
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <row.icon size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">{row.label}</div>
                    <div className="font-semibold">{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Registrations</span>
                <span>
                  {event.registered} / {event.capacity}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progress > 90 ? "bg-red-500" : "bg-blue-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => onRegister(event)}
              disabled={isSoldOut}
              className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 ${
                isSoldOut
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              }`}
            >
              {isSoldOut ? "Registration Closed" : "Register Now"} <Ticket size={20} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
