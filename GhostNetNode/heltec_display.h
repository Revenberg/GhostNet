#pragma once
#include <SSD1306Wire.h>
#include <OLEDDisplayUi.h>

/**
 * @file heltec_display.h
 * @brief HeltecDisplay class for managing OLED display and UI frames.
 *
 * This class encapsulates all display logic, frame callbacks, and overlay handling.
 * Use HeltecDisplay::instance() to access the singleton instance.
 */

#define SDA_OLED GPIO_NUM_17
#define SCL_OLED GPIO_NUM_18
#define RST_OLED GPIO_NUM_21
#define VEXT     GPIO_NUM_36

class HeltecDisplay {
public:
    static HeltecDisplay& instance();

    void begin(const char *ssid);

    // Setup and update
    void loop();

    // Overlay callback
    void overlay(OLEDDisplay *display, OLEDDisplayUiState* state);

    // Frame array
    FrameCallback* getFrames();
    size_t getFrameCount() const;

    // Last LoRa message
    void setLastLoRaMsg(const String& msg);
    const String& getLastLoRaMsg() const;

    static String ssid;

private:
    HeltecDisplay();
    HeltecDisplay(const HeltecDisplay&) = delete;
    HeltecDisplay& operator=(const HeltecDisplay&) = delete;

    SSD1306Wire display;
    OLEDDisplayUi ui;
    String lastLoRaMsg;
    FrameCallback frames[5];
};

// Frame and overlay callbacks as free/static functions
void frame1(OLEDDisplay *display, OLEDDisplayUiState* state, int16_t x, int16_t y);
void frame2(OLEDDisplay *display, OLEDDisplayUiState* state, int16_t x, int16_t y);
void frame3(OLEDDisplay *display, OLEDDisplayUiState* state, int16_t x, int16_t y);
void frame4(OLEDDisplay *display, OLEDDisplayUiState* state, int16_t x, int16_t y);
void frameNodeName(OLEDDisplay *display, OLEDDisplayUiState* state, int16_t x, int16_t y);
void overlay_static(OLEDDisplay *display, OLEDDisplayUiState* state);
