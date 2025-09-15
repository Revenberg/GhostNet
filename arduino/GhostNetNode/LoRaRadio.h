#pragma once
#include <Arduino.h>
#include <RadioLib.h>
#include <map>
#include <deque>
#include <set>

// ============ Config =============
#define LORA_CS 8
#define LORA_RST 12
#define LORA_BUSY 13
#define LORA_DIO1 14

// ============ Structs ============
struct NeighbourInfo {
  unsigned long lastSeen;
  float rssi;
  float snr;
};

struct ReceivedMessage {
  unsigned long timestamp;
  String sender;
  String content;
  float rssi;
  float snr;
};

struct Fragment {
  String msgID;
  int index;
  int total;
  String data;
  unsigned long receivedAt;
};

struct RadioMessage {
  String sender;
  String receiver;
  String msgID;
  String msgType; // "MSG", "ACK", "BEACON"
  String content;
};

// ============ LoRaRadio Class ============
class LoRaRadio {
public:
  /**
   * @brief Constructor. Initializes internal state.
   */
  LoRaRadio();

  /**
   * @brief Initialize the LoRa radio hardware and queue.
   * @param freq Frequency in MHz (default 868.0)
   * @param bw Bandwidth in kHz (default 125.0)
   * @param sf Spreading factor (default 12)
   * @param cr Coding rate (default 8)
   * @param syncWord Sync word (default 0x56)
   * @return true if initialization succeeded, false otherwise.
   */
  bool begin(float freq = 868.0, float bw = 125.0, int sf = 12, int cr = 8, byte syncWord = 0x56);

  /**
   * @brief Main loop for radio operations. Should be called regularly.
   */
  void loop();

  /**
   * @brief Send a message via LoRa, with fragmentation if needed. Returns msgID used.
   * @param msg Message to send.
   * @return msgID used for tracking ACKs.
   */
  String sendMessageWithAck(const String &msg);

  /**
   * @brief Send a beacon message with the node name.
   * @param nodeName Name of the node.
   */
  void sendBeacon(const String &nodeName);

  /**
   * @brief Update internal state (not used in current code).
   */
  void update();

  /**
   * @brief Get the node name for this device.
   * @return Node name as a String.
   */
  String getNodeName();

  /**
   * @brief Send a String message to the internal queue.
   * @param msg Message to send.
   * @return true if successful, false if queue is full or error occurred.
   */

   bool sendToQueueString(const String &msgType, const String &msg);
  /**
   * @brief Send a message to the internal queue.
   * @param msg Message to send.
   * @return true if successful, false if queue is full or error occurred.
   */
  bool sendToQueue(RadioMessage rm);
  /**
   * @brief Receive a message from the internal queue.
   * @param msg Reference to store received message.
   * @return true if a message was received, false otherwise.
   */
  bool receiveFromQueue(RadioMessage &msg);

  /**
   * @brief Get the map of neighbours.
   * @return Reference to neighbours map.
   */
  static std::map<String, NeighbourInfo> &getNeighbours();

  /**
   * @brief Get the log of received messages.
   * @return Reference to message log deque.
   */
  std::deque<ReceivedMessage> &getMessageLog();

  /**
   * @brief Get the log of raw received messages.
   * @return Reference to raw log deque.
   */
  std::deque<ReceivedMessage> &getRawLog();

  /**
   * @brief Check if a message with given msgID has been ACKed.
   * @param msgID Message ID to check.
   * @return true if ACK received, false otherwise.
   */
  bool isAcked(const String &msgID);

  void logoutHandler();

private:
  SX1262 radio;  ///< RadioLib SX1262 radio instance
  static void IRAM_ATTR onReceiveStatic();
  void handleReceive();
  String assembleFragment(const String &packet);

  // Buffers
  volatile bool receivedFlag = false;                        ///< Flag for received interrupt
  std::map<String, std::map<int, Fragment>> fragmentBuffer;  ///< Fragment buffer for assembling messages
  static std::map<String, NeighbourInfo> neighbours;         ///< Map of neighbours (now static)
  std::deque<ReceivedMessage> messageLog;                    ///< Log of received messages
  std::deque<ReceivedMessage> rawLog;                        ///< Log of all raw messages

  QueueHandle_t radioQueue = nullptr;  ///< FreeRTOS queue for RadioMessage

  // ACK tracking
  std::map<String, unsigned long> pendingAcks;  ///< msgID -> timestamp sent
  std::set<String> receivedAcks;                ///< msgIDs for which ACK was received

  // Settings
  unsigned long lastBeacon = 0;
  const unsigned long beaconInterval = 30000;
  const size_t maxFragmentSize = 80;
  const size_t maxMessageCount = 100;
  const unsigned long maxMessageAge = 5 * 60 * 1000;
};
