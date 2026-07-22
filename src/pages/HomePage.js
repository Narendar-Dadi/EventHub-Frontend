import React from "react";

export default function HomePage() {
  return (
    <section className="hero-card">
      <span className="chip">Trending Campus Tech</span>
      <h1>Smart College Event Management System</h1>
      <p className="hero-subtext">
        Organize college events with a modern dashboard, instant registrations,
        QR-based check-ins, and seamless payment support.
      </p>
      <div className="hero-stats">
        <div className="stat-box">
          <strong>Realtime</strong>
          <span>Event visibility</span>
        </div>
        <div className="stat-box">
          <strong>Smart QR</strong>
          <span>Fast staff check-in</span>
        </div>
        <div className="stat-box">
          <strong>Secure Pay</strong>
          <span>Mock + Stripe-ready</span>
        </div>
      </div>
    </section>
  );
}
