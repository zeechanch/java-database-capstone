// doctorDashboard.js
import { getDoctorAppointments } from "./services/doctorServices.js";

const grid = document.getElementById("appointmentsGrid");
const datePicker = document.getElementById("datePicker");
const searchBar = document.getElementById("searchBar");
const todayBtn = document.getElementById("todayButton");

// Stats Elements
const elTotal = document.getElementById("totalAppts");
const elPending = document.getElementById("pendingAppts");
const elCompleted = document.getElementById("completedAppts");

// Initialize to Local Date (YYYY-MM-DD)
const getLocalDate = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
};

let currentAppointments = [];
let selectedDate = getLocalDate();
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Set Date Picker defaults
  datePicker.value = selectedDate;

  // Initial Load
  loadDashboard();

  // Event Listeners
  datePicker.addEventListener("change", (e) => {
    selectedDate = e.target.value;
    todayBtn.classList.remove("active");
    loadDashboard();
  });

  todayBtn.addEventListener("click", () => {
    selectedDate = getLocalDate();
    datePicker.value = selectedDate;
    todayBtn.classList.add("active");
    loadDashboard();
  });

  searchBar.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = currentAppointments.filter(app =>
      (app.patientName || app.patient?.name || "").toLowerCase().includes(term)
    );
    renderAppointments(filtered);
  });
});

async function loadDashboard() {
  grid.innerHTML = '<p class="loading-text">Loading appointments...</p>';

  try {
    const appointments = await getDoctorAppointments(selectedDate, token);

    if (appointments === null) {
      grid.innerHTML = '<p class="error-text">Failed to load schedule. Please check connection.</p>';
      return;
    }

    currentAppointments = appointments || [];
    updateStats(currentAppointments);
    renderAppointments(currentAppointments);
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="error-text">Failed to load data.</p>';
  }
}

function updateStats(appointments) {
  elTotal.textContent = appointments.length;
  // Assuming status: 0 = Pending, 1 = Completed, 2 = Cancelled
  const pending = appointments.filter(a => a.status == 0).length;
  const completed = appointments.filter(a => a.status == 1).length;

  elPending.textContent = pending;
  elCompleted.textContent = completed;
}

function renderAppointments(appointments) {
  grid.innerHTML = "";

  if (appointments.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <p>No appointments found for ${selectedDate}.</p>
            </div>
        `;
    return;
  }

  appointments.forEach(app => {
    const card = createAppointmentCard(app);
    grid.appendChild(card);
  });
}

// Update Status Logic
window.handleStatusUpdate = async (id, status) => {
  // Confirmation
  const action = status === '1' ? 'Complete' : 'Cancel';
  if (!confirm(`Are you sure you want to ${action} this appointment?`)) return;

  try {
    const success = await import("./services/doctorServices.js").then(m => m.updateAppointmentStatus(id, status, token));
    if (success) {
      alert("Status updated successfully!");
      loadDashboard(); // Refresh
    } else {
      alert("Failed to update status.");
    }
  } catch (e) {
    console.error(e);
    alert("Error occurred.");
  }
};

function createAppointmentCard(app) {
  const card = document.createElement("div");
  card.className = "appt-card";

  const patientName = app.patientName || app.patient?.name || "Unknown";
  const patientPhone = app.patient?.phone || "N/A";
  // Parse Time
  let timeStr = "TBD";
  if (app.appointmentDate) {
    timeStr = new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (app.appointmentTime) {
    timeStr = app.appointmentTime; // usage variance check
  }

  let statusClass = "status-pending";
  let statusText = "Pending";
  let showActions = true;
  if (app.status == 1) { statusClass = "status-completed"; statusText = "Completed"; showActions = false; }
  if (app.status == 2) { statusClass = "status-cancelled"; statusText = "Cancelled"; showActions = false; }

  card.innerHTML = `
        <div class="card-header">
            <h4>${timeStr}</h4>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="card-body">
            <div class="patient-info">
                <p><strong>👤 ${patientName}</strong></p>
                <p>📞 ${patientPhone}</p>
                <p>🆔 #${app.id}</p>
            </div>
        </div>
        ${showActions ? `
        <div class="card-actions">
           <button class="action-btn btn-complete" onclick="handleStatusUpdate(${app.id}, '1')">Complete</button>
           <button class="action-btn btn-cancel" onclick="handleStatusUpdate(${app.id}, '2')">Cancel</button>
        </div>` : ''}
    `;
  return card;
}
