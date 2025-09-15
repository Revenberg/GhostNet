
#pragma once
#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include "LoRaRadio.h"
#include "User.h"



class LoRaWeb
{
public:
  LoRaWeb(LoRaRadio &radio);
  void begin(const char *ssid, const char *password);
  void loop();

  // LoRa helpers
  void loraSendTable();

  // HTML helpers
  String neighbourTableHtml();
  String messageLogHtml();
  String userListHtml();
  String rootHTML(String session);

  // Cookie/session helpers
  String getSessionToken(AsyncWebServerRequest *request);
  bool requireLogin(AsyncWebServerRequest *request);
  String getCookie(AsyncWebServerRequest *request, const String &name);

  // AsyncWebServer handlers
  void handleRoot(AsyncWebServerRequest *request);
  void handleSetCookie(AsyncWebServerRequest *request);
  void handleClearCookie(AsyncWebServerRequest *request);
  void handleSendTable(AsyncWebServerRequest *request);
  void handleSendMsg(AsyncWebServerRequest *request);

private:
  LoRaRadio &radio;
  AsyncWebServer server;
  UserManager userManager;
};
