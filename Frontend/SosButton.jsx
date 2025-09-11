import React from "react";

// Example SOS Button Component
const SosButton = () => {
  const handleSosClick = () => {
    // TODO: Replace this with actual SOS functionality
    alert("🚨 SOS — Help is on the way!");
    console.log("SOS button clicked!");
  };

  return (
    <button
      id="sosBtn"
      className="btn danger big"
      onClick={handleSosClick}
      style={{
        backgroundColor: "#e74c3c",
        color: "#fff",
        fontSize: "1.2rem",
        padding: "12px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      🚨 SOS — Send Help
    </button>
  );
};

export default SosButton;
