const sidebar = document.getElementById("sidebar");
const profileTrigger = document.getElementById("profileTrigger");

const weightRange = document.getElementById("weightRange");
const activityRange = document.getElementById("activityRange");
const sugarRange = document.getElementById("sugarRange");

const weightValue = document.getElementById("weightValue");
const activityValue = document.getElementById("activityValue");
const sugarValue = document.getElementById("sugarValue");

const riskCurrent = document.getElementById("riskCurrent");
const riskTarget = document.getElementById("riskTarget");

const planCards = document.querySelectorAll(".plan-card");

let baseRisk = 70; // default fallback

// ================= SIDEBAR =================
if (profileTrigger) {
  profileTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    profileTrigger.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    profileTrigger.classList.remove("open");
  });
}

// ================= LOAD BACKEND DATA =================
async function loadRisk() {

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

    if (!latest) return;

    let risk = latest.risk_score;

    if (risk > 1) risk = risk / 100;

    baseRisk = Math.round(risk * 100);

    updateReadout(); // 🔥 update after fetching

  } catch (err) {
    console.error(err);
  }
}

// ================= UPDATE UI =================
function updateReadout() {

  const weight = Number(weightRange.value);
  const activity = Number(activityRange.value);
  const sugar = Number(sugarRange.value);

  weightValue.textContent = `${weight} kg`;
  activityValue.textContent = `${activity} min/day`;
  sugarValue.textContent = `${sugar} g/day`;

  // 🎯 SMART RISK CALCULATION
  const refWeight = 72;
  const refActivity = 30;
  const refSugar = 40;

  let reduction = 0;

  reduction += (refWeight - weight) * 0.8;
  reduction += (activity - refActivity) * 0.5;
  reduction -= (sugar - refSugar) * 0.6;

  let targetRisk = baseRisk - reduction;

  targetRisk = Math.max(10, Math.min(baseRisk, Math.round(targetRisk)));

  // ================= UI UPDATE =================
  riskCurrent.textContent = `${baseRisk}%`;
  riskTarget.textContent = `${targetRisk}%`;

  riskChart.data.datasets[0].data = [baseRisk, targetRisk];
  riskChart.update();
}

// ================= EVENTS =================
[weightRange, activityRange, sugarRange].forEach((input) => {
  input.addEventListener("input", updateReadout);
});

// ================= PLAN SELECT =================
planCards.forEach((card) => {
  card.addEventListener("click", () => {
    planCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});

// ================= CHART =================
const chartCtx = document.getElementById("chart");

const riskChart = new Chart(chartCtx, {
  type: "bar",
  data: {
    labels: ["Current Risk", "Projected Risk"],
    datasets: [{
      data: [70, 70],
      borderRadius: 12,
      backgroundColor: ["#ef4444", "#16a34a"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  }
});

// ================= INIT =================
loadRisk();