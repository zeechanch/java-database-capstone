import { API_BASE_URL } from "../config/config.js";

const APPOINTMENTS_API = `${API_BASE_URL}/appointments`;
const DOCTOR_API = `${API_BASE_URL}/doctor`;

// ============================================
// DOCTOR DASHBOARD FUNCTIONS
// ============================================

/**
 * Fetch appointments for the logged-in doctor on a specific date.
 * Endpoint: /appointments/{date}/{patientName}/{token}
 * @param {string} date - Local Date String (YYYY-MM-DD)
 * @param {string} token - Auth Token
 * @param {string} patientName - Filter by patient name (optional, defaults to "null")
 */
export async function getDoctorAppointments(date, token, patientName = "null") {
  try {
    const safeName = (patientName && patientName.trim() !== "") ? patientName.trim() : "null";

    const url = `${APPOINTMENTS_API}/doctor-appointments?date=${date}&patientName=${safeName}&token=${encodeURIComponent(token)}`;
    console.log("Fetching Doctor Appointments URL:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Appointments Data:", data);
      return data;
    } else {
      console.error("Failed to fetch appointments:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return null;
  }
}

/**
 * Update appointment status
 * Endpoint: PATCH /appointments/status/{id}/{status}/{token}
 * @param {number} id - Appointment ID
 * @param {string} status - New Status (1=Completed, 2=Cancelled)
 * @param {string} token - Auth Token
 */
export async function updateAppointmentStatus(id, status, token) {
  try {
    const response = await fetch(`${APPOINTMENTS_API}/status/${id}/${status}/${token}`, {
      method: "PATCH"
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating status:", error);
    return false;
  }
}

// ============================================
// ADMIN DASHBOARD FUNCTIONS (RESTORED)
// ============================================

/**
 * Get all doctors
 * Endpoint: GET /doctor
 */
export async function getDoctors() {
  try {
    const response = await fetch(DOCTOR_API);
    if (!response.ok) throw new Error("Failed to load doctors");
    const data = await response.json();
    return data.doctors || []; // Endpoint returns {doctors: [...]}
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
}

/**
 * Filter doctors
 * Endpoint: GET /doctor/filter/{name}/{time}/{speciality}
 */
export async function filterDoctors(name, time, speciality) {
  // Handle nulls
  const pName = name || 'null';
  const pTime = time || 'all';
  const pSpec = speciality || 'all';

  const url = `${DOCTOR_API}/filter/${pName}/${pTime}/${pSpec}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to filter doctors");
    const data = await response.json();
    return data.doctors || [];
  } catch (error) {
    console.error("Error filtering doctors:", error);
    return [];
  }
}

/**
 * Save (Create) Doctor
 * Endpoint: POST /doctor/save/{token}
 */
export async function saveDoctor(doctorData, token) {
  try {
    const response = await fetch(`${DOCTOR_API}/save/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctorData)
    });
    const result = await response.json();
    return { success: response.ok, message: result.message };
  } catch (error) {
    console.error("Error saving doctor:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete Doctor from the system
 * Endpoint: DELETE /doctor/{id}/{token}
 */
export async function deleteDoctor(id, token) {
  try {
    const response = await fetch(`${DOCTOR_API}/${id}/${token}`, {
      method: "DELETE"
    });
    const result = await response.json();
    return { success: response.ok, message: result.message };
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return { success: false, message: error.message };
  }
}
