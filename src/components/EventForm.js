import React, { useState } from "react";

export default function EventForm({ selectedEvent, onRegistered }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!selectedEvent) {
    return <p className="message muted">Select an event to register.</p>;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.includes("@")) {
      setError("Enter valid name and email");
      return;
    }

    const res = await fetch(`/api/events/${selectedEvent._id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Registration failed");
      return;
    }

    onRegistered(data, selectedEvent);
    setName("");
    setEmail("");
  };

  return (
    <section className="panel-card">
      <h3>Register for {selectedEvent.title}</h3>
      <form onSubmit={submit} className="grid-form">
        <input
          className="text-input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="text-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
      {error && <p className="message error">{error}</p>}
    </section>
  );
}
