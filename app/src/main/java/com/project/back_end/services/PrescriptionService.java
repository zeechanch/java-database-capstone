package com.project.back_end.services;

import com.project.back_end.models.Prescription;
import com.project.back_end.repo.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepo;

    @Autowired
    public PrescriptionService(PrescriptionRepository prescriptionRepo) {
        this.prescriptionRepo = prescriptionRepo;
    }

    @Transactional
    public int savePrescription(Prescription prescription) {
        try {
            prescriptionRepo.save(prescription);
            return 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public Prescription getPrescription(Long appointmentId) {
        return prescriptionRepo.findByAppointmentId(appointmentId);
    }
}
