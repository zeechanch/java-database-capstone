package com.project.back_end.controllers;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Login;
import com.project.back_end.models.Patient;
import com.project.back_end.services.PatientService;
import com.project.back_end.services.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.path}patient")
public class PatientController {

    private final PatientService patientService;
    private final Service service;

    @Autowired
    public PatientController(PatientService patientService, Service service) {
        this.patientService = patientService;
        this.service = service;
    }

    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Patient>> getPatient(@PathVariable String token) {
        Map<String, Patient> response = new HashMap<>();
        if (!service.validateToken(token, "patient").equals("valid")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Patient patient = patientService.getPatientDetails(token);
        if (patient != null) {
            response.put("patient", patient);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/all/{token}")
    public ResponseEntity<List<Patient>> getAllPatients(@PathVariable String token) {
        if (!service.validateToken(token, "admin").equals("valid")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(service.getAllPatients(), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createPatient(@RequestBody Patient patient) {
        Map<String, String> response = new HashMap<>();
        if (!service.validatePatient(patient)) {
            response.put("message", "Patient already exists");
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }

        int result = patientService.createPatient(patient);
        if (result == 1) {
            response.put("message", "Registered successfully");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        response.put("message", "Registration failed");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Login login) {
        Map<String, String> response = new HashMap<>();
        String result = service.validatePatientLogin(login);

        if (result.startsWith("token:")) {
            response.put("token", result.substring("token:".length()));
            response.put("message", "Login Success");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response.put("message", result);
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}/{user}/{token}")
    public ResponseEntity<Map<String, List<AppointmentDTO>>> getPatientAppointment(
            @PathVariable Long id,
            @PathVariable String user,
            @PathVariable String token) {

        Map<String, List<AppointmentDTO>> response = new HashMap<>();
        if (!service.validateToken(token, user).equals("valid")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<AppointmentDTO> appointments = patientService.getPatientAppointment(id);
        response.put("appointments", appointments);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/filter/{condition}/{name}/{token}")
    public ResponseEntity<Map<String, List<AppointmentDTO>>> filterPatientAppointment(
            @PathVariable String condition,
            @PathVariable String name,
            @PathVariable String token) {

        Map<String, List<AppointmentDTO>> response = new HashMap<>();
        if (!service.validateToken(token, "patient").equals("valid")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Object result = service.filterPatient(token, condition, name); // reusing service delegation logic
        if (result instanceof List) {
            response.put("appointments", (List<AppointmentDTO>) result);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
}
