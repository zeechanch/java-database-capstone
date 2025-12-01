# Architecture Summary

## 1. Presentation Layer (Frontend)
The Presentation Layer is what users see and interact with in the browser. It includes:

- HTML  
- CSS  
- JavaScript  

Users click buttons, fill out forms, and the browser sends requests to the backend.

---

## 2. Application Layer (Backend – Spring Boot)
The Application Layer represents the “brain” of the system. It processes client requests and coordinates business logic.

### REST Controllers
- Act as gatekeepers to the backend.  
- Handle incoming requests such as “Create Doctor,” “Book Appointment,” etc.  
- Forward requests to the appropriate service classes.

### Service Classes
- Contain the main business logic of the application.  
- Perform checks, validations, and enforce rules.  
- Example: “If the doctor is free at 3 PM, allow booking; otherwise show an error.”

### Repository Layer
- Interacts with the database.  
- Services call repositories to save, update, delete, or retrieve data.

---

## 3. Data Layer (Databases)

### MySQL (Structured Data – via JPA)
Used for storing:

- Doctors  
- Patients  
- Admins  
- Appointments  

**Why MySQL?**  
Because this data is relational and requires structure, foreign keys, and strict validation.

### MongoDB (Unstructured Data – via Spring Data Mongo)
Used for storing:

- Prescriptions  
- Medical notes  
- Flexible clinical documents  

**Why MongoDB?**  
Because prescription formats vary widely, and MongoDB allows storing this data flexibly as documents.

---

# Numbered Request/Response Flow

1. **User Action (Frontend):**  
   A user (admin/doctor/patient) interacts with the web interface and performs an action such as "Book Appointment" or "View Patient Records."

2. **HTTP Request Sent:**  
   The frontend sends the request using JavaScript (Fetch/AJAX) to the corresponding REST API endpoint exposed by the Spring Boot backend.

3. **API Gateway / Controller Layer:**  
   The request reaches a specific MVC controller (e.g., `AppointmentController`), which validates inputs and routes it to the correct service.

4. **Service Layer Processing:**  
   Service classes (e.g., `AppointmentService`) contain business logic, handle transactions, perform checks (like role-based permissions), and coordinate data flow.

5. **Repository/Data Access Layer:**  
   - For relational entities (Doctors, Patients, Appointments), service classes call **JPA repositories** to run CRUD operations on MySQL.  
   - For flexible medical records (Prescriptions), service classes interact with **MongoDB repositories**.

6. **Database Operations Execute:**  
   - MySQL stores structured relational records, ensuring integrity with foreign keys and relations.  
   - MongoDB stores unstructured or semi-structured documents for fast retrieval.

7. **Repository Returns Data to Service:**  
   JPA or Mongo repositories return query results or save confirmations to the service layer.

8. **Service Layer Maps Response:**  
   The service layer formats the response (DTOs, status messages, error handling).

9. **Controller Returns Response:**  
   The controller converts the final data into JSON and returns it to the client.

10. **Frontend Receives JSON:**  
   The browser receives the JSON response and dynamically updates the UI (appointments list, patient info, error alerts, etc.).

11. **Optional CI/CD Automation:**  
   During development, GitHub Actions run tests, API checks, security scans, and Docker builds before changes are deployed.
