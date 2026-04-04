// ================= ROLE SELECTION =================

// Patient
const patientBtn = document.getElementById("patientBtn");
if (patientBtn) {
  patientBtn.onclick = () => {
    localStorage.setItem("role", "patient");
    window.location.href = "/frontend/patient/Signup.html";
  };
}

// Doctor
const doctorBtn = document.getElementById("doctorBtn");
if (doctorBtn) {
  doctorBtn.onclick = () => {
    localStorage.setItem("role", "doctor");
    window.location.href = "/frontend/doctor/Signup-doctor.html";
  };
}

// ================= KEYBOARD SUPPORT =================
document.querySelectorAll(".option").forEach((card) => {
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      card.click();
    }
  });
});