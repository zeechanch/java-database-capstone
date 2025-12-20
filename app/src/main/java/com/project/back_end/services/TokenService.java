package com.project.back_end.services;

import com.project.back_end.models.Admin;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class TokenService {

    private final AdminRepository adminRepo;
    private final DoctorRepository doctorRepo;
    private final PatientRepository patientRepo;

    @Value("${jwt.secret}")
    private String jwtSecret;

    public TokenService(AdminRepository adminRepo, DoctorRepository doctorRepo, PatientRepository patientRepo) {
        this.adminRepo = adminRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7)) // 7 days
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateToken(String token, String role) {
        try {
            String email = extractEmail(token); // Extract email first to use in role validation
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            // Also validate role if needed, e.g. check subject or claim

            if (email == null) {
                return false;
            }

            switch (role) {
                case "admin":
                    return adminRepo.findByUsername(email) != null;
                case "doctor":
                    return doctorRepo.findByEmail(email) != null;
                case "patient":
                    return patientRepo.findByEmail(email) != null;
                default:
                    return false;
            }
        } catch (Exception e) {
            return false;
        }

    }
}
