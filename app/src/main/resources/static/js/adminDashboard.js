/* adminDashboard.js
   Handles:
   - Loading all doctor cards
   - Searching & filtering doctors
   - Adding a new doctor via modal form
*/

// ===============================
// EVENT: On DOM Load → Load Doctors
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();

  // Search bar + filters listeners
  document.getElementById("searchBar")?.addEventListener("input", filterDoctorsOnChange);
  document.getElementById("timeFilter")?.addEventListener("change", filterDoctorsOnChange);
  document.getElementById("specialtyFilter")?.addEventListener("change", filterDoctorsOnChange);

  // Add doctor button listener (if present)
  const addDoctorBtn = document.getElementById("addDoctorBtn");
  if (addDoctorBtn) {
    addDoctorBtn.addEventListener("click", () => openModal("addDoctor"));
  }
});


// ===============================
// FUNCTION: loadDoctorCards
// Fetch and display all doctors
// ===============================
async function loadDoctorCards() {
  try {
    const doctors = await getDoctors(); // service layer call
    renderDoctorCards(doctors);
  } catch (error) {
    console.error("Error loading doctors:", error);
  }
}


// ===============================
// FUNCTION: filterDoctorsOnChange
// Filters by: name, time (AM/PM), specialty
// ===============================
async function filterDoctorsOnChange() {
  try {
    const name = document.getElementById("searchBar")?.value.trim() || null;
    const time = document.getElementById("timeFilter")?.value || null;
    const specialty = document.getElementById("specialtyFilter")?.value || null;

    const doctors = await filterDoctors(name, time, specialty);

    if (!doctors || doctors.length === 0) {
      document.getElementById("content").innerHTML =
        `<p class="no-results">No doctors found with the given filters.</p>`;
      return;
    }

    renderDoctorCards(doctors);

  } catch (error) {
    console.error(error);
    alert("An error occurred while filtering doctors.");
  }
}


// ===============================
// FUNCTION: renderDoctorCards
// Helper to render a list of doctors
// ===============================
function renderDoctorCards(doctors) {
  const content = document.getElementById("content");
  content.innerHTML = ""; // Clear existing cards

  doctors.forEach((doctor) => {
    const card = createDoctorCard(doctor); // from doctorCard.js
    content.appendChild(card);
  });
}


// ===============================
// FUNCTION: adminAddDoctor
// Add a new doctor using modal form
// ===============================
async function adminAddDoctor() {
  // Collect form values
  const name = document.getElementById("doctorName")?.value.trim();
  const email = document.getElementById("doctorEmail")?.value.trim();
  const phone = document.getElementById("doctorPhone")?.value.trim();
  const password = document.getElementById("doctorPassword")?.value.trim();
  const specialty = document.getElementById("doctorSpecialty")?.value.trim();
  const availableTime = document.getElementById("doctorTime")?.value.trim();

  // Check token
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in. Please log in again.");
    return;
  }

  // Build doctor object
  const doctor = {
    name,
    email,
    phone,
    password,
    specialty,
    availableTime
  };

  try {
    const response = await saveDoctor(doctor, token);

    if (response.success) {
      alert("Doctor added successfully!");
      closeModal();
      window.location.reload();
    } else {
      alert("Failed to save doctor: " + (response.message || "Unknown error"));
    }

  } catch (error) {
    console.error("Error adding doctor:", error);
    alert("An error occurred while saving the doctor.");
  }
}
