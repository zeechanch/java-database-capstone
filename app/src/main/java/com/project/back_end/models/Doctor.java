package com.project.back_end.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.List;

@Entity
@Table(name = "doctor")

public class Doctor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    @NotNull
    @Column(nullable = false)
    @Size(min=3,max=100)
    private String name;
    
    @NotNull
    @Column(nullable = false)
    @Size(min=3,max=100)
    private String speciality;
    
    @NotNull
    @Column(nullable = false, unique = true)
    @Email
    private String email;
    
    @NotNull
    @Column(nullable = false)
    @Size(min=6)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) 
    private String password;
    
    @NotNull
    @Column(nullable = false)
    @Pattern(regexp = "^[0-9]{10}$")
    private String phone;

    @ElementCollection
    @CollectionTable(
            name = "doctor_available_times",
            joinColumns = @JoinColumn(name = "doctor_id")
    )
    @Column(name = "time_slot")
    private List<String> availableTimes;

    public Doctor() {}

    public Doctor(String name, String speciality, String email, String password, String phone, List<String> availableTimes) {
        this.name = name;
        this.speciality = speciality;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.availableTimes = availableTimes;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpeciality() {
        return speciality;
    }

    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getAvailableTimes() {
        return availableTimes;
    }

    public void setAvailableTimes(List<String> availableTimes) {
        this.availableTimes = availableTimes;
    }
    
}

