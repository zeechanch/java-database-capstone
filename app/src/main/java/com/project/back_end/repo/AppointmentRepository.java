package com.project.back_end.repo;

import com.project.back_end.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

      @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH d.availableTimes WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :start AND :end")
      List<Appointment> findByDoctorIdAndAppointmentDateBetween(@Param("doctorId") Long doctorId,
                  @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

      @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH d.availableTimes LEFT JOIN FETCH a.patient p WHERE a.doctor.id = :doctorId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :patientName, '%')) AND a.appointmentDate BETWEEN :start AND :end")
      List<Appointment> findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentDateBetween(
                  @Param("doctorId") Long doctorId, @Param("patientName") String patientName,
                  @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

      @Modifying
      @Transactional
      @Query("DELETE FROM Appointment a WHERE a.doctor.id = :doctorId")
      void deleteAllByDoctorId(@Param("doctorId") Long doctorId);

      List<Appointment> findByPatientId(Long patientId);

      List<Appointment> findByPatient_IdAndStatusOrderByAppointmentDateAsc(Long patientId, String status);

      @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND LOWER(a.doctor.name) LIKE LOWER(CONCAT('%', :doctorName, '%'))")
      List<Appointment> filterByDoctorNameAndPatientId(@Param("doctorName") String doctorName,
                  @Param("patientId") Long patientId);

      @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status = :status AND LOWER(a.doctor.name) LIKE LOWER(CONCAT('%', :doctorName, '%'))")
      List<Appointment> filterByDoctorNameAndPatientIdAndStatus(@Param("doctorName") String doctorName,
                  @Param("patientId") Long patientId, @Param("status") String status);

      @Modifying
      @Transactional
      @Query("UPDATE Appointment a SET a.status = :status WHERE a.id = :id")
      void updateStatus(@Param("status") String status, @Param("id") long id);
}
