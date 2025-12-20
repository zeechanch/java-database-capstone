package com.project.back_end.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public class AppointmentDTO {

    // 1. 'id' field
    private Long id;

    // 2. 'doctorId' field
    private Long doctorId;

    // 3. 'doctorName' field
    private String doctorName;

    // 4. 'patientId' field
    private Long patientId;

    // 5. 'patientName' field
    private String patientName;

    // 6. 'patientEmail' field
    private String patientEmail;

    // 7. 'patientPhone' field
    private String patientPhone;

    // 8. 'patientAddress' field
    private String patientAddress;

    // 9. 'appointmentTime' field (The master time field)
    private LocalDateTime appointmentTime;

    // 10. 'status' field
    private int status; // e.g., 0=Scheduled, 1=Completed, 2=Canceled

    // --- Custom / Derived Fields (Calculated in the constructor or custom getters)
    // ---

    // 11. 'appointmentDate' field (Derived from appointmentTime)
    private LocalDate appointmentDate;

    // 12. 'appointmentTimeOnly' field (Derived from appointmentTime)
    private LocalTime appointmentTimeOnly;

    // 13. 'endTime' field (Derived from appointmentTime)
    private LocalDateTime endTime;

    // 14. Constructor: Accepts all relevant fields and calculates derived fields.
    public AppointmentDTO(
            Long id, Long doctorId, String doctorName, Long patientId, String patientName,
            String patientEmail, String patientPhone, String patientAddress,
            LocalDateTime appointmentTime, int status) {

        this.id = id;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientEmail = patientEmail;
        this.patientPhone = patientPhone;
        this.patientAddress = patientAddress;
        this.appointmentTime = appointmentTime;
        this.status = status;

        // Calculate derived fields:
        if (appointmentTime != null) {
            // 11. appointmentDate: Extracts the date part
            this.appointmentDate = appointmentTime.toLocalDate();

            // 12. appointmentTimeOnly: Extracts the time part
            this.appointmentTimeOnly = appointmentTime.toLocalTime();

            // 13. endTime: Calculated by adding 1 hour to appointmentTime
            this.endTime = appointmentTime.plus(1, ChronoUnit.HOURS);
        }
    }

    // Constructor for Entity conversion
    public AppointmentDTO(com.project.back_end.models.Appointment appointment) {
        this.id = appointment.getId();
        if (appointment.getDoctor() != null) {
            this.doctorId = appointment.getDoctor().getId();
            this.doctorName = appointment.getDoctor().getName();
        }
        if (appointment.getPatient() != null) {
            this.patientId = appointment.getPatient().getId();
            this.patientName = appointment.getPatient().getName();
            this.patientEmail = appointment.getPatient().getEmail();
            this.patientPhone = appointment.getPatient().getPhone();
        }
        this.appointmentTime = appointment.getAppointmentDate();
        // Convert string status to int if needed or change field type.
        // DTO has int status. Entity has String. Let's map String to int.
        // Assuming PENDING=0, COMPLETED=1, CANCELLED=2 or similar.
        // Or if map is unknown, just use 0.
        // Wait, PatientService logic used: "past".equalsIgnoreCase(condition) ? 1 : 0.
        // Let's assume PENDING=0.
        this.status = "PENDING".equalsIgnoreCase(appointment.getStatus()) ? 0 : 1;

        // Derived
        if (this.appointmentTime != null) {
            this.appointmentDate = this.appointmentTime.toLocalDate();
            this.appointmentTimeOnly = this.appointmentTime.toLocalTime();
            this.endTime = this.appointmentTime.plus(1, ChronoUnit.HOURS);
        }
    }

    // Default Constructor (Optional, but often useful for frameworks like
    // Spring/Jackson)
    public AppointmentDTO() {
    }

    // 15. Getters: Standard getter methods for all fields (including derived ones).

    public Long getId() {
        return id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public String getPatientAddress() {
        return patientAddress;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public int getStatus() {
        return status;
    }

    // Custom Getter for derived fields:

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public LocalTime getAppointmentTimeOnly() {
        return appointmentTimeOnly;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }
}