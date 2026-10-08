package com.hydroalert.repository;

import com.hydroalert.entity.WaterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for WaterReading entity.
 */
@Repository
public interface WaterReadingRepository extends JpaRepository<WaterReading, Long> {

    /**
     * Find latest water reading for a specific location.
     */
    Optional<WaterReading> findFirstByLocationOrderByIdDesc(String location);

    /**
     * Find recent readings for a specific location.
     */
    List<WaterReading> findTop10ByLocationOrderByIdDesc(String location);

    /**
     * Find latest readings across all locations.
     */
    List<WaterReading> findTop20ByOrderByIdDesc();
}
