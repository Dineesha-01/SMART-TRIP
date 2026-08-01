package com.smarttrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String name;
    private String username;
    private String email;
    private String password;
    private String secretPin;
    private String phone;
    private String homeCity;
    private String avatarUrl;
    private String role; 
    
    @Builder.Default
    private Boolean isBlocked = false;

    private List<String> travelPreferences;
    private String authProvider;
}
