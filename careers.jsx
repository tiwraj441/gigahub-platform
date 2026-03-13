import React, { useState } from "react";

const ApplyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    experience: "",
    details: "",
    file: null,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("status", formData.status);
    data.append("experience", formData.experience);
    data.append("details", formData.details);
    if (formData.file) data.append("fileToUpload", formData.file);

    try {
      const res = await fetch("http://localhost:5000/api/apply", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setMessage("✅ Thanks! We will contact you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          status: "",
          experience: "",
          details: "",
          file: null,
        });
      } else {
        setMessage("❌ " + json.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Please try again.");
    }
  };

  return (
    <div>
      <h1>Job Application</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <br />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="">Apply For</option>
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
        </select>
        <br />
        <input
          name="experience"
          type="number"
          placeholder="Experience (years)"
          value={formData.experience}
          onChange={handleChange}
        />
        <br />
        <textarea
          name="details"
          placeholder="Other details"
          value={formData.details}
          onChange={handleChange}
        />
        <br />
        <input
          type="file"
          name="file"
          accept=".pdf"
          onChange={handleChange}
          required
        />
        <br />
        <button type="submit">Apply</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ApplyForm;
