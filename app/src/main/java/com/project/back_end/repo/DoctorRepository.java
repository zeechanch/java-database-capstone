package com.project.back_end.repo;

import com.project.back_end.models.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

   @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availableTimes WHERE d.email = :email")
   Doctor findByEmail(@Param("email") String email);

   @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availableTimes WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%'))")
   List<Doctor> findByNameContainingIgnoreCase(@Param("name") String name);

   @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availableTimes WHERE LOWER(d.speciality) LIKE LOWER(CONCAT('%', :speciality, '%'))")
   List<Doctor> findBySpecialityContainingIgnoreCase(@Param("speciality") String speciality);

   @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availableTimes WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')) AND LOWER(d.speciality) LIKE LOWER(CONCAT('%', :speciality, '%'))")
   List<Doctor> findByNameAndSpeciality(@Param("name") String name, @Param("speciality") String speciazty);

   @Query("SELECT DISTINCT d FROM Doctor d LEFT JOIN FETCH d.availableTimes")
   List<Doctor> findAllWithAvailableTimes();
}