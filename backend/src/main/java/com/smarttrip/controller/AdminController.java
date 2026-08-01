package com.smarttrip.controller;

import com.smarttrip.dto.AuthDto;
import com.smarttrip.model.Trip;
import com.smarttrip.model.User;
import com.smarttrip.repository.TripRepository;
import com.smarttrip.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/trips")
    public ResponseEntity<List<Trip>> getAllUserTrips() {
        return ResponseEntity.ok(tripRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalTrips", totalTrips);
        stats.put("superAdminCount", userRepository.findAll().stream().filter(u -> "ROLE_SUPER_ADMIN".equals(u.getRole())).count());
        stats.put("adminCount", userRepository.findAll().stream().filter(u -> "ROLE_ADMIN".equals(u.getRole())).count());
        stats.put("travellerCount", userRepository.findAll().stream().filter(u -> !"ROLE_SUPER_ADMIN".equals(u.getRole()) && !"ROLE_ADMIN".equals(u.getRole())).count());

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address is already registered."));
        }

        User adminUser = User.builder()
                .name(request.getName())
                .username(request.getUsername() != null ? request.getUsername() : request.getEmail().split("@")[0])
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .secretPin("1234")
                .phone(request.getPhone() != null ? request.getPhone() : "+91 99999 88888")
                .homeCity(request.getHomeCity() != null ? request.getHomeCity() : "SmartTrip HQ")
                .role("ROLE_ADMIN")
                .isBlocked(false)
                .authProvider("LOCAL")
                .travelPreferences(Collections.singletonList("Management"))
                .build();

        User saved = userRepository.save(adminUser);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/users/{userId}/toggle-block")
    public ResponseEntity<?> toggleBlockUser(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if ("ROLE_SUPER_ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Super Admin account cannot be blocked."));
        }

        user.setIsBlocked(!Boolean.TRUE.equals(user.getIsBlocked()));
        User updated = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "userId", updated.getId(),
            "isBlocked", updated.getIsBlocked(),
            "message", updated.getIsBlocked() ? "User blocked successfully." : "User unblocked successfully."
        ));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String userId, @RequestParam String newRole) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if ("ROLE_SUPER_ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Super Admin role cannot be modified."));
        }

        user.setRole(newRole);
        User updated = userRepository.save(user);

        return ResponseEntity.ok(updated);
    }
}
