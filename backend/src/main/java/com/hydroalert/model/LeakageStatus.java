package com.hydroalert.model;

/**
 * Water flow evaluation status based on 8.0 L/min threshold:
 * - Flow rate < 8.0 L/min  -> NORMAL
 * - Flow rate >= 8.0 L/min -> POSSIBLE_LEAKAGE
 */
public enum LeakageStatus {
    NORMAL("Normal"),
    POSSIBLE_LEAKAGE("Possible Leakage");

    private final String displayName;

    LeakageStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
