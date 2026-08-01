package com.smarttrip.dto;

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
        private String usernameOrEmail;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String name;
        private String username;
        private String email;
        private String password;
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
        private String usernameOrEmail;
        private String secretPin;
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
