package com.project.back_end.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "patient")

public class Patient {
    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;
    
    @NotNull
    @Column(nullable=false)
    @Size(min=3,max=100)
    private String name;
    
    @NotNull
    @Column(nullable=false, unique = true)
    @Email
    private String email;
    
    @NotNull
    @Column(nullable=false)
    @Size(min=6)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) 
    private String passsword;
    
    @NotNull
    @Column(nullable=false)
    @Pattern(regexp="^[0-9]{10}$")
    private String phone;
    
    @NotNull
    @Column(nullable=false)
    @Size(max=255)
    private String address;

    public Patient() {}

    public Patient(String name, String email, String passsword, String phone, String address) {
        this.name = name;
        this.email = email;
        this.passsword = passsword;
        this.phone = phone;
        this.address = address;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasssword() {
        return passsword;
    }

    public void setPasssword(String passsword) {
        this.passsword = passsword;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
    
}
