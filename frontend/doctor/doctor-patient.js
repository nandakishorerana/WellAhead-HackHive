// ================= PROFILE DROPDOWN =================
const profileTrigger = document.getElementById("profileTrigger");
const profileMenu = document.getElementById("profileMenu");

if (profileTrigger && profileMenu) {
  profileTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    profileMenu.style.display =
      profileMenu.style.display === "block" ? "none" : "block";
  });

  window.addEventListener("click", (e) => {
    if (!profileTrigger.contains(e.target)) {
      profileMenu.style.display = "none";
    }
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

// ================= LOAD STATS =================
async function loadStats() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/doctors/stats", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    const cards = document.querySelectorAll(".card-box h4");

    cards[0].innerText = data.total_patients;
    cards[1].innerText = data.high_risk_patients;

  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ================= LOAD PRIORITY =================
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
    container.innerHTML = "<h6>Priority Patients</h6>";

    data.forEach(p => {
      container.innerHTML += `
        <div class="priority mt-3">
          <div class="priority-row">
            <strong>${p.name}</strong>
            <span class="risk-chip">${p.risk}%</span>
          </div>
          <p>${p.risk > 80 ? "Critical condition" : "Needs monitoring"}</p>
        </div>
      `;
    });

  } catch (err) {
    console.error("Priority error:", err);
  }
}

// ================= LOAD PATIENT TABLE =================
async function loadPatients() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/doctors/patients", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const patients = await res.json();
    const tbody = document.querySelector("tbody");

    tbody.innerHTML = "";

    for (let p of patients) {

      let risk = 0;
      let status = "Low";

      try {
        const histRes = await fetch(`http://127.0.0.1:8000/predictions/history/${p.id}`, {
          headers: {
            "Authorization": "Bearer " + token
          }
        });

        const history = await histRes.json();

        if (history.length > 0) {
          let latest = history[history.length - 1];

          risk = latest.risk_score || 0;

          // FIX: handle both 0-1 and 0-100 values
          if (risk <= 1) {
            risk = Math.round(risk * 100);
          } else {
            risk = Math.round(risk);
          }

          if (risk > 70) status = "High";
          else if (risk > 50) status = "Moderate";
        }

      } catch (e) {
        console.log("History fetch failed for", p.id);
      }

      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="d-flex align-items-center gap-2">
          <img src="https://i.pravatar.cc/40" class="avatar">
          ${p.name}
        </td>
        <td class="${risk > 60 ? "text-danger" : "text-success"} fw-bold">${risk}%</td>
        <td>
          <span class="status-chip 
            ${status === "High" ? "status-high" : ""}
            ${status === "Moderate" ? "status-moderate" : ""}
            ${status === "Low" ? "status-low" : ""}
          ">
            ${status}
          </span>
        </td>
        <td>Recent</td>
        <td>
          <button class="btn btn-sm custom-btn view-btn">View</button>
        </td>
      `;

      // VIEW BUTTON CLICK
      row.querySelector(".view-btn").addEventListener("click", () => {
        loadPatientDetails(p.id, p.name, risk, status);

        // highlight selected row
        document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("active-row"));
        row.classList.add("active-row");
      });

      tbody.appendChild(row);
    }

  } catch (err) {
    console.error("Patients error:", err);
  }
}

// ================= LOAD DETAILS =================
async function loadPatientDetails(id, name, risk, status) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://127.0.0.1:8000/doctors/patients/${id}`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();
    const latest = data.health_data[data.health_data.length - 1];

    document.querySelector(".details-header strong").innerText = name;
    document.querySelector(".details-header img").src = "https://i.pravatar.cc/40";

    document.querySelector(".details-header .status-chip").innerText =
      `${risk}% (${status})`;

    let symptoms = [];

    if (latest?.Polyuria) symptoms.push("Frequent Urination");
    if (latest?.Polydipsia) symptoms.push("Excess Thirst");
    if (latest?.weakness) symptoms.push("Weakness");

    document.querySelector(".details-box ul:nth-of-type(1)").innerHTML =
      `<li>${symptoms.join(", ") || "No major symptoms"}</li>`;

    let rec = "Healthy";

    if (risk > 80) rec = "Immediate medical attention required";
    else if (risk > 50) rec = "Monitor closely";

    document.querySelector(".details-box ul:nth-of-type(2)").innerHTML =
      `<li>${rec}</li>`;

    // 🔥 SHOW DETAILS BOX (FIX)
    document.getElementById("detailsBox").style.display = "block";

  } catch (err) {
    console.error("Details error:", err);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadPriorityPatients();
  loadPatients();
});