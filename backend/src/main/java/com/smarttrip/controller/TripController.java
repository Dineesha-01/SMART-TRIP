package com.smarttrip.controller;

import com.smarttrip.model.Trip;
import com.smarttrip.model.User;
import com.smarttrip.repository.TripRepository;
import com.smarttrip.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripController {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @PostMapping("/save")
    public ResponseEntity<?> saveTrip(@RequestBody Trip trip) {
        String currentUserId = currentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated."));
        }

        // Force the trip to belong to whoever is actually logged in — never trust a client-supplied userId.
        if (!isAdmin()) {
            trip.setUserId(currentUserId);
        } else if (trip.getUserId() == null || trip.getUserId().isBlank()) {
            trip.setUserId(currentUserId);
        }

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
    public ResponseEntity<?> getAllTrips() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required."));
        }
        return ResponseEntity.ok(tripRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTrips(@PathVariable String userId) {
        if (!isAdmin() && !userId.equals(currentUserId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only view your own trips."));
        }
        List<Trip> trips = tripRepository.findByUserId(userId);
        return ResponseEntity.ok(trips);
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable String tripId, @RequestBody Trip tripReq) {
        Optional<Trip> existingOpt = tripRepository.findById(tripId);

        if (existingOpt.isPresent()) {
            Trip existing = existingOpt.get();
            if (!isAdmin() && !Objects.equals(existing.getUserId(), currentUserId())) {
                return ResponseEntity.status(403).body(Map.of("message", "You can only edit your own trips."));
            }

            if (tripReq.getTitle() != null) existing.setTitle(tripReq.getTitle());
            if (tripReq.getDestination() != null) existing.setDestination(tripReq.getDestination());
            if (tripReq.getDurationDays() > 0) existing.setDurationDays(tripReq.getDurationDays());
            if (tripReq.getTotalBudget() > 0) existing.setTotalBudget(tripReq.getTotalBudget());
            if (tripReq.getEstimatedCost() > 0) existing.setEstimatedCost(tripReq.getEstimatedCost());
            if (tripReq.getStatus() != null) existing.setStatus(tripReq.getStatus());
            if (tripReq.getSelectedPlaces() != null) existing.setSelectedPlaces(tripReq.getSelectedPlaces());

            Trip updated = tripRepository.save(existing);
            return ResponseEntity.ok(updated);
        }

        // Creating a brand-new trip via PUT — force ownership to whoever is logged in.
        String currentUserId = currentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated."));
        }
        if (!isAdmin()) {
            tripReq.setUserId(currentUserId);
        }
        tripReq.setId(tripId);
        Trip saved = tripRepository.save(tripReq);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable String tripId) {
        Optional<Trip> existingOpt = tripRepository.findById(tripId);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trip existing = existingOpt.get();
        if (!isAdmin() && !Objects.equals(existing.getUserId(), currentUserId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only delete your own trips."));
        }

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

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName()).map(User::getId).orElse(null);
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
}