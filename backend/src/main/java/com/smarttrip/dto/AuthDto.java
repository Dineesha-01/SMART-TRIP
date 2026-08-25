package com.smarttrip.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Username or email is required")
        private String usernameOrEmail;
        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;
        private String username;
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid address")
        private String email;
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
        @NotBlank(message = "Secret PIN is required")
        @Size(min = 4, message = "Secret PIN must be at least 4 digits")
        private String secretPin;
        private String phone;
        private String homeCity;
        private String role; // ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_TRAVELLER
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Username or email is required")
        private String usernameOrEmail;
        @NotBlank(message = "Secret PIN is required")
        private String secretPin;
        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        private String newPassword;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String tokenType;
        private String userId;
        private String name;
        private String email;
        private String username;
        private String role;
        private String message;
    }
}