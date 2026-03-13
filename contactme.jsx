/**import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage("✅ Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatusMessage("❌ " + (json.error || "Failed to send message."));
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Contact Us</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          required
          style={styles.textarea}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
      {statusMessage && (
        <p
          style={{
            marginTop: "10px",
            color: statusMessage.startsWith("✅") ? "green" : "red",
          }}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
};

// --- Inline styles ---
const styles = {
  container: {
    maxWidth: "400px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#007BFF",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  textarea: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    minHeight: "100px",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#007BFF",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.3s",
  },
};

export default ContactForm;**/



import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success", "error", "info"
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("Sending your message...");
    setStatusType("info");

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setStatusMessage("✅ Your message was sent successfully!");
        setStatusType("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatusMessage("❌ " + (json.error || "Failed to send message."));
        setStatusType("error");
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Server error. Please try again.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  // status box styles
  const statusStyles = {
    success: {
      background: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
      padding: "10px",
      borderRadius: "6px",
      marginTop: "10px",
      textAlign: "center"
    },
    error: {
      background: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
      padding: "10px",
      borderRadius: "6px",
      marginTop: "10px",
      textAlign: "center"
    },
    info: {
      background: "#d1ecf1",
      color: "#0c5460",
      border: "1px solid #bee5eb",
      padding: "10px",
      borderRadius: "6px",
      marginTop: "10px",
      textAlign: "center"
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Contact Us</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          required
          style={styles.textarea}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
      {statusMessage && (
        <div style={statusStyles[statusType]}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

// --- Inline styles ---
const styles = {
  container: {
    maxWidth: "400px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#007BFF",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  textarea: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    minHeight: "100px",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#007BFF",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.3s",
  },
};

export default ContactForm;

