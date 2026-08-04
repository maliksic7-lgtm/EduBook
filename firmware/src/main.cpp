#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>
#include <qrcode.h>
#include "AudioManager.h"
#include "Config.h"

enum DeviceState {
  STATE_BOOT,
  STATE_CONNECTING,
  STATE_ASK_MODE,
  STATE_WEB_MODE,
  STATE_STANDALONE_MENU,
  STATE_VOICE_REVIEW,
  STATE_VOICE_RECORDING,
  STATE_QUIZ,
  STATE_CHAT,
  STATE_RESULT
};

DeviceState currentState = STATE_BOOT;
int currentPage = 1;
bool webMode = false;
bool isRecording = false;
unsigned long voiceStartTime = 0;
int lastScore = 0;
char lastFeedback[256] = "";
char studentName[64] = "Siswa_EduBook";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
TFT_eSPI tft = TFT_eSPI();
AudioManager audioManager;

static void setState(DeviceState newState);
static void drawBootScreen();
static void drawAskMode();
static void drawQRCode(const char* url);
static void drawStandaloneMenu();
static void drawReadingPage(int page);
static void drawRecordingUI();
static void drawResultScreen(int score, const char* feedback);
static void connectWiFi();
static void connectMQTT();
static void mqttCallback(char* topic, byte* payload, unsigned int length);
static void publishPage(int page);
static void publishVoice(const char* text);
static void publishNav(const char* action);
static void recordAndSendAudio();
static void checkButton();

void setup() {
  Serial.begin(115200);
  pinMode(LED_STATUS, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  digitalWrite(LED_STATUS, LOW);

  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);

  audioManager.begin();

  mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
  mqttClient.setCallback(mqttCallback);

  setState(STATE_BOOT);
}

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  checkButton();

  switch (currentState) {
    case STATE_BOOT:
      drawBootScreen();
      delay(1500);
      setState(STATE_CONNECTING);
      break;

    case STATE_CONNECTING:
      connectWiFi();
      setState(STATE_ASK_MODE);
      break;

    case STATE_ASK_MODE:
      drawAskMode();
      break;

    case STATE_WEB_MODE:
      {
        char url[64];
        snprintf(url, sizeof(url), "http://%s:5000", WiFi.localIP().toString().c_str());
        drawQRCode(url);
        publishPage(currentPage);
        delay(5000);
      }
      break;

    case STATE_STANDALONE_MENU:
      drawStandaloneMenu();
      break;

    case STATE_VOICE_REVIEW:
      drawRecordingUI();
      publishNav("start_voice");
      isRecording = true;
      voiceStartTime = millis();
      audioManager.startRecording();
      setState(STATE_VOICE_RECORDING);
      break;

    case STATE_VOICE_RECORDING:
      {
        uint8_t audioBuffer[1024];
        audioManager.readAudioData(audioBuffer, sizeof(audioBuffer));

        if (!isRecording || (millis() - voiceStartTime >= MAX_VOICE_DURATION_MS)) {
          isRecording = false;
          audioManager.stopRecording();
          publishNav("stop_voice");
          recordAndSendAudio();
          setState(STATE_RESULT);
        }
      }
      break;

    case STATE_QUIZ:
      break;

    case STATE_RESULT:
      drawResultScreen(lastScore, lastFeedback);
      break;

    case STATE_CHAT:
      break;
  }
}

static void setState(DeviceState newState) {
  currentState = newState;
}

static void checkButton() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(300);
    switch (currentState) {
      case STATE_ASK_MODE:
        webMode = true;
        publishNav("web_mode_yes");
        setState(STATE_WEB_MODE);
        break;

      case STATE_WEB_MODE:
        webMode = false;
        publishNav("web_mode_no");
        setState(STATE_STANDALONE_MENU);
        break;

      case STATE_STANDALONE_MENU:
        setState(STATE_VOICE_REVIEW);
        break;

      case STATE_VOICE_RECORDING:
        isRecording = false;
        break;

      case STATE_RESULT:
        setState(STATE_ASK_MODE);
        break;

      default:
        break;
    }
  }
}

