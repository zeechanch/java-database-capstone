/* adminDashboard.js */

// Imports
import { getDoctors, filterDoctors, saveDoctor } from './services/doctorServices.js';
import { getDashboardStats, getAllPatients, getAllAppointments } from './services/adminServices.js';
import { createDoctorCard } from './components/doctorCard.js';
import { openModal, closeModal } from './components/modals.js';

// Expose openModal and closeModal to window for header.js usage and inline handlers
window.openModal = openModal;
window.closeModal = closeModal;

// ===============================
// EVENT: On DOM Load
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Stats
  loadStats();

  // 2. Load Default View (Doctors)
  loadDoctorCards();

  // 3. Tab Switching Logic
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Remove active class from all tabs & contents
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Activate clicked tab
      const target = e.currentTarget;
      target.classList.add('active');
      const viewId = `view-${target.dataset.tab}`;
      const content = document.getElementById(viewId);
      if (content) {
        content.style.display = 'block';
        content.classList.add('active');
      }

      // Load content based on tab
      if (target.dataset.tab === 'doctors') loadDoctorCards();
      if (target.dataset.tab === 'patients') loadPatients();
      if (target.dataset.tab === 'appointments') loadAppointments();
    });
  });

  // 4. Search & Filter Listeners for Doctors
  document.getElementById("searchBar")?.addEventListener("input", filterDoctorsOnChange);
  document.getElementById("timeFilter")?.addEventListener("change", filterDoctorsOnChange);
  document.getElementById("specialtyFilter")?.addEventListener("change", filterDoctorsOnChange);

  // 5. Global Handlers (e.g. for Edit Doctor)
  // window.openEditDoctorModal = openEditDoctorModal; // Moved to top-level
});

// Expose immediately
window.openEditDoctorModal = openEditDoctorModal;

// ===============================
// LOGIC: Stats
// ===============================
// ===============================
// LOGIC: Stats
// ===============================
async function loadStats() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("No token found for stats");
    return;
  }

  try {
    const stats = await getDashboardStats(token);
    if (stats) {
      document.getElementById('statDoctors').innerText = stats.doctors;
      document.getElementById('statPatients').innerText = stats.patients;
      document.getElementById('statAppointments').innerText = stats.appointments;
    } else {
      console.error("Stats returned null");
    }
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

// ===============================
// LOGIC: Doctors
// ===============================
async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (error) {
    console.error("Error loading doctors:", error);
    document.getElementById("content").innerHTML = `<p class="error-text">Failed to load doctors: ${error.message}</p>`;
  }
}

function renderDoctorCards(doctors) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (!doctors || doctors.length === 0) {
    content.innerHTML = `<p class="no-results">No doctors found.</p>`;
    return;
  }

  doctors.forEach((doctor) => {
    const card = createDoctorCard(doctor);
    content.appendChild(card);
  });
}

async function filterDoctorsOnChange() {
  const name = document.getElementById("searchBar")?.value.trim() || null;
  const time = document.getElementById("timeFilter")?.value || null;
  const specialty = document.getElementById("specialtyFilter")?.value || null;

  if (!name && (time === 'all' || !time) && (specialty === 'all' || !specialty)) {
    return loadDoctorCards();
  }

  const doctors = await filterDoctors(name, time, specialty);
  renderDoctorCards(doctors && doctors.length > 0 ? doctors : []);
}

