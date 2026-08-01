# Software Requirements Specification (SRS)
## Smart Trip – Intelligent Travel Planning & Recommendation System

---

### 1. Introduction

#### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to provide a complete, detailed, and formal description of the **Smart Trip** system. It defines the functional requirements, non-functional requirements, external interfaces, system architecture, hardware/software constraints, use cases, and data flow models for the Smart Trip web application. This document serves as the primary reference for software developers, project managers, quality assurance testers, and evaluators.

#### 1.2 Scope
**Smart Trip** is an intelligent, full-stack web application designed to simplify personalized travel planning. The application enables travelers to discover tourist attractions, hotels, restaurants, emergency medical facilities, and ATMs based on their selected destination. It offers automated route optimization, real-time weather forecasts, dynamic budget calculation, hotel booking integration, emergency contact support, and secure trip saving capabilities.

#### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS**: Software Requirements Specification
- **JWT**: JSON Web Token (used for stateless backend authentication)
- **OTP**: One-Time Password
- **POI**: Point of Interest (attractions, restaurants, hotels, hospitals, ATMs)
- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **UI/UX**: User Interface / User Experience
- **DFD**: Data Flow Diagram
- **NFR**: Non-Functional Requirement

#### 1.4 Overview
The remainder of this document outlines the overall description of the system, specific functional and non-functional requirements, hardware and software specifications, system architecture, data flow diagrams, use cases, error handling strategies, and future enhancements.

---

### 2. Overall Description

#### 2.1 User Characteristics
The system targets diverse groups of travelers:
- **General Tourists**: Users seeking personalized trip itineraries, budget estimation, and destination recommendations.
- **Solo Travelers & Backpackers**: Users prioritizing route optimization, budget tracking, and safety/emergency information.
- **System Administrators**: Users who oversee system health, maintain point-of-interest data, and monitor authentication security.

#### 2.2 Product Perspective
Smart Trip operates as an independent web application following a decoupled client-server architecture:
- **Frontend Layer**: Single Page Application (SPA) built with React, Vite, and modern visual components.
- **Backend Layer**: Microservice-ready RESTful service built with Spring Boot 3.x and Java 21/17.
- **Data Persistence**: MongoDB 8 document-oriented database for storing user accounts, trip plans, and POI records.

#### 2.3 Operating Environment
- **Client Side**: Web browsers (Google Chrome 110+, Mozilla Firefox 100+, Microsoft Edge 110+, Apple Safari 16+) on Windows, macOS, Linux, iOS, or Android.
- **Server Side**: Embedded Apache Tomcat 10 server running on Java Runtime Environment (JRE) 17/21 on Windows Server or Linux distributions.

#### 2.4 Design and Implementation Constraints
- The backend must strictly implement RESTful API standards with JSON payloads.
- Authentication state must be managed statelessly via JWT bearer tokens.
- All client-side components must strictly conform to ESLint and Prettier code quality standards.
- External maps and weather data integrations must gracefully fallback when offline or when rate-limited.

#### 2.5 Assumptions and Dependencies
- Users possess an active internet connection for real-time map tile rendering and weather data retrieval.
- Third-party APIs (e.g., Google Maps JavaScript API, OpenWeatherMap API) maintain minimum 99% uptime.

---

### 3. System Architecture & Technical Specifications

#### 3.1 Software Specifications

##### 3.1.1 Frontend Framework & Tooling
- **Framework**: React 18.x with JSX
- **Build Tool**: Vite 5.x
- **Code Quality**: ESLint 8.x + Prettier (Industry standard configuration)
- **Styling**: Modern Vanilla CSS tokens with Dark Glassmorphism aesthetic, responsive CSS Grid/Flexbox
- **Icons**: Lucide-React / Vector SVG icon sets

##### 3.1.2 Backend Framework & Runtime
- **Framework**: Spring Boot 3.3.x
- **Programming Language**: Java 21 (LTS) / Java 17 (LTS)
- **Build & Dependency Management**: Apache Maven 3.9.x
- **Security & Authentication**: Spring Security 6.x + JJWT (JSON Web Token 0.12.x)
- **API Architecture**: REST APIs exposing standard HTTP endpoints (`/api/v1/...`)
- **Container / Server**: Embedded Apache Tomcat 10.1.x

##### 3.1.3 Database Architecture
- **Database Engine**: MongoDB 8.0 Community / Enterprise Edition
- **Driver / Abstraction**: Spring Data MongoDB 4.3.x
- **Data Storage Model**: Document collections (`users`, `trips`, `places`, `emergency_contacts`)

#### 3.2 Minimum System Requirements (Hardware & OS)

