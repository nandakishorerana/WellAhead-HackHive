let lineChart;
let pieChart;

//LOAD DASHBOARD
async function loadDashboard() {

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

        if (!data || data.length === 0) {
            document.getElementById("insight").innerText = "No data available";
            return;
        }

        const latest = data[data.length - 1];

        //AGE + GENDER (LOCKED)
        document.getElementById("age").value = localStorage.getItem("user_age") || "";

        const savedGender = localStorage.getItem("user_gender");
        if (savedGender) {
            document.getElementById("gender").value = savedGender;
        }

        //RISK
        let risk = latest.risk_score;

        if (risk > 1) risk = risk / 100;

        const riskPercent = Math.round(risk * 100);
        const healthScore = 100 - riskPercent;

        document.getElementById("riskPercent").innerText = `${riskPercent}%`;
        document.getElementById("health").innerText = `${healthScore} / 100`;

        let insight = "Low";
        if (riskPercent > 70) insight = "High";
        else if (riskPercent > 40) insight = "Medium";

        document.getElementById("insight").innerText = insight;

        //RISK FACTORS
        const riskFactorsDiv = document.getElementById("riskFactors");

        let factors = [];

        if (riskPercent > 70) {
            factors = [
                "High glucose level detected",
                "Insulin imbalance risk",
                "Lifestyle improvement needed"
            ];
        } else if (riskPercent > 40) {
            factors = [
                "Moderate glucose level",
                "Monitor blood pressure",
                "Improve diet"
            ];
        } else {
            factors = [
                "Healthy condition",
                "Maintain lifestyle",
                "Regular checkup advised"
            ];
        }

        riskFactorsDiv.innerHTML = factors
            .map(f => `<div class="risk-item">${f}</div>`)
            .join("");

        //LINE CHART
        const labels = data.map((_, i) => `Test ${i + 1}`);
        const values = data.map(d =>
            Math.round((d.risk_score > 1 ? d.risk_score / 100 : d.risk_score) * 100)
        );

        const ctx = document.getElementById("lineChart");

        if (lineChart) lineChart.destroy();

        lineChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Risk %",
                    data: values,
                    fill: true,
                    tension: 0.4
                }]
            }
        });

        //PIE CHART
        const explanation = latest.explanation || [];

        let glucose = 0;
        let insulin = 0;
        let bp = 0;
        let symptoms = 0;

        if (Array.isArray(explanation)) {

            explanation.forEach(item => {
                const feature = (item.feature || "").toLowerCase();
                const impact = Math.abs(item.impact || item.value || 0);

                if (feature.includes("glucose")) glucose += impact;
                else if (feature.includes("insulin")) insulin += impact;
                else if (feature.includes("blood") || feature.includes("pressure")) bp += impact;
                else symptoms += impact;
            });

        } else {

            Object.keys(explanation).forEach(key => {
                const feature = key.toLowerCase();
                const impact = Math.abs(explanation[key]);

                if (feature.includes("glucose")) glucose += impact;
                else if (feature.includes("insulin")) insulin += impact;
                else if (feature.includes("blood") || feature.includes("pressure")) bp += impact;
                else symptoms += impact;
            });
        }

        const total = glucose + insulin + bp + symptoms || 1;

        const dataValues = [
            Math.round((glucose / total) * 100),
            Math.round((insulin / total) * 100),
            Math.round((bp / total) * 100),
            Math.round((symptoms / total) * 100)
        ];

        const pieCtx = document.getElementById("pieChart");

        if (pieChart) pieChart.destroy();

        pieChart = new Chart(pieCtx, {
            type: "doughnut",
            data: {
                labels: ["Glucose", "Insulin", "Blood Pressure", "Symptoms"],
                datasets: [{
                    data: dataValues
                }]
            }
        });

    } catch (err) {
        console.error(err);
        alert("Failed to load dashboard");
    }
}

//VALIDATION
function validateVitals() {
    let valid = true;

    const fields = [
        { id: "glucose", error: "glucoseError" },
        { id: "bp", error: "bpError" },
        { id: "insulin", error: "insulinError" }
    ];

    fields.forEach(f => {
        const input = document.getElementById(f.id);
        const error = document.getElementById(f.error);

        if (!input.value) {
            input.style.border = "2px solid red";
            if (error) error.classList.remove("d-none");
            valid = false;
        } else {
            input.style.border = "";
            if (error) error.classList.add("d-none");
        }
    });

    return valid;
}

//MODAL
let currentStep = 0;
const steps = document.querySelectorAll(".form-step");

function showStep(i) {
    steps.forEach((s, index) => {
        s.classList.toggle("active", index === i);
    });
    currentStep = i;
}

document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentStep === 1 && !validateVitals()) return;

    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    } else {
        submitHealth();
    }
});

document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentStep > 0) showStep(currentStep - 1);
});

//SUBMIT
async function submitHealth() {

    const token = localStorage.getItem("token");

    const data = {
        Age: Number(document.getElementById("age").value),
        Gender: document.getElementById("gender").value,

        Glucose: Number(document.getElementById("glucose").value),
        BloodPressure: Number(document.getElementById("bp").value),
        Insulin: Number(document.getElementById("insulin").value),

        Polyuria: document.getElementById("polyuria").value,
        Polydipsia: document.getElementById("polydipsia").value,
        sudden_weight_loss: document.getElementById("weightloss").value,
        weakness: document.getElementById("weakness").value,
        Polyphagia: document.getElementById("polyphagia").value,
        visual_blurring: document.getElementById("vision").value,
        itching: document.getElementById("itching").value,
        Irritability: document.getElementById("irritability").value,

        Obesity: document.getElementById("obesity").value,
        muscle_stiffness: document.getElementById("stiffness").value,
        partial_paresis: document.getElementById("paresis").value,
        alopecia: document.getElementById("alopecia").value,
        delayed_healing: document.getElementById("healing").value,
        genital_thrush: document.getElementById("thrush").value
    };

    try {
        const res = await fetch("http://127.0.0.1:8000/predictions/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(data)
        });

        if (res.ok) location.reload();
        else alert("Error updating");

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

//PROFILE DROPDOWN
const profileTrigger = document.getElementById("profileTrigger");

if (profileTrigger) {
    profileTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        profileTrigger.classList.toggle("open");
    });

    document.addEventListener("click", () => {
        profileTrigger.classList.remove("open");
    });
}

//LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });
}

//USER NAME
const name = localStorage.getItem("user_name");

if (name) {
    document.getElementById("username").innerText = name;
    document.querySelector(".top-header h1").innerText = `Welcome, ${name}!`;
}

//INIT
showStep(0);
loadDashboard();