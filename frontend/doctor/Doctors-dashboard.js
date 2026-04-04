const profileTrigger = document.getElementById("profileTrigger");
const profileMenu = document.getElementById("profileMenu");

// ================= PROFILE DROPDOWN =================
if (profileTrigger && profileMenu) {
  profileTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    profileMenu.style.display =
      profileMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    profileMenu.style.display = "none";
  });
}

// ================= LOGOUT =================
const logoutBtn = document.querySelector("#profileMenu div:last-child");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "logindoc.html";
  });
}

// ================= LOAD DOCTOR STATS =================
async function loadDoctorStats() {
  try {
    const token = localStorage.getItem("token");

    // 🔒 Protect page
    if (!token) {
      window.location.href = "logindoc.html";
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/doctors/stats", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    // 🔥 Handle unauthorized
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "logindoc.html";
      return;
    }

    const data = await res.json();

    console.log("Doctor Stats:", data); // DEBUG

    const cards = document.querySelectorAll(".card-box h4");

    if (cards.length >= 2) {
      cards[0].innerText = data.total_patients ?? 0;
      cards[1].innerText = data.high_risk_patients ?? 0;
    }

  } catch (err) {
    console.error("Failed to load stats:", err);
  }
}

// ================= OPTIONAL DEBUG =================
const email = localStorage.getItem("doctor_email");

if (email) {
  console.log("Logged in doctor:", email);
}

async function loadPriorityPatients() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/doctors/priority", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    const container = document.querySelector(".priority-box");

    if (!container) return;

    // remove old items except title
    const title = container.querySelector("h6");
    container.innerHTML = "";
    container.appendChild(title);

    data.forEach(p => {

      let tag = "Low";
      if (p.risk > 80) tag = "Critical";
      else if (p.risk > 60) tag = "High";

      container.innerHTML += `
        <div class="priority mt-2">
          <div class="priority-row">
            <h6>${p.name}</h6>
            <span class="risk-chip">${tag}</span>
          </div>
          <p>Risk: ${p.risk}%</p>
        </div>
      `;
    });

  } catch (err) {
    console.error("Priority error:", err);
  }
}

// ================= INIT (IMPORTANT FIX) =================
document.addEventListener("DOMContentLoaded", () => {
  loadDoctorStats();
  loadPriorityPatients();
});

