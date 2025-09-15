// --- AsyncWebServer migration ---
#include "LoRaWeb.h"
#include "LoRaRadio.h"
#include <ArduinoJson.h>
#include <DNSServer.h>
#include <ESPAsyncWebServer.h>

#include "GameCommon.h"
#include "RPI4.h"
#include "User.h"
#include <LittleFS.h>

static DNSServer dnsServer;

LoRaWeb::LoRaWeb(LoRaRadio &radioRef)
    : radio(radioRef), server(80)
{
  // eventueel extra initialisatie
}

// =======================
// Helpers
// =======================

String LoRaWeb::getSessionToken(AsyncWebServerRequest *request)
{
  Serial.println("[LoRaWeb] Checking for session cookie");
  if (!request->hasHeader("Cookie"))
    return "";
  String cookies = request->header("Cookie");
  Serial.println("[LoRaWeb] Found cookies: " + cookies);
  int start = 0;
  while (start < cookies.length())
  {
    int sep = cookies.indexOf(';', start);
    if (sep == -1)
      sep = cookies.length();
    String c = cookies.substring(start, sep);
    c.trim();
    if (c.startsWith("session="))
      return c.substring(8);
    start = sep + 1;
  }
  return "";
}

bool LoRaWeb::requireLogin(AsyncWebServerRequest *request)
{
  String token = getSessionToken(request);
  if (token == "" || !UserManager::isValidSession(token))
  {
    request->redirect("/login");
    return false;
  }
  return true;
}

String LoRaWeb::rootHTML(String session)
{
  String html = "<h1>GhostNet Node</h1>";
  if (session == "")
  {
    html += "<h2>Welkom</h2><a href='/login'>Login</a>";
  }
  else
  {
    html += "<h2>Welkom</h2> " + UserManager::getNameAndTeamByToken(session);
    html += " <a href='/logout'>Logout</a>";
  }

  html += this->userListHtml();

  html += "<nav>";
  html += "<a href='/adduser'>Add User</a> | ";
  html += "<a href='/upload'>Upload Image</a> | ";
  html += "<a href='/messages'>Messages</a> | ";
  html += "<a href='/raw'>Raw</a> | ";
  html += "<a href='/messages.json'>Messages JSON</a> | ";
  html += "<a href='/raw.json'>Raw JSON</a>";
  html += "</nav><br><br>";
  return html;
}

// =======================
// LoRa functies
// =======================

void LoRaWeb::loraSendTable()
{

  String nodeName = radio.getNodeName();
  String tableMsg = "TABLE van " + nodeName + " (" + String(GAMEVERSION) + "):\n";
  auto &neighbours = radio.getNeighbours();
  for (auto &kv : neighbours)
  {
    unsigned long age = (millis() - kv.second.lastSeen) / 1000;
    tableMsg += "Node: " + kv.first +
                " | Laatst: " + String(age) + "s" +
                " | RSSI: " + String(kv.second.rssi, 1) +
                " | SNR: " + String(kv.second.snr, 1) + "\n";
  }

  radio.sendToQueueString("TableNeighbours", tableMsg);
}

void LoRaWeb::handleSendTable(AsyncWebServerRequest *request)
{
  loraSendTable();
  request->redirect("/admin");
}

void LoRaWeb::handleSendMsg(AsyncWebServerRequest *request)
{
  if (request->hasParam("msg", true))
  {
    String msg = request->getParam("msg", true)->value();
    radio.sendToQueueString("MSG", msg);
  }
  request->redirect("/admin");
}

// =======================
// HTML helpers
// =======================

String LoRaWeb::neighbourTableHtml()
{
  String tableHtml = "<h2>Neighbour Table - " + radio.getNodeName() + " (" + String(GAMEVERSION) + ")</h2><table border=1><tr><th>Node</th><th>Laatst gezien (s)</th><th>RSSI</th><th>SNR</th></tr>";
  auto &neighbours = radio.getNeighbours();
  for (auto &kv : neighbours)
  {
    unsigned long age = (millis() - kv.second.lastSeen) / 1000;
    tableHtml += "<tr><td>" + kv.first + "</td><td>" + String(age) + "</td><td>" + String(kv.second.rssi, 1) + "</td><td>" + String(kv.second.snr, 1) + "</td></tr>";
  }
  tableHtml += "</table><br><form action='/sendtable' method='POST'><button type='submit'>Zend table via LoRa</button></form>";
  return tableHtml;
}

