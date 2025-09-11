(function () {
  function generateId() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }
  function now() {
    return new Date().toLocaleTimeString();
  }
  function distanceMeters(a, b) {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const aa = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
  }

  const state = {
    tourist: {
      id: localStorage.getItem("did") || generateId(),
      name: "Alex Traveler",
      lat: 12.9716,
      lng: 77.5946
    },
    geoFence: { center: { lat: 12.9720, lng: 77.5940 }, radius: 300 },
    incidents: JSON.parse(localStorage.getItem("incidents") || "[]")
  };

  const didEl = document.getElementById("did");
  const coordsEl = document.getElementById("coords");
  const statusEl = document.getElementById("status");
  const chatbox = document.getElementById("chatbox");

  function renderState() {
    didEl.textContent = state.tourist.id;
    coordsEl.textContent = `Lat: ${state.tourist.lat.toFixed(
      5
    )}, Lng: ${state.tourist.lng.toFixed(5)}`;
    const d = distanceMeters(state.tourist, state.geoFence.center);
    statusEl.textContent =
      d <= state.geoFence.radius ? "✅ Inside Safe Zone" : "⚠️ Outside Safe Zone";
    statusEl.style.color = d <= state.geoFence.radius ? "#2e7d32" : "#e53935";
  }

  // Map setup
  const map = L.map("map").setView([state.tourist.lat, state.tourist.lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: ""
  }).addTo(map);
  const marker = L.marker([state.tourist.lat, state.tourist.lng]).addTo(map);
  L.circle(
    [state.geoFence.center.lat, state.geoFence.center.lng],
    { radius: state.geoFence.radius, color: "#009688", fillOpacity: 0.08 }
  ).addTo(map);

  function updateMarker() {
    marker.setLatLng([state.tourist.lat, state.tourist.lng]);
    map.panTo([state.tourist.lat, state.tourist.lng]);
    renderState();
  }

  // ID Regenerate
  document.getElementById("regenId").onclick = function () {
    state.tourist.id = generateId();
    localStorage.setItem("did", state.tourist.id);
    renderState();
    alert("New ID generated: " + state.tourist.id);
  };

  // Movement controls
  const step = 0.0008;
  document.getElementById("move-n").onclick = () => {
    state.tourist.lat += step;
    updateMarker();
  };
  document.getElementById("move-s").onclick = () => {
    state.tourist.lat -= step;
    updateMarker();
  };
  document.getElementById("move-e").onclick = () => {
    state.tourist.lng += step;
    updateMarker();
  };
  document.getElementById("move-w").onclick = () => {
    state.tourist.lng -= step;
    updateMarker();
  };

  // 🚨 SOS Button
  document.getElementById("sosBtn").onclick = function () {
    const incident = {
      type: "SOS",
      id: state.tourist.id,
      name: state.tourist.name,
      loc: { lat: state.tourist.lat, lng: state.tourist.lng },
      time: now(),
      tx: "0x" + Math.random().toString(16).slice(2, 10)
    };

    // Save locally
    state.incidents.unshift(incident);
    localStorage.setItem("incidents", JSON.stringify(state.incidents));

    // Show marker on map
    L.circle([incident.loc.lat, incident.loc.lng], {
      radius: 30,
      color: "#e53935"
    })
      .addTo(map)
      .bindPopup("🚨 SOS Sent: " + incident.name)
      .openPopup();

    // 🚀 Send to backend for SMS
    fetch("http://localhost:5000/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("🚨 SOS sent! SMS delivered to emergency contact.");
        } else {
          alert("⚠️ SOS saved locally, but SMS failed.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("⚠️ Failed to contact server. SOS saved locally only.");
      });
  };

  // Chatbot
  document.getElementById("chatForm").onsubmit = function (e) {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const q = input.value.trim();
    if (!q) return;
    appendMessage("user", q);
    input.value = "";
    showTyping();
    setTimeout(() => {
      let resp = getAIResponse(q);
      removeTyping();
      appendMessage("ai", resp);
    }, 1200);
  };

  document.querySelectorAll(".suggestion").forEach((btn) => {
    btn.onclick = () => {
      const text = btn.textContent.replace(/^[^a-zA-Z]+/, "").trim();
      appendMessage("user", text);
      showTyping();
      setTimeout(() => {
        let resp = getAIResponse(text);
        removeTyping();
        appendMessage("ai", resp);
      }, 1000);
    };
  });

  function getAIResponse(q) {
    const lq = q.toLowerCase();
    if (lq.includes("hospital"))
      return "🏥 The nearest hospital is CityCare, 1.2 km away.";
    if (lq.includes("station"))
      return "🚉 The closest metro station is Central Station, just 500m north.";
    if (lq.includes("emergency"))
      return "📞 Dial <b>112</b> for emergency assistance in India.";
    if (lq.includes("safe") || lq.includes("hotel"))
      return "🛎️ Recommended safe hotels: GreenLeaf Inn, City Plaza Hotel.";
    if (lq.includes("help") || lq.includes("danger"))
      return "⚠️ If unsafe, press the <b>SOS button</b>. Authorities will be alerted.";
    return "🤝 I can assist with safety tips, nearest facilities, and emergencies. Try asking about <b>hospitals</b>, <b>stations</b>, or <b>emergency numbers</b>.";
  }

  function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.className = sender === "user" ? "chat-user" : "chat-ai";
    div.innerHTML = text + `<span class="chat-time">${now()}</span>`;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.id = "typing";
    div.className = "chat-ai typing";
    div.textContent = "Assistant is typing...";
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
  function removeTyping() {
    const t = document.getElementById("typing");
    if (t) t.remove();
  }

  renderState();
})();
