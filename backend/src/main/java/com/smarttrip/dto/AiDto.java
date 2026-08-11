package com.smarttrip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String role;    // "user" | "assistant"
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private List<ChatMessage> messages;
        private String destination;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceRef {
        private String name;
        private String category;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayPlanRequest {
        private String destination;
        private int durationDays;
        private List<PlaceRef> selectedPlaces;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrichPlaceRequest {
        private String placeName;
        private String destination;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RealPlacesRequest {
        private String destination;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiTextResponse {
        private String content;
    }
}