String LoRaWeb::messageLogHtml()
{
  String logHtml = "<h2>Message Log</h2><ul>";
  auto &messageLog = radio.getMessageLog();
  for (auto &m : messageLog)
  {
    logHtml += "<li>[" + String(m.timestamp) + "] " + m.sender + ": " + m.content +
               " (RSSI=" + String(m.rssi, 1) + ", SNR=" + String(m.snr, 1) + ")</li>";
  }
  logHtml += "</ul>";
  return logHtml;
}

String LoRaWeb::userListHtml()
{
  String html = "<h2>Users</h2><ul>";
  for (int i = 0; i < UserManager::userCount; ++i)
  {
    html += "<li>" + UserManager::users[i].username + " (" + UserManager::users[i].team + ")</li>";
  }
  html += "</ul>";
  return html;
}

// =======================
// Begin
// =======================

// =======================
// Helpers
// =======================
String LoRaWeb::getCookie(AsyncWebServerRequest *request, const String &name)
{
  if (!request->hasHeader("Cookie"))
  {
    Serial.println("[getCookie] Geen Cookie header aanwezig");
    return "";
  }

  String cookies = request->getHeader("Cookie")->value();
  Serial.println("[getCookie] Cookie header: " + cookies);

  int start = 0;
  while (start < cookies.length())
  {
    int sep = cookies.indexOf(';', start);
    if (sep == -1)
      sep = cookies.length();
    String c = cookies.substring(start, sep);
    c.trim();
    if (c.startsWith(name + "="))
      return c.substring(name.length() + 1);
    start = sep + 1;
  }
  return "";
}

// =======================
// Routes
// =======================
void LoRaWeb::handleRoot(AsyncWebServerRequest *request)
{
  String cookie = getCookie(request, "test");
  String token = getCookie(request, "session");
  // getSessionToken(request);

  String html = "<h1>ESP32 Async Cookie Test</h1>";
  if (cookie != "")
  {
    html += "<p>Cookie gevonden: " + cookie + "</p>";
    html += "<a href='/clear'>Clear Cookie</a>";
  }
  else
  {
    html += "<p>Geen cookie aanwezig</p>";
    html += "<a href='/set'>Set Cookie</a>";
  }

  // Show uploaded image if present
  LittleFS.begin(true);
  if (LittleFS.exists("/uploaded.jpg")) {
    html += "<h3>Uploaded Image:</h3>";
    html += "<img src='/uploaded.jpg' style='max-width:300px;'><br>";
  }
  html += LoRaWeb::rootHTML(token);
  request->send(200, "text/html", html);
}

void LoRaWeb::handleSetCookie(AsyncWebServerRequest *request)
{
  Serial.println("[handleSetCookie] Cookie wordt gezet");
  AsyncWebServerResponse *response = request->beginResponse(303);
  response->addHeader("Set-Cookie", "test=helloESP32; Path=/; Max-Age=3600");
  response->addHeader("Set-Cookie", "token=12345678; Path=/; Max-Age=3600");
  response->addHeader("Location", "/");
  request->send(response);
}

void LoRaWeb::handleClearCookie(AsyncWebServerRequest *request)
{
  Serial.println("[handleClearCookie] Cookie wordt verwijderd");
  AsyncWebServerResponse *response = request->beginResponse(303);
  response->addHeader("Set-Cookie", "test=; Path=/; Max-Age=0");
  response->addHeader("Location", "/");
  request->send(response);
}

