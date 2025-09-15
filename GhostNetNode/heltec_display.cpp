#include <Wire.h>
#include "heltec_display.h"
#include <WiFi.h>
#include "LoRaRadio.h"
#include "heltec_bat.h"
#include "GameCommon.h"

// Heltec V3 OLED pinnen
#define SDA_OLED 17
#define SCL_OLED 18
#define RST_OLED 21
#define VEXT 36 // Power pin for OLED

HeltecBat &battery = HeltecBat::instance();

String HeltecDisplay::ssid = "";

//SSD1306Wire display(0x3c, SDA_OLED, SCL_OLED, GEOMETRY_128_64);
//OLEDDisplayUi ui(&display);

HeltecDisplay& HeltecDisplay::instance() {
    static HeltecDisplay inst;
    return inst;
}

HeltecDisplay::HeltecDisplay() : display(0x3c, SDA_OLED, SCL_OLED, GEOMETRY_128_64), ui(&display) {
  // ✅ OLED aanzetten via VEXT (op Heltec V3 is HIGH = aan)
  pinMode(VEXT, OUTPUT);
  digitalWrite(VEXT, LOW);
  delay(50);

  pinMode(RST_OLED, OUTPUT);
  digitalWrite(RST_OLED, LOW);
  delay(20);
  digitalWrite(RST_OLED, HIGH);

  // ✅ I2C starten
  Wire.begin(SDA_OLED, SCL_OLED);
  Serial.println(SDA_OLED);
  Serial.println(SCL_OLED);
}

void HeltecDisplay::begin(const char *ssid) {
    Serial.begin(115200);
  while (!Serial)
    ;

  // ✅ Display initialiseren
  HeltecDisplay::display.init();
  HeltecDisplay::display.flipScreenVertically();
  HeltecDisplay::display.setContrast(255);

  // Frame callbacks
   frames[0] = frame1;
   frames[1] = frame2;
   frames[2] = frame3;
   frames[3] = frame4;
   frames[4] = frameNodeName;
   ui.setTargetFPS(30);
   ui.setFrames(frames, 5);
   ui.setOverlays(new OverlayCallback[1]{overlay_static}, 1);
   ui.init();

  // ✅ Welkomstscherm
  HeltecDisplay::display.clear();
  HeltecDisplay::display.setFont(ArialMT_Plain_16);
  HeltecDisplay::display.display();

  Serial.println("[HeltecDisplay] begin met SSID: " + String(ssid));
  HeltecDisplay::ssid = (char *)ssid;
}

// Frame and overlay callbacks as free/static functions
void frame1(OLEDDisplay *display, OLEDDisplayUiState *state, int16_t x, int16_t y) {
  display->setFont(ArialMT_Plain_16);
  display->drawString(x, y, String(HeltecDisplay::ssid));
}

void frame2(OLEDDisplay *display, OLEDDisplayUiState *state, int16_t x, int16_t y) {
  display->setFont(ArialMT_Plain_16);
  int bat = battery.getCachedBatteryPercent();
  display->drawString(x, y, "Batterij: " + String(bat, 1) + "%");
}

void frame3(OLEDDisplay *display, OLEDDisplayUiState *state, int16_t x, int16_t y) {
  display->setFont(ArialMT_Plain_16);
  auto &neighbours = LoRaRadio::getNeighbours();
  display->drawString(x, y, "Nodes: " + String(neighbours.size()));
}

void frame4(OLEDDisplay *display, OLEDDisplayUiState *state, int16_t x, int16_t y) {
  display->setFont(ArialMT_Plain_16);
  display->drawString(x, y, "Versie:");
  display->drawString(x, y + 16, String(GAMEVERSION));
}

void frameNodeName(OLEDDisplay *display, OLEDDisplayUiState *state, int16_t x, int16_t y) {
    display->setFont(ArialMT_Plain_16);
    display->drawString(x, y, "Node Name:");
    extern LoRaRadio LoRa;
    display->drawString(x, y + 16, LoRa.getNodeName());
}

void overlay_static(OLEDDisplay *display, OLEDDisplayUiState *state) {}

void HeltecDisplay::overlay(OLEDDisplay *display, OLEDDisplayUiState *state) {
  int bat = battery.getCachedBatteryPercent();
  display->setFont(ArialMT_Plain_10);
  display->drawString(100, 32, String(bat) + "%");
}

void HeltecDisplay::loop() {
  ui.update();
}