static void drawBootScreen() {
  tft.fillScreen(TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(40, 60);
  tft.setTextColor(TFT_CYAN);
  tft.println("EduBook");
  tft.setTextSize(1);
  tft.setTextColor(TFT_WHITE);
  tft.setCursor(30, 100);
  tft.println("SIC Batch 8");
  tft.setCursor(20, 140);
  tft.setTextColor(TFT_DARKGREY);
  tft.println("Booting System...");
  for (int i = 0; i < 200; i += 10) {
    tft.fillRect(20, 170, i, 6, TFT_CYAN);
    delay(30);
  }
  tft.fillRect(20, 170, 200, 6, TFT_GREEN);
}

static void drawAskMode() {
  tft.fillScreen(TFT_BLACK);
  tft.setTextSize(1);
  tft.setTextColor(TFT_CYAN);
  tft.setCursor(20, 30);
  tft.println("Apakah kamu ingin");
  tft.setCursor(20, 50);
  tft.println("menggunakan Web Server");
  tft.setCursor(20, 70);
  tft.println("Display / Dashboard?");

  tft.setTextColor(TFT_WHITE);
  tft.setCursor(20, 120);
  tft.println("Tekan tombol atau ucapkan:");

  tft.fillRect(20, 150, 80, 30, TFT_DARKGREEN);
  tft.setTextColor(TFT_WHITE);
  tft.setCursor(30, 158);
  tft.println("IYA");

  tft.fillRect(120, 150, 80, 30, TFT_MAROON);
  tft.setTextColor(TFT_WHITE);
  tft.setCursor(130, 158);
  tft.println("TIDAK");

  tft.setTextColor(TFT_DARKGREY);
  tft.setCursor(20, 200);
  tft.println("Atau tunggu 10 detik");
  tft.setCursor(20, 218);
  tft.println("untuk mode mandiri...");
}

static void drawQRCode(const char* url) {
  tft.fillScreen(TFT_WHITE);
  tft.setTextColor(TFT_BLACK, TFT_WHITE);
  tft.setTextSize(1);
  tft.setCursor(10, 5);
  tft.println("Web Dashboard Tersedia!");
  tft.setCursor(10, 22);
  tft.setTextColor(TFT_DARKGREY, TFT_WHITE);
  tft.print("IP: ");
  tft.println(WiFi.localIP());

  QRCode qr;
  uint8_t qrcodeData[qrcode_getBufferSize(4)];
  qrcode_initText(&qr, qrcodeData, 4, ECC_MEDIUM, url);

  int blockSize = 3;
  int qrSize = qr.size * blockSize;
  int xOff = (tft.width() - qrSize) / 2;
  int yOff = 50;

  for (uint8_t y = 0; y < qr.size; y++) {
    for (uint8_t x = 0; x < qr.size; x++) {
      tft.fillRect(xOff + x * blockSize, yOff + y * blockSize,
                   blockSize, blockSize,
                   qrcode_getModule(&qr, x, y) ? TFT_BLACK : TFT_WHITE);
    }
  }

  tft.setTextColor(TFT_BLACK, TFT_WHITE);
  tft.setCursor(10, yOff + qrSize + 10);
  tft.setTextSize(1);
  tft.print("URL: ");
  tft.println(url);
  tft.setCursor(10, tft.getCursorY() + 14);
  tft.setTextColor(TFT_DARKGREY, TFT_WHITE);
  tft.println("Mode: Web Dashboard");
  tft.setCursor(10, tft.getCursorY() + 12);
  tft.setTextColor(TFT_BLACK, TFT_WHITE);
  tft.println("Scan QR atau buka link di browser");
  tft.setTextColor(TFT_GREEN, TFT_WHITE);
  tft.setCursor(10, tft.getCursorY() + 14);
  tft.println("Gunakan mic laptop/HP untuk review");
}

static void drawStandaloneMenu() {
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_CYAN);
  tft.setTextSize(2);
  tft.setCursor(20, 15);
  tft.println("MODE MANDIRI");
  tft.setTextSize(1);
  tft.drawFastHLine(0, 50, tft.width(), TFT_DARKGREY);

  tft.setTextColor(TFT_WHITE);
  tft.setCursor(20, 65);
  tft.println("1. Smart-Review Lisan");
  tft.setCursor(20, 90);
  tft.println("2. Tantangan Kuis");
  tft.setCursor(20, 115);
  tft.println("3. Tanya EduBot");
  tft.setCursor(20, 140);
  tft.println("4. Baca Materi");

  tft.setTextColor(TFT_GREEN);
  tft.setCursor(20, 180);
  tft.println("Tekan tombol untuk");
  tft.setCursor(20, 198);
  tft.println("Smart-Review");

  tft.setTextColor(TFT_DARKGREY);
  tft.setCursor(20, 230);
  tft.println("Atau ucapkan nomor menu");
}

