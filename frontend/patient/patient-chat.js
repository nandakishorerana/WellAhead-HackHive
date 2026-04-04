const token = localStorage.getItem("token");
const userId = parseInt(localStorage.getItem("user_id"));
const appointmentId = localStorage.getItem("chat_appointment_id");

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSendBtn");

// ================= LOAD MESSAGES =================
async function loadMessages() {

  if (!appointmentId) {
    chatBox.innerHTML = "<p>No chat selected ❌</p>";
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/messages/${appointmentId}`, {
      headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    chatBox.innerHTML = "";

    if (data.length === 0) {
      chatBox.innerHTML = "<p>No messages yet 👋</p>";
      return;
    }

    data.forEach(m => {

      const div = document.createElement("div");

      const isMine = m.sender_id == userId;

      div.className = "message " + (isMine ? "right" : "left");

      div.innerHTML = `
        ${m.content}
        <span>${new Date(m.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      `;

      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    console.error("Chat load error:", err);
  }
}

// ================= SEND =================
sendBtn.onclick = async () => {

  const text = input.value.trim();

  if (!text) return;

  await fetch("http://127.0.0.1:8000/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      appointment_id: appointmentId,
      content: text
    })
  });

  input.value = "";
  loadMessages();
};

// ================= ENTER KEY =================
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// ================= AUTO REFRESH =================
setInterval(loadMessages, 3000);

// ================= INIT =================
loadMessages();