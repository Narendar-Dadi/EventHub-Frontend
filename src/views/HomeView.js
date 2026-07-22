import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Activity, Star, ArrowRight } from "lucide-react";
import EventCard from "../components/EventCard";

export default function HomeView({ navigate, events }) {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full">
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 dark:from-blue-950 dark:via-slate-950 dark:to-black" />
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{ x: Math.random() * width, y: Math.random() * 600 }}
              animate={{
                y: [null, Math.random() * -600],
                x: [null, Math.random() * width]
              }}
              transition={{ duration: 10 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <span className="px-4 py-1.5 rounded-full bg-white/10 text-blue-200 border border-white/20 text-sm font-semibold mb-6 inline-block backdrop-blur-sm">
              Smart College Event Management System
            </span>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Discover, Register &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Experience
            </span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Manage hackathons, cultural fests, sports tournaments, and seminars with MongoDB-backed
            events and Razorpay payments.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => navigate("events")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
            >
              Browse Events <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-12 border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Events", value: `${events.length || 0}+`, icon: Calendar },
            { label: "Registered Students", value: "12k+", icon: Users },
            { label: "College Clubs", value: "30+", icon: Activity },
            { label: "Successful Years", value: "5+", icon: Star }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex p-3 rounded-2xl bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 mb-4">
                <stat.icon size={28} />
              </div>
              <h3 className="text-3xl font-extrabold mb-1">{stat.value}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-3">Trending This Week</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
              Don&apos;t miss out on the most anticipated events happening across campus.
            </p>
          </div>
          <button
            onClick={() => navigate("events")}
            className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
          >
            View All <ArrowRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.slice(0, 3).map((event, i) => (
            <EventCard key={event.id} event={event} index={i} onClick={() => navigate("event-detail", event)} />
          ))}
        </div>
      </section>
    </div>
  );
}
