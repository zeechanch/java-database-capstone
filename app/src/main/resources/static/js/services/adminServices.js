
import { API_BASE_URL } from "../config/config.js";

const ADMIN_API = `${API_BASE_URL}/admin`;
const PATIENT_API = `${API_BASE_URL}/patient`;
const APPOINTMENT_API = `${API_BASE_URL}/appointments`;

export async function getDashboardStats(token) {
    const url = `${ADMIN_API}/stats/${token}`;
    console.log("Fetching Stats:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getAllPatients(token) {
    const url = `${PATIENT_API}/all/${token}`;
    console.log("Fetching Patients:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getAllAppointments(token) {
    const url = `${APPOINTMENT_API}/all/${token}`;
    console.log("Fetching Appointments:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (error) {
        throw error;
    }
}
