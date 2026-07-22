import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { CATEGORIES } from "../constants";
import EventCard from "../components/EventCard";

export default function EventsDirectory({ navigate, events }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Explore Events</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Find and register for technical workshops, cultural nights, and sports tournaments.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search events by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} onClick={() => navigate("event-detail", event)} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-4">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No events found</h3>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