// ===============================
// LOGIC: Patients
// ===============================
async function loadPatients() {
  const token = localStorage.getItem('token');
  const container = document.getElementById('patients-list');
  container.innerHTML = '<p class="loading-text">Loading patients...</p>';

  try {
    const patients = await getAllPatients(token);
    container.innerHTML = '';

    if (!patients || patients.length === 0) {
      container.innerHTML = '<p class="no-results">No patients found.</p>';
      return;
    }

    // Create modern table
    const table = document.createElement('div');
    table.className = 'data-table';
    table.innerHTML = `
      <div class="table-header">
        <div class="table-row">
          <div class="table-cell header-cell">Patient Name</div>
          <div class="table-cell header-cell">Email</div>
          <div class="table-cell header-cell">Phone</div>
          <div class="table-cell header-cell">Address</div>
        </div>
      </div>
      <div class="table-body">
        ${patients.map(p => `
          <div class="table-row">
            <div class="table-cell">
              <div class="cell-content">
                <svg class="cell-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span class="cell-name">${p.name}</span>
              </div>
            </div>
            <div class="table-cell">
              <span class="cell-email">${p.email}</span>
            </div>
            <div class="table-cell">${p.phone || 'N/A'}</div>
            <div class="table-cell">${p.address || 'N/A'}</div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(table);
  } catch (e) {
    container.innerHTML = `<p class="error-text">Error loading patients: ${e.message}</p>`;
  }
}

// ===============================
// LOGIC: Appointments
// ===============================
async function loadAppointments() {
  const token = localStorage.getItem('token');
  const container = document.getElementById('appointments-list');
  container.innerHTML = '<p class="loading-text">Loading appointments...</p>';

  try {
    const appointments = await getAllAppointments(token);
    container.innerHTML = '';

    if (!appointments || appointments.length === 0) {
      container.innerHTML = '<p class="no-results">No appointments found.</p>';
      return;
    }

    // Helper function to format status
    const formatStatus = (status) => {
      // Normalize to string to handle both numeric and string types
      const s = String(status).toUpperCase();
      const statusMap = {
        'CONFIRMED': { label: 'Confirmed', class: 'status-confirmed' },
        'PENDING': { label: 'Pending', class: 'status-pending' },
        '0': { label: 'Pending', class: 'status-pending' },
        'CANCELLED': { label: 'Cancelled', class: 'status-cancelled' },
        '2': { label: 'Cancelled', class: 'status-cancelled' },
        'COMPLETED': { label: 'Completed', class: 'status-completed' },
        '1': { label: 'Completed', class: 'status-completed' }
      };
      return statusMap[s] || { label: status, class: 'status-default' };
    };

    // Create modern table
    const table = document.createElement('div');
    table.className = 'data-table';
    table.innerHTML = `
      <div class="table-header">
        <div class="table-row">
          <div class="table-cell header-cell">Date & Time</div>
          <div class="table-cell header-cell">Patient</div>
          <div class="table-cell header-cell">Doctor</div>
          <div class="table-cell header-cell">Status</div>
        </div>
      </div>
      <div class="table-body">
        ${appointments.map(app => {
      const statusInfo = formatStatus(app.status);
      const date = new Date(app.appointmentDate);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
      });

      return `
          <div class="table-row">
            <div class="table-cell">
              <div class="cell-content">
                <svg class="cell-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
                <div class="cell-datetime">
                  <span class="cell-date">${formattedDate}</span>
                  <span class="cell-time">${formattedTime}</span>
                </div>
              </div>
            </div>
            <div class="table-cell">${app.patient ? app.patient.name : 'Unknown'}</div>
            <div class="table-cell">${app.doctor ? app.doctor.name : 'Unknown'}</div>
            <div class="table-cell">
              <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
            </div>
          </div>
        `}).join('')}
      </div>
    `;
    container.appendChild(table);
  } catch (e) {
    container.innerHTML = `<p class="error-text">Error loading appointments: ${e.message}</p>`;
  }
}

