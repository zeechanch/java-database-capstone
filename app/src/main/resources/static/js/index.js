// index.js

/* ===============================
   Imports & API Configuration
   =============================== */
import { openModal } from "./components/modals.js";
import { API_BASE_URL } from "./config/config.js";

// Define API endpoints
const ADMIN_API = `${API_BASE_URL}/admin/login`;
const DOCTOR_API = `${API_BASE_URL}/doctor/login`;

/* ===============================
   Page Load Handlers
   =============================== */
window.onload = () => {
    const adminLoginBtn = document.getElementById("adminLogin");
    const doctorLoginBtn = document.getElementById("doctorLogin");
    const patientLoginBtn = document.getElementById("patientLogin");

    // Admin login button
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener("click", () => {
            openModal("adminLogin");
        });
    }

    // Doctor login button
    if (doctorLoginBtn) {
        doctorLoginBtn.addEventListener("click", () => {
            openModal("doctorLogin");
        });
    }

    // Patient login button
    if (patientLoginBtn) {
        patientLoginBtn.addEventListener("click", () => {
            openModal("patientLogin");
        });
    }
};

/* ===============================
   Admin Login Handler
   =============================== */
window.adminLoginHandler = async function () {
    try {
        // Step 1: Get credentials
        const username = document.getElementById("username").value; // changed id to match modals.js
        const password = document.getElementById("password").value;

        // Step 2: Create admin object
        const admin = { username, password };

        // Step 3: Send login request
        const response = await fetch(ADMIN_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(admin),
        });

        // Step 4: Handle success
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            selectRole("admin");
        } else {
            // Step 5: Invalid credentials
            alert("Invalid admin credentials.");
        }
    } catch (error) {
        // Step 6: Error handling
        console.error(error);
        alert("Something went wrong. Please try again later.");
    }
};

/* ===============================
   Doctor Login Handler
   =============================== */
window.doctorLoginHandler = async function () {
    try {
        // Step 1: Get credentials
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Step 2: Create doctor object
        const doctor = { email, password };

        // Step 3: Send login request
        const response = await fetch(DOCTOR_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(doctor),
        });

        // Step 4: Handle success
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            selectRole("doctor");
        } else {
            // Step 5: Invalid credentials
            alert("Invalid doctor credentials.");
        }
    } catch (error) {
        // Step 6: Error handling
        console.error(error);
        alert("Something went wrong. Please try again later.");
    }
};

/* ===============================
   Patient Login Handler
   =============================== */
/* ===============================
   Patient Login Handler
   =============================== */
window.loginPatient = async function () {
    const PATIENT_API = `${API_BASE_URL}/patient/login`;
    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const patient = { email, password };

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const response = await fetch(PATIENT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patient)
        });

        if (response.ok) {
            const data = await response.json();

            if (data.status === 'failure') {
                alert(data.message || "Invalid credentials.");
                return;
            }

            // Expected response: token: "..."
            // But PatientController might return Map or String.
            // Let's check PatientController.loginPatient...
            // It calls service.validatePatientLogin -> returns "token:..." or "Invalid credentials"
            // Wait, PatientController logic needs verification.

            // Assuming successful login returns a token or simple string like existing handlers.
            // The existing handlers expect { token: "..." }.
            // Let's assume standard behavior for now but safeguard.

            let token = data.token;
            // If the controller returns raw string 'token:...' via map, it might be different.
            // AdminController returns { status: "success", token: "..." }.
            // Let's assume PatientController behaves similarly or check quickly.

            localStorage.setItem("token", token || data); // Fallback
            selectRole("loggedPatient"); // Changed to loggedPatient to match header check
        } else {
            alert("Invalid patient credentials.");
        }
    } catch (e) {
        console.error(e);
        alert("Login failed.");
    }
};
