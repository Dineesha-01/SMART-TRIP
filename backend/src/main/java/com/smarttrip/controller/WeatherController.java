package com.smarttrip.controller;

import com.smarttrip.model.Trip;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWeather(@RequestParam(defaultValue = "Paris") String destination) {
        Map<String, Object> weather = new HashMap<>();
        weather.put("destination", destination);
        weather.put("temperature", "24°C / 75°F");
        weather.put("condition", "Partly Cloudy");
        weather.put("humidity", "58%");
        weather.put("windSpeed", "12 km/h");
        weather.put("uvIndex", "Moderate (4/10)");
        weather.put("packingTip", "Light jacket for cool evenings & comfortable walking shoes.");

        Trip.WeatherInfo summary = Trip.WeatherInfo.builder()
                .temperature("24°C")
                .condition("Partly Cloudy")
                .forecastSummary("Pleasant & Sunny afternoon")
                .build();
        weather.put("summary", summary);

        return ResponseEntity.ok(weather);
    }
}
