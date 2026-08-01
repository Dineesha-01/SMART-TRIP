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
@Document(collection = "trips")
public class Trip {

    @Id
    private String id;
    private String userId;
    private String destination;
    private String title;
    private String startDate;
    private String endDate;
    private int durationDays;
    private double totalBudget;
    private double estimatedCost;
    private String travelStyle;
    private List<Place> selectedPlaces;
    private List<RouteWaypoint> optimizedRoute;
    private WeatherInfo weatherSummary;
    private String status; 

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteWaypoint {
        private int stepNumber;
        private String placeName;
        private double latitude;
        private double longitude;
        private String category;
        private double distanceKm;
        private int estimatedTimeMinutes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeatherInfo {
        private String temperature;
        private String condition;
        private String forecastSummary;
    }
}