void LoRaWeb::begin(const char *ssid, const char *pass)
{
  // Serve uploaded image
  server.on("/uploaded.jpg", HTTP_GET, [](AsyncWebServerRequest *request){
    if (LittleFS.exists("/uploaded.jpg")) {
      request->send(LittleFS, "/uploaded.jpg", "image/jpeg");
    } else {
      request->send(404, "text/plain", "No image uploaded");
    }
  });

  // ---- Image upload form
  server.on("/upload", HTTP_GET, [this](AsyncWebServerRequest *request){
    String html = "<h2>Upload Image</h2>";
    html += "<form method='POST' action='/upload' enctype='multipart/form-data'>";
    html += "<input type='file' name='image'><br>";
    html += "<input type='submit' value='Upload'></form>";
    request->send(200, "text/html", html);
  });

  // ---- Image upload POST handler
  server.on("/upload", HTTP_POST,
    [this](AsyncWebServerRequest *request){
      request->send(200, "text/html", "<h2>Image upload complete!</h2><a href='/'>Back</a>");
    },
    [](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final){
      Serial.printf("[LoRaWeb] Uploading file: %s, index: %u, len: %u, final: %d\n", filename.c_str(), index, len, final);
      // Save the uploaded file to LittleFS

      if(!index){
        LittleFS.begin(true);
        File file = LittleFS.open("/uploaded.jpg", "w");
        if(file){
          file.write(data, len);
          file.close();
        }
      } else {
        File file = LittleFS.open("/uploaded.jpg", "a");
        if(file){
          file.write(data, len);
          file.close();
        }
      }
      if(final){
        // Optionally do something when upload is finished
        //radio.sendToQueue(data);
      }
    }
  );
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, pass);

  RPI4::sendStartInfo(radio.getNodeName(), String(GAMEVERSION));
  RPI4::sendWiFiInfo(String(ssid), String(pass));

  dnsServer.start(53, "*", WiFi.softAPIP());

  server.on("/", HTTP_GET, [this](AsyncWebServerRequest *request){ handleRoot(request); });

  server.on("/set", HTTP_GET, [this](AsyncWebServerRequest *request){ handleSetCookie(request); });
  server.on("/clear", HTTP_GET, [this](AsyncWebServerRequest *request){ handleClearCookie(request); });

  // Captive portal check
  server.on("/generate_204", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->redirect("/"); });

  // ---- Root
  /*server.on("/test", HTTP_GET, [this](AsyncWebServerRequest *request){
    Serial.println("[LoRaWeb] Root accessed");
    String token = getSessionToken(request);
    String html = rootHTML(token);
    request->send(200, "text/html", html);
  });
*/
  // ---- Admin
  server.on("/admin", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    if (!requireLogin(request)) return;
    String session = getSessionToken(request);
    String html = rootHTML(session);
    html += neighbourTableHtml();
    html += userListHtml();
    html += messageLogHtml();
    html += "<h2>Stuur bericht</h2>";
    html += "<form action='/sendmsg' method='POST'><input name='msg' size=40><input type='submit' value='Verstuur'></form>";
    request->send(200, "text/html", html); });

  // ---- Add User form
  server.on("/adduser", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    String html = "<h2>Add User</h2>";
    html += "<form action='/adduser' method='POST'>";
    html += "Username: <input name='username'><br>";
    html += "Password: <input name='password' type='password'><br>";
    html += "Team: <input name='team'><br>";
    html += "<input type='submit' value='Add User'></form>";
    request->send(200, "text/html", html); });

  // ---- Add User submit
  server.on("/adduser", HTTP_POST, [this](AsyncWebServerRequest *request)
            {
    String username = request->hasParam("username", true) ? request->getParam("username", true)->value() : "";
    String password = request->hasParam("password", true) ? request->getParam("password", true)->value() : "";
    String team = request->hasParam("team", true) ? request->getParam("team", true)->value() : "";

    if (username.length() > 0 && password.length() > 0) {
      Serial.println("[LoRaWeb] Adding user: " + username);
      Serial.println("[LoRaWeb] With team: " + team);

      if (UserManager::addUser(username, password, team)) {
        String session = UserManager::createSession(username);
        AsyncWebServerResponse *response = request->beginResponse(303);
//        response->addHeader("Set-Cookie", "session=" + session + "; Path=/; Max-Age=86400; SameSite=Lax");
        response->addHeader("Set-Cookie", "session=" + session + "; Path=/; Max-Age=86400");
        response->addHeader("Location", "/admin");
        request->send(response);
      } else {
        request->send(200, "text/html", "<h2>Error: Username already exists</h2>");
      }
    } else {
      request->send(200, "text/html", "<h2>Error: Fill all fields</h2>");
    } });

  // ---- Login form
  server.on("/login", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    String html = "<h2>Login</h2>";
    html += "<form action='/login' method='POST'>";
    html += "User: <input name='user'><br>";
    html += "Pass: <input name='pass' type='password'><br>";
    html += "<input type='submit' value='Login'></form>";
    request->send(200, "text/html", html); });

  // ---- Login submit
  server.on("/login", HTTP_POST, [this](AsyncWebServerRequest *request)
            {
    String user = request->hasParam("user", true) ? request->getParam("user", true)->value() : "";
    String pass = request->hasParam("pass", true) ? request->getParam("pass", true)->value() : "";
    Serial.println("[LoRaWeb] Login attempt for user: " + user);
    if (user.length() > 0 && pass.length() > 0) {
      String hashPassword = UserManager::hashPassword(pass);
      if (UserManager::isValidLogin(user, hashPassword)) {
        Serial.println("[LoRaWeb] Login successful for user: " + user);
        String session = UserManager::createSession(user);
        AsyncWebServerResponse *response = request->beginResponse(303);
        response->addHeader("Set-Cookie", "session=" + session + "; Path=/; Max-Age=86400");
        response->addHeader("Location", "/");
        request->send(response);
        Serial.println("[LoRaWeb] Redirecting to / with session: " + session);
      } else {
        request->send(403, "text/html", "<p>Login mislukt</p>");
      }
    } else {
      request->send(403, "text/html", "<p>Login mislukt: velden leeg</p>");
    } });

  // ---- Logout
  server.on("/logout", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    AsyncWebServerResponse *response = request->beginResponse(303);
    response->addHeader("Set-Cookie", "session=; Path=/; Max-Age=0");
    response->addHeader("Location", "/");
    request->send(response); });

  // ---- Messages HTML
  server.on("/messages", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    if (!requireLogin(request)) return;
    auto &msgs = radio.getMessageLog();
    String html = "<h2>Messages</h2><ul>";
    for (auto it = msgs.rbegin(); it != msgs.rend(); ++it) {
      html += "<li>[" + String(it->timestamp) + "] ";
      html += it->sender + ": " + it->content;
      html += " (RSSI=" + String(it->rssi) + ", SNR=" + String(it->snr) + ")</li>";
    }
    html += "</ul>";
    request->send(200, "text/html", html); });

  // ---- Raw HTML
  server.on("/raw", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    if (!requireLogin(request)) return;
    auto &raw = radio.getRawLog();
    String html = "<h2>Raw Messages</h2><ul>";
    for (auto it = raw.rbegin(); it != raw.rend(); ++it) {
      html += "<li>[" + String(it->timestamp) + "] ";
      html += it->sender + ": " + it->content;
      html += " (RSSI=" + String(it->rssi) + ", SNR=" + String(it->snr) + ")</li>";
    }
    html += "</ul>";
    request->send(200, "text/html", html); });

  // ---- Messages JSON
  server.on("/messages.json", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    if (!requireLogin(request)) return;
    auto &msgs = radio.getMessageLog();
    DynamicJsonDocument doc(4096);
    JsonArray arr = doc.to<JsonArray>();
    for (auto it = msgs.rbegin(); it != msgs.rend(); ++it) {
      JsonObject obj = arr.createNestedObject();
      obj["timestamp"] = it->timestamp;
      obj["sender"] = it->sender;
      obj["content"] = it->content;
      obj["rssi"] = it->rssi;
      obj["snr"] = it->snr;
    }
    String out;
    serializeJson(arr, out);
    request->send(200, "application/json", out); });

  // ---- Raw JSON
  server.on("/raw.json", HTTP_GET, [this](AsyncWebServerRequest *request)
            {
    if (!requireLogin(request)) return;
    auto &raw = radio.getRawLog();
    DynamicJsonDocument doc(4096);
    JsonArray arr = doc.to<JsonArray>();
    for (auto it = raw.rbegin(); it != raw.rend(); ++it) {
      JsonObject obj = arr.createNestedObject();
      obj["timestamp"] = it->timestamp;
      obj["sender"] = it->sender;
      obj["content"] = it->content;
      obj["rssi"] = it->rssi;
      obj["snr"] = it->snr;
    }
    String out;
    serializeJson(arr, out);
    request->send(200, "application/json", out); });

  // ---- Actions
  server.on("/sendtable", HTTP_POST, [this](AsyncWebServerRequest *request)
            { handleSendTable(request); });
  server.on("/sendmsg", HTTP_POST, [this](AsyncWebServerRequest *request)
            { handleSendMsg(request); });

  server.begin();
}

// =======================
// Loop
// =======================

void LoRaWeb::loop()
{
  // No server.handleClient() needed for AsyncWebServer

  static unsigned long lastTableSend = 0;
  unsigned long now = millis();
  if ((long)(now - lastTableSend) >= 300000)
  { // 5 minuten
    loraSendTable();
    lastTableSend = now;
  }

  dnsServer.processNextRequest();
}
