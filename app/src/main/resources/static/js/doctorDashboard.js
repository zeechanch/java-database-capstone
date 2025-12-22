// doctorDashboard.js
import { getDoctorAppointments, getDoctorDetails, updateDoctor, updateAvailability } from "./services/doctorServices.js";

const grid = document.getElementById("appointmentsGrid");
const datePicker = document.getElementById("datePicker");
const searchBar = document.getElementById("searchBar");
const todayBtn = document.getElementById("todayButton");
const manageBtn = document.getElementById("manageAvailabilityBtn");
const modal = document.getElementById("availabilityModal");
const closeModal = document.querySelector(".close-modal");
const saveBtn = document.getElementById("saveAvailabilityBtn");
const timeSlotContainer = document.getElementById("timeSlotContainer");

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
let currentDoctor = null;

const ALL_TIME_SLOTS = [
  "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00",
  "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"
];

document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Set Date Picker defaults
  datePicker.value = selectedDate;

  // Initial Load
  loadDashboard();

  // Fetch Doctor Profile to get current availability
  currentDoctor = await getDoctorDetails(token);

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

  // Modal Handlers
  manageBtn.addEventListener("click", openAvailabilityModal);
  closeModal.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  saveBtn.addEventListener("click", saveAvailability);
});

function openAvailabilityModal() {
  if (!currentDoctor) {
    alert("Could not fetch doctor details. Please try again.");
    return;
  }

  modal.style.display = "flex";
  renderTimeSlots();
}

function renderTimeSlots() {
  timeSlotContainer.innerHTML = "";
  const currentTimes = currentDoctor.availableTimes || [];

  ALL_TIME_SLOTS.forEach(slot => {
    const label = document.createElement("label");
    label.className = "time-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = slot;
    if (currentTimes.includes(slot)) {
      checkbox.checked = true;
    }

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(slot));
    timeSlotContainer.appendChild(label);
  });
}

async function saveAvailability() {
  const checkboxes = timeSlotContainer.querySelectorAll("input[type='checkbox']:checked");
  const selectedTimes = Array.from(checkboxes).map(cb => cb.value);

  // Call API for availability update only
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  const result = await updateAvailability(selectedTimes, token);

  if (result.success) {
    alert("Availability updated successfully!");
    currentDoctor.availableTimes = selectedTimes; // Update local state
    modal.style.display = "none";
  } else {
    alert("Failed to update: " + result.message);
  }

  saveBtn.textContent = "Save Changes";
  saveBtn.disabled = false;
}

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
  // Assuming status: 0/PENDING = Pending, 1/COMPLETED = Completed, 2/CANCELLED = Cancelled
  const pending = appointments.filter(a => a.status == 0 || a.status === 'PENDING').length;
  const completed = appointments.filter(a => a.status == 1 || a.status === 'COMPLETED').length;

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

  // Normalize status to check both numeric and string variants
  // 0 / PENDING -> Pending
  // 1 / COMPLETED -> Completed
  // 2 / CANCELLED -> Cancelled

  if (app.status == 1 || app.status === 'COMPLETED') {
    statusClass = "status-completed";
    statusText = "Completed";
    showActions = false;
  } else if (app.status == 2 || app.status === 'CANCELLED') {
    statusClass = "status-cancelled";
    statusText = "Cancelled";
    showActions = false;
  } else if (app.status == 0 || app.status === 'PENDING') {
    statusClass = "status-pending";
    statusText = "Pending";
    showActions = true;
  } else {
    // Fallback for unknown status
    statusText = app.status;
    showActions = false;
  }

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
