package com.project.back_end.services;

import com.project.back_end.models.Appointment;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final PatientRepository patientRepo;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepo, DoctorRepository doctorRepo,
            PatientRepository patientRepo) {
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
    }

    @Transactional
    public int saveAppointment(Appointment appointment) {
        try {
            // Basic validation
            if (appointment.getDoctor() == null || appointment.getPatient() == null)
                return -1;

            // Check if slot logic here or allow overbooking for now?
            // "validateAppointment" in Service.java does the checking. We assume controller
            // calls that first.
            // Or we do it here.

            appointmentRepo.save(appointment);
            return 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Transactional
    public int updateAppointment(Appointment appointment) {
        if (!appointmentRepo.existsById(appointment.getId()))
            return -1;
        appointmentRepo.save(appointment);
        return 1;
    }

    @Transactional
    public int cancelAppointment(Long id) {
        try {
            if (!appointmentRepo.existsById(id))
                return -1;
            appointmentRepo.deleteById(id);
            return 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public Appointment getAppointment(Long id) {
        return appointmentRepo.findById(id).orElse(null);
    }
}
