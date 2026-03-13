import React from "react";

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Dashboard</h1>
      <p>This is a protected page only accessible after login.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
