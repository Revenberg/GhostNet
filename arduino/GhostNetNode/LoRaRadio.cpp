#include "LoRaRadio.h"
#include "User.h"
#include "RPI4.h"
#include "GameCommon.h"
// Define static member for neighbours
std::map<String, NeighbourInfo> LoRaRadio::neighbours;

Module loraModule(LORA_CS, LORA_DIO1, LORA_RST, LORA_BUSY);

LoRaRadio::LoRaRadio()
  : radio(&loraModule), radioQueue(nullptr) {}

bool LoRaRadio::sendToQueueString(const String &msgType, const String &msg) {
  RadioMessage rm;
  rm.content = msg;
  rm.sender = getNodeName();
  rm.receiver = "ALL";
  rm.msgType = msgType;

  return sendToQueue(rm);
}

bool LoRaRadio::sendToQueue(RadioMessage rm) {
  if (!radioQueue) {
    Serial.println("[LoRaRadio] ERROR: radioQueue not initialized!");
    return false;
  }
  BaseType_t result = xQueueSend(radioQueue, &rm, 0);
  if (result != pdPASS) {
    Serial.println("[LoRaRadio] ERROR: xQueueSend failed (queue full?)");
    return false;
  }
  return true;
}

bool LoRaRadio::receiveFromQueue(RadioMessage &msg) {
  if (!radioQueue) {
    Serial.println("[LoRaRadio] ERROR: radioQueue not initialized!");
    return false;
  }
  BaseType_t result = xQueueReceive(radioQueue, &msg, 0);
  if (result != pdPASS) {
    // Optionally log: Serial.println("[LoRaRadio] No message in queue");
    return false;
  }
  return true;
}

bool LoRaRadio::begin(float freq, float bw, int sf, int cr, byte syncWord) {
  int state = radio.begin(freq, bw, sf, cr, syncWord);
  if (state != RADIOLIB_ERR_NONE) {
    Serial.println("[LoRa] Init failed, code=" + String(state));
    return false;
  }
  radio.setDio1Action(onReceiveStatic);
  radio.startReceive();
  radioQueue = xQueueCreate(10, sizeof(RadioMessage));
  if (!radioQueue) {
    Serial.println("[LoRaRadio] ERROR: Failed to create radioQueue!");
    return false;
  }
  return true;
}

void IRAM_ATTR LoRaRadio::onReceiveStatic() {
  // This will be patched to instance method (singleton or global)
  extern LoRaRadio LoRa;
  LoRa.receivedFlag = true;
}

void LoRaRadio::handleReceive() {
  String str;
  int state = radio.readData(str);

  if (state == RADIOLIB_ERR_NONE && str.length() > 0) {
#if DEBUG_ENABLED
    Serial.printf("[LoRa PACKET] Raw packet: %s\n", str.c_str());
#endif

    float rssi = radio.getRSSI();
    float snr = radio.getSNR();

    // Always log raw message
    ReceivedMessage rawMsg{ millis(), "?", str, rssi, snr };
    rawLog.push_back(rawMsg);
    if (rawLog.size() > maxMessageCount)
      rawLog.pop_front();

    // Check for ACK
    if (str.startsWith("ACK:")) {
      int idx1 = str.indexOf(':');
      int idx2 = str.indexOf(':', idx1 + 1);
      if (idx1 > 0 && idx2 > idx1) {
        String ackMsgID = str.substring(idx1 + 1, idx2);
        receivedAcks.insert(ackMsgID);
#if DEBUG_ENABLED
        Serial.printf("[LoRa ACK] Received ACK for msgID=%s\n", ackMsgID.c_str());
#endif
      }
      return;  // Don't process further
    }

    // Try fragment assembly
    String assembled = assembleFragment(str);
    if (assembled.length() > 0)
      str = assembled;
    else
      return;  // nothing complete, only in rawLog

    // Extract sender and msgID
    String sender = "unknown";
    String msgID = "";
    if (str.startsWith("BEACON"))
      sender = str.substring(10);
#if DEBUG_ENABLED
    Serial.printf("[LoRa RX BEACON] %s\n", sender.c_str());
#endif

    else if (str.startsWith("MSG:")) {
      int idx1 = str.indexOf(':');
      int idx2 = str.indexOf(':', idx1 + 1);
      if (idx1 > 0 && idx2 > idx1) {
        msgID = str.substring(idx1 + 1, idx2);
        sender = str.substring(idx2 + 1, str.indexOf(':', idx2 + 1));
      }
    }

    // Update neighbours
    NeighbourInfo info{ millis(), rssi, snr };
    neighbours[sender] = info;

    // Log complete message
    ReceivedMessage msg{ millis(), sender, str, rssi, snr };
    messageLog.push_back(msg);
    if (messageLog.size() > maxMessageCount)
      messageLog.pop_front();      
    while (!messageLog.empty() && millis() - messageLog.front().timestamp > maxMessageAge)
      messageLog.pop_front();

#if DEBUG_ENABLED
    Serial.printf("[LoRa RX] %s | RSSI=%.1f | SNR=%.1f\n", str.c_str(), rssi, snr);
#endif

    // Forward all non-beacon messages to all nodes, prevent looping
    // Add a simple loop prevention: only forward if not already forwarded by this node
    if (!str.startsWith("BEACON") && !str.startsWith("FORWARDED:")) {
      String forwardedMsg = "FORWARDED:" + getNodeName() + ":" + str;
      radio.transmit(forwardedMsg);
#if DEBUG_ENABLED
      Serial.printf("[LoRa FORWARD] Forwarded message: %s\n", forwardedMsg.c_str());
#endif
    }

    // Send ACK if msgID found
    if (msgID.length() > 0) {
      String ack = "ACK:" + msgID + ":" + getNodeName();
      radio.transmit(ack);
#if DEBUG_ENABLED
      Serial.printf("[LoRa ACK] Sent ACK for msgID=%s\n", msgID.c_str());
#endif
    }
  }
}

