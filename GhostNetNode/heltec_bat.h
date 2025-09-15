#pragma once
#include <Arduino.h>

/**
 * @file heltec_bat.h
 * @brief Battery measurement and caching for Heltec ESP32 boards.
 */

class HeltecBat {
public:
    // Singleton accessor
    static HeltecBat& instance();

    // Update battery cache if needed
    void updateBatteryCache();

    // Get cached voltage and percent
    float getCachedBatteryVoltage() const;
    int getCachedBatteryPercent() const;

private:
    HeltecBat();
    HeltecBat(const HeltecBat&) = delete;
    HeltecBat& operator=(const HeltecBat&) = delete;

    float readBatteryVoltage();
    int batteryPercent(float v);

    // Cached values
    float cachedVoltage = 0.0;
    int cachedPercent = 0;
    unsigned long lastUpdate = 0;
    static constexpr unsigned long BATTERY_UPDATE_INTERVAL = 5UL * 60UL * 1000UL; // 5 min
};
