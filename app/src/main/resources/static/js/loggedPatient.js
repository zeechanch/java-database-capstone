// loggedPatient.js 
import { getDoctors, filterDoctors } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';
import { bookAppointment } from './services/appointmentRecordService.js';
import { getPatientData, getPatientAppointments } from './services/patientServices.js';
import { showToast } from './components/toast.js';

let allDoctors = []; // Store doctors globally for access by ID

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Initialize Dashboard
  await loadPatientInfo(token);
  loadDoctorCards();

  // Event Listeners
  document.getElementById("searchBar")?.addEventListener("input", filterDoctorsOnChange);
  document.getElementById("filterTime")?.addEventListener("change", filterDoctorsOnChange);
  document.getElementById("filterSpecialty")?.addEventListener("change", filterDoctorsOnChange);

  // Booking Button Delegate
  document.getElementById("content")?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".book-appointment-btn");
    if (!btn) return;

    const doctorId = Number(btn.dataset.doctorId);
    const doctor = allDoctors.find(d => d.id === doctorId);

    if (!doctor) {
      showToast("Doctor details not found", "error");
      return;
    }

    const token = localStorage.getItem("token");
    const patient = await getPatientData(token);

    if (patient) {
      showBookingOverlay(e, doctor, patient);
    } else {
      showToast("Could not fetch your details", "error");
    }
  });
});

/* ===========================
   Patient Info & Sidebar
   =========================== */
async function loadPatientInfo(token) {
  try {
    const patient = await getPatientData(token);
    if (patient) {
      // Update Welcome Name
      const nameDisplay = document.getElementById("patientNameDisplay");
      if (nameDisplay) nameDisplay.textContent = patient.name.split(' ')[0]; // First name

      // Load Upcoming Appointment
      loadUpcomingAppointment(patient.id, token);
    }
  } catch (err) {
    console.error("Error loading patient info:", err);
  }
}

async function loadUpcomingAppointment(patientId, token) {
  const container = document.getElementById("nextAppointment");
  if (!container) return;

  try {
    const appointments = await getPatientAppointments(patientId, token, "patient");
    // Filter future appointments and sort by nearest date
    const now = new Date();
    const upcoming = appointments
      ?.filter(app => new Date(app.appointmentDate) > now && app.status !== 2) // 2 = cancelled (assuming)
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    if (upcoming && upcoming.length > 0) {
      const next = upcoming[0];
      const date = new Date(next.appointmentDate);
      container.innerHTML = `
                <div class="appt-details">
                    <p class="appt-date">📅 ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p class="appt-doc">👨‍⚕️ ${next.doctorName}</p>
                    <span class="badge badge-success">Confirmed</span>
                </div>
            `;
    } else {
      container.innerHTML = `<p class="placeholder-text">No upcoming appointments.</p>`;
    }
  } catch (err) {
    container.innerHTML = `<p class="error-text">Failed to load schedule.</p>`;
  }
}

/* ===========================
   Doctors & Filtering
   =========================== */
async function loadDoctorCards() {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = '<p class="loading-text">Finding best doctors for you...</p>';

  try {
    const doctors = await getDoctors();
    allDoctors = doctors || []; // Update global store
    renderDoctorCards(doctors);
  } catch (err) {
    contentDiv.innerHTML = '<p class="error-text">Failed to load doctors list.</p>';
  }
}

function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";

  if (!doctors || doctors.length === 0) {
    contentDiv.innerHTML = "<p class='no-results'>No doctors found.</p>";
    return;
  }

  doctors.forEach(doctor => {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  });
}

function filterDoctorsOnChange() {
  const searchBar = document.getElementById("searchBar").value.trim();
  const filterTime = document.getElementById("filterTime").value;
  const filterSpecialty = document.getElementById("filterSpecialty").value;

  const name = searchBar.length > 0 ? searchBar : null;
  const time = filterTime.length > 0 ? filterTime : null;
  const specialty = filterSpecialty.length > 0 ? filterSpecialty : null;

  filterDoctors(name, time, specialty)
    .then(response => {
      // Response structure might differ based on backend implementation
      // Previously it accessed response.doctors, let's robustly handle array or object
      const doctors = Array.isArray(response) ? response : (response.doctors || []);
      allDoctors = doctors; // Update global store
      renderDoctorCards(doctors);
    })
    .catch(error => {
      console.error(error);
      showToast("Failed to filter doctors", "error");
    });
}


/* ===========================
   Booking Logic (Overlay)
   =========================== */
export function showBookingOverlay(e, doctor, patient) {
  // Check if overlay already exists to prevent duplicates
  if (document.querySelector('.modalApp')) return;

  const ripple = document.createElement("div");
  ripple.classList.add("ripple-overlay");
  // Center ripple if event is not precise
  ripple.style.left = `${e.clientX || window.innerWidth / 2}px`;
  ripple.style.top = `${e.clientY || window.innerHeight / 2}px`;
  document.body.appendChild(ripple);

  setTimeout(() => ripple.classList.add("active"), 50);

  const modalApp = document.createElement("div");
  modalApp.classList.add("modalApp");

  modalApp.innerHTML = `
    <h2>Book Appointment</h2>
    <div class="booking-summary">
        <p><strong>Doctor:</strong> ${doctor.name} (${doctor.specialization || doctor.specialty})</p>
        <p><strong>Patient:</strong> ${patient.name}</p>
    </div>
    
    <label>Select Date</label>
    <input class="input-field" type="date" id="appointment-date" min="${new Date().toISOString().split('T')[0]}" />
    
    <label>Select Time</label>
    <select class="input-field" id="appointment-time">
      <option value="">-- Choose Slot --</option>
      ${doctor.availableTimes.map(t => `<option value="${t}">${t}</option>`).join('')}
    </select>
    
    <div class="modal-actions">
        <button class="cancel-booking">Cancel</button>
        <button class="confirm-booking">Confirm Booking</button>
    </div>
  `;

  document.body.appendChild(modalApp);
  setTimeout(() => modalApp.classList.add("active"), 100);

  // Close Handler
  const close = () => {
    modalApp.classList.remove("active");
    ripple.classList.remove("active");
    setTimeout(() => {
      modalApp.remove();
      ripple.remove();
    }, 300);
  };

  modalApp.querySelector(".cancel-booking").addEventListener("click", close);
  ripple.addEventListener("click", close);

  // Confirm Handler
  modalApp.querySelector(".confirm-booking").addEventListener("click", async () => {
    const date = modalApp.querySelector("#appointment-date").value;
    const time = modalApp.querySelector("#appointment-time").value;

    if (!date || !time) {
      showToast("Please select both date and time", "warning");
      return;
    }

    const token = localStorage.getItem("token");
    const startTime = time.split('-')[0].trim(); // Handle "09:00 - 10:00" format if present

    // Construct simplified time string (HH:mm:ss)
    // If time is "09:00", just append ":00"
    // Ideally ensure format matches backend expectations

    const appointmentDateISO = `${date}T${startTime.length === 5 ? startTime + ':00' : startTime}`;

    const appointment = {
      doctor: { id: doctor.id },
      patient: { id: patient.id },
      appointmentDate: appointmentDateISO,
      status: 0
    };

    try {
      const { success, message } = await bookAppointment(appointment, token);
      if (success) {
        showToast("Appointment Booked Successfully! 🎉", "success");
        close();
        // Refresh sidebar if needed
        loadUpcomingAppointment(patient.id, token);
      } else {
        showToast("Booking Failed: " + message, "error");
      }
    } catch (err) {
      showToast("System Error: Could not book appointment", "error");
    }
  });
}
