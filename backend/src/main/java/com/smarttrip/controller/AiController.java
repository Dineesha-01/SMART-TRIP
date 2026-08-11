package com.smarttrip.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.dto.AiDto;
import com.smarttrip.security.RateLimiter;
import com.smarttrip.service.GroqAiService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final GroqAiService groqAiService;
    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody AiDto.ChatRequest request, HttpServletRequest httpRequest) {
        ResponseEntity<?> limited = checkRateLimit(httpRequest);
        if (limited != null) return limited;

        String destination = safe(request.getDestination(), "your destination");
        String systemInstruction = "You are SmartTrip AI, an expert travel guide for " + destination
                + ". Format your answer with clean headings, bold text, and bullet points. Avoid unnecessary intro filler.";

        return respond(() -> groqAiService.chat(request.getMessages(), systemInstruction));
    }

    @PostMapping("/day-plan")
    public ResponseEntity<?> dayPlan(@RequestBody AiDto.DayPlanRequest request, HttpServletRequest httpRequest) {
        ResponseEntity<?> limited = checkRateLimit(httpRequest);
        if (limited != null) return limited;

        String destination = safe(request.getDestination(), "your destination");
        int days = request.getDurationDays() > 0 ? request.getDurationDays() : 1;

        String placesListStr = (request.getSelectedPlaces() == null || request.getSelectedPlaces().isEmpty())
                ? "None explicitly pre-selected. Please suggest top attractions, local food, and sights!"
                : request.getSelectedPlaces().stream()
                    .map(p -> "- " + p.getName() + " (" + p.getCategory() + ")")
                    .collect(Collectors.joining("\n"));

        String prompt = "You are SmartTrip AI, an expert travel planner.\n"
                + "Generate a structured " + days + "-day itinerary for a trip to \"" + destination + "\".\n\n"
                + "Selected places by user:\n" + placesListStr + "\n\n"
                + "Requirements:\n"
                + "- Organize into Day 1, Day 2, ..., Day " + days + ".\n"
                + "- For each day, provide 3 slots: Morning (9 AM - 12 PM), Afternoon (1 PM - 4 PM), Evening (5 PM - 9 PM).\n"
                + "- Include brief insider travel advice, local food highlights, and transport tips for " + destination + ".\n"
                + "- Keep formatting clean using bold headings, bullet points, and clear sections.";

        String systemInstruction = "You are SmartTrip AI, a world-class intelligent travel assistant "
                + "specialized in travel planning, local insider knowledge, and route optimization.";

        return respond(() -> groqAiService.chat(
                List.of(new AiDto.ChatMessage("user", prompt)), systemInstruction));
    }

    @PostMapping("/enrich-place")
    public ResponseEntity<?> enrichPlace(@RequestBody AiDto.EnrichPlaceRequest request, HttpServletRequest httpRequest) {
        ResponseEntity<?> limited = checkRateLimit(httpRequest);
        if (limited != null) return limited;

        String placeName = safe(request.getPlaceName(), "this place");
        String destination = safe(request.getDestination(), "India");

        String prompt = "Provide detailed authentic travel guide facts for \"" + placeName + "\" in " + destination + ":\n"
                + "1. Brief Historical & Significance Overview (2-3 sentences).\n"
                + "2. Estimated Ticket Entry Fee in local currency, or if Free.\n"
                + "3. Best Hours & Days to Visit.\n"
                + "4. Top 3 Nearby Highlights or Unique Local Tips.\n\n"
                + "Format clearly with bold headers and bullet points. Keep it concise, formal, and accurate.";

        return respond(() -> groqAiService.chat(
                List.of(new AiDto.ChatMessage("user", prompt)),
                "You are SmartTrip AI, an authoritative tourism & travel history guide."));
    }

    @PostMapping("/real-places")
    public ResponseEntity<?> realPlaces(@RequestBody AiDto.RealPlacesRequest request, HttpServletRequest httpRequest) {
        ResponseEntity<?> limited = checkRateLimit(httpRequest);
        if (limited != null) return limited;

        String destination = safe(request.getDestination(), null);
        if (destination == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "destination is required"));
        }

        String prompt = "Return a JSON array of 8-10 REAL famous places for \"" + destination + "\".\n"
                + "Include real tourist attractions, famous real hotels, top local restaurants, real hospitals, and real ATMs.\n\n"
                + "OUTPUT REQUIREMENTS:\n"
                + "- Output ONLY valid raw JSON array.\n"
                + "- Each object MUST have: \"name\", \"category\" (\"Attraction\"|\"Hotel\"|\"Restaurant\"|\"Hospital\"|\"ATM\"), "
                + "\"address\", \"priceEstimate\", \"rating\" (number between 4.5 and 4.9).\n"
                + "No conversational intro or markdown outside the JSON block.";

        try {
            String rawReply = groqAiService.chat(
                    List.of(new AiDto.ChatMessage("user", prompt)),
                    "You are a real-world travel database API returning valid raw JSON arrays only.");
            String jsonArray = groqAiService.extractJsonArray(rawReply);
            if (jsonArray == null) {
                return ResponseEntity.ok(List.of());
            }
            List<Map<String, Object>> parsed = objectMapper.readValue(jsonArray, List.class);
            return ResponseEntity.ok(parsed);
        } catch (Exception ex) {
            return ResponseEntity.ok(List.of());
        }
    }

    private ResponseEntity<?> respond(java.util.function.Supplier<String> call) {
        try {
            return ResponseEntity.ok(AiDto.AiTextResponse.builder().content(call.get()).build());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", ex.getMessage()));
        }
    }

    private ResponseEntity<?> checkRateLimit(HttpServletRequest httpRequest) {
        String key = clientKey(httpRequest);
        if (!rateLimiter.tryAcquire(key)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many AI requests. Please wait a moment and try again."));
        }
        return null;
    }

    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isBlank()) ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
    }

    private String safe(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}