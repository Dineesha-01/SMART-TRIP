package com.smarttrip.repository;

import com.smarttrip.model.Place;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceRepository extends MongoRepository<Place, String> {
    List<Place> findByDestination(String destination);
    List<Place> findByDestinationAndCategory(String destination, String category);
}
