const table = document.getElementById("scheduleTable");

async function loadAppointments() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Login as doctor");
        return;
    }

    const res = await fetch("http://127.0.0.1:8000/appointments/doctor", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    renderTable(data);
    updateStats(data);
}

// ================= TABLE =================
function renderTable(data) {

    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = `<tr><td colspan="4">No appointments yet</td></tr>`;
        return;
    }

    data.forEach(a => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${a.patient_name}</td>
            <td>${formatTime(a.time)}</td>
            <td>
                <span class="status-chip ${getStatusClass(a.status)}">
                    ${capitalize(a.status)}
                </span>
            </td>
            <td>
                ${
                    a.status === "pending"
                    ? `
                      <button class="btn btn-sm custom-btn" onclick="acceptAppointment(${a.id})">Accept</button>
                      <button class="btn btn-sm btn-danger" onclick="rejectAppointment(${a.id})">Reject</button>
                    `
                    : `✔`
                }
            </td>
        `;

        table.appendChild(row);
    });
}

// ================= ACCEPT =================
async function acceptAppointment(id) {

    const token = localStorage.getItem("token");

    await fetch(`http://127.0.0.1:8000/appointments/${id}/accept`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    loadAppointments();
}

// ================= REJECT =================
async function rejectAppointment(id) {

    const token = localStorage.getItem("token");

    await fetch(`http://127.0.0.1:8000/appointments/${id}/reject`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    loadAppointments();
}

// ================= HELPERS =================
function formatTime(time) {
    return new Date(time).toLocaleString();
}

function getStatusClass(status) {
    if (status === "pending") return "status-pending";
    if (status === "confirmed") return "status-confirmed";
    if (status === "rejected") return "status-rejected";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// ================= STATS =================
function updateStats(data) {

    document.getElementById("totalCount").innerText = data.length;

    const pending = data.filter(a => a.status === "pending").length;

    document.getElementById("pendingCount").innerText = pending;
    document.getElementById("todayCount").innerText = data.length;
}

// ================= INIT =================
loadAppointments();