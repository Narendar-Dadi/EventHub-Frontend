import React, { useState } from "react";
import Dashboard from "../components/Dashboard";
import EventForm from "../components/EventForm";
import QRScanner from "../components/QRScanner";

export default function EventPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  const handleRegistered = (data, event) => {
    setRegistration(data);
    setSelectedEvent(event);
    setPaymentMessage("");
  };

  const handlePay = async () => {
    if (!selectedEvent || !registration?.registration?._id) return;

    const res = await fetch(`/api/events/${selectedEvent._id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: registration.registration._id })
    });

    const data = await res.json();
    if (!res.ok) {
      setPaymentMessage(data.message || "Payment failed");
      return;
    }

    setPaymentMessage(data.payment.mock ? "Mock payment successful" : "Payment successful");
  };

  return (
    <div className="page-grid">
      <Dashboard onSelectEvent={setSelectedEvent} />
      <EventForm selectedEvent={selectedEvent} onRegistered={handleRegistered} />

      {registration?.qrCodeDataUrl && (
        <section className="panel-card">
          <h3>Your Registration QR</h3>
          <img alt="Event QR" src={registration.qrCodeDataUrl} width={220} className="qr-image" />
          <div className="button-row">
            <button className="btn btn-primary" onClick={handlePay}>
              Pay Event Fee
            </button>
          </div>
          {paymentMessage && <p className="message">{paymentMessage}</p>}
        </section>
      )}

      <QRScanner />
    </div>
  );
}
