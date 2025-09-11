function toggleSection(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector("span");
  if (content.style.display === "block") {
    content.style.display = "none";
    icon.textContent = "➕";
  } else {
    content.style.display = "block";
    icon.textContent = "➖";
  }
}

// Dark mode toggle
document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("darkToggle").textContent =
    document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});
