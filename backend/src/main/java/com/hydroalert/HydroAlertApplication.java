package com.hydroalert;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * HydroAlert – Real-Time Water Leakage Detection & Instant Alert System
 * Spring Boot REST Backend Application
 *
 * College Final-Year Project
 */
@SpringBootApplication
public class HydroAlertApplication {

    public static void main(String[] args) {
        SpringApplication.run(HydroAlertApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" HydroAlert Spring Boot Backend running on port 8080");
        System.out.println(" Ready to serve React + TypeScript Frontend");
        System.out.println("==========================================================");
    }
}
