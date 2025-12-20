// patientAppointment.js
import { getPatientAppointments, getPatientData, filterAppointments } from "./services/patientServices.js";
import { showToast } from "./components/toast.js";
import { API_BASE_URL } from "./config/config.js";

const grid = document.getElementById("appointmentsGrid");
const token = localStorage.getItem("token");

let allAppointments = [];
let currentTab = 'upcoming'; // 'upcoming' or 'past'
let patientId = null;

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const patient = await getPatientData(token);
    if (!patient) throw new Error("Failed to fetch patient details");

    patientId = Number(patient.id);

    // Initial Fetch
    await loadAppointments();

    // Tab Listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update UI
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update Logic
        currentTab = e.target.dataset.tab;
        renderAppointments();
      });
    });

    // Search Listener
    document.getElementById("searchBar")?.addEventListener("input", (e) => {
      renderAppointments(e.target.value.trim());
    });

  } catch (error) {
    console.error("Error loading appointments:", error);
    grid.innerHTML = `<p class="error-text">Failed to load appointments.</p>`;
  }
}

async function loadAppointments() {
  try {
    const data = await getPatientAppointments(patientId, token, "patient") || [];
    // Filter specifically for this patient ID just in case
    allAppointments = data.filter(app => app.patientId === patientId);
    renderAppointments();
  } catch (err) {
    console.error(err);
    showToast("Error loading data", "error");
  }
}

function renderAppointments(searchTerm = "") {
  grid.innerHTML = "";

  const now = new Date();

  // 1. Filter by Tab
  let filtered = allAppointments.filter(app => {
    const appDate = new Date(app.appointmentDate);
    if (currentTab === 'upcoming') {
      return appDate >= now && app.status !== 2; // 2 = cancelled
    } else {
      return appDate < now || app.status === 2;
    }
  });

  // 2. Filter by Search
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(app =>
      app.doctorName.toLowerCase().includes(lower)
    );
  }

  // 3. Sort
  filtered.sort((a, b) => {
    return currentTab === 'upcoming'
      ? new Date(a.appointmentDate) - new Date(b.appointmentDate) // Ascending
      : new Date(b.appointmentDate) - new Date(a.appointmentDate); // Descending (History)
  });

  // 4. Render
  if (filtered.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <p>No ${currentTab} appointments found.</p>
                ${currentTab === 'upcoming' ? '<a href="/pages/loggedPatientDashboard.html" class="cta-link">Book Now</a>' : ''}
            </div>
        `;
    return;
  }

  filtered.forEach(app => {
    const card = createAppointmentCard(app);
    grid.appendChild(card);
  });
}

function createAppointmentCard(app) {
  const card = document.createElement("div");
  card.className = "appt-card";

  const dateObj = new Date(app.appointmentDate);
  const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isCancelled = app.status === 2;
  const statusBadge = isCancelled
    ? '<span class="badge badge-error">Cancelled</span>'
    : '<span class="badge badge-success">Confirmed</span>';

  card.innerHTML = `
        <div class="card-header">
            <div class="doc-info">
                <h3>${app.doctorName}</h3>
                <!-- <p class="specialty">Specialty Placeholder</p> -->
            </div>
            ${statusBadge}
        </div>
        <div class="card-body">
            <div class="info-row">
                <span class="icon">📅</span>
                <span>${dateStr}</span>
            </div>
            <div class="info-row">
                <span class="icon">⏰</span>
                <span>${timeStr}</span>
            </div>
        </div>
        ${!isCancelled && currentTab === 'upcoming' ? `
        <div class="card-actions">
            <button class="btn-cancel" data-id="${app.id}">Cancel</button>
            <button class="btn-reschedule" data-id="${app.id}">Reschedule</button>
        </div>
        ` : ''}
    `;

  // Attach Listeners
  const cancelBtn = card.querySelector(".btn-cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => handleCancel(app.id));
  }

  const rescheduleBtn = card.querySelector(".btn-reschedule");
  if (rescheduleBtn) {
    rescheduleBtn.addEventListener("click", () => redirectToUpdatePage(app));
  }

  return card;
}

async function handleCancel(id) {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/appointments/cancel/${id}/${token}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast("Appointment Cancelled", "success");
      // Refresh data locally or re-fetch
      loadAppointments();
    } else {
      const data = await response.json();
      showToast(data.message || "Failed to cancel", "error");
    }
  } catch (err) {
    showToast("System Error", "error");
  }
}

function redirectToUpdatePage(appointment) {
  const queryString = new URLSearchParams({
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName || "You",
    doctorName: appointment.doctorName,
    doctorId: appointment.doctorId,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTimeOnly, // Ensure simple time
  }).toString();

  window.location.href = `/pages/updateAppointment.html?${queryString}`;
}