static void drawReadingPage(int page) {
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_CYAN);
  tft.setCursor(10, 5);
  tft.setTextSize(1);
  tft.print("Halaman ");
  tft.println(page);
  tft.drawFastHLine(0, 22, tft.width(), TFT_DARKGREY);
  tft.setTextColor(TFT_WHITE);
  tft.setCursor(10, 35);
  tft.println("Memuat materi...");
  tft.setTextColor(TFT_DARKGREY);
  tft.setCursor(10, tft.height() - 20);
  tft.println("Tekan tombol untuk kembali");
}

static void drawRecordingUI() {
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_RED);
  tft.setTextSize(2);
  tft.setCursor(30, 20);
  tft.println("MEREKAM...");
  tft.fillCircle(tft.width() / 2, 75, 12, TFT_RED);

  for (int i = 0; i < 8; i++) {
    int h = 10 + random(20);
    tft.fillRect(30 + i * 25, 105 - h, 12, h, TFT_GREEN);
  }

  tft.setTextSize(1);
  tft.setTextColor(TFT_WHITE);
  tft.setCursor(10, 140);
  tft.println("Ucapkan hafalan Anda");
  tft.setTextColor(TFT_DARKGREY);
  tft.setCursor(10, 170);
  tft.println("Tekan tombol untuk selesai");
}

static void drawResultScreen(int score, const char* feedback) {
  tft.fillScreen(TFT_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(score >= 70 ? TFT_GREEN : TFT_YELLOW);
  tft.setCursor(40, 25);
  tft.print("Skor: ");
  tft.println(score);
  tft.drawFastHLine(0, 55, tft.width(), TFT_DARKGREY);
  tft.setTextSize(1);
  tft.setTextColor(TFT_WHITE);
  tft.setCursor(10, 75);
  tft.println(feedback);
  tft.setTextColor(TFT_DARKGREY);
  tft.setCursor(10, tft.height() - 20);
  tft.println("Tekan tombol untuk kembali");
}

static void connectWiFi() {
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_YELLOW);
  tft.setCursor(20, 60);
  tft.println("Menghubungkan WiFi...");
  tft.setTextColor(TFT_DARKGREY);
  tft.setCursor(20, 90);
  tft.print("SSID: ");
  tft.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    tft.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    tft.setTextColor(TFT_GREEN);
    tft.setCursor(20, 140);
    tft.println("WiFi Terhubung!");
    tft.setCursor(20, 160);
    tft.print("IP: ");
    tft.println(WiFi.localIP());
    digitalWrite(LED_STATUS, HIGH);
  } else {
    tft.setTextColor(TFT_RED);
    tft.setCursor(20, 140);
    tft.println("WiFi Gagal!");
    tft.setCursor(20, 160);
    tft.println("Restart device...");
    delay(2000);
    ESP.restart();
  }
  delay(1000);
}

