package com.smarttrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "places")
public class Place {

    @Id
    private String id;
    private String name;
    private String category; // Attraction, Hotel, Restaurant, Hospital, ATM
    private String destination;
    private String address;
    private double latitude;
    private double longitude;
    private double rating;
    private int userRatingsTotal;
    private String priceLevel; // $, $$, $$$
    private String imageUrl;
    private String bookingLink;
    private String phoneNumber;
    private boolean isEmergencyFacility;
}
