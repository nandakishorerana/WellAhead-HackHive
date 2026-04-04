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

// ================= AI DATA LOAD =================
async function loadInsights() {

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
    const latest = data[data.length - 1];

    if (!latest || !latest.explanation) return;

    const shap = latest.explanation;

    // ================= FIX: CLEAN + NORMALIZE =================
    const cleaned = shap.map(item => ({
      feature: item.feature,
      value: Math.abs(item.value ?? item.impact ?? 0)
    }));

    // sort descending
    const sorted = cleaned
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    // normalize to %
    const total = sorted.reduce((sum, s) => sum + s.value, 0);

    const labels = sorted.map(s => s.feature);
    const values = sorted.map(s =>
      total ? Math.round((s.value / total) * 100) : 0
    );

    // ================= CHART =================
    const ctx = document.getElementById("barChart");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ["#ef4444", "#f59e0b", "#14b8a6", "#0ea5e9"],
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100 // 🔥 important (percentage scale)
          }
        }
      }
    });

    // ================= TAGS =================
    const tagContainer = document.querySelector(".dashboard-card:nth-child(2)");
    const tagDiv = tagContainer.querySelectorAll(".tag");

    sorted.forEach((item, i) => {

      if (!tagDiv[i]) return;

      let cls = "green";

      const percent = total ? item.value / total : 0;

      if (percent > 0.4) cls = "red";
      else if (percent > 0.2) cls = "amber";

      tagDiv[i].className = "tag " + cls;
      tagDiv[i].innerText = item.feature;
    });

    // ================= SUMMARY =================
    const summary = tagContainer.querySelector("p");

    const top = sorted[0]?.feature.toLowerCase() || "";

    if (top.includes("glucose")) {
      summary.innerText =
        "Primary concern is blood glucose consistency. Focus on nutrition timing and daily activity.";
    }
    else if (top.includes("insulin")) {
      summary.innerText =
        "Insulin imbalance is contributing to your risk. Improve physical activity and consult a doctor if needed.";
    }
    else if (top.includes("pressure")) {
      summary.innerText =
        "Blood pressure is a key factor. Reduce salt intake and maintain regular exercise.";
    }
    else if (top.includes("obesity") || top.includes("bmi")) {
      summary.innerText =
        "Body weight is influencing your risk. Focus on balanced diet and regular exercise.";
    }
    else {
      summary.innerText =
        "Your risk is influenced by multiple moderate factors. Maintain a balanced lifestyle.";
    }

  } catch (err) {
    console.error(err);
  }
}

// INIT
loadInsights();