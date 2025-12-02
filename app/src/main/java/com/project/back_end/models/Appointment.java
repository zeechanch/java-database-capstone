package com.project.back_end.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.persistence.Transient;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    
    @NotNull
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;
    
    @NotNull
    @Column(nullable = false)
    private String status = "PENDING";
    
    private String notes;
    
    public Appointment() {}

    public Appointment(Patient patient, Doctor doctor, LocalDateTime appointmentDate, String notes) {
        this.patient = patient;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.notes = notes;
    }
    
    @Transient
    public LocalDateTime getEndTime() {
        return appointmentDate.plusHours(1);
    }
    
    @Transient
    public LocalDate getAppointmentDateOnly() {
        return appointmentDate.toLocalDate();
    }
    @Transient
    public LocalTime getAppointmentTimeOnly() {
        return appointmentDate.toLocalTime();
    }


    public long getAppointment_id() {
        return id;
    }

    public Patient getPatient() {
        return patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public String getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    public void setAppointment_id(long appointment_id) {
        this.id = id;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
       

}

