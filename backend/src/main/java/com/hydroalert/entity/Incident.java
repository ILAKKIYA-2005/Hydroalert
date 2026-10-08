package com.hydroalert.entity;

import com.hydroalert.model.IncidentStatus;
import jakarta.persistence.*;

/**
 * JPA Entity representing a water leakage incident stored in MySQL 'incidents' table.
 */
@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(nullable = false)
    private double flowRate;

    @Column(nullable = false, length = 50)
    private String detectionTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private IncidentStatus status;

    @Column(length = 50)
    private String acknowledgementTime;

    @Column(length = 50)
    private String resolutionTime;

    @Column(length = 255)
    private String notes;

    public Incident() {
        this.status = IncidentStatus.ACTIVE;
    }

    public Incident(String location, double flowRate, String detectionTime) {
        this.location = location;
        this.flowRate = flowRate;
        this.detectionTime = detectionTime;
        this.status = IncidentStatus.ACTIVE;
        this.notes = "Flow rate breached 8.0 L/min threshold. Possible Leakage detected.";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public double getFlowRate() {
        return flowRate;
    }

    public void setFlowRate(double flowRate) {
        this.flowRate = flowRate;
    }

    public String getDetectionTime() {
        return detectionTime;
    }

    public void setDetectionTime(String detectionTime) {
        this.detectionTime = detectionTime;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public String getAcknowledgementTime() {
        return acknowledgementTime;
    }

    public void setAcknowledgementTime(String acknowledgementTime) {
        this.acknowledgementTime = acknowledgementTime;
    }

    public String getResolutionTime() {
        return resolutionTime;
    }

    public void setResolutionTime(String resolutionTime) {
        this.resolutionTime = resolutionTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
