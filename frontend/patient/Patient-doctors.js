// ================= SAFE INIT =================
console.log("Patient Doctors JS Loaded ✅");

// ================= ELEMENTS =================
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const profileTrigger = document.getElementById("profileTrigger");
const searchInput = document.getElementById("doctorSearch");
const filters = document.querySelectorAll("#filters button");

let activeFilter = "all";
let doctorsData = [];
let patientAppointments = [];

let selectedDoctorId = null;
let selectedTime = null;
let currentAppointmentId = null;

const token = localStorage.getItem("token");
const userId = parseInt(localStorage.getItem("user_id"));

// ================= FETCH =================
async function loadDoctors() {

  try {
    const docRes = await fetch("http://127.0.0.1:8000/doctors/");
    const doctors = await docRes.json();

    let appointments = [];

    try {
      const appRes = await fetch("http://127.0.0.1:8000/appointments/patient", {
        headers: { "Authorization": "Bearer " + token }
      });

      if (appRes.ok) {
        appointments = await appRes.json();
      }
    } catch (err) {}

    patientAppointments = appointments;

    doctorsData = doctors.map(d => ({
      id: d.id,
      name: d.name || "Dr. Unknown",
      specialty: (d.specialty || "general physician").toLowerCase(),
      img: "https://i.pravatar.cc/100?img=" + d.id
    }));

    renderDoctors();

  } catch (err) {
    console.error("Doctor fetch failed:", err);
  }
}

// ================= GET APPOINTMENT =================
function getAppointmentForDoctor(docId) {
  return patientAppointments.find(a => a.doctor_id == docId);
}

// ================= FORMAT =================
function formatTime(time) {
  return new Date(time).toLocaleString();
}

// ================= RENDER =================
const container = document.getElementById("doctorContainer");

function renderDoctors() {

  if (!container) return;

  container.innerHTML = doctorsData.map(doc => {

    const appointment = getAppointmentForDoctor(doc.id);

    let actionHTML = `
      <button class="btn-solid-teal book-btn" data-id="${doc.id}">
        Book Appointment
      </button>
    `;

    if (appointment) {

      let statusClass = "text-warning";
      let statusText = "Pending ⏳";

      if (appointment.status === "confirmed") {
        statusClass = "text-success";
        statusText = "Confirmed ✅";
      }

      if (appointment.status === "rejected") {
        statusClass = "text-danger";
        statusText = "Rejected ❌";
      }

      actionHTML = `
        <div class="${statusClass}" style="font-weight:600;">
          ${statusText}
        </div>
        <small>${formatTime(appointment.time)}</small>

        ${
          appointment.status === "confirmed"
          ? `<button class="btn btn-sm btn-primary mt-2 chat-btn" data-id="${appointment.id}">
                💬 Chat
             </button>`
          : ""
        }
      `;
    }

    return `
      <article class="doctor-card" data-specialty="${doc.specialty}">
          <img src="${doc.img}">
          <div class="doctor-info">
              <h6>${doc.name}</h6>
              <p>${doc.specialty}</p>
              ${actionHTML}
          </div>
      </article>
    `;
  }).join("");

  attachBookEvents();
  attachChatEvents();
  applyDoctorFilters();
}

// ================= BOOK =================
function attachBookEvents() {
  document.querySelectorAll(".book-btn").forEach(btn => {

    btn.onclick = () => {
      selectedDoctorId = btn.dataset.id;
      selectedTime = null;

      document.getElementById("appointmentDate").value = "";
      document.getElementById("slotContainer").innerHTML = "";

      new bootstrap.Modal(document.getElementById('bookingModal')).show();
    };

  });
}

// ================= 🔥 LOAD SLOTS =================
const dateInput = document.getElementById("appointmentDate");

if (dateInput) {
  dateInput.addEventListener("change", async () => {

    const date = dateInput.value;
    if (!date || !selectedDoctorId) return;

    const res = await fetch(
      `http://127.0.0.1:8000/appointments/slots/${selectedDoctorId}?date=${date}`
    );

    const data = await res.json();

    const container = document.getElementById("slotContainer");
    container.innerHTML = "";

    data.slots.forEach(slot => {

      const isBooked = data.booked.includes(slot);

      const btn = document.createElement("button");

      btn.className = "btn btn-sm m-1 " +
        (isBooked ? "btn-secondary" : "btn-outline-primary");

      btn.innerText = new Date(slot).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (!isBooked) {
        btn.onclick = () => {

          selectedTime = slot;

          document.querySelectorAll("#slotContainer button")
            .forEach(b => b.classList.remove("btn-primary"));

          btn.classList.add("btn-primary");

        };
      } else {
        btn.disabled = true;
      }

      container.appendChild(btn);
    });

  });
}

// ================= 🔥 CONFIRM =================
const confirmBtn = document.getElementById("confirmBooking");

if (confirmBtn) {
  confirmBtn.onclick = async () => {

    if (!selectedTime) {
      alert("Select a slot first");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/appointments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        doctor_id: parseInt(selectedDoctorId),
        time: selectedTime
      })
    });

    if (!res.ok) {
      alert("Booking failed");
      return;
    }

    alert("✅ Appointment booked!");
    loadDoctors();
  };
}

// ================= CHAT =================
function attachChatEvents() {
  document.querySelectorAll(".chat-btn").forEach(btn => {
    btn.onclick = () => {
      const appointmentId = btn.dataset.id;

      // save current chat session
      localStorage.setItem("chat_appointment_id", appointmentId);

      // redirect to chat page
      window.location.href = "patient-chat.html";
    };
  });
}

// ================= FILTER =================
function applyDoctorFilters() {

  if (!searchInput) return;

  const q = searchInput.value.trim().toLowerCase();
  const cards = document.querySelectorAll(".doctor-card");

  cards.forEach((card) => {
    const specialty = card.dataset.specialty.toLowerCase();
    const text = card.textContent.toLowerCase();

    const matchFilter = activeFilter === "all" || specialty.includes(activeFilter);
    const matchSearch = q === "" || text.includes(q);

    card.style.display = matchFilter && matchSearch ? "flex" : "none";
  });
}

// ================= EVENTS =================
filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter.toLowerCase();
    applyDoctorFilters();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", applyDoctorFilters);
}

// ================= AUTO REFRESH =================
setInterval(loadDoctors, 8000);

// ================= INIT =================
loadDoctors();