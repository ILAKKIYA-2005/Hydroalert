package com.hydroalert.model;

/**
 * Strict incident lifecycle status enum:
 * ACTIVE -> ACKNOWLEDGED -> RESOLVED
 */
public enum IncidentStatus {
    ACTIVE,
    ACKNOWLEDGED,
    RESOLVED
}
