import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";

export default function EventCard({ event, index, onClick }) {
  const isSoldOut = event.status === "Sold Out" || event.registered >= event.capacity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-sm font-bold px-3 py-1 rounded-full shadow">
          {event.category}
        </div>
        {isSoldOut && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
            Sold Out
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Calendar size={16} className="text-blue-500" />
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}{" "}
            at {event.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <MapPin size={16} className="text-blue-500" /> {event.venue}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="font-bold text-lg">
            {event.fee === 0 ? <span className="text-green-500">Free</span> : `₹${event.fee}`}
          </div>
          <div className="text-sm font-medium text-slate-500">
            {event.registered}/{event.capacity} Filled
          </div>
        </div>
      </div>
    </motion.div>
  );
}
