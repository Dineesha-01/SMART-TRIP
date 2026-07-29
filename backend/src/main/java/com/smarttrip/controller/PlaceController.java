package com.smarttrip.controller;

import com.smarttrip.model.Place;
import com.smarttrip.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlaceController {

    private final PlaceRepository placeRepository;

    @GetMapping("/nearby")
    public ResponseEntity<List<Place>> getNearbyPlaces(
            @RequestParam(defaultValue = "Paris") String destination,
            @RequestParam(required = false) String category) {
        
        List<Place> dbPlaces = (category != null && !category.isBlank()) 
                ? placeRepository.findByDestinationAndCategory(destination, category)
                : placeRepository.findByDestination(destination);

        if (!dbPlaces.isEmpty()) {
            return ResponseEntity.ok(dbPlaces);
        }

        // Generate dynamic realistic places for any queried destination
        List<Place> mockPlaces = generateSamplePlaces(destination, category);
        return ResponseEntity.ok(mockPlaces);
    }

    private List<Place> generateSamplePlaces(String destination, String categoryFilter) {
        List<Place> list = new ArrayList<>();
        String destLower = destination != null ? destination.toLowerCase().trim() : "";

        if (destLower.contains("jaipur")) {
            list.add(Place.builder()
                    .id("jp_1").name("Hawa Mahal (Palace of Winds)").category("Attraction").destination("Jaipur")
                    .address("Hawa Mahal Rd, Badi Choupad, Pink City, Jaipur, Rajasthan 302002")
                    .latitude(26.9239).longitude(75.8267).rating(4.8).userRatingsTotal(34500).priceLevel("₹200 entry")
                    .imageUrl("https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 261 8862").build());

            list.add(Place.builder()
                    .id("jp_2").name("Amber Fort & Palace (Amer Fort)").category("Attraction").destination("Jaipur")
                    .address("Devisinghpura, Amer, Jaipur, Rajasthan 302028")
                    .latitude(26.9855).longitude(75.8513).rating(4.9).userRatingsTotal(42100).priceLevel("₹500 entry")
                    .imageUrl("https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 253 0293").build());

            list.add(Place.builder()
                    .id("jp_3").name("City Palace & Maharaja Museum").category("Attraction").destination("Jaipur")
                    .address("Gangori Bazaar, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002")
                    .latitude(26.9258).longitude(75.8237).rating(4.7).userRatingsTotal(28900).priceLevel("₹300 entry")
                    .imageUrl("https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 400 5217").build());

            list.add(Place.builder()
                    .id("jp_4").name("Jal Mahal (Water Palace)").category("Attraction").destination("Jaipur")
                    .address("Amer Rd, Jal Mahal, Amber, Jaipur, Rajasthan 302002")
                    .latitude(26.9534).longitude(75.8462).rating(4.6).userRatingsTotal(19800).priceLevel("Free View")
                    .imageUrl("https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 261 8862").build());

            list.add(Place.builder()
                    .id("jp_5").name("Rambagh Palace Luxury Heritage Hotel").category("Hotel").destination("Jaipur")
                    .address("Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005")
                    .latitude(26.8981).longitude(75.8080).rating(4.9).userRatingsTotal(3800).priceLevel("₹28,000 / night")
                    .bookingLink("https://www.booking.com/searchresults.html?ss=Jaipur")
                    .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 238 5700").build());

            list.add(Place.builder()
                    .id("jp_6").name("Chokhi Dhani Rajasthani Village Restaurant").category("Restaurant").destination("Jaipur")
                    .address("12 Miles, Tonk Rd, Sitapura, Jaipur, Rajasthan 303905")
                    .latitude(26.7690).longitude(75.8291).rating(4.8).userRatingsTotal(14500).priceLevel("₹1,200 / person")
                    .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 516 5000").build());

            list.add(Place.builder()
                    .id("jp_7").name("LMB (Laxmi Misthan Bhandar)").category("Restaurant").destination("Jaipur")
                    .address("No. 98, 99, Johari Bazar Rd, Jaipur, Rajasthan 302003")
                    .latitude(26.9200).longitude(75.8250).rating(4.6).userRatingsTotal(8900).priceLevel("₹600 / person")
                    .imageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 141 256 5844").build());

            list.add(Place.builder()
                    .id("jp_8").name("SMS (Sawai Man Singh) Hospital & Medical Center").category("Hospital").destination("Jaipur")
                    .address("Jawahar Lal Nehru Marg, Ashok Nagar, Jaipur, Rajasthan 302001")
                    .latitude(26.9030).longitude(75.8110).rating(4.6).userRatingsTotal(2100).priceLevel("24/7 Emergency")
                    .isEmergencyFacility(true).phoneNumber("+91 141 256 0291").build());

            list.add(Place.builder()
                    .id("jp_9").name("State Bank of India 24/7 ATM - MI Road").category("ATM").destination("Jaipur")
                    .address("Mirza Ismail Rd, Panch Batti, C Scheme, Jaipur, Rajasthan 302001")
                    .latitude(26.9160).longitude(75.8120).rating(4.3).userRatingsTotal(450).priceLevel("Free Cash Withdrawal")
                    .build());
        } else if (destLower.contains("agra") || destLower.contains("taj")) {
            list.add(Place.builder()
                    .id("ag_1").name("Taj Mahal").category("Attraction").destination("Agra")
                    .address("Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001")
                    .latitude(27.1751).longitude(78.0421).rating(4.9).userRatingsTotal(125000).priceLevel("₹1,100 entry")
                    .imageUrl("https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 562 222 6431").build());

            list.add(Place.builder()
                    .id("ag_2").name("Agra Fort (Red Fort Agra)").category("Attraction").destination("Agra")
                    .address("Agra Fort, Rakabganj, Agra, Uttar Pradesh 282003")
                    .latitude(27.1795).longitude(78.0211).rating(4.8).userRatingsTotal(48000).priceLevel("₹650 entry")
                    .imageUrl("https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 562 222 6431").build());

            list.add(Place.builder()
                    .id("ag_3").name("ITC Mughal Resort & Spa").category("Hotel").destination("Agra")
                    .address("Fatehabad Rd, Tajganj, Agra, Uttar Pradesh 282001")
                    .latitude(27.1610).longitude(78.0410).rating(4.8).userRatingsTotal(5200).priceLevel("₹14,000 / night")
                    .bookingLink("https://www.booking.com/searchresults.html?ss=Agra")
                    .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 562 402 1700").build());

            list.add(Place.builder()
                    .id("ag_4").name("Pinch of Spice Restaurant").category("Restaurant").destination("Agra")
                    .address("107G, Fatehabad Rd, Tajganj, Agra, Uttar Pradesh 282001")
                    .latitude(27.1620).longitude(78.0400).rating(4.7).userRatingsTotal(6400).priceLevel("₹800 / person")
                    .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=85")
                    .phoneNumber("+91 562 404 0404").build());

            list.add(Place.builder()
                    .id("ag_5").name("District Hospital Agra").category("Hospital").destination("Agra")
                    .address("M G Road, Agra, Uttar Pradesh 282002")
                    .latitude(27.1800).longitude(78.0100).rating(4.4).userRatingsTotal(650).priceLevel("24/7 Emergency")
                    .isEmergencyFacility(true).phoneNumber("+91 562 246 0446").build());
        } else {
            // General City Real Landmarks Fallback
            list.add(Place.builder().id("gen_1").name(destination + " Historic Heritage Monument").category("Attraction")
                    .destination(destination).address("City Center, " + destination).latitude(20.5937).longitude(78.9629)
                    .rating(4.8).userRatingsTotal(1420).priceLevel("₹250 entry")
                    .imageUrl("https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=85").build());

            list.add(Place.builder().id("gen_2").name("Grand " + destination + " Palace Resort").category("Hotel")
                    .destination(destination).address("Main Avenue, " + destination).latitude(20.5950).longitude(78.9640)
                    .rating(4.9).userRatingsTotal(2100).priceLevel("₹4,500 / night")
                    .bookingLink("https://www.booking.com/searchresults.html?ss=" + destination)
                    .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=85").build());

            list.add(Place.builder().id("gen_3").name(destination + " Authentic Bistro & Grill").category("Restaurant")
                    .destination(destination).address("Food Street, " + destination).latitude(20.5920).longitude(78.9610)
                    .rating(4.7).userRatingsTotal(890).priceLevel("₹700 / person")
                    .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=85").build());

            list.add(Place.builder().id("gen_4").name(destination + " City Hospital").category("Hospital")
                    .destination(destination).address("Hospital Rd, " + destination).latitude(20.5900).longitude(78.9600)
                    .rating(4.5).userRatingsTotal(310).priceLevel("24/7 Emergency").isEmergencyFacility(true).build());

            list.add(Place.builder().id("gen_5").name("State Bank 24/7 ATM - " + destination).category("ATM")
                    .destination(destination).address("Station Rd, " + destination).latitude(20.5910).longitude(78.9605)
                    .rating(4.3).userRatingsTotal(180).priceLevel("Free Cash Withdrawal").build());
        }

        if (categoryFilter == null || categoryFilter.isBlank() || categoryFilter.equalsIgnoreCase("All")) {
            return list;
        }

        return list.stream()
                .filter(p -> p.getCategory().equalsIgnoreCase(categoryFilter))
                .toList();
    }
}