// ===============================
// FUNCTION: adminAddDoctor
// Handles the save action from modals.js 'addDoctor' modal
// ===============================
async function adminAddDoctor() {
  // Collect values based on IDs in modals.js
  const name = document.getElementById("doctorName")?.value.trim();
  const email = document.getElementById("doctorEmail")?.value.trim();
  const phone = document.getElementById("doctorPhone")?.value.trim();
  const password = document.getElementById("doctorPassword")?.value.trim();
  const specialty = document.getElementById("specialization")?.value; // Note ID is 'specialization'

  // Collect checked availability
  const availability = [];
  document.querySelectorAll('input[name="availability"]:checked').forEach(checkbox => {
    availability.push(checkbox.value);
  });

  if (!name || !email || !password || !specialty || !phone) {
    alert("Please fill in all required fields.");
    return;
  }

  const doctorData = {
    name,
    email,
    phone,
    password,
    speciality: specialty,
    availableTimes: availability // Backend expects 'availableTimes' list
  };

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session expired. Please log in again.");
    window.location.href = "/";
    return;
  }

  try {
    const response = await saveDoctor(doctorData, token);

    // Reset error container
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.style.display = 'none';
      errorContainer.innerHTML = '';
    }

    if (response) {
      // If response is the parsed JSON from fetch in service:
      // Standard success is { message: "...", id: ... } or status 201/200.
      // Standard error from GlobalExceptionHandler is { message: "Validation ...", errors: ... } or just { message: "..." }

      // Check for specific error structure (from ValidationFailed.java: { message: "..." } per field?
      // Actually ValidationFailed.java returns { "message": "error msg" } or multiple fields?
      // The validation handler iterates field errors but puts them all in 'message' key overwriting each other?
      // Wait, ValidationFailed.java: errors.put("message", "" + errorMessage); inside a loop.
      // It unfortunately overwrites 'message' if multiple errors exist. But at least we get one.
      // Better to check if response has 'message' and if it looks like an error (not success).

      // DoctorController returns { message: "Doctor saved successfully" } on success.
      // We need to differentiate based on status code, but saveDoctor service might return result directly?
      // Let's check saveDoctor in doctorServices.js.
      // If service returns response.json(), we can check response.message.

      // If service throws or returns error object:
      // The logic relies on what saveDoctor returns.
      // Assuming saveDoctor returns the JSON object.

      if (response.message === "Doctor saved successfully" || response.message === "Doctor already exists") {
        if (response.message === "Doctor already exists") {
          if (errorContainer) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = response.message;
          } else {
            alert(response.message);
          }
        } else {
          alert("Doctor added successfully!");
          closeModal();
          loadDoctorCards();
        }
      } else {
        // Likely an error (validation or other)
        if (errorContainer) {
          errorContainer.style.display = 'block';
          errorContainer.textContent = response.message || "An unknown error occurred.";
        } else {
          alert(response.message || "An unknown error occurred.");
        }
      }
    } else {
      alert("Failed to save doctor: Unknown error");
    }
  } catch (error) {
    console.error("Error adding doctor:", error);
    // If error is from fetch reject (network), show alert.
    // If it's a 400 response thrown by service? 
    // We need to see doctorServices.js.
    // Assuming service returns the error object if 400.
    alert("An error occurred while saving the doctor.");
  }
}

// Expose to window for modals.js
window.adminAddDoctor = adminAddDoctor;

