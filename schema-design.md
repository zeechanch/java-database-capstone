# Schema Design Documentation  
Smart Clinic Management System  
**File: schema-design.md**

---

# 1. MySQL Database Design (Structured Data)

The relational database stores structured and strictly validated data such as users, doctors, patients, and appointments. This ensures referential integrity and consistency across the system.

---

## 1.1 Patients Table

| Column Name      | Data Type       | Constraints                          |
|------------------|-----------------|---------------------------------------|
| patient_id       | INT             | PRIMARY KEY, AUTO_INCREMENT          |
| first_name       | VARCHAR(100)    | NOT NULL                             |
| last_name        | VARCHAR(100)    | NOT NULL                             |
| email            | VARCHAR(150)    | UNIQUE, NOT NULL                     |
| phone            | VARCHAR(20)     | NOT NULL                             |
| dob              | DATE            | NOT NULL                             |
| address          | VARCHAR(255)    | NULL                                 |

**Notes:**  
- Unique email ensures no duplicate patient accounts.  
- DOB stored as `DATE` for accurate age calculations.

---

## 1.2 Doctors Table

| Column Name      | Data Type       | Constraints                          |
|------------------|-----------------|---------------------------------------|
| doctor_id        | INT             | PRIMARY KEY, AUTO_INCREMENT          |
| first_name       | VARCHAR(100)    | NOT NULL                             |
| last_name        | VARCHAR(100)    | NOT NULL                             |
| specialization   | VARCHAR(150)    | NOT NULL                             |
| email            | VARCHAR(150)    | UNIQUE, NOT NULL                     |
| phone            | VARCHAR(20)     | NOT NULL                             |

**Notes:**  
- Specialization enables filtering and scheduling based on expertise.

---

## 1.3 Admins Table

| Column Name      | Data Type       | Constraints                          |
|------------------|-----------------|---------------------------------------|
| admin_id         | INT             | PRIMARY KEY, AUTO_INCREMENT          |
| username         | VARCHAR(100)    | UNIQUE, NOT NULL                     |
| password_hash    | VARCHAR(255)    | NOT NULL                             |
| role             | VARCHAR(50)     | DEFAULT 'ADMIN'                      |

**Notes:**  
- Passwords stored as hashed strings for security.  
- `role` allows future expansion (e.g., SuperAdmin).

---

## 1.4 Appointments Table

| Column Name      | Data Type       | Constraints                                     |
|------------------|-----------------|--------------------------------------------------|
| appointment_id   | INT             | PRIMARY KEY, AUTO_INCREMENT                     |
| patient_id       | INT             | FOREIGN KEY REFERENCES patients(patient_id)     |
| doctor_id        | INT             | FOREIGN KEY REFERENCES doctors(doctor_id)       |
| appointment_date | DATETIME        | NOT NULL                                        |
| status           | VARCHAR(50)     | DEFAULT 'PENDING'                               |
| notes            | VARCHAR(255)    | NULL                                            |

**Notes:**  
- Tracks booking details between patient and doctor.  
- Status options include: PENDING, CONFIRMED, CANCELLED, COMPLETED.

---

# 2. MongoDB Collection Design (Unstructured Data)

MongoDB stores flexible data that can vary in the number and structure of fields. This is ideal for prescriptions and medical notes.

---

## 2.1 Prescriptions Collection

**Reasoning:**  
Prescriptions vary case by case — different medicines, dosages, instructions — making them suitable for a document database.

### Example Document:

```json
{
  "_id": "67abf23d90e45b1123cabc90",
  "patient_id": 14,
  "doctor_id": 7,
  "created_at": "2025-01-10T10:30:00Z",
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times a day",
      "duration_days": 7
    },
    {
      "name": "Paracetamol",
      "dosage": "650mg",
      "frequency": "as needed",
      "notes": "Max 3 per day"
    }
  ],
  "instructions": "Drink plenty of water. Avoid cold drinks.",
  "follow_up_required": true,
  "follow_up_date": "2025-01-20T09:00:00Z"
}
