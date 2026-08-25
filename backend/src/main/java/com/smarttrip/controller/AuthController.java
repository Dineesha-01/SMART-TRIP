package com.smarttrip.controller;

import com.smarttrip.dto.AuthDto;
import com.smarttrip.model.User;
import com.smarttrip.repository.UserRepository;
import com.smarttrip.security.JwtTokenProvider;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(
                AuthDto.AuthResponse.builder()
                    .message("Email address is already registered.")
                    .build()
            );
        }

        if (request.getUsername() != null && userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(
                AuthDto.AuthResponse.builder()
                    .message("Username is already taken.")
                    .build()
            );
        }

        String userRole = request.getRole() != null ? request.getRole() : "ROLE_TRAVELLER";

                if (request.getSecretPin() == null || request.getSecretPin().trim().length() < 4) {
            return ResponseEntity.badRequest().body(
                AuthDto.AuthResponse.builder()
                    .message("A secret recovery PIN (at least 4 digits) is required.")
                    .build()
            );
        }

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername() != null ? request.getUsername() : request.getEmail().split("@")[0])
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .secretPin(request.getSecretPin().trim())
                .phone(request.getPhone())
                .homeCity(request.getHomeCity() != null ? request.getHomeCity() : "New York")
                .role(userRole)
                .isBlocked(false)
                .authProvider("LOCAL")
                .travelPreferences(Collections.singletonList("Sightseeing"))
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole());

        return ResponseEntity.ok(
            AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .username(savedUser.getUsername())
                .role(savedUser.getRole() != null ? savedUser.getRole() : "ROLE_TRAVELLER")
                .message("User registered successfully.")
                .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        String identifier = request.getUsernameOrEmail();
        Optional<User> userOpt = userRepository.findByEmailOrUsername(identifier, identifier);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Check if user is blocked
            if (Boolean.TRUE.equals(user.getIsBlocked())) {
                return ResponseEntity.status(403).body(
                    AuthDto.AuthResponse.builder()
                        .message("Your account has been suspended by the Super Admin.")
                        .build()
                );
            }

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                String role = user.getRole() != null ? user.getRole() : "ROLE_TRAVELLER";
                String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId(), role);
                return ResponseEntity.ok(
                    AuthDto.AuthResponse.builder()
                        .token(token)
                        .tokenType("Bearer")
                        .userId(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .role(role)
                        .message("Login successful.")
                        .build()
                );
            }
        }

        return ResponseEntity.status(401).body(
            AuthDto.AuthResponse.builder()
                .message("Invalid email/username or password.")
                .build()
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthDto.AuthResponse> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
        String identifier = request.getUsernameOrEmail();
        Optional<User> userOpt = userRepository.findByEmailOrUsername(identifier, identifier);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(
                AuthDto.AuthResponse.builder()
                    .message("No account found matching email or username.")
                    .build()
            );
        }

        User user = userOpt.get();
        if (user.getSecretPin() == null || !user.getSecretPin().trim().equals(request.getSecretPin().trim())) {
            return ResponseEntity.badRequest().body(
                AuthDto.AuthResponse.builder()
                    .message("Incorrect Secret Recovery PIN.")
                    .build()
            );
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(
            AuthDto.AuthResponse.builder()
                .message("Password reset successfully. You can now login with your new password.")
                .build()
        );
    }
}