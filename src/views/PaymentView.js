import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, CreditCard, Shield, Smartphone } from "lucide-react";
import { api, loadRazorpayScript } from "../api/client";

export default function PaymentView({
  event,
  user,
  paymentConfig,
  onSuccess,
  onCancel,
  showToast
}) {
  const [processing, setProcessing] = useState(false);
  const platformFee = paymentConfig?.platformFee ?? 0;
  const displayTotal = event.fee > 0 ? event.fee + platformFee : 0;

  const handleFreeRegistration = async () => {
    setProcessing(true);
    try {
      const eventId = event.id || event._id;
      const data = await api.registerFree(eventId);
      showToast("Registration successful! Your ticket is ready. 🎟️", "success");
      onSuccess(data.ticket);
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaidRegistration = async () => {
    if (!paymentConfig?.configured) {
      showToast("Razorpay is not configured. Contact admin.", "error");
      return;
    }

    setProcessing(true);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        showToast("Could not load Razorpay checkout. Check your internet.", "error");
        setProcessing(false);
        return;
      }

      const eventId = event.id || event._id;
      const order = await api.createPaymentOrder({ eventId });

      if (!order.orderId || !order.keyId) {
        showToast("Failed to create payment order. Please try again.", "error");
        setProcessing(false);
        return;
      }

      const options = {
        key: order.keyId,
        // Backend sends paise — pass directly, do NOT multiply by 100
        amount: order.amount,
        currency: order.currency || "INR",
        name: "EventHub",
        description: `Ticket: ${event.title}`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: ""
        },
        // ── Enable ALL Razorpay payment methods ─────────────
        // By not restricting, Razorpay shows everything enabled
        // on your merchant account: UPI, Cards, Netbanking, Wallets
        config: {
          display: {
            blocks: {
              utib: { name: "Pay using UPI", instruments: [{ method: "upi" }] },
              other: { name: "Other Payment Methods", instruments: [{ method: "card" }, { method: "netbanking" }, { method: "wallet" }] }
            },
            sequence: ["block.utib", "block.other"],
            preferences: { show_default_blocks: true }
          }
        },
        handler: async (response) => {
          try {
            const verified = await api.verifyPayment({
              eventId,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
            showToast("Payment verified! Your ticket is ready. 🎟️", "success");
            onSuccess(verified.ticket);
          } catch (err) {
            showToast(err.message || "Payment verification failed. Contact support.", "error");
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            showToast("Payment cancelled.", "info");
          }
        },
        theme: { color: "#2563eb" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        showToast(response?.error?.description || "Payment failed. Please try again.", "error");
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      showToast(err.message || "Something went wrong. Please try again.", "error");
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (displayTotal === 0) handleFreeRegistration();
    else handlePaidRegistration();
  };

  const paymentMethods = [
    { icon: "🏦", label: "UPI / Google Pay / PhonePe" },
    { icon: "💳", label: "Credit / Debit Cards" },
    { icon: "🌐", label: "Net Banking" },
    { icon: "👛", label: "Wallets (Paytm, etc.)" }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Processing overlay */}
        {processing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="mb-4"
            >
              <Activity size={40} className="text-blue-600" />
            </motion.div>
            <h3 className="text-lg font-bold">Processing Payment...</h3>
            <p className="text-sm text-slate-500">Please do not close this window.</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
            <CreditCard size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold">Complete Registration</h2>
          <p className="text-slate-500 text-sm mt-1">Secure checkout for <strong>{event.title}</strong></p>
        </div>

        {/* Amount breakdown */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Ticket Price</span>
            <span className="font-semibold">{event.fee === 0 ? "Free" : `₹${event.fee}`}</span>
          </div>
          {event.fee > 0 && (
            <div className="flex justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Platform Fee</span>
              <span className="font-semibold">₹{platformFee}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className={displayTotal === 0 ? "text-green-600" : "text-blue-600"}>
              {displayTotal === 0 ? "Free" : `₹${displayTotal}`}
            </span>
          </div>
        </div>

        {/* Payment methods badge row */}
        {displayTotal > 0 && (
          <div className="mb-6">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-3 flex items-center gap-2">
              <Smartphone size={13} /> Accepted Payment Methods
            </p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((m) => (
                <div key={m.label} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <span>{m.icon}</span> {m.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Razorpay not configured warning */}
        {!paymentConfig?.configured && displayTotal > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm px-4 py-3 rounded-xl mb-4 text-center">
            ⚠️ Razorpay keys are not set. Add them in backend/.env or Admin → Payment Settings.
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={processing || (displayTotal > 0 && !paymentConfig?.configured)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {displayTotal === 0
              ? "🎟️ Confirm Free Registration"
              : `🔒 Pay ₹${displayTotal} with Razorpay`}
          </button>
          <button
            onClick={onCancel}
            disabled={processing}
            className="w-full py-3 bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield size={13} /> 256-bit SSL · Secured by Razorpay · PCI DSS Compliant
        </div>
      </motion.div>
    </div>
  );
}
