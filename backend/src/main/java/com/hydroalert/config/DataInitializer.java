package com.hydroalert.config;

import com.hydroalert.entity.Incident;
import com.hydroalert.entity.User;
import com.hydroalert.entity.WaterReading;
import com.hydroalert.model.IncidentStatus;
import com.hydroalert.model.LeakageStatus;
import com.hydroalert.repository.IncidentRepository;
import com.hydroalert.repository.UserRepository;
import com.hydroalert.repository.WaterReadingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Seeds initial demo data into MySQL tables when the database is first created.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final WaterReadingRepository waterReadingRepository;
    private final IncidentRepository incidentRepository;
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

    public DataInitializer(UserRepository userRepository,
                           WaterReadingRepository waterReadingRepository,
                           IncidentRepository incidentRepository) {
        this.userRepository = userRepository;
        this.waterReadingRepository = waterReadingRepository;
        this.incidentRepository = incidentRepository;
    }

    @Override
    public void run(String... args) {
        String nowTime = LocalDateTime.now().format(timeFormatter);

        // 1. Seed Default Users if table is empty
        if (userRepository.count() == 0) {
            userRepository.save(new User("operator", "operator123"));
            userRepository.save(new User("admin", "admin123"));
            userRepository.save(new User("supervisor", "supervisor123"));
            log.info("Initialized default users in MySQL 'users' table.");
        }

        // 2. Seed Baseline Water Readings if table is empty
        if (waterReadingRepository.count() == 0) {
            waterReadingRepository.save(new WaterReading("Block A - 1st Floor", 3.0, nowTime, LeakageStatus.NORMAL.getDisplayName()));
            waterReadingRepository.save(new WaterReading("Block B - 2nd Floor", 8.5, nowTime, LeakageStatus.POSSIBLE_LEAKAGE.getDisplayName()));
            waterReadingRepository.save(new WaterReading("Block C - Ground Floor", 2.5, nowTime, LeakageStatus.NORMAL.getDisplayName()));
            log.info("Initialized baseline water readings in MySQL 'water_readings' table.");
        }

        // 3. Seed Initial Incidents if table is empty
        if (incidentRepository.count() == 0) {
            // Seed Active incident for Block B
            Incident activeInc = new Incident("Block B - 2nd Floor", 8.5, nowTime);
            activeInc.setStatus(IncidentStatus.ACTIVE);
            activeInc.setNotes("Flow rate breached 8.0 L/min threshold. Possible Leakage detected.");
            incidentRepository.save(activeInc);

            // Seed Resolved history incident for Block A
            Incident resolvedInc = new Incident("Block A - 1st Floor", 9.5, "04:30 PM");
            resolvedInc.setAcknowledgementTime("04:33 PM");
            resolvedInc.setResolutionTime("05:15 PM");
            resolvedInc.setStatus(IncidentStatus.RESOLVED);
            resolvedInc.setNotes("Joint seal replaced. Flow stabilized below 8.0 L/min.");
            incidentRepository.save(resolvedInc);

            log.info("Initialized initial incidents in MySQL 'incidents' table.");
        }
    }
}
