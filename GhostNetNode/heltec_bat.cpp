#include "heltec_bat.h"

// Heltec V3 battery ADC pin
#define BAT_ADC 13

/**
 * @brief Singleton accessor for HeltecBat.
 * @return Reference to the singleton instance.
 */
HeltecBat& HeltecBat::instance() {
    static HeltecBat instance;
    instance.updateBatteryCache();
    return instance;
}

/**
 * @brief Constructor for HeltecBat.
 * Initializes cached values.
 */
HeltecBat::HeltecBat()
    : cachedVoltage(0.0f), cachedPercent(0), lastUpdate(0) {}

/**
 * @brief Reads the battery voltage from the ADC pin.
 * @return Battery voltage in Volts.
 */
float HeltecBat::readBatteryVoltage() {
    int rawAdcValue = analogRead(BAT_ADC);
    // ESP32 ADC is 12-bit (0–4095), Vref = 3.3V, voltage divider factor 2.0
    float voltage = ((float)rawAdcValue / 4095.0f) * 2.0f * 3.3f;
    return voltage;
}

/**
 * @brief Converts a voltage value to battery percentage.
 * @param voltage Voltage in Volts.
 * @return Battery percentage (0–100).
 */
int HeltecBat::batteryPercent(float voltage) {
    // Simple mapping: 3.3V = 0%, 4.2V = 100%
    if (voltage < 3.3f) return 0;
    if (voltage > 4.2f) return 100;
    return static_cast<int>(((voltage - 3.3f) / (4.2f - 3.3f)) * 100.0f);
}

/**
 * @brief Updates the cached battery values if the interval has passed.
 *        Uses BATTERY_UPDATE_INTERVAL to avoid frequent ADC reads.
 */
void HeltecBat::updateBatteryCache() {
    unsigned long currentMillis = millis();
    if (currentMillis - lastUpdate > BATTERY_UPDATE_INTERVAL || lastUpdate == 0) {
        cachedVoltage = readBatteryVoltage();
        cachedPercent = batteryPercent(cachedVoltage);
        lastUpdate = currentMillis;
    }
}

/**
 * @brief Gets the cached battery voltage.
 * @return Cached voltage in Volts.
 */
float HeltecBat::getCachedBatteryVoltage() const {
    return cachedVoltage;
}

/**
 * @brief Gets the cached battery percentage.
 * @return Cached percentage (0–100).
 */
int HeltecBat::getCachedBatteryPercent() const {
    return cachedPercent;
}

// Private members:
// float cachedVoltage: Last measured battery voltage.
// int cachedPercent: Last calculated battery percentage.
// unsigned long lastUpdate: Timestamp of last cache update.