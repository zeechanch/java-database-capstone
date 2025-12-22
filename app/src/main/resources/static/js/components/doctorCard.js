// doctorCard.js

// Imports
import { deleteDoctor } from "../services/doctorServices.js";
// Note: Other imports removed or updated as they seemed to use different paths or were not used in admin context

/**
 * Creates and returns a doctor card DOM element
 * @param {Object} doctor - doctor data object
 * @returns {HTMLElement}
 */
export function createDoctorCard(doctor) {
  const card = document.createElement("div");
  card.className = "doctor-card";

  const role = localStorage.getItem("userRole");

  // Create card with enhanced design
  card.innerHTML = `
    <div class="doctor-card-header">
      <div class="doctor-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <div class="doctor-card-title">
        <h3>${doctor.name}</h3>
        <span class="specialty-badge">${doctor.specialization || doctor.speciality || 'General'}</span>
      </div>
    </div>
    
    <div class="doctor-card-body">
      <div class="doctor-info-row">
        <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <span>${doctor.email}</span>
      </div>
      
      <div class="doctor-info-row">
        <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        <span>${doctor.phone || "N/A"}</span>
      </div>
      
      <div class="availability-section">
        <div class="availability-header">
          <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          <strong>Available Times</strong>
        </div>
        <div class="time-slots">
          ${doctor.availableTimes && doctor.availableTimes.length > 0
      ? doctor.availableTimes.map(t => `<span class="time-chip">${t}</span>`).join('')
      : '<span class="no-times">No times available</span>'}
        </div>
      </div>
    </div>
  `;

  // Add action buttons based on role
  if (role === "admin") {
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "doctor-card-actions";

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.type = "button";
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      Edit
    `;
    editBtn.onclick = (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (typeof window.openEditDoctorModal === 'function') {
        window.openEditDoctorModal(doctor);
      } else {
        console.error("openEditDoctorModal is not defined");
      }
    };

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.type = "button";
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
      Delete
    `;
    deleteBtn.onclick = async (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (!confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) return;

      const token = localStorage.getItem("token");
      const result = await deleteDoctor(doctor.id, token);
      if (result.success) {
        card.remove();
      } else {
        alert(result.message);
      }
    };

    actionsContainer.append(editBtn, deleteBtn);
    card.appendChild(actionsContainer);
  } else if (role === "loggedPatient") {
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "doctor-card-actions";

    const bookBtn = document.createElement("button");
    bookBtn.className = "btn-book cta-button"; // Added cta-button for style if available, but btn-book is key
    bookBtn.textContent = "Book Appointment";

    // We can add data attributes to make it easier for the delegate listener
    bookBtn.dataset.doctorId = doctor.id;
    bookBtn.classList.add("book-appointment-btn");

    actionsContainer.appendChild(bookBtn);
    card.appendChild(actionsContainer);
  }

  return card;
}
