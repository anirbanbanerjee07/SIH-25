// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Configure transporter (API-based email service)
// Example with Gmail (replace with SMTP or SendGrid API if you prefer)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anisoma1969@gmail.com",       // Your sender email
    pass: "ayxg rlbx ippf qyfs"          // Gmail App Password (not your normal password)
  }
});

// 🚨 SOS API
app.post("/sos", async (req, res) => {
  const { id, name, loc, time, fenceStatus } = req.body;

  try {
    // Email details
    const mailOptions = {
      from: `"Smart Tourist SOS" <youremail@gmail.com>`,
      to: "emergencycontact@gmail.com",   // Recipient email
      subject: "🚨 Emergency SOS Alert - Smart Tourist Safety",
      html: `
        <h2>🚨 SOS Alert Triggered!</h2>
        <p><b>Traveler:</b> ${name} (ID: ${id})</p>
        <p><b>Location:</b> ${loc.lat}, ${loc.lng}</p>
        <p><b>Geo-Fence Status:</b> ${fenceStatus}</p>
        <p><b>Time:</b> ${time}</p>
        <p>📍 <a href="https://www.google.com/maps?q=${loc.lat},${loc.lng}" target="_blank">
          View Location on Google Maps
        </a></p>
        <hr/>
        <p>This alert was generated automatically by <b>Smart Tourist Safety System</b>.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "🚨 SOS Email sent successfully" });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start Server
app.listen(5000, () =>
  console.log("✅ SOS server running on http://localhost:5000")
);
