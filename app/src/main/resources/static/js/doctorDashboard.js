// doctorDashboard.js

// Imports
import { getAllAppointments } from "./api/appointments.js";
import { createPatientRow } from "./components/patientRow.js";

// DOM Elements (MATCHING YOUR HTML)
const tableBody = document.getElementById("patientTableBody");
const searchBar = document.getElementById("searchBar");
const datePicker = document.getElementById("datePicker");
const todayButton = document.getElementById("todayButton");

// Initialize today's date (YYYY-MM-DD)
const today = new Date().toISOString().split("T")[0];
let selectedDate = today;

// Token for authenticated API calls
const token = localStorage.getItem("token");

// Patient name filter (null by default)
let patientName = null;

/* ---------------- Search Bar ---------------- */
searchBar.addEventListener("input", () => {
  const value = searchBar.value.trim();

  patientName = value !== "" ? value : null;
  loadAppointments();
});

/* ---------------- Today Button ---------------- */
todayButton.addEventListener("click", () => {
  selectedDate = today;
  datePicker.value = today;
  loadAppointments();
});

/* ---------------- Date Picker ---------------- */
datePicker.addEventListener("change", (e) => {
  selectedDate = e.target.value;
  loadAppointments();
});

/* ---------------- Load Appointments ---------------- */
async function loadAppointments() {
  try {
    // Fetch appointments from backend
    const appointments = await getAllAppointments(
      selectedDate,
      patientName,
      token
    );

    // Clear existing rows
    tableBody.innerHTML = "";

    // No appointments case
    if (!appointments || appointments.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">
            No Appointments found for today.
          </td>
        </tr>
      `;
      return;
    }

    // Render appointment rows
    appointments.forEach((appointment) => {
      const patient = {
        id: appointment.patient.id,
        name: appointment.patient.name,
        phone: appointment.patient.phone,
        email: appointment.patient.email,
      };

      const row = createPatientRow(patient, appointment);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading appointments:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:red;">
          Error loading appointments. Try again later.
        </td>
      </tr>
    `;
  }
}

/* ---------------- Page Load ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  datePicker.value = today;
  loadAppointments();
});
