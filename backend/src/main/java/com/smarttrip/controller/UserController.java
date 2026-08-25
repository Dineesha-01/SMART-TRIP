package com.smarttrip.controller;

import com.smarttrip.model.User;
import com.smarttrip.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId)
                .or(() -> userRepository.findByEmail(userId))
                .or(() -> userRepository.findByUsername(userId));

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User target = userOpt.get();
        if (!isSelfOrAdmin(target)) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only view your own profile."));
        }

        target.setPassword(null); // never expose the password hash, even to the owner
        return ResponseEntity.ok(target);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable String userId, @RequestBody User updateReq) {
        Optional<User> existingOpt = userRepository.findById(userId)
                .or(() -> userRepository.findByEmail(userId))
                .or(() -> userRepository.findByUsername(userId));

        if (existingOpt.isPresent()) {
            User userToUpdate = existingOpt.get();
            if (!isSelfOrAdmin(userToUpdate)) {
                return ResponseEntity.status(403).body(Map.of("message", "You can only edit your own profile."));
            }

            if (updateReq.getName() != null && !updateReq.getName().isBlank()) userToUpdate.setName(updateReq.getName());
            if (updateReq.getEmail() != null && !updateReq.getEmail().isBlank()) userToUpdate.setEmail(updateReq.getEmail());
            if (updateReq.getPhone() != null) userToUpdate.setPhone(updateReq.getPhone());
            if (updateReq.getHomeCity() != null) userToUpdate.setHomeCity(updateReq.getHomeCity());
            if (updateReq.getTravelPreferences() != null) userToUpdate.setTravelPreferences(updateReq.getTravelPreferences());
            if (updateReq.getAvatarUrl() != null) userToUpdate.setAvatarUrl(updateReq.getAvatarUrl());

            User updated = userRepository.save(userToUpdate);
            updated.setPassword(null);
            return ResponseEntity.ok(updated);
        }

        // No existing account with this id — only allow creating a record that matches your own JWT identity.
        String currentEmail = currentEmail();
        if (currentEmail == null || (updateReq.getEmail() != null && !updateReq.getEmail().equalsIgnoreCase(currentEmail))) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only create your own profile record."));
        }

        if (updateReq.getId() == null || updateReq.getId().isBlank()) {
            updateReq.setId(userId);
        }
        User saved = userRepository.save(updateReq);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        for (GrantedAuthority a : auth.getAuthorities()) {
            if (a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN")) {
                return true;
            }
        }
        return false;
    }

    private boolean isSelfOrAdmin(User target) {
        String currentEmail = currentEmail();
        boolean isSelf = currentEmail != null && currentEmail.equalsIgnoreCase(target.getEmail());
        return isSelf || isAdmin();
    }
}