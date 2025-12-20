// index.js

/* ===============================
   Imports & API Configuration
   =============================== */
import { openModal } from "./util.js";
import { BASE_API_URL } from "./config.js";

// Define API endpoints
const ADMIN_API = `${BASE_API_URL}/admin/login`;
const DOCTOR_API = `${BASE_API_URL}/doctor/login`;

/* ===============================
   Page Load Handlers
   =============================== */
window.onload = () => {
  const adminLoginBtn = document.getElementById("adminLogin");
  const doctorLoginBtn = document.getElementById("doctorLogin");

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
};

/* ===============================
   Admin Login Handler
   =============================== */
window.adminLoginHandler = async function () {
  try {
    // Step 1: Get credentials
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;

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
    const email = document.getElementById("doctorEmail").value;
    const password = document.getElementById("doctorPassword").value;

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