// ===============================
// MODAL: Edit Doctor
// ===============================
function openEditDoctorModal(doctor) {
  try {
    console.log("Opening edit modal for:", doctor.name);
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) { console.error("No modal body found!"); return; }

    modalBody.innerHTML = `
            <div class="edit-modal-header">
                <h2>Edit Doctor</h2>
                <p class="edit-modal-subtitle">Update doctor information</p>
            </div>
            <form id="editDoctorForm" class="edit-doctor-form">
                <input type="hidden" id="editDocId" value="${doctor.id}">
                
                <div class="form-group">
                    <label for="editName">Full Name</label>
                    <input type="text" id="editName" class="input-field" value="${doctor.name}" required placeholder="Enter doctor's name">
                </div>
                
                <div class="form-group">
                    <label for="editSpecialty">Specialty</label>
                    <select id="editSpecialty" class="input-field select-dropdown" required>
                        <option value="">Select Specialty</option>
                        <option value="cardiologist" ${doctor.speciality === 'cardiologist' ? 'selected' : ''}>Cardiologist</option>
                        <option value="dermatologist" ${doctor.speciality === 'dermatologist' ? 'selected' : ''}>Dermatologist</option>
                        <option value="neurologist" ${doctor.speciality === 'neurologist' ? 'selected' : ''}>Neurologist</option>
                        <option value="pediatrician" ${doctor.speciality === 'pediatrician' ? 'selected' : ''}>Pediatrician</option>
                        <option value="orthopedic" ${doctor.speciality === 'orthopedic' ? 'selected' : ''}>Orthopedic</option>
                        <option value="gynecologist" ${doctor.speciality === 'gynecologist' ? 'selected' : ''}>Gynecologist</option>
                        <option value="psychiatrist" ${doctor.speciality === 'psychiatrist' ? 'selected' : ''}>Psychiatrist</option>
                        <option value="dentist" ${doctor.speciality === 'dentist' ? 'selected' : ''}>Dentist</option>
                        <option value="ophthalmologist" ${doctor.speciality === 'ophthalmologist' ? 'selected' : ''}>Ophthalmologist</option>
                        <option value="ent" ${doctor.speciality === 'ent' ? 'selected' : ''}>ENT Specialist</option>
                        <option value="urologist" ${doctor.speciality === 'urologist' ? 'selected' : ''}>Urologist</option>
                        <option value="oncologist" ${doctor.speciality === 'oncologist' ? 'selected' : ''}>Oncologist</option>
                        <option value="gastroenterologist" ${doctor.speciality === 'gastroenterologist' ? 'selected' : ''}>Gastroenterologist</option>
                        <option value="general" ${doctor.speciality === 'general' ? 'selected' : ''}>General Physician</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group half">
                        <label for="editEmail">Email Address</label>
                        <input type="email" id="editEmail" class="input-field" value="${doctor.email}" required placeholder="doctor@hospital.com">
                    </div>
                    <div class="form-group half">
                        <label for="editPhone">Phone Number</label>
                        <input type="text" id="editPhone" class="input-field" value="${doctor.phone || ''}" placeholder="1234567890">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editPassword">New Password</label>
                    <input type="password" id="editPassword" class="input-field" placeholder="Leave blank to keep current password">
                    <small class="form-hint">Only fill if you want to change the password</small>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Doctor</button>
                </div>
            </form>
        `;

    openModal(); // Shows modal container

    // Prevent modal content clicks from bubbling to the overlay
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    document.getElementById('editDoctorForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling up to parent elements
      const newPassword = document.getElementById('editPassword').value;
      const newPhone = document.getElementById('editPhone').value.trim();

      // Validate phone number format if provided
      if (newPhone && !/^[0-9]{10}$/.test(newPhone)) {
        alert('Phone number must be exactly 10 digits');
        return;
      }

      const updatedDoc = {
        id: parseInt(document.getElementById('editDocId').value, 10),
        name: document.getElementById('editName').value,
        speciality: document.getElementById('editSpecialty').value,
        email: document.getElementById('editEmail').value,
        phone: newPhone || doctor.phone, // Keep existing phone if new one is empty
        availableTimes: doctor.availableTimes || []
      };

      // Only include password if user entered a new one
      if (newPassword && newPassword.trim().length > 0) {
        updatedDoc.password = newPassword;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.location.origin}/doctor/update/${token}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDoc)
        });

        if (response.ok) {
          // Use setTimeout to ensure alert is shown before DOM manipulation
          setTimeout(() => {
            closeModal();
            loadDoctorCards(); // Refresh
          }, 100);
          alert("Doctor updated successfully");
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.message || `Failed to update doctor (Status: ${response.status})`;
          alert(errorMsg);
        }
      } catch (err) {
        console.error(err);
        alert("Error updating doctor: " + err.message);
      }
    });
  } catch (e) {
    console.error("Critical error in openEditDoctorModal:", e);
  }
}