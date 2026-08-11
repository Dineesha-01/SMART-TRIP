package com.smarttrip.service;

import com.smarttrip.dto.AiDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GroqAiService {

    private static final Pattern JSON_ARRAY_PATTERN = Pattern.compile("\\[\\s*\\{[\\s\\S]*}\\s*]");

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.groq.api-key:}")
    private String apiKey;

    @Value("${app.groq.endpoint:https://api.groq.com/openai/v1/chat/completions}")
    private String endpoint;

    @Value("${app.groq.model:llama-3.3-70b-versatile}")
    private String model;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String chat(List<AiDto.ChatMessage> conversation, String systemInstruction) {
        if (!isConfigured()) {
            throw new IllegalStateException("AI assistant is not configured on the server (missing GROQ_API_KEY).");
        }

        List<Map<String, String>> payloadMessages = new ArrayList<>();
        if (systemInstruction != null && !systemInstruction.isBlank()) {
            payloadMessages.add(Map.of("role", "system", "content", systemInstruction));
        }
        for (AiDto.ChatMessage m : conversation) {
            payloadMessages.add(Map.of("role", m.getRole(), "content", m.getContent()));
        }

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", payloadMessages,
                "temperature", 0.7,
                "max_tokens", 1500
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, new HttpEntity<>(body, headers), Map.class);
            return extractContent(response.getBody());
        } catch (RestClientException ex) {
            throw new IllegalStateException("Could not reach AI service: " + ex.getMessage(), ex);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<?, ?> responseBody) {
        if (responseBody == null) return "No response generated.";
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
        if (choices == null || choices.isEmpty()) return "No response generated.";
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        if (message == null) return "No response generated.";
        Object content = message.get("content");
        return content != null ? content.toString() : "No response generated.";
    }

    public String extractJsonArray(String rawReply) {
        if (rawReply == null) return null;
        Matcher matcher = JSON_ARRAY_PATTERN.matcher(rawReply);
        return matcher.find() ? matcher.group() : null;
    }
}