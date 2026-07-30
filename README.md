# SMART-TRIP

SMART-TRIP is a full-stack travel planning platform that helps users discover places, build itineraries, estimate budgets, and save trips. The app includes a React + Vite frontend, a Spring Boot backend, and MongoDB-backed persistence.

## Features
- Travel planning dashboard with destination-based search
- Interactive map and nearby place discovery
- Selected places management and trip saving
- Budget estimation and route planning
- Admin and traveler authentication flows
- MongoDB-backed trip and user data persistence

## Tech Stack
- Frontend: React, Vite, JavaScript
- Backend: Java 17, Spring Boot 3, Spring Security, JWT
- Database: MongoDB
- APIs: Google Places / Foursquare / Groq-based place discovery

## Project Structure
- frontend/: React application
- backend/: Spring Boot backend service
- data/: sample data and local database assets
- help.txt: local run guide

## Prerequisites
Install the following before running the project:
- Node.js 18+ and npm
- Java 17+
- MongoDB (or use the embedded fallback behavior configured in the backend)

## Run the Frontend
1. Open a terminal and go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser at:
   ```text
   http://localhost:5173
   ```

## Run the Backend
1. Open a second terminal and go to the backend folder:
   ```bash
   cd backend
   ```
2. Run the Spring Boot app:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
   If you are using Git Bash or a Unix shell, use:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The backend will run at:
   ```text
   http://localhost:8080
   ```

## Database
The backend is configured to connect to MongoDB at:
```text
mongodb://localhost:27017/smarttrip_db
```

If MongoDB is not running, the backend can fall back to an embedded in-memory MongoDB server during local development, but a real MongoDB instance is recommended for full functionality.

## Default Login Credentials
- Super Admin: smarttrip@gmail.com / Smarttrip@1234
- Admin: admin@smarttrip.com / Admin@1234
- Traveler: alex@example.com / password123

## Useful Commands
- Frontend build:
  ```bash
  cd frontend
  npm run build
  ```
- Backend compile check:
  ```bash
  cd backend
  .\mvnw.cmd -q -DskipTests compile
  ```

## Notes
- The app uses browser local storage for selected places persistence and syncs to the backend when you save a trip.
- If port 8080 is already occupied, stop the other process or change the server port in the backend configuration.

## GitHub Remote
This repository is configured to push to:
```text
https://github.com/Likhitha-chittiboina/SMART-TRIP.git
```
