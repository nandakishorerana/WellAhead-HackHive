(function () {
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

  document.querySelectorAll(".eye[data-target]").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.preventDefault();
      togglePassword(icon.dataset.target, icon);
    });
  });

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    window.location.href = "Patient-dashboard.html";
  });
})();
