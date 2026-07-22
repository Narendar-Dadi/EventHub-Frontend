import React, { useEffect, useState } from "react";

export default function Dashboard({ onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const query = filter ? `?filter=${filter}` : "";
    fetch(`/api/events${query}`)
      .then((res) => res.json())
      .then(setEvents)
      .catch(() => setError("Failed to load events"));
  }, [filter]);

  return (
    <section className="panel-card">
      <h2>Event Dashboard</h2>
      <div className="button-row">
        <button className={filter === "" ? "btn btn-pill active" : "btn btn-pill"} onClick={() => setFilter("")}>
          All
        </button>
        <button className={filter === "upcoming" ? "btn btn-pill active" : "btn btn-pill"} onClick={() => setFilter("upcoming")}>
          Upcoming
        </button>
        <button className={filter === "ongoing" ? "btn btn-pill active" : "btn btn-pill"} onClick={() => setFilter("ongoing")}>
          Ongoing
        </button>
        <button className={filter === "past" ? "btn btn-pill active" : "btn btn-pill"} onClick={() => setFilter("past")}>
          Past
        </button>
      </div>
      {error && <p className="message error">{error}</p>}
      {events.length === 0 && !error && <p className="message muted">No events found.</p>}
      <ul className="event-list">
        {events.map((event) => (
          <li key={event._id} className="event-item">
            <div className="event-title-row">
              <strong>{event.title}</strong>
              <span className={`status-badge status-${event.status}`}>{event.status}</span>
            </div>
            <div className="event-meta">{event.location}</div>
            <div className="event-meta">Fee: INR {event.fee || 0}</div>
            <button className="btn btn-primary" onClick={() => onSelectEvent(event)}>
              Register
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
