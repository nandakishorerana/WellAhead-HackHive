let currentAppointmentId = null;

const chatBox = document.getElementById("chatBox");
const inputMsg = document.getElementById("inputMsg");
const sendBtn = document.getElementById("sendBtn");

const token = localStorage.getItem("token");
const userId = parseInt(localStorage.getItem("user_id"));

// ================= LOAD PATIENTS =================
async function loadPatients() {

  const res = await fetch("http://127.0.0.1:8000/appointments/doctor", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  const container = document.querySelector(".patients");
  container.innerHTML = "<h6>Patients</h6>";

  data.forEach(app => {

    if (app.status !== "confirmed") return;

    const div = document.createElement("div");
    div.className = "patient";

    div.innerHTML = `
      <div>
        <h6>${app.patient_name}</h6>
        <p>Click to chat</p>
      </div>
    `;

    div.onclick = () => {
      document.querySelectorAll(".patient").forEach(p => p.classList.remove("active"));
      div.classList.add("active");

      currentAppointmentId = app.id;
      loadMessages();
    };

    container.appendChild(div);
  });
}

// ================= LOAD MESSAGES =================
async function loadMessages() {

  if (!currentAppointmentId) return;

  const res = await fetch(`http://127.0.0.1:8000/messages/${currentAppointmentId}`, {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  chatBox.innerHTML = "";

  data.forEach(m => {

    const msgDiv = document.createElement("div");

    const isMine = m.sender_id === userId;

    msgDiv.className = "message " + (isMine ? "right" : "left");

    msgDiv.innerHTML = `
      ${m.content}
    `;

    chatBox.appendChild(msgDiv);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// ================= SEND =================
sendBtn.onclick = async () => {

  const content = inputMsg.value.trim();

  if (!content || !currentAppointmentId) return;

  await fetch("http://127.0.0.1:8000/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      appointment_id: currentAppointmentId,
      content: content
    })
  });

  inputMsg.value = "";
  loadMessages();
};

// ================= AUTO REFRESH =================
setInterval(loadMessages, 2000);

// ================= INIT =================
loadPatients();