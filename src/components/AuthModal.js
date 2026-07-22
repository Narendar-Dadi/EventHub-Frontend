import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Briefcase, GraduationCap, Shield, Clock, XCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Admin",     email: "admin@smarthub.edu",     password: "Admin@123",     icon: Shield,          color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20" },
  { role: "Organizer", email: "organizer@smarthub.edu", password: "Organizer@123", icon: Briefcase,       color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { role: "Student",   email: "student@smarthub.edu",   password: "Student@123",   icon: GraduationCap,   color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20" }
];

export default function AuthModal({ darkMode, onClose, onLogin, onRegister, loading, onNavigate }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [statusBlock, setStatusBlock] = useState(null); // "pending" | "rejected"

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setStatusBlock(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatusBlock(null);
    try {
      if (mode === "login") {
        await onLogin({ email: form.email, password: form.password });
      } else {
        await onRegister(form);
      }
    } catch (err) {
      if (err.data?.status === "pending") {
        setStatusBlock("pending");
      } else if (err.data?.status === "rejected") {
        setStatusBlock("rejected");
      } else {
        setError(err.message || "Something went wrong");
      }
    }
  };

  const fillDemo = (acc) => {
    setForm({ name: "", email: acc.email, password: acc.password });
    setMode("login");
    setError("");
    setStatusBlock(null);
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setStatusBlock(null);
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className={`w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
          darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-8 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === "login"
                ? "Sign in to your EventHub account"
                : "Register as a student on EventHub"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 px-8 mb-6">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === "login"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === "register"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        <div className="px-8 pb-8">
          {/* Register role info */}
          {mode === "register" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 mb-5 flex gap-3 items-start"
            >
              <GraduationCap size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Student registration</span> — your account is activated immediately.{" "}
                <button
                  type="button"
                  onClick={() => { onClose(); if (onNavigate) onNavigate("register-organizer"); }}
                  className="underline font-semibold hover:text-blue-900"
                >
                  Apply as Organizer instead →
                </button>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Email</label>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Password</label>
              <input
                required
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                minLength={6}
                className={inputClass}
              />
            </div>

            {/* Role display for register */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Role</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <GraduationCap size={18} className="text-blue-500" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Student</span>
                  <span className="ml-auto text-xs text-slate-400">Instant access</span>
                </div>
              </div>
            )}

            {/* Status block messages */}
            <AnimatePresence>
              {statusBlock === "pending" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3"
                >
                  <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    <p className="font-bold mb-1">Account Pending Approval</p>
                    <p>Your organizer account is awaiting admin review. You'll be able to log in once approved.</p>
                  </div>
                </motion.div>
              )}
              {statusBlock === "rejected" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3"
                >
                  <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-400">
                    <p className="font-bold mb-1">Application Rejected</p>
                    <p>Your organizer application was not approved. Contact support for details.</p>
                  </div>
                </motion.div>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-800"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Student Account"}
            </button>
          </form>

          {/* Organizer register link */}
          {mode === "login" && (
            <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex items-center gap-3">
              <Briefcase size={16} className="text-purple-500 shrink-0" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Want to host events?{" "}
                <button
                  type="button"
                  onClick={() => { onClose(); if (onNavigate) onNavigate("register-organizer"); }}
                  className="font-bold underline hover:text-purple-900"
                >
                  Apply as Organizer
                </button>
              </span>
            </div>
          )}

          {/* Demo accounts */}
          {mode === "login" && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">
                Demo Accounts
              </p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc)}
                      className={`w-full text-left px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all flex items-center gap-3 ${acc.bg}`}
                    >
                      <Icon size={16} className={acc.color} />
                      <div>
                        <span className={`font-bold ${acc.color}`}>{acc.role}</span>
                        <span className="text-slate-400 block text-xs">{acc.email}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
