#include "esp_system.h"
#include "esp_spi_flash.h"
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <Arduino.h>
#include <esp_arduino_version.h>
#include <esp_system.h>

#include "LoRaRadio.h"
#include "LoRaWeb.h"
#include "user.h"
#include "GameCommon.h"
#include "heltec_display.h"
#include "LittleFS.h"

const char* GAMEVERSION = "1.5.0";
String enqueueDebug = "";

LoRaRadio LoRa;
LoRaWeb Web(LoRa);

HeltecDisplay& Display = HeltecDisplay::instance();

void loraTask(void *param) {
  Serial.printf("[LoRaTask] Gestart op core %d\n", xPortGetCoreID());
  for(;;) {
    LoRa.loop();
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void webTask(void *param) {
  Serial.printf("[WebTask] Gestart op core %d\n", xPortGetCoreID());
  for(;;) {
    Web.loop();
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void displayTask(void *param) {
  Serial.printf("[DisplayTask] Gestart op core %d\n", xPortGetCoreID());
  for(;;) {
    Display.loop();
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("GAMEVERSION: " + String(GAMEVERSION));
  Serial.printf("Arduino-ESP32 Core version: %d.%d.%d\n",
                ESP_ARDUINO_VERSION_MAJOR,
                ESP_ARDUINO_VERSION_MINOR,
                ESP_ARDUINO_VERSION_PATCH);

  // Arduino ESP32 chip info
  Serial.printf("CPU Freq: %d MHz\n", ESP.getCpuFreqMHz());
  Serial.printf("Flash size: %dMB\n", ESP.getFlashChipSize() / (1024 * 1024));
  
  if (!LittleFS.begin(true)) {
    Serial.println("LittleFS mount failed");
    return;
  }
  Serial.println("LittleFS OK");
  // Print LittleFS disk space (ESP32 API)
  Serial.printf("LittleFS Total: %u bytes\n", LittleFS.totalBytes());
  Serial.printf("LittleFS Used: %u bytes\n", LittleFS.usedBytes());
  
  // LoRa init
  Serial.println("[DEBUG] LoRa init...");
  if (!LoRa.begin()) {
    Serial.println("LoRa init failed!");
    for(;;);
  }
  Serial.println("[DEBUG] LoRa init OK");

  // Web init
  Serial.println("[DEBUG] Web begin...");
  Web.begin(("GhostNetNode " + String(GAMEVERSION)).c_str(), "");   // AP mode
  Serial.println("[DEBUG] Web begin OK");

  // Display init
  Serial.println("[DEBUG] Display begin...");
  String ssidStr = "GhostNetNode " + String(GAMEVERSION);
  Display.begin(ssidStr.c_str());
  Serial.println("[DEBUG] Display begin OK");

  UserManager::loadUsersNVS();

  // Start FreeRTOS taken
  xTaskCreatePinnedToCore(loraTask, "LoRaTask", 8192, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(webTask, "WebTask", 8192, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(displayTask, "DisplayTask", 8192, NULL, 1, NULL, 0); // liever op core 0
}

unsigned long lastMemPrint = 0;

void loop() {
    unsigned long now = millis();
    if (now - lastMemPrint > 60000) { // elke minuut
        Serial.print("Free heap: ");
        Serial.println(ESP.getFreeHeap());
        lastMemPrint = now;
    }
    // niets nodig, taken draaien onder FreeRTOS
}
