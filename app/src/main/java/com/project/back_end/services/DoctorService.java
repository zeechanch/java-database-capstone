package com.project.back_end.services;

import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepo;
    private final AppointmentRepository appointmentRepo;
    private final TokenService tokenService;

    @Autowired
    public DoctorService(DoctorRepository doctorRepo, AppointmentRepository appointmentRepo,
            TokenService tokenService) {
        this.doctorRepo = doctorRepo;
        this.appointmentRepo = appointmentRepo;
        this.tokenService = tokenService;
    }

    @Transactional(readOnly = true)
    public List<String> getDoctorAvailability(Long doctorId, LocalDateTime date) {
        // Logic: Get doctor's standard times, remove those that are booked in
        // appointments

        Doctor doctor = doctorRepo.findById(doctorId).orElse(null);
        if (doctor == null)
            return new ArrayList<>();

        // Fetch booked appointments on that day
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = date.toLocalDate().atTime(23, 59, 59);

        List<com.project.back_end.models.Appointment> booked = appointmentRepo
                .findByDoctorIdAndAppointmentDateBetween(doctorId, startOfDay, endOfDay);
        List<LocalTime> bookedTimes = booked.stream()
                .map(app -> app.getAppointmentDate().toLocalTime())
                .collect(Collectors.toList());

        // Filter available slots
        // Available times are strings like "10:00", "11:00" etc.
        return doctor.getAvailableTimes().stream()
                .filter(slot -> {
                    try {
                        // Assuming slot is "HH:mm" or "HH:mm:ss"
                        // Handle potential format issues or different formats using simple parse if
                        // standard ISO
                        // If format is "10:00", LocalTime.parse works.
                        LocalTime slotTime = LocalTime.parse(slot);
                        return !bookedTimes.contains(slotTime);
                    } catch (Exception e) {
                        return true; // Keep if parse fails or assume available
                    }
                })
                .collect(Collectors.toList());
    }

    public int saveDoctor(Doctor doctor) {
        try {
            if (doctorRepo.findByEmail(doctor.getEmail()) != null)
                return -1;
            if (doctor.getPassword() == null || doctor.getPassword().isEmpty())
                return 0; // Invalid input
            doctorRepo.save(doctor);
            return 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    public int updateDoctor(Doctor doctor) {
        Doctor existingDoctor = doctorRepo.findById(doctor.getId()).orElse(null);
        if (existingDoctor == null)
            return -1;

        // Preserve existing password if not provided in update
        if (doctor.getPassword() == null || doctor.getPassword().isEmpty()) {
            doctor.setPassword(existingDoctor.getPassword());
        }

        doctorRepo.save(doctor);
        return 1;
    }

    @Transactional(readOnly = true)
    public List<Doctor> getDoctors() {
        return doctorRepo.findAllWithAvailableTimes();
    }

    @Transactional
    public int deleteDoctor(Long id) {
        if (!doctorRepo.existsById(id))
            return -1;
        appointmentRepo.deleteAllByDoctorId(id);
        doctorRepo.deleteById(id);
        return 1;
    }

    public String validateDoctor(com.project.back_end.models.Login login) {
        Doctor doctor = doctorRepo.findByEmail(login.getEmail());
        if (doctor != null && doctor.getPassword().equals(login.getPassword())) {
            return "token:" + tokenService.generateToken(doctor.getEmail());
        }
        return "Invalid credentials";
    }

    public Doctor getDoctorByToken(String token) {
        if (!tokenService.validateToken(token, "doctor")) {
            return null;
        }
        String email = tokenService.extractEmail(token);
        return doctorRepo.findByEmail(email);
    }

    // Filter implementations
    @Transactional(readOnly = true)
    public List<Doctor> findDoctorByName(String name) {
        return doctorRepo.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    public List<Doctor> filterDoctors(String name, String time, String speciality) {
        List<Doctor> allDoctors = getDoctors();

        return allDoctors.stream()
                .filter(d -> matchesName(d, name))
                .filter(d -> matchesSpeciality(d, speciality))
                .filter(d -> matchesTime(d, time))
                .collect(Collectors.toList());
    }

    private boolean matchesName(Doctor d, String name) {
        if (name == null || name.equalsIgnoreCase("null") || name.equalsIgnoreCase("all") || name.trim().isEmpty()) {
            return true;
        }
        return d.getName().toLowerCase().contains(name.toLowerCase());
    }

    private boolean matchesSpeciality(Doctor d, String speciality) {
        if (speciality == null || speciality.equalsIgnoreCase("null") || speciality.equalsIgnoreCase("all")
                || speciality.trim().isEmpty()) {
            return true;
        }
        return d.getSpeciality().toLowerCase().contains(speciality.toLowerCase());
    }

    private boolean matchesTime(Doctor d, String time) {
        if (time == null || time.equalsIgnoreCase("null") || time.equalsIgnoreCase("all") || time.trim().isEmpty()) {
            return true;
        }

        List<String> times = d.getAvailableTimes();
        if (times == null || times.isEmpty())
            return false;

        // Exact match (e.g., "11:30")
        if (time.contains(":")) {
            return times.contains(time);
        }

        // Range match
        String lowerTime = time.toLowerCase();
        for (String t : times) {
            try {
                LocalTime localTime = LocalTime.parse(t);
                int hour = localTime.getHour();

                if (lowerTime.equals("morning") && hour >= 6 && hour < 12)
                    return true;
                if (lowerTime.equals("afternoon") && hour >= 12 && hour < 17)
                    return true;
                if (lowerTime.equals("evening") && hour >= 17 && hour < 21)
                    return true;
            } catch (Exception e) {
                // Ignore parse errors
            }
        }
        return false;
    }

    @Transactional
    public int updateAvailability(String token, List<String> availableTimes) {
        Doctor doctor = getDoctorByToken(token);
        if (doctor == null) {
            return -1;
        }

        // Use native queries to avoid triggering validation on the Doctor entity
        // causing issues with bad data (legacy phone numbers etc.)
        doctorRepo.deleteAvailableTimes(doctor.getId());

        if (availableTimes != null) {
            for (String timeSlot : availableTimes) {
                doctorRepo.insertAvailableTime(doctor.getId(), timeSlot);
            }
        }

        return 1;
    }
}
