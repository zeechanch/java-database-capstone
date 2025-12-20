package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepo;
    private final AppointmentRepository appointmentRepo;
    private final TokenService tokenService;

    @Autowired
    public PatientService(PatientRepository patientRepo, AppointmentRepository appointmentRepo,
            TokenService tokenService) {
        this.patientRepo = patientRepo;
        this.appointmentRepo = appointmentRepo;
        this.tokenService = tokenService;
    }

    public int createPatient(Patient patient) {
        try {
            if (patientRepo.findByEmail(patient.getEmail()) != null) {
                return 0; // Exists
            }
            patientRepo.save(patient);
            return 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getPatientAppointment(Long id) {
        try {
            List<Appointment> appointments = appointmentRepo.findByPatientId(id);
            return appointments.stream().map(AppointmentDTO::new).collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> filterByCondition(String condition, Long patientId) {
        String status = "past".equalsIgnoreCase(condition) ? "COMPLETED" : "PENDING";
        // Assuming "past" maps to "COMPLETED" (or similar past status) and default is
        // "PENDING".

        List<Appointment> apps = appointmentRepo.findByPatient_IdAndStatusOrderByAppointmentDateAsc(patientId, status);
        return apps.stream().map(AppointmentDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> filterByDoctor(String doctorName, Long patientId) {
        List<Appointment> apps = appointmentRepo.filterByDoctorNameAndPatientId(doctorName, patientId);
        return apps.stream().map(AppointmentDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> filterByDoctorAndCondition(String doctorName, String condition, Long patientId) {
        if ("null".equals(doctorName) || doctorName == null) {
            return filterByCondition(condition, patientId);
        }
        String status = "past".equalsIgnoreCase(condition) ? "COMPLETED" : "PENDING";
        List<Appointment> apps = appointmentRepo.filterByDoctorNameAndPatientIdAndStatus(doctorName, patientId, status);
        return apps.stream().map(AppointmentDTO::new).collect(Collectors.toList());
    }

    public Patient getPatientDetails(String token) {
        String email = tokenService.extractEmail(token);
        if (email != null) {
            return patientRepo.findByEmail(email);
        }
        return null;
    }
}
