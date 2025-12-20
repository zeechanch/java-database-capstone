package com.project.back_end.controllers;

import com.project.back_end.models.Admin;
import com.project.back_end.services.Service; // Assuming the service is in this package
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

// 1. Set Up the Controller Class:
//    - Annotate the class with `@RestController` to indicate that it's a REST controller, used to handle web requests and return JSON responses.
//    - Use `@RequestMapping("${api.path}admin")` to define a base path for all endpoints in this controller.
//    - This allows the use of an external property (`api.path`) for flexible configuration of endpoint paths.
@RestController
@RequestMapping("${api.path}admin")
public class AdminController {

    private final Service service;

    // 2. Autowire Service Dependency:
    // - Use constructor injection to autowire the `Service` class.
    // - The service handles core logic related to admin validation and token
    // checking.
    // - This promotes cleaner code and separation of concerns between the
    // controller and business logic layer.
    public AdminController(Service service) {
        this.service = service;
    }

    // 3. Define the `adminLogin` Method:
    // - Handles HTTP POST requests for admin login functionality.
    // - Accepts an `Admin` object in the request body, which contains login
    // credentials.
    // - Delegates authentication logic to the `validateAdmin` method in the service
    // layer.
    // - Returns a `ResponseEntity` with a `Map` containing login status or
    // messages.
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> adminLogin(@RequestBody Admin admin) {
        // Use a Map for the response body, which will be converted to JSON.
        Map<String, String> response = new HashMap<>();

        // Assuming service.validateAdmin(Admin) returns the token string if successful,
        // or an error message if failed.
        String result = service.validateAdmin(admin);

        // Check if the result is a token (assuming tokens are long, complex strings)
        // A better check would be based on what your service layer is designed to
        // return (e.g., a custom DTO or a specific token structure).
        if (result != null && result.startsWith("token:")) {
            response.put("status", "success");
            response.put("token", result.substring("token:".length())); // Extract the token
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            // Handle failure case (result contains an error message)
            response.put("status", "failure");
            response.put("message", result != null ? result : "Invalid credentials or internal error.");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/stats/{token}")
    public ResponseEntity<Map<String, Long>> getStats(@PathVariable String token) {
        if (!service.validateToken(token, "admin").equals("valid")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(service.getDashboardStats(), HttpStatus.OK);
    }

    /*
     * * NOTE: You can add other admin-related endpoints here, like:
     * 
     * @GetMapping("/users")
     * public ResponseEntity<List<User>> getAllUsers() { ... }
     */
}