std::deque<ReceivedMessage> &LoRaRadio::getRawLog() {
  return rawLog;
}

String LoRaRadio::sendMessageWithAck(const String &msg) {
  // Generate unique msgID
  String msgID = String(millis());
  String nodeName = getNodeName();
  String fullMsg = "MSG:" + msgID + ":" + nodeName + ":" + msg;

  size_t totalLen = fullMsg.length();
  if (totalLen <= maxFragmentSize) {
    radio.transmit(fullMsg);
    pendingAcks[msgID] = millis();
    return msgID;
  }

  int totalFragments = (totalLen + maxFragmentSize - 1) / maxFragmentSize;
  for (int i = 0; i < totalFragments; i++) {
    int startIdx = i * maxFragmentSize;
    int len = min((int)totalLen - startIdx, (int)maxFragmentSize);
    String fragment = fullMsg.substring(startIdx, startIdx + len);
    String packet = "[" + msgID + "|" + String(i + 1) + "|" + String(totalFragments) + "]" + fragment;

    Serial.printf("[LoRa PACKET] Raw packet: %s\n", packet.c_str());

    radio.transmit(packet);
    delay(10);
  }
  pendingAcks[msgID] = millis();
  return msgID;
}
bool LoRaRadio::isAcked(const String &msgID) {
  Serial.printf("[LoRa ACK] Checking ACK for msgID=%s\n", msgID.c_str());
  return receivedAcks.count(msgID) > 0;
}

void LoRaRadio::sendBeacon(const String &nodeName) {
  Serial.printf("[LoRa BEACON] Sending beacon from node: %s\n", nodeName.c_str());
  sendMessageWithAck("BEACON van " + nodeName);
}

// =======================
// Helper functions
// =======================
String LoRaRadio::getNodeName() {
  uint64_t chipid = ESP.getEfuseMac();
  char id[17];
  sprintf(id, "%04X%08X", (uint16_t)(chipid >> 32), (uint32_t)chipid);
  return String("NODE_") + id;
}

String LoRaRadio::assembleFragment(const String &packet) {
  int idx1 = packet.indexOf('[');
  int idx2 = packet.indexOf(']');
  if (idx1 != 0 || idx2 < 0)
    return packet;

  String header = packet.substring(1, idx2);
  int sep1 = header.indexOf('|');
  int sep2 = header.lastIndexOf('|');
  if (sep1 < 0 || sep2 < 0 || sep1 == sep2)
    return packet;

  String msgID = header.substring(0, sep1);
  int index = header.substring(sep1 + 1, sep2).toInt();
  int total = header.substring(sep2 + 1).toInt();
  String data = packet.substring(idx2 + 1);

  fragmentBuffer[msgID][index] = { msgID, index, total, data, millis() };

  String assembled;
  for (int i = 1; i <= total; i++) {
    if (fragmentBuffer[msgID].count(i) == 0)
      return "";
    assembled += fragmentBuffer[msgID][i].data;
  }

  fragmentBuffer.erase(msgID);
  return assembled;
}

std::map<String, NeighbourInfo> &LoRaRadio::getNeighbours() {
  return neighbours;
}
std::deque<ReceivedMessage> &LoRaRadio::getMessageLog() {
  return messageLog;
}

void LoRaRadio::loop() {
  if (receivedFlag) {
    receivedFlag = false;
    handleReceive();
    radio.startReceive();
  }

  if (millis() - lastBeacon > beaconInterval) {
    sendBeacon(getNodeName());
    lastBeacon = millis();
  }

  RadioMessage msg;
  while (receiveFromQueue(msg))
  {
    if (msg.msgType == "msg") {
      String rpiMsg = "[RPI4 MSG] From: " + msg.sender + " To: " + msg.receiver + " MsgID: " + msg.msgID + " Content: " + msg.content;
  RPI4::sendToRPI4(rpiMsg);
    }
    if (msg.msgType == "user") {
      if (msg.content.indexOf(',') > 0)
      {
  User user = UserManager::deserializeUser(msg.content);
  UserManager::addUserFromLoRa(user);
        String rpiMsg = "[RPI4 USER] " + user.username + ", team: " + user.team + ", token: " + user.token;
  RPI4::sendToRPI4(rpiMsg);
      }
    }
    if (msg.msgType == "file") {
      // Handle file transfer messages here
    }
  }
}