static void connectMQTT() {
  int retries = 0;
  while (!mqttClient.connected() && retries < 5) {
    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      mqttClient.subscribe(MQTT_TOPIC_PAGE);
      mqttClient.subscribe(MQTT_TOPIC_NAV);
      mqttClient.subscribe(MQTT_TOPIC_AUDIO);
      mqttClient.subscribe(MQTT_TOPIC_SYNC);
      mqttClient.subscribe(MQTT_TOPIC_PREFIX "/config");
    } else {
      retries++;
      delay(2000);
    }
  }
}

static void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  if (String(topic) == MQTT_TOPIC_PAGE) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err && doc.containsKey("page")) {
      currentPage = doc["page"].as<int>();
      if (currentState == STATE_WEB_MODE || currentState == STATE_READING) {
        drawReadingPage(currentPage);
      }
    }
  }

  if (String(topic) == MQTT_TOPIC_AUDIO) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err) {
      if (doc.containsKey("keyword")) {
        String keyword = doc["keyword"].as<String>();
        if (keyword == "iya" && currentState == STATE_ASK_MODE) {
          webMode = true;
          setState(STATE_WEB_MODE);
        } else if (keyword == "tidak" && currentState == STATE_ASK_MODE) {
          webMode = false;
          setState(STATE_STANDALONE_MENU);
        } else if (keyword == "smart_review") {
          setState(STATE_VOICE_REVIEW);
        } else if (keyword == "quiz") {
          setState(STATE_QUIZ);
        } else if (keyword == "chat") {
          setState(STATE_CHAT);
        } else if (keyword == "baca") {
          setState(STATE_READING);
        }
      }

      if (doc.containsKey("feedback")) {
        strncpy(lastFeedback, doc["feedback"] | "", sizeof(lastFeedback) - 1);
        lastScore = doc["score"] | 0;
        if (currentState == STATE_RESULT) {
          drawResultScreen(lastScore, lastFeedback);
        }
      }
    }
  }

  if (String(topic) == MQTT_TOPIC_NAV) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err && doc.containsKey("action")) {
      String action = doc["action"].as<String>();
      if (action == "navigate_page" && doc.containsKey("page")) {
        currentPage = doc["page"].as<int>();
        publishPage(currentPage);
      }
    }
  }

  if (String(topic) == MQTT_TOPIC_SYNC) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err && doc.containsKey("page")) {
      currentPage = doc["page"].as<int>();
    }
  }

  String configTopic = String(MQTT_TOPIC_PREFIX) + "/config";
  if (String(topic) == configTopic) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err && doc.containsKey("student_name")) {
      strncpy(studentName, doc["student_name"] | "Siswa_EduBook", sizeof(studentName) - 1);
    }
  }
}

static void publishPage(int page) {
  JsonDocument doc;
  doc["page_number"] = page;
  String payload;
  serializeJson(doc, payload);
  mqttClient.publish(MQTT_TOPIC_PAGE, payload.c_str());
}

static void publishVoice(const char* text) {
  JsonDocument doc;
  doc["student_name"] = studentName;
  doc["page"] = currentPage;
  doc["text_hafalan"] = text;
  doc["paragraph_id"] = currentPage;
  String payload;
  serializeJson(doc, payload);
  mqttClient.publish(MQTT_TOPIC_VOICE, payload.c_str());
}

static void publishNav(const char* action) {
  JsonDocument doc;
  doc["action"] = action;
  String payload;
  serializeJson(doc, payload);
  mqttClient.publish(MQTT_TOPIC_NAV, payload.c_str());
}

static void recordAndSendAudio() {
  size_t size = audioManager.getRecordedSize();
  const uint8_t* data = audioManager.getRecordedData();

  String audioB64 = "";
  if (size > 0 && data) {
    audioB64 = base64::encode(data, size);
  }

  if (audioB64.length() > 0) {
    publishVoice(audioB64.c_str());
  } else {
    publishVoice("(audio placeholder)");
  }

  audioManager.clearBuffer();
}
