package com.smarttrip.config;

import com.smarttrip.model.Place;
import com.smarttrip.model.Trip;
import com.smarttrip.model.User;
import com.smarttrip.repository.PlaceRepository;
import com.smarttrip.repository.TripRepository;
import com.smarttrip.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking MongoDB collections and seeding initial data...");
            seedUsers();
            seedPlaces();
            seedTrips();
            log.info("MongoDB database seeding complete!");
        } catch (Exception e) {
            log.warn("MongoDB connection warning during seeding: {}. App will fallback to runtime mock memory store.", e.getMessage());
        }
    }

    private void seedUsers() {
        // Seed Super Admin if missing
        if (!userRepository.findByEmail("smarttrip@gmail.com").isPresent()) {
            User superAdmin = User.builder()
                    .id("usr_super_admin_001")
                    .name("Super Admin")
                    .username("superadmin")
                    .email("smarttrip@gmail.com")
                    .password(passwordEncoder.encode("Smarttrip@1234"))
                    .secretPin("1234")
                    .phone("+91 99999 00000")
                    .homeCity("New Delhi, India")
                    .role("ROLE_SUPER_ADMIN")
                    .authProvider("LOCAL")
                    .travelPreferences(Arrays.asList("Management", "System Controls", "Analytics"))
                    .build();

            userRepository.save(superAdmin);
            log.info("Seeded Super Admin user into MongoDB: smarttrip@gmail.com (ROLE_SUPER_ADMIN)");
        }

        // Seed Employee Admin if missing
        if (!userRepository.findByEmail("admin@smarttrip.com").isPresent()) {
            User adminEmployee = User.builder()
                    .id("usr_admin_002")
                    .name("Admin Employee")
                    .username("adminemployee")
                    .email("admin@smarttrip.com")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .secretPin("1234")
                    .phone("+91 88888 11111")
                    .homeCity("Mumbai, India")
                    .role("ROLE_ADMIN")
                    .authProvider("LOCAL")
                    .travelPreferences(Arrays.asList("Destinations", "Customer Support"))
                    .build();

            userRepository.save(adminEmployee);
            log.info("Seeded Employee Admin user into MongoDB: admin@smarttrip.com (ROLE_ADMIN)");
        }

        // Seed Traveller Demo if missing
        if (userRepository.count() == 0 || !userRepository.findByEmail("alex@example.com").isPresent()) {
            User demoUser = User.builder()
                    .id("usr_demo_123")
                    .name("Alex Johnson")
                    .username("alexjohnson")
                    .email("alex@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .secretPin("1234")
                    .phone("+1 (555) 234-5678")
                    .homeCity("San Francisco")
                    .role("ROLE_TRAVELLER")
                    .authProvider("LOCAL")
                    .travelPreferences(Arrays.asList("Cultural", "Sightseeing", "Foodie"))
                    .build();

            userRepository.save(demoUser);
            log.info("Seeded Traveller user into MongoDB: alex@example.com (ROLE_TRAVELLER)");
        }
    }

    private void seedPlaces() {
        if (placeRepository.count() == 0) {
            List<Place> initialPlaces = Arrays.asList(
                // Jaipur Real Places
                Place.builder().id("jp_1").name("Hawa Mahal (Palace of Winds)").category("Attraction").destination("Jaipur")
                    .address("Hawa Mahal Rd, Badi Choupad, Pink City, Jaipur, Rajasthan 302002")
                    .latitude(26.9239).longitude(75.8267).rating(4.8).userRatingsTotal(34500).priceLevel("₹200 entry")
                    .imageUrl("https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 261 8862").build(),

                Place.builder().id("jp_2").name("Amber Fort & Palace (Amer Fort)").category("Attraction").destination("Jaipur")
                    .address("Devisinghpura, Amer, Jaipur, Rajasthan 302028")
                    .latitude(26.9855).longitude(75.8513).rating(4.9).userRatingsTotal(42100).priceLevel("₹500 entry")
                    .imageUrl("https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 253 0293").build(),

                Place.builder().id("jp_3").name("City Palace & Maharaja Museum").category("Attraction").destination("Jaipur")
                    .address("Gangori Bazaar, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002")
                    .latitude(26.9258).longitude(75.8237).rating(4.7).userRatingsTotal(28900).priceLevel("₹300 entry")
                    .imageUrl("https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 400 5217").build(),

                Place.builder().id("jp_4").name("Rambagh Palace Luxury Resort").category("Hotel").destination("Jaipur")
                    .address("Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005")
                    .latitude(26.8981).longitude(75.8080).rating(4.9).userRatingsTotal(3800).priceLevel("₹28,000 / night")
                    .bookingLink("https://www.booking.com/searchresults.html?ss=Jaipur")
                    .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 238 5700").build(),

                Place.builder().id("jp_5").name("Chokhi Dhani Rajasthani Village Restaurant").category("Restaurant").destination("Jaipur")
                    .address("12 Miles, Tonk Rd, Sitapura, Jaipur, Rajasthan 303905")
                    .latitude(26.7690).longitude(75.8291).rating(4.8).userRatingsTotal(14500).priceLevel("₹1,200 / person")
                    .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 516 5000").build(),

                // Agra Real Places
                Place.builder().id("ag_1").name("Taj Mahal").category("Attraction").destination("Agra")
                    .address("Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001")
                    .latitude(27.1751).longitude(78.0421).rating(4.9).userRatingsTotal(125000).priceLevel("₹1,100 entry")
                    .imageUrl("https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 562 222 6431").build(),

                // Paris Real Places
                Place.builder().id("p1").name("Louvre Museum & Glass Pyramid").category("Attraction").destination("Paris")
                    .address("Rue de Rivoli, 75001 Paris, France")
                    .latitude(48.8606).longitude(2.3376).rating(4.9).userRatingsTotal(24500).priceLevel("€17 entry")
                    .imageUrl("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+33 1 40 20 50 50").build(),

                Place.builder().id("p2").name("Eiffel Tower & Champ de Mars").category("Attraction").destination("Paris")
                    .address("Champ de Mars, 5 Av. Anatole France, 75007 Paris")
                    .latitude(48.8584).longitude(2.2945).rating(4.8).userRatingsTotal(32000).priceLevel("€25 entry")
                    .imageUrl("https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+33 8 92 70 12 39").build()
            );

            placeRepository.saveAll(initialPlaces);
            log.info("Seeded {} place records into MongoDB places collection", initialPlaces.size());
        }
    }

    private void seedTrips() {
        if (tripRepository.count() == 0) {
            Trip demoTrip = Trip.builder()
                    .id("t1")
                    .userId("usr_demo_123")
                    .destination("Paris")
                    .title("3-Day Paris Cultural Expedition")
                    .startDate("2026-08-10")
                    .endDate("2026-08-13")
                    .durationDays(3)
                    .totalBudget(1400.0)
                    .estimatedCost(1160.0)
                    .travelStyle("Standard")
                    .status("PLANNED")
                    .selectedPlaces(Collections.emptyList())
                    .build();

            tripRepository.save(demoTrip);
            log.info("Seeded initial trip itinerary into MongoDB trips collection");
        }
    }
}
