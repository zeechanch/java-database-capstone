package com.project.back_end.controllers;

import com.project.back_end.models.Prescription;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.PrescriptionService;
import com.project.back_end.services.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.path}prescription")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final Service service;
    private final AppointmentService appointmentService;

    @Autowired
    public PrescriptionController(PrescriptionService prescriptionService, Service service,
            AppointmentService appointmentService) {
        this.prescriptionService = prescriptionService;
        this.service = service;
        this.appointmentService = appointmentService;
    }

    @PostMapping("/save/{token}")
    public ResponseEntity<Map<String, String>> savePrescription(@RequestBody Prescription prescription,
            @PathVariable String token) {
        Map<String, String> response = new HashMap<>();
        if (!service.validateToken(token, "doctor").equals("valid")) {
            response.put("message", "Unauthorized");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = prescriptionService.savePrescription(prescription);
        if (result == 1) {
            if (prescription.getAppointmentId() != null) {
                // Logic to update appointment status if needed
            }

            response.put("message", "Prescription saved");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        response.put("message", "Failed to save");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @GetMapping("/{appointmentId}/{token}")
    public ResponseEntity<Prescription> getPrescription(@PathVariable Long appointmentId, @PathVariable String token) {
        if (!service.validateToken(token, "doctor").equals("valid")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Prescription prescription = prescriptionService.getPrescription(appointmentId);
        if (prescription != null) {
            return new ResponseEntity<>(prescription, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
