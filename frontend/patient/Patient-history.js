const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const profileTrigger = document.getElementById("profileTrigger");

// ================= SIDEBAR =================
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

if (profileTrigger) {
  profileTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    profileTrigger.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    profileTrigger.classList.remove("open");
  });
}

// ================= LOAD HISTORY =================
async function loadHistory() {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {

    const res = await fetch("http://127.0.0.1:8000/predictions/history", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    if (!data || data.length === 0) return;

    const timeline = document.querySelector(".timeline");
    timeline.innerHTML = "";

    // ================= TIMELINE =================
    data.slice().reverse().forEach(item => {

      let risk = item.risk_score;
      if (risk > 1) risk = risk / 100;

      const percent = Math.round(risk * 100);

      let level = "low";
      let label = "Low Risk";

      if (percent > 70) {
        level = "high";
        label = "High Risk";
      } else if (percent > 40) {
        level = "medium";
        label = "Medium Risk";
      }

      const date = new Date(item.created_at).toDateString();

      timeline.innerHTML += `
        <div class="card-item">
          <span class="card-date">${date}</span>
          <span class="risk-badge risk-${level}">${percent}% ${label}</span>
          <p class="card-desc mb-0">${getMessage(percent)}</p>
        </div>
      `;
    });

    // ================= SUMMARY =================
    const latest = data[data.length - 1];
    const first = data[0];

    let latestRisk = latest.risk_score;
    let firstRisk = first.risk_score;

    if (latestRisk > 1) latestRisk /= 100;
    if (firstRisk > 1) firstRisk /= 100;

    const latestPercent = Math.round(latestRisk * 100);
    const firstPercent = Math.round(firstRisk * 100);

    const improvement = firstPercent - latestPercent;

    // ✅ FIXED: Use IDs (not nth-child)
    const currentEl = document.getElementById("currentRisk");
    const improvementEl = document.getElementById("improvement");
    const trendEl = document.getElementById("trend");

    if (currentEl) {
      currentEl.innerText = `${latestPercent}%`;
    }

    if (improvementEl) {
      improvementEl.innerText =
        `${improvement > 0 ? "-" : "+"}${Math.abs(improvement)}%`;
    }

    if (trendEl) {
      if (improvement > 0) {
        trendEl.innerText = "Improving ↗";
        trendEl.className = "stat-trend text-success mb-0";
      } else if (improvement < 0) {
        trendEl.innerText = "Worsening ↘";
        trendEl.className = "stat-trend text-danger mb-0";
      } else {
        trendEl.innerText = "Stable →";
        trendEl.className = "stat-trend mb-0";
      }
    }

  } catch (err) {
    console.error(err);
  }
}

// ================= HELPER =================
function getMessage(percent) {

  if (percent > 70) {
    return "High risk detected. Immediate lifestyle changes needed.";
  } else if (percent > 40) {
    return "Moderate condition. Keep improving habits.";
  } else {
    return "Stable health condition.";
  }
}

// ================= INIT =================
loadHistory();