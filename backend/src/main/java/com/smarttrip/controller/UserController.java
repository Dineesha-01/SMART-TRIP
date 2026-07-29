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
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUserProfile(@PathVariable String userId, @RequestBody User updateReq) {
        return userRepository.findById(userId)
                .map(existingUser -> {
                    if (updateReq.getName() != null) existingUser.setName(updateReq.getName());
                    if (updateReq.getPhone() != null) existingUser.setPhone(updateReq.getPhone());
                    if (updateReq.getHomeCity() != null) existingUser.setHomeCity(updateReq.getHomeCity());
                    if (updateReq.getTravelPreferences() != null) existingUser.setTravelPreferences(updateReq.getTravelPreferences());
                    if (updateReq.getAvatarUrl() != null) existingUser.setAvatarUrl(updateReq.getAvatarUrl());

                    User updated = userRepository.save(existingUser);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
