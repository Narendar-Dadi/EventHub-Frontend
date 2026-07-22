import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

export default function CreateEventView({ navigate, onSave, organizer, saving }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    fee: "",
    category: "Technical",
    status: "Active"
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      capacity: parseInt(formData.capacity, 10) || 0,
      fee: parseInt(formData.fee, 10) || 0,
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      organizer: organizer || "Event Organizer"
    });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Create New Event</h1>
        <p className="text-slate-500">Events are saved to MongoDB.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <label className={labelClass}>Event Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Banner Image URL</label>
          <div className="relative">
            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="url" name="image" value={formData.image} onChange={handleChange} className={`${inputClass} pl-12`} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Date</label>
            <input required type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input required type="text" name="time" placeholder="09:00 AM" value={formData.time} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Venue</label>
          <input required type="text" name="venue" value={formData.venue} onChange={handleChange} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Capacity</label>
            <input required type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Registration Fee (₹)</label>
            <input required type="number" min="0" name="fee" value={formData.fee} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
              {["Technical", "Hackathon", "Cultural", "Sports", "Seminar", "Workshop"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
          <button type="button" onClick={() => navigate("dashboard")} className="px-6 py-3 rounded-xl font-semibold text-slate-600">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Create Event"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
