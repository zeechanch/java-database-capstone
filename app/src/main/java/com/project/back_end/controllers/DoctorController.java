package com.project.back_end.controllers;

import com.project.back_end.models.Doctor;
import com.project.back_end.models.Login;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("${api.path}doctor")
public class DoctorController {

    private final DoctorService doctorService;
    private final Service service;

    @Autowired
    public DoctorController(DoctorService doctorService, Service service) {
        this.doctorService = doctorService;
        this.service = service;
    }

    @GetMapping("/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<List<String>> getDoctorAvailability(
            @PathVariable String user,
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String token) {

        if (!service.validateToken(token, user).equals("valid")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<String> times = doctorService.getDoctorAvailability(doctorId, date.atStartOfDay());
        return new ResponseEntity<>(times, HttpStatus.OK);
    }

    @GetMapping("/profile/{token}")
    public ResponseEntity<Doctor> getDoctorProfile(@PathVariable String token) {
        Doctor doctor = doctorService.getDoctorByToken(token);
        if (doctor == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Map<String, List<Doctor>>> getDoctor() {
        Map<String, List<Doctor>> response = new HashMap<>();
        response.put("doctors", doctorService.getDoctors());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/save/{token}")
    public ResponseEntity<Map<String, String>> saveDoctor(@Valid @RequestBody Doctor doctor,
            @PathVariable String token) {
        Map<String, String> response = new HashMap<>();
        if (!service.validateToken(token, "admin").equals("valid")) {
            response.put("message", "Unauthorized");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.saveDoctor(doctor);
        if (result == -1) {
            response.put("message", "Doctor already exists");
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        } else if (result == 1) {
            response.put("message", "Doctor saved successfully");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            response.put("message", "Internal Server Error");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody Login login) {
        Map<String, String> response = new HashMap<>();
        String result = doctorService.validateDoctor(login);
        if (result.startsWith("token:")) {
            response.put("token", result.substring("token:".length()));
            response.put("message", "Login successful");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response.put("message", result);
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/availability/{token}")
    public ResponseEntity<Map<String, String>> updateAvailability(@RequestBody List<String> availableTimes,
            @PathVariable String token) {
        Map<String, String> response = new HashMap<>();

        // We use "doctor" role check generally, but here the token itself validates the
        // doctor.
        // The service method getDoctorByToken checks if it's a valid doctor token.
        // But for consistency with other methods, we might want a controller-level
        // check if needed.
        // However, getDoctorByToken internal logic handles it.

        int result = doctorService.updateAvailability(token, availableTimes);
        if (result == 1) {
            response.put("message", "Availability updated successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response.put("message", "Update Failed");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/update/{token}")
    public ResponseEntity<Map<String, String>> updateDoctor(@Valid @RequestBody Doctor doctor,
            @PathVariable String token) {
        Map<String, String> response = new HashMap<>();
        if (!service.validateToken(token, "admin").equals("valid")) {
            response.put("message", "Unauthorized");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.updateDoctor(doctor);
        if (result == 1) {
            response.put("message", "Updated successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response.put("message", "Fetch Failed");
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, Object>> deleteDoctor(@PathVariable Long id, @PathVariable String token) {
        Map<String, Object> response = new HashMap<>();
        if (!service.validateToken(token, "admin").equals("valid")) {
            response.put("success", false);
            response.put("message", "Unauthorized");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.deleteDoctor(id);
        if (result == 1) {
            response.put("success", true);
            response.put("message", "Deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response.put("success", false);
        response.put("message", "Delete failed");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @GetMapping("/filter/{name}/{time}/{speciality}")
    public ResponseEntity<Map<String, List<Doctor>>> filter(
            @PathVariable String name,
            @PathVariable String time,
            @PathVariable String speciality) {

        Map<String, List<Doctor>> response = new HashMap<>();
        response.put("doctors", doctorService.filterDoctors(name, time, speciality));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
