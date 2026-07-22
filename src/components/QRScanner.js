import React, { useState } from "react";

export default function QRScanner() {
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState("");

  const checkIn = async () => {
    try {
      const parsed = JSON.parse(payload);
      const res = await fetch("/api/events/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-in failed");
      setResult("Check-in successful");
    } catch (error) {
      setResult(error.message || "Invalid QR payload");
    }
  };

  return (
    <section className="panel-card">
      <h3>QR Check-in (Staff)</h3>
      <textarea
        className="text-input text-area"
        placeholder='Paste QR JSON payload: {"eventId":"...","registrationId":"...","qrToken":"..."}'
        rows={4}
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />
      <button className="btn btn-primary" onClick={checkIn}>
        Validate & Check-in
      </button>
      {result && <p className="message">{result}</p>}
    </section>
  );
}
