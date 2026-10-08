package com.hydroalert.repository;

import com.hydroalert.entity.Incident;
import com.hydroalert.model.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Incident entity.
 */
@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    /**
     * Find incidents by status (e.g. RESOLVED for history).
     */
    List<Incident> findByStatusOrderByIdDesc(IncidentStatus status);

    /**
     * Find incidents by multiple statuses (e.g. ACTIVE and ACKNOWLEDGED for active queue).
     */
    List<Incident> findByStatusInOrderByIdDesc(List<IncidentStatus> statuses);

    /**
     * Check if an active/acknowledged incident already exists for a specific location.
     */
    Optional<Incident> findFirstByLocationAndStatusIn(String location, List<IncidentStatus> statuses);
}
