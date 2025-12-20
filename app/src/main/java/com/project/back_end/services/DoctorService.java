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

    // Filter implementations
    @Transactional(readOnly = true)
    public List<Doctor> findDoctorByName(String name) {
        return doctorRepo.findByNameContainingIgnoreCase(name);
    }

    // Additional filter methods wrapper
    @Transactional(readOnly = true)
    public List<Doctor> filterDoctors(String name, String speciality) {
        if (!"null".equals(name) && !"all".equals(speciality)) {
            return doctorRepo.findByNameAndSpeciality(name, speciality);
        } else if (!"null".equals(name)) {
            return doctorRepo.findByNameContainingIgnoreCase(name);
        } else if (!"all".equals(speciality)) {
            return doctorRepo.findBySpecialityContainingIgnoreCase(speciality);
        }
        return getDoctors();
    }
}
