#include "RPI4.h"
#include <Arduino.h>

void RPI4::sendToRPI4(const String& msg) {
    Serial.println("[RPI4] " + msg);
}

void RPI4::sendLoRaMessage(const ReceivedMessage& msg) {
    String out = "[RPI4] LORA: [" + String(msg.timestamp) + "] " + msg.sender + ": " + msg.content + " (RSSI=" + String(msg.rssi, 1) + ", SNR=" + String(msg.snr, 1) + ")";
    Serial.println(out);
}

void RPI4::sendNeighbourInfo(const std::map<String, NeighbourInfo>& neighbours) {
    String out = "[RPI4 LORA] Neighbours:\n";
    for (const auto& kv : neighbours) {
        unsigned long age = (millis() - kv.second.lastSeen) / 1000;
        out += "Node: " + kv.first + " | Laatst: " + String(age) + "s | RSSI: " + String(kv.second.rssi, 1) + " | SNR: " + String(kv.second.snr, 1) + "\n";
    }
    Serial.print(out);
}

void RPI4::sendStartInfo(const String& nodeName, const String& version) {
    Serial.println("[RPI4 Start] Node: " + nodeName + ", Version: " + version);
}

void RPI4::sendWiFiInfo(const String& ssid, const String& password) {
    Serial.println("[RPI4 WIFI] SSID: " + ssid + ", Password: " + password);
}
