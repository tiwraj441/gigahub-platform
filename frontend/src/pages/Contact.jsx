/**import { useState } from "react";
import { submitLead } from "../api/apiClient";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    interested_in: "",
  });
  const [status, setStatus] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await submitLead(form);
      setStatus("✅ Thanks! We received your request.");
      setForm({ name: "", email: "", phone: "", company: "", message: "", interested_in: "" });
    } catch {
      setStatus("❌ Error submitting, try again");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Contact / Request a Quote</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {["name","email","phone","company","interested_in"].map((f) => (
          <input
            key={f}
            placeholder={f}
            required={f==="name"||f==="email"}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="w-full p-3 border rounded"
          />
        ))}
        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full p-3 border rounded"
        ></textarea>
        <button className="px-4 py-2 bg-black text-white rounded">Send</button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}**/

import { useState } from "react";
import { submitLead } from "../api/apiClient";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    interested_in: "",
  });
  const [status, setStatus] = useState(null); // message text
  const [statusType, setStatusType] = useState(""); // "success" or "error"

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await submitLead(form);
      setStatus("✅ Thanks! We received your request.");
      setStatusType("success");
      setForm({ name: "", email: "", phone: "", company: "", message: "", interested_in: "" });
    } catch {
      setStatus("❌ Error submitting, try again.");
      setStatusType("error");
    }

    // Optional: clear message after 5 seconds
    setTimeout(() => setStatus(null), 5000);
  }

  // Box styles based on status type
  const statusStyles = {
    success: "bg-green-100 text-green-800 border border-green-300 p-3 rounded",
    error: "bg-red-100 text-red-800 border border-red-300 p-3 rounded",
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Contact / Request a Quote</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {["name", "email", "phone", "company", "interested_in"].map((f) => (
          <input
            key={f}
            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
            required={f === "name" || f === "email"}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="w-full p-3 border rounded"
          />
        ))}
        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full p-3 border rounded"
        ></textarea>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Send
        </button>
      </form>

      {status && (
        <div className={`mt-4 ${statusStyles[statusType]}`}>
          {status}
        </div>
      )}
    </div>
  );
}

