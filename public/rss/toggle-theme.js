document.addEventListener("DOMContentLoaded", function () {
  var toggleSwitch = document.getElementById("theme-toggle");
  var toggleLabel = document.getElementById("toggle-label");

  function updateBodyClass(theme) {
    document.body.className = ""; // Reset any classes on body
    document.body.classList.add(theme);
    if (toggleLabel) {
      toggleLabel.textContent = theme === "dark" ? "Dark Mode" : "Light Mode";
    }
    localStorage.setItem("rss-theme", theme); // Store selected theme in local storage
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("rss-theme");
    const userPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const defaultTheme = userPrefersDark ? "dark" : "light";

    if (savedTheme) {
      // If there is a saved theme, use it
      updateBodyClass(savedTheme);
      toggleSwitch.checked = savedTheme === "dark";
    } else {
      // If no saved theme, use system preference
      updateBodyClass(defaultTheme);
      toggleSwitch.checked = userPrefersDark;
    }
  }

  function toggleTheme(e) {
    const newTheme = e.target.checked ? "dark" : "light";
    updateBodyClass(newTheme);
  }

  if (toggleSwitch) {
    toggleSwitch.addEventListener("change", toggleTheme);
  }

  initTheme(); // Initialize theme when the page loads
});
