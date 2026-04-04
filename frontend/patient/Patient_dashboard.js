let currentStep = 0;
let currentSteps = [];

// =========================
function getCurrentSteps() {
    const diseaseType = document.querySelector('input[name="entry-disease"]:checked')?.value || "diabetes";

    if (diseaseType === "heart") {
        return [
            document.querySelector('.form-step[data-step-key="disease"]'),
            document.querySelector('.form-step[data-step-key="basic"]'),
            document.querySelector('.form-step[data-step-key="heart-clinical"]')
        ].filter(step => step); // filter out nulls
    } else if (diseaseType === "diabetes") {
        return [
            document.querySelector('.form-step[data-step-key="disease"]'),
            document.querySelector('.form-step[data-step-key="basic"]'),
            document.querySelector('.form-step[data-step-key="diabetes-vitals"]'),
            document.querySelector('.form-step[data-step-key="diabetes-symptoms"]'),
            document.querySelector('.form-step[data-step-key="diabetes-conditions"]')
        ].filter(step => step);
    } else {
        // both
        return [
            document.querySelector('.form-step[data-step-key="disease"]'),
            document.querySelector('.form-step[data-step-key="basic"]'),
            document.querySelector('.form-step[data-step-key="diabetes-vitals"]'),
            document.querySelector('.form-step[data-step-key="diabetes-symptoms"]'),
            document.querySelector('.form-step[data-step-key="diabetes-conditions"]'),
            document.querySelector('.form-step[data-step-key="heart-clinical"]')
        ].filter(step => step);
    }
}

// =========================
function showStep(index) {
    currentSteps = getCurrentSteps();
    currentSteps.forEach((step, i) => {
        step.classList.toggle("active", i === index);
    });

    currentStep = index;

    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    nextBtn.innerText = currentStep === currentSteps.length - 1 ? "Submit" : "Next";
    prevBtn.style.display = currentStep === 0 ? "none" : "inline-block";
}

// =========================
async function submitForm() {

    const token = localStorage.getItem("token");
    if (!token) return alert("Login first!");

    // Get selected disease type
    const diseaseType = document.querySelector('input[name="entry-disease"]:checked').value;

    let data = {};

    // Common fields
    const age = document.getElementById("entry-age").value;
    const gender = document.getElementById("entry-gender").value;

    if (diseaseType === "diabetes") {
        data = {
            disease_type: "diabetes",
            Age: Number(age),
            Gender: gender,
            Glucose: Number(document.getElementById("entry-glucose").value),
            BloodPressure: Number(document.getElementById("entry-bp").value),
            Insulin: Number(document.getElementById("entry-insulin").value),
            Polyuria: document.getElementById("entry-polyuria").value,
            Polydipsia: document.getElementById("entry-polydipsia").value,
            sudden_weight_loss: document.getElementById("entry-weightloss").value,
            weakness: document.getElementById("entry-weakness").value,
            Polyphagia: document.getElementById("entry-polyphagia").value,
            visual_blurring: document.getElementById("entry-vision").value,
            itching: document.getElementById("entry-itching").value,
            Irritability: document.getElementById("entry-irritability").value,
            Obesity: document.getElementById("entry-obesity").value,
            muscle_stiffness: document.getElementById("entry-stiffness").value,
            partial_paresis: document.getElementById("entry-paresis").value,
            alopecia: document.getElementById("entry-alopecia").value,
            delayed_healing: document.getElementById("entry-healing").value,
            genital_thrush: document.getElementById("entry-thrush").value
        };
    }

    else if (diseaseType === "heart") {
        data = {
            disease_type: "heart",
            age: Number(age),
            sex: gender === "Male" ? 1 : 0,  // Convert to 0/1 for heart model
            cp: Number(document.getElementById("entry-cp").value),
            trestbps: Number(document.getElementById("entry-trestbps").value),
            chol: Number(document.getElementById("entry-chol").value),
            fbs: Number(document.getElementById("entry-fbs").value),
            restecg: Number(document.getElementById("entry-restecg").value),
            thalach: Number(document.getElementById("entry-thalach").value),
            exang: Number(document.getElementById("entry-exang").value),
            oldpeak: Number(document.getElementById("entry-oldpeak").value),
            slope: 0,  // Not collected in form, default to 0
            ca: 0,     // Not collected in form, default to 0
            thal: 0    // Not collected in form, default to 0
        };
    }

    else {
        // For "both", we'd need to collect all fields, but for now assume diabetes + heart
        data = {
            disease_type: "both",
            // Diabetes fields
            Age: Number(age),
            Gender: gender,
            Glucose: Number(document.getElementById("entry-glucose").value),
            BloodPressure: Number(document.getElementById("entry-bp").value),
            Insulin: Number(document.getElementById("entry-insulin").value),
            Polyuria: document.getElementById("entry-polyuria").value,
            Polydipsia: document.getElementById("entry-polydipsia").value,
            sudden_weight_loss: document.getElementById("entry-weightloss").value,
            weakness: document.getElementById("entry-weakness").value,
            Polyphagia: document.getElementById("entry-polyphagia").value,
            visual_blurring: document.getElementById("entry-vision").value,
            itching: document.getElementById("entry-itching").value,
            Irritability: document.getElementById("entry-irritability").value,
            Obesity: document.getElementById("entry-obesity").value,
            muscle_stiffness: document.getElementById("entry-stiffness").value,
            partial_paresis: document.getElementById("entry-paresis").value,
            alopecia: document.getElementById("entry-alopecia").value,
            delayed_healing: document.getElementById("entry-healing").value,
            genital_thrush: document.getElementById("entry-thrush").value,
            // Heart fields
            age: Number(age),
            sex: gender === "Male" ? 1 : 0,
            cp: Number(document.getElementById("entry-cp").value),
            trestbps: Number(document.getElementById("entry-trestbps").value),
            chol: Number(document.getElementById("entry-chol").value),
            fbs: Number(document.getElementById("entry-fbs").value),
            restecg: Number(document.getElementById("entry-restecg").value),
            thalach: Number(document.getElementById("entry-thalach").value),
            exang: Number(document.getElementById("entry-exang").value),
            oldpeak: Number(document.getElementById("entry-oldpeak").value),
            slope: 0,
            ca: 0,
            thal: 0
        };
    }

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

        localStorage.setItem("selected_disease", diseaseType);
        window.location.href = "dashboard.html";

    } catch (err) {
        console.error(err);
        alert("Backend error");
    }
}

// =========================
nextBtn.addEventListener("click", () => {
    if (currentStep < currentSteps.length - 1) {
        showStep(currentStep + 1);
    } else {
        submitForm();
    }
});

prevBtn.addEventListener("click", () => {
    if (currentStep > 0) showStep(currentStep - 1);
});

// =========================
// SHOW HEART INPUTS
document.querySelectorAll('input[name="entry-disease"]').forEach(radio => {
    radio.addEventListener("change", function () {
        currentStep = 0; // reset to first step
        showStep(0);
    });
});

showStep(0);