| Specification Component | Minimum Requirement | Recommended Requirement |
| :--- | :--- | :--- |
| **Processor (CPU)** | Intel Core i3 (7th Gen) or AMD Ryzen 3 | Intel Core i5/i7 (10th Gen+) or AMD Ryzen 5/7 |
| **System Memory (RAM)** | 8 GB RAM | 16 GB RAM |
| **Free Storage Space** | 20 GB available SSD/HDD storage | 50 GB NVMe SSD storage |
| **Network Interface** | Standard Broadband / Wi-Fi | 100 Mbps+ High-speed Broadband |
| **Operating System** | Windows 10/11 (64-bit), macOS 12+, Ubuntu 20.04+ | Windows 11 Pro (64-bit) / macOS Sonoma |

---

### 4. Functional Requirements

#### 4.1 Authentication & User Management

- **FR-1.1 (User Registration)**: The system shall allow new users to create an account by providing a valid full name, email address, password, and mobile number.
- **FR-1.2 (Email & Password Login)**: The system shall authenticate existing users using their registered email address and encrypted password, issuing a JWT bearer token upon successful verification.
- **FR-1.3 (OTP Authentication)**: The system shall provide an option to log in or verify account operations via a 6-digit One-Time Password (OTP) sent to the user's email/mobile number.
- **FR-1.4 (Google OAuth Login)**: The system shall support federated single sign-on (SSO) via Google OAuth 2.0.
- **FR-1.5 (Logout)**: The system shall allow logged-in users to invalidate their active session and safely revoke client-side storage of JWT tokens.
- **FR-1.6 (View & Update User Profile)**: The system shall allow users to view and edit their profile information, including profile picture URL, contact details, home city, and travel preferences.

#### 4.2 Destination Discovery & Location Services

- **FR-2.1 (Points of Interest Retrieval)**: The system shall retrieve and display nearby tourist attractions, hotels, restaurants, hospitals, ATMs, and other points of interest based on the user's selected destination using integrated location services.
- **FR-2.2 (Interactive Map Visualization)**: The system shall integrate Google Maps API to visually display interactive markers, info windows, and geographical coordinates for selected places.
- **FR-2.3 (Categorized POI Filtering)**: The system shall allow users to filter nearby places by category (Attractions, Dining, Stays, Emergency Medical, Banking/ATMs).

#### 4.3 Intelligent Trip Planning & Analytics

- **FR-3.1 (Route Optimization)**: The system shall calculate and render an optimal traveling sequence between selected attractions to minimize total travel time and distance using route optimization algorithms.
- **FR-3.2 (Dynamic Budget Calculation)**: The system shall calculate estimated total trip expenses based on selected accommodation tiers, daily meal allowances, activity tickets, and transit modes.
- **FR-3.3 (Live Weather Forecast)**: The system shall fetch and display current weather conditions and a multi-day forecast for the user's targeted travel destination.
- **FR-3.4 (Hotel Booking Redirection)**: The system shall provide direct affiliate links to external hotel booking platforms (e.g., Booking.com, Agoda) for identified accommodations.
- **FR-3.5 (Emergency Contact Directory)**: The system shall present immediate access to destination-specific emergency helpline numbers, nearby police stations, and major hospital hotlines.

#### 4.4 Trip Persistence & History

- **FR-4.1 (Save Trip Itinerary)**: The system shall allow authenticated users to save generated trip plans (including destination, dates, budget breakdown, optimized route, and place list) to their profile.
- **FR-4.2 (View Previous Trips)**: The system shall display a list of all past and upcoming saved trips associated with the user's account.
- **FR-4.3 (Delete Trip Plan)**: The system shall enable users to permanently remove a saved trip plan from their history after receiving user confirmation.

---

### 5. Non-Functional Requirements (NFR)

#### 5.1 Security
- Password credentials must be hashed using BCrypt prior to database storage.
- All API communication must be encrypted over HTTPS using TLS 1.3.
- JWT tokens must contain an explicit expiration timestamp (default: 24 hours) and be verified on all protected API endpoints.

#### 5.2 Performance & Response Time
- The system shall respond to user search requests and render destination recommendations within 2.0 seconds under normal load conditions.
- The route optimization algorithm shall execute and return serialized route data in under 1.5 seconds for up to 25 waypoint locations.

#### 5.3 Availability & Reliability
- The system shall maintain an operational availability of 99.5% excluding scheduled maintenance windows.
- In the event of an external API failure (e.g., weather or maps API rate-limit), the system shall gracefully display cached fallback data without crashing.

#### 5.4 Scalability
- The Spring Boot backend architecture shall support horizontal scaling across multiple instances behind a load balancer.
- MongoDB 8 database collections shall be indexed on user IDs and destination coordinates to support rapid query throughput under high concurrent user loads.

#### 5.5 Maintainability & Code Quality
- All client-side code must strictly pass ESLint rules and maintain high component modularity.
- Backend services must adhere to clean architecture principles (Controller-Service-Repository pattern) with complete Javadoc/Swagger endpoint documentation.

