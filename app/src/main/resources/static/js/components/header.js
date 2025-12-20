// header.js

/* ===============================
   Render Header
   =============================== */
function renderHeader() {
  const headerDiv = document.getElementById("header");

  // If root page → clear session & render basic header
  if (window.location.pathname.endsWith("/")) {
    localStorage.removeItem("userRole");

    headerDiv.innerHTML = `
      <header class="header">
        <div class="logo-section">
          <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
          <span class="logo-title">Hospital CMS</span>
        </div>
      </header>
    `;
    return;
  }

  // Retrieve role and token
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  // Base header content
  let headerContent = `
    <header class="header">
      <div class="logo-section">
        <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
        <span class="logo-title">Hospital CMS</span>
      </div>
      <nav>
  `;

  /* -------- Session Validation -------- */
  if (
    (role === "loggedPatient" || role === "admin" || role === "doctor") &&
    !token
  ) {
    localStorage.removeItem("userRole");
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/";
    return;
  }

  /* -------- Role-Based Header -------- */
  if (role === "admin") {
    headerContent += `
      <a href="#" onclick="logout(); return false;">Logout</a>
    `;
  }
  else if (role === "doctor") {
    headerContent += `
      <a href="#" onclick="logout(); return false;">Logout</a>
    `;
  }
  else if (role === "patient") {
    headerContent += `
      <!-- Patient role - no navigation buttons -->
    `;
  }
  else if (role === "loggedPatient") {
    headerContent += `
      <a href="#" onclick="logoutPatient(); return false;">Logout</a>
    `;
  }

  /* -------- Close Header -------- */
  headerContent += `
      </nav>
    </header>
  `;

  /* -------- Render Header -------- */
  headerDiv.innerHTML = headerContent;

  /* -------- Attach Button Listeners -------- */
  attachHeaderButtonListeners();
}

/* ===============================
   Helper Functions
   =============================== */
function attachHeaderButtonListeners() {
  const loginBtn = document.getElementById("patientLogin");
  const signupBtn = document.getElementById("patientSignup");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      openModal("patientLogin");
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      openModal("patientSignup");
    });
  }
}

function logout() {
  localStorage.removeItem("userRole");
  localStorage.removeItem("token");
  window.location.href = "/";
}

function logoutPatient() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/";
}

// Expose functions to global scope
window.logout = logout;
window.logoutPatient = logoutPatient;

/* ===============================
   Initialize Header
   =============================== */
renderHeader();
