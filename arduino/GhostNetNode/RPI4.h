#pragma once
#include <Arduino.h>
#include <map>
#include "LoRaRadio.h"

class RPI4 {
public:
    static void sendToRPI4(const String& msg);
    static void sendLoRaMessage(const ReceivedMessage& msg);
    static void sendNeighbourInfo(const std::map<String, NeighbourInfo>& neighbours);
    static void sendStartInfo(const String& nodeName, const String& version);
    static void sendWiFiInfo(const String& ssid, const String& password);
};
