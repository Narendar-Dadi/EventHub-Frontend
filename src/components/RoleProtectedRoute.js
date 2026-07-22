import React from "react";
import { motion } from "framer-motion";
import { ShieldOff, LogIn } from "lucide-react";

/**
 * RoleProtectedRoute
 *
 * Wraps a view and enforces role-based access.
 *
 * Props:
 *   user         — current user object (or null)
 *   allowedRoles — array of roles that may access this route, e.g. ["admin"]
 *   navigate     — navigate function for redirect
 *   children     — the protected view to render
 *   requireAuth  — if true (default), unauthenticated users see login prompt
 */
export default function RoleProtectedRoute({
  user,
  allowedRoles = [],
  navigate,
  children,
  requireAuth = true
}) {
  // Not logged in
  if (!user) {
    if (!requireAuth) return children;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      >
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
          <LogIn size={36} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          You need to be signed in to access this page.
        </p>
        <button
          onClick={() => navigate("home")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Go to Home
        </button>
      </motion.div>
    );
  }

  // Logged in but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      >
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <ShieldOff size={36} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2 max-w-sm">
          Your account role (<span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{user.role}</span>) does not have
          permission to access this page.
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
          Required: {allowedRoles.join(" or ")}
        </p>
        <button
          onClick={() => {
            if (user.role === "admin") navigate("admin-dashboard");
            else if (user.role === "organizer") navigate("dashboard");
            else navigate("student-dashboard");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Go to My Dashboard
        </button>
      </motion.div>
    );
  }

  return children;
}
