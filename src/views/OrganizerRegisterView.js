import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, CheckCircle, Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import { api } from "../api/client";

export default function OrganizerRegisterView({ navigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full px-4 py-3 pl-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white transition-all";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.registerOrganizer(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-extrabold mb-3">Application Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your organizer application has been sent for admin review. You'll be able to log in once
            your account is approved.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-sm text-amber-700 dark:text-amber-400">
            ⏳ Approval usually takes 24–48 hours. Please check back later.
          </div>
          <button
            onClick={() => navigate("home")}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
            <Briefcase size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Organizer Registration</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Apply to become an event organizer on EventHub
          </p>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 mb-6 flex gap-3"
        >
          <Briefcase size={20} className="text-purple-500 shrink-0 mt-0.5" />
          <div className="text-sm text-purple-700 dark:text-purple-300">
            <p className="font-semibold mb-1">How it works</p>
            <p>Submit your application → Admin reviews → Account approved → You can log in and create events.</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
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
            </div>

            {/* Role — display only */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Role
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center gap-3">
                <Briefcase size={18} className="text-purple-500" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">Organizer</span>
                <span className="ml-auto text-xs text-slate-400">Pending admin approval</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  minLength={6}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-60 transition-all"
            >
              {loading ? "Submitting..." : <>Submit Application <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 justify-center text-sm text-slate-500">
            <span>Already approved?</span>
            <button
              onClick={() => navigate("home")}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Sign in from Home
            </button>
            <span className="hidden sm:block">·</span>
            <button
              onClick={() => navigate("home")}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 font-semibold"
            >
              Student? Register here →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
