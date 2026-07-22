import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Database, Lock } from "lucide-react";
import { api } from "../api/client";

export default function PaymentSettingsView({ navigate, user, showToast }) {
  const [formData, setFormData] = useState({
    keyId: "",
    secretKey: "",
    currency: "INR",
    mode: "test"
  });
  const [source, setSource] = useState("");
  const [hasSecret, setHasSecret] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    api
      .getPaymentSettings()
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          keyId: data.keyId || "",
          currency: data.currency || "INR",
          mode: data.mode || "test"
        }));
        setSource(data.source || "");
        setHasSecret(data.hasSecret);
      })
      .catch(() => showToast("Could not load payment settings", "error"))
      .finally(() => setLoading(false));
  }, [user, showToast]);

  if (!user || user.role !== "admin") {
    return <div className="p-20 text-center text-xl">Access Denied. Admins only.</div>;
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.savePaymentSettings(formData);
      showToast("Payment gateway settings saved!", "success");
      setHasSecret(Boolean(formData.secretKey) || hasSecret);
      setFormData((prev) => ({ ...prev, secretKey: "" }));
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => navigate("dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6">
        <ArrowRight size={18} className="rotate-180" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
          <Database size={28} className="text-blue-500" /> Gateway Configuration
        </h1>
        <p className="text-slate-500">
          Prefer setting keys in <code className="text-sm">backend/.env</code>. Database settings are used when env vars are empty.
        </p>
        {source === "env" && (
          <p className="mt-2 text-sm text-emerald-600">Currently using keys from backend/.env</p>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex gap-3 text-blue-800 dark:text-blue-300 text-sm">
            <Lock size={20} className="shrink-0" />
            <p>Secret keys are stored on the server only and never sent to the browser except when you save them here.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Razorpay Key ID</label>
            <input required type="text" name="keyId" value={formData.keyId} onChange={handleChange} placeholder="rzp_test_xxxxxxxxx" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Razorpay Secret Key {hasSecret && "(leave blank to keep existing)"}
            </label>
            <input
              type="password"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder={hasSecret ? "••••••••••••••••" : "Required on first save"}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className={inputClass}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Environment Mode</label>
              <select name="mode" value={formData.mode} onChange={handleChange} className={inputClass}>
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button type="submit" className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700">
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
