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

  // ✅ FIXED LOGIN
  document.getElementById("loginBtn").addEventListener("click", async function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      // ✅ Optional: store token
      localStorage.setItem("token", data.access_token);

      // ✅ Redirect after success
      window.location.href = "Doctors-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });

})();