(function () {
  const DASHBOARD_URL = "Patient-dashboard.html";

  function togglePassword(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    if (iconEl) {
      iconEl.classList.toggle("fa-eye", !isPassword);
      iconEl.classList.toggle("fa-eye-slash", isPassword);
    }
  }

  document.querySelectorAll(".eye[data-target]").forEach(function (icon) {
    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      const id = icon.getAttribute("data-target");
      togglePassword(id, icon);
    });
  });

  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", function () {
      const name = (document.getElementById("fullName") || {}).value.trim();
      const email = (document.getElementById("email") || {}).value.trim();
      const password = (document.getElementById("password") || {}).value;
      const confirm = (document.getElementById("confirmPassword") || {}).value;

      if (!name || !email || !password || !confirm) {
        alert("Please fill in all fields.");
        return;
      }

      if (password !== confirm) {
        alert("Passwords do not match.");
        return;
      }

      window.location.href = DASHBOARD_URL;
    });
  }
})();