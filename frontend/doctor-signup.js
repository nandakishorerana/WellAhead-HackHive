(function () {

  const DASHBOARD_URL = "Doctors-dashboard.html";

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

  // ================= DROPDOWN =================
  const specBox = document.querySelector(".specialization-box");
  const dropdownOptions = document.getElementById("dropdownOptions");
  const dropdownDisplay = document.getElementById("dropdownDisplay");
  const dropdownArrow = document.getElementById("dropdownArrow");

  function setDropdownOpen(open) {
    dropdownOptions.classList.toggle("open", open);
    specBox.classList.toggle("open", open);
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(!dropdownOptions.classList.contains("open"));
  }

  function selectOption(el) {
    dropdownDisplay.textContent = el.textContent.trim();
    dropdownDisplay.classList.remove("placeholder");
    setDropdownOpen(false);
  }

  document.querySelectorAll(".eye[data-target]").forEach(icon => {
    icon.addEventListener("click", e => {
      e.stopPropagation();
      togglePassword(icon.dataset.target, icon);
    });
  });

  dropdownDisplay.addEventListener("click", toggleDropdown);
  dropdownArrow.addEventListener("click", toggleDropdown);

  dropdownOptions.querySelectorAll("[role='option']").forEach(opt => {
    opt.addEventListener("click", e => {
      e.stopPropagation();
      selectOption(opt);
    });
  });

  document.addEventListener("click", () => setDropdownOpen(false));

  // ================= SIGNUP =================
  document.getElementById("signupBtn").addEventListener("click", async () => {

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;
    const license = document.getElementById("licenseId").value.trim();

    const spec = !dropdownDisplay.classList.contains("placeholder")
      ? dropdownDisplay.textContent.trim()
      : "";

    if (!name || !email || !password || !confirm || !license || !spec) {
      alert("Fill all fields");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    // 🔥 DEBUG (optional - remove later)
    console.log("Selected Specialization:", spec);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "doctor",

          // 🔥 FIXED KEY (VERY IMPORTANT)
          specialization: spec,

          license_id: license
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Signup failed");
        return;
      }

      window.location.href = "logindoc.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

  });

})();