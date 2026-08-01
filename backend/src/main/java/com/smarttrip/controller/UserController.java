package com.smarttrip.controller;

import com.smarttrip.model.User;
import com.smarttrip.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserProfile(@PathVariable String userId) {
        return userRepository.findById(userId)
                .or(() -> userRepository.findByEmail(userId))
                .or(() -> userRepository.findByUsername(userId))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUserProfile(@PathVariable String userId, @RequestBody User updateReq) {
        User userToUpdate = userRepository.findById(userId)
                .or(() -> userRepository.findByEmail(userId))
                .or(() -> userRepository.findByUsername(userId))
                .orElse(null);

        if (userToUpdate != null) {
            if (updateReq.getName() != null && !updateReq.getName().isBlank()) userToUpdate.setName(updateReq.getName());
            if (updateReq.getEmail() != null && !updateReq.getEmail().isBlank()) userToUpdate.setEmail(updateReq.getEmail());
            if (updateReq.getPhone() != null) userToUpdate.setPhone(updateReq.getPhone());
            if (updateReq.getHomeCity() != null) userToUpdate.setHomeCity(updateReq.getHomeCity());
            if (updateReq.getTravelPreferences() != null) userToUpdate.setTravelPreferences(updateReq.getTravelPreferences());
            if (updateReq.getAvatarUrl() != null) userToUpdate.setAvatarUrl(updateReq.getAvatarUrl());

            User updated = userRepository.save(userToUpdate);
            return ResponseEntity.ok(updated);
        }

        // If user not in DB yet, create/save user record
        if (updateReq.getId() == null || updateReq.getId().isBlank()) {
            updateReq.setId(userId);
        }
        User saved = userRepository.save(updateReq);
        return ResponseEntity.ok(saved);
    }
}
