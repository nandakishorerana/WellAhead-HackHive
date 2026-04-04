let currentStep = 0;

const steps = document.querySelectorAll(".form-step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

function showStep(index) {
    steps.forEach((step, i) => {
        step.classList.remove("active");
        if (i === index) step.classList.add("active");
    });

    currentStep = index;

    nextBtn.innerText = currentStep === steps.length - 1 ? "Submit" : "Next";
    prevBtn.style.display = currentStep === 0 ? "none" : "inline-block";
}

// =========================
// 🔥 FINAL SUBMIT (CONNECTED TO BACKEND)
// =========================
async function submitForm() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Login first!");
        window.location.href = "login.html";
        return;
    }

    const inputs = document.querySelectorAll("input, select");

    const values = [];
    inputs.forEach(input => values.push(input.value));

    const data = {
        Age: Number(values[0]),
        Gender: values[1],

        Glucose: Number(values[2]),
        BloodPressure: Number(values[3]),
        Insulin: Number(values[4]),

        Polyuria: values[5],
        Polydipsia: values[6],
        sudden_weight_loss: values[7],
        weakness: values[8],
        Polyphagia: values[9],
        visual_blurring: values[10],
        itching: values[11],
        Irritability: "No",

        Obesity: values[12],
        muscle_stiffness: values[13],
        partial_paresis: values[14],
        alopecia: values[15],
        delayed_healing: values[16],
        genital_thrush: values[17]
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

        const result = await res.json();

        if (!res.ok) {
            alert(result.detail || "Prediction failed");
            return;
        }

        // Save for dashboard
        localStorage.setItem("latest_prediction", JSON.stringify(result));

        // Redirect
        window.location.href = "dashboard.html";

    } catch (err) {
        console.error(err);
        alert("Backend error");
    }
}

// =========================
nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    } else {
        submitForm();
    }
});

prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
});

showStep(0);