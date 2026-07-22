import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, CheckCircle, XCircle, AlertTriangle,
  QrCode, RefreshCw, Users, Clock
} from "lucide-react";
import { api } from "../api/client";

// Load jsQR dynamically from CDN
function loadJsQR() {
  return new Promise((resolve) => {
    if (window.jsQR) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

const STATUS = {
  idle: null,
  success: "success",
  duplicate: "duplicate",
  invalid: "invalid",
  error: "error"
};

export default function QRScannerView({ user, navigate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastScanRef = useRef(""); // prevent repeated scans of same QR

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanResult, setScanResult] = useState(null); // { status, message, ticket? }
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [libraryReady, setLibraryReady] = useState(false);

  // Load jsQR on mount
  useEffect(() => {
    loadJsQR().then((ok) => setLibraryReady(ok));
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    lastScanRef.current = "";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanFrame();
      }
    } catch (err) {
      setCameraError(err.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access in your browser settings."
        : `Camera error: ${err.message}`);
    }
  };

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !window.jsQR) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data && code.data !== lastScanRef.current) {
        lastScanRef.current = code.data;
        processQRCode(code.data);
        return; // stop scanning until reset
      }
    }
    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, []);

  const processQRCode = async (rawData) => {
    stopCamera();
    setScanResult({ status: "checking", message: "Verifying ticket..." });
    try {
      const parsed = JSON.parse(rawData);
      const { ticketId, qrToken } = parsed;

      if (!ticketId || !qrToken) throw new Error("Invalid QR code format.");

      const result = await api.checkInTicket({ ticketId, qrToken });

      setScanResult({
        status: STATUS.success,
        message: result.message,
        ticket: result.ticket
      });

      // Add to recent check-ins
      if (result.ticket) {
        setRecentCheckins((prev) => [
          { ...result.ticket, ts: new Date() },
          ...prev.slice(0, 9)
        ]);
      }
    } catch (err) {
      const errMsg = err.message || "Verification failed";
      const status = errMsg.includes("already") ? STATUS.duplicate
        : errMsg.includes("Invalid") ? STATUS.invalid
        : STATUS.error;
      setScanResult({ status, message: errMsg });
    }
  };

  const handleReset = () => {
    setScanResult(null);
    lastScanRef.current = "";
    setCameraError(null);
    startCamera();
  };

  // Guard: Admin only
  if (!user || (user.role !== "admin" && user.role !== "organizer")) {
    return (
      <div className="p-20 text-center">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-slate-500">Admin or Organizer access required.</p>
      </div>
    );
  }

  const resultConfig = {
    success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", label: "Check-In Successful!" },
    duplicate: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", label: "Already Checked In" },
    invalid: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", label: "Invalid Ticket" },
    error: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", label: "Verification Failed" },
    checking: { icon: RefreshCw, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", label: "Checking..." }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <QrCode size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">QR Ticket Scanner</h1>
            <p className="text-slate-500">Scan student tickets to mark attendance</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Column */}
        <div className="space-y-4">
          {/* Camera viewport */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2"><Camera size={18} className="text-blue-500" /> Camera</h2>
              {scanning && (
                <span className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
                </span>
              )}
            </div>

            <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning overlay */}
              {scanning && !scanResult && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-52 h-52">
                    {/* Corner frames */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                    {/* Scan line */}
                    <motion.div
                      animate={{ y: [0, 160, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1 right-1 h-0.5 bg-blue-400/80 rounded-full shadow-[0_0_8px_2px_rgba(96,165,250,0.6)]"
                    />
                  </div>
                  <p className="absolute bottom-6 text-white/70 text-sm font-medium">Align QR code within frame</p>
                </div>
              )}

              {/* Not scanning placeholder */}
              {!scanning && !cameraError && !scanResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <QrCode size={48} className="mb-3 opacity-30" />
                  <p className="text-sm">Camera not started</p>
                </div>
              )}

              {/* Camera error */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <XCircle size={32} className="text-red-400 mb-2" />
                  <p className="text-sm text-red-300">{cameraError}</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 flex gap-3">
              {!scanning ? (
                <button
                  onClick={startCamera}
                  disabled={!libraryReady}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera size={18} />
                  {libraryReady ? "Start Scanner" : "Loading..."}
                </button>
              ) : (
                <>
                  <button onClick={stopCamera} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-300 transition-colors">
                    Stop
                  </button>
                  <button onClick={handleReset} className="py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                    <RefreshCw size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Scan result */}
          <AnimatePresence mode="wait">
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl border p-6 ${resultConfig[scanResult.status]?.bg || ""}`}
              >
                {(() => {
                  const cfg = resultConfig[scanResult.status];
                  if (!cfg) return null;
                  const Icon = cfg.icon;
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <Icon size={28} className={`${cfg.color} ${scanResult.status === "checking" ? "animate-spin" : ""}`} />
                        <h3 className="text-lg font-bold">{cfg.label}</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{scanResult.message}</p>
                      {scanResult.ticket && (
                        <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 text-sm space-y-1">
                          <div><span className="text-slate-500">Attendee:</span> <strong>{scanResult.ticket.attendee}</strong></div>
                          <div><span className="text-slate-500">Event:</span> <strong>{scanResult.ticket.event}</strong></div>
                          <div><span className="text-slate-500">Ticket:</span> <span className="font-mono text-xs">{scanResult.ticket.ticketId}</span></div>
                          {scanResult.ticket.checkedInAt && (
                            <div><span className="text-slate-500">Time:</span> <span>{new Date(scanResult.ticket.checkedInAt).toLocaleTimeString()}</span></div>
                          )}
                        </div>
                      )}
                      {scanResult.status !== "checking" && (
                        <button
                          onClick={handleReset}
                          className="mt-4 w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={15} /> Scan Next Ticket
                        </button>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Check-ins Column */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2"><Users size={18} className="text-green-500" /> Recent Check-ins</h2>
              <span className="text-xs text-slate-400">{recentCheckins.length} this session</span>
            </div>

            {recentCheckins.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Check-ins will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                <AnimatePresence>
                  {recentCheckins.map((c, i) => (
                    <motion.div
                      key={`${c.ticketId}-${i}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle size={18} className="text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{c.attendee}</p>
                        <p className="text-xs text-slate-500 truncate">{c.event}</p>
                        <p className="font-mono text-xs text-slate-400">{c.ticketId}</p>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock size={11} /> {c.ts?.toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Instructions card */}
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-sm">
            <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-3">How to use</h3>
            <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal list-inside">
              <li>Click <strong>Start Scanner</strong></li>
              <li>Allow camera access when prompted</li>
              <li>Hold the student's ticket QR up to the camera</li>
              <li>Attendance is marked automatically</li>
              <li>Click <strong>Scan Next</strong> for the next student</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