#### 5.6 Compatibility & Portability
- The web frontend shall be responsive across desktop displays (1920x1080, 1440x900), laptops (1366x768), tablets (768x1024), and mobile screens (375x812+).
- The system shall be portable across major operating systems supporting Java 17+ and Node.js 18+.

#### 5.7 Backup and Recovery
- The database subsystem shall perform automated daily incremental backups of user and trip collections.
- System recovery time objective (RTO) shall not exceed 1 hour in case of database instance failure.

#### 5.8 Integrity
- Database transactions modifying user profile data or saving trip plans must maintain strict ACID/document-level operational integrity.

---

### 6. Use Case & Data Flow Analysis

#### 6.1 Use Case Summary Table

| Use Case ID | Use Case Name | Primary Actor | Description |
| :--- | :--- | :--- | :--- |
| **UC-01** | Register Account | Guest User | User signs up using Name, Email, Password, and Mobile. |
| **UC-02** | User Authentication | Registered User | User logs in via Email/Password, OTP, or Google OAuth. |
| **UC-03** | Search Destination | Authenticated User | User enters destination and filters POIs (Attractions, Hotels, etc.). |
| **UC-04** | Generate & Optimize Route | Authenticated User | System calculates shortest path connecting selected attractions. |
| **UC-05** | Calculate Trip Budget | Authenticated User | System computes estimated cost breakdown based on travel preferences. |
| **UC-06** | Save & View Trips | Authenticated User | User saves itinerary to database and retrieves trip history later. |
| **UC-07** | Manage User Profile | Authenticated User | User updates profile info, preferences, and password. |

#### 6.2 Data Flow Diagram (DFD Level 1)

```
 [ User Client ]  ---- (1. Auth Credentials) ----> [ 1.0 Auth Subsystem ] ---- (Save User) ----> [( User DB Collection )]
 [ User Client ]  <--- (2. JWT Token Issued) ----- [ 1.0 Auth Subsystem ]
        |
        +------------- (3. Destination & Filter) -> [ 2.0 POI & Weather Engine ] -> [( Places & Weather Cache )]
        |                                                 |
        | <----------- (4. Nearby POIs & Weather) --------+
        |
        +------------- (5. Select Waypoints) -----> [ 3.0 Route & Budget Optimizer ]
        |                                                 |
        | <----------- (6. Optimized Route & Cost) -------+
        |
        +------------- (7. Save Trip Request) ----> [ 4.0 Trip Management Service ] -> [( Trips DB Collection )]
```

---

### 7. External Interface Requirements

#### 7.1 User Interface (UI)
- Modern Dark/Glassmorphism theme with cohesive color palettes (Deep Indigo `#0F172A`, Emerald Accent `#10B981`, Vivid Cyan `#06B6D4`).
- Responsive navbar with logo, search bar, navigation links, and avatar profile menu.
- Interactive tabbed planner interface (Overview, Nearby Attractions, Route Map, Budget Breakdown, Weather & Safety).

#### 7.2 Hardware Interfaces
- No direct custom hardware interfaces required beyond standard input/output devices (keyboard, mouse, touch display).

#### 7.3 Software Interfaces
- **Google Maps JavaScript & Places API**: For map rendering, geocoding, and place details.
- **OpenWeatherMap REST API**: For fetching current temperatures and weather forecasts.
- **MongoDB Java Driver (Spring Data)**: For secure database queries over TLS connection string.

---

### 8. Error Handling & Resilience

- **Invalid Credentials**: Clear inline error messages returned on login failure without leaking whether email or password was wrong.
- **Expired JWT Token**: Client interceptor automatically catches HTTP 401 Unauthorized, clears local session token, and redirects user to login.
- **Network Disconnection**: Toast notifications notify user of lost connection while preserving local trip drafting state.
- **Invalid API Payloads**: Spring Boot global `@ControllerAdvice` handles validation errors (`MethodArgumentNotValidException`) and returns standardized HTTP 400 JSON error objects.

---

### 9. Future Enhancements

- **AI-Powered Itinerary Generator**: Integration with Large Language Models (LLMs) to automatically construct multi-day travel plans based on natural language prompts.
- **Collaborative Group Trip Planning**: Real-time multi-user editing of shared trip itineraries using WebSockets.
- **Offline PWA Support**: Progressive Web Application (PWA) caching enabling travelers to access saved routes and emergency info without internet connectivity.
- **Social Trip Sharing**: Ability to publish trip reviews, photo logs, and share public links with fellow travel enthusiasts.

---

### 10. Conclusion

The proposed **Smart Trip** system fulfills all functional and non-functional requirements while providing users with an efficient, intelligent, secure, and personalized travel planning experience. The selected modern architecture—utilizing a React frontend with ESLint quality standards, a robust Spring Boot 3.x backend with embedded Apache Tomcat 10, and a flexible MongoDB database—ensures high performance, scalability, maintainability, and seamless future enhancements for academic and production environments.
