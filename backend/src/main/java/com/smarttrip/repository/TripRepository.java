package com.smarttrip.repository;

import com.smarttrip.model.Trip;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends MongoRepository<Trip, String> {
    List<Trip> findByUserId(String userId);
}
