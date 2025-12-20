// footer.js

/* ===============================
   Render Footer
   =============================== */
function renderFooter() {
  // Select the footer element
  const footer = document.getElementById("footer");

  // Insert footer HTML content
  footer.innerHTML = `
    <footer class="footer">
      <div class="footer-container">

        <!-- Logo & Copyright -->
        <div class="footer-logo">
          <img src="../assets/images/logo/logo.png" alt="Hospital CMS Logo">
          <p>© Copyright 2025. All Rights Reserved by Hospital CMS.</p>
        </div>

        <!-- Footer Links -->
        <div class="footer-links">

          <!-- Company -->
          <div class="footer-column">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>

          <!-- Support -->
          <div class="footer-column">
            <h4>Support</h4>
            <a href="#">Account</a>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
          </div>

          <!-- Legals -->
          <div class="footer-column">
            <h4>Legals</h4>
            <a href="#">Terms & Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Licensing</a>
          </div>

        </div>

      </div>
    </footer>
  `;
}

/* ===============================
   Initialize Footer
   =============================== */
renderFooter();
