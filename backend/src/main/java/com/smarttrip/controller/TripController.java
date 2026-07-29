package com.smarttrip.controller;

import com.smarttrip.model.Trip;
import com.smarttrip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripController {

    private final TripRepository tripRepository;

    @PostMapping("/save")
    public ResponseEntity<Trip> saveTrip(@RequestBody Trip trip) {
        if (trip.getId() == null || trip.getId().isBlank()) {
            trip.setId(UUID.randomUUID().toString());
        }
        if (trip.getStatus() == null) {
            trip.setStatus("PLANNED");
        }
        Trip saved = tripRepository.save(trip);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Trip>> getUserTrips(@PathVariable String userId) {
        List<Trip> trips = tripRepository.findByUserId(userId);
        return ResponseEntity.ok(trips);
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Map<String, String>> deleteTrip(@PathVariable String tripId) {
        tripRepository.deleteById(tripId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Trip deleted successfully.");
        response.put("tripId", tripId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/optimize-route")
    public ResponseEntity<List<Trip.RouteWaypoint>> optimizeRoute(@RequestBody List<Map<String, Object>> places) {
        List<Trip.RouteWaypoint> waypoints = new ArrayList<>();
        int step = 1;
        double currentLat = 48.8566;
        double currentLng = 2.3522;

        for (Map<String, Object> p : places) {
            String name = (String) p.getOrDefault("name", "Stop " + step);
            String category = (String) p.getOrDefault("category", "Attraction");
            double lat = p.get("latitude") != null ? Double.parseDouble(p.get("latitude").toString()) : currentLat + (step * 0.005);
            double lng = p.get("longitude") != null ? Double.parseDouble(p.get("longitude").toString()) : currentLng + (step * 0.005);

            waypoints.add(Trip.RouteWaypoint.builder()
                    .stepNumber(step)
                    .placeName(name)
                    .category(category)
                    .latitude(lat)
                    .longitude(lng)
                    .distanceKm(Math.round((1.2 * step) * 10.0) / 10.0)
                    .estimatedTimeMinutes(15 * step)
                    .build());
            step++;
        }

        return ResponseEntity.ok(waypoints);
    }

    @GetMapping("/calculate-budget")
    public ResponseEntity<Map<String, Object>> calculateBudget(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "Standard") String style,
            @RequestParam(defaultValue = "1") int travelers) {

        double dailyHotelRate = style.equalsIgnoreCase("Luxury") ? 250 : style.equalsIgnoreCase("Budget") ? 60 : 130;
        double dailyFoodCost = style.equalsIgnoreCase("Luxury") ? 100 : style.equalsIgnoreCase("Budget") ? 30 : 60;
        double dailyActivities = style.equalsIgnoreCase("Luxury") ? 80 : style.equalsIgnoreCase("Budget") ? 25 : 45;
        double transportFee = style.equalsIgnoreCase("Luxury") ? 150 : style.equalsIgnoreCase("Budget") ? 30 : 70;

        double totalAccommodation = dailyHotelRate * days;
        double totalFood = dailyFoodCost * days * travelers;
        double totalActivities = dailyActivities * days * travelers;
        double totalTransport = transportFee * travelers;
        double totalEstimatedCost = totalAccommodation + totalFood + totalActivities + totalTransport;

        Map<String, Object> response = new HashMap<>();
        response.put("days", days);
        response.put("travelers", travelers);
        response.put("travelStyle", style);
        response.put("totalEstimatedCost", totalEstimatedCost);
        response.put("accommodationCost", totalAccommodation);
        response.put("foodCost", totalFood);
        response.put("activitiesCost", totalActivities);
        response.put("transportCost", totalTransport);

        return ResponseEntity.ok(response);
    }
}
