/*
 * ============================================================================
 *  EduBook - ESP32 DevKit V1 Firmware (Arduino IDE) - VOICE ASSISTANT VERSION
 *  Samsung Innovation Campus - Batch 8
 *
 *  Perangkat buku elektronik pintar: TFT display + INMP441 mic + MAX98357A
 *  amplifier/speaker, tersinkron dengan backend Node.js (backend/server.js)
 *  melalui MQTT pub/sub. Dashboard web diakses lewat QR/IP yang ditampilkan
 *  di TFT.
 *
 *  FITUR BARU:
 *  - Push-to-Talk button (1 tombol, multi-function)
 *  - Silence detection (5 detik diam = stop)
 *  - Recording duration: 10 detik hafalan, 60 detik voice command
 *  - Language toggle (ID/EN, default ID)
 *  - Offline cache (SPIFFS) - cache semua data
 *  - Attractive TFT UI dengan animasi custom
 *  - Voice assistant: STT, NLU, intent routing
 *  - Chat mode, Profile, Leaderboard, Missions via voice
 *
 *  ALUR:
 *    1. BOOT -> konek WiFi + MQTT
 *    2. ASK_MODE: TFT bertanya "Do u wanna use web server display/dashboard?"
 *       - User bilang "iya" / tekan tombol -> QR + IP + link web
 *       - User bilang "tidak" / timeout -> modus mandiri
 *    3. WEB_MODE: QR code + IP + URL server untuk dashboard
 *    4. MODE MANDIRI: Push-to-Talk voice command / Smart-Review / Baca
 *
 *  TRANSPORT: MQTT saja
 *   Topic (prefix MQTT_TOPIC_PREFIX "edubook/demo"):
 *     /page    ESP32 -> server     {"page_number": n}
 *     /navbar  ESP32 -> server     {"action": "start_voice" | "stop_voice" |
 *                                   "next_tab" | "web_mode_yes" | "web_mode_no"}
 *     /voice   ESP32 -> server     {"student_name","page","text_hafalan",
 *                                   "paragraph_id","context","language"}
 *     /audio   server -> ESP32     {"keyword": "iya"|"tidak"|...} or
 *                                  {"feedback":..., "score":..., "page":...} or
 *                                  {"text":..., "intent":..., "data":...}
 *     /sync    bidirectional       {"page": n}
 *     /config  server -> ESP32     {"student_name":"...", "language":"id"|"en"}
 *
 *  LIBRARY (Arduino IDE Library Manager):
 *    - TFT_eSPI    (Bodmer)
 *    - PubSubClient (knolleary)
 *    - ArduinoJson >= 7.0 (bblanchon)
 *
 *  SETUP PENTING - PIN TFT_eSPI (bukan di file .ino, tapi di):
 *    <Documents>/Arduino/libraries/TFT_eSPI/User_Setup.h
 *    #define ILI9341_DRIVER
 *    #define TFT_MISO   19
 *    #define TFT_MOSI   23
 *    #define TFT_SCLK   18
 *    #define TFT_CS      5
 *    #define TFT_DC     21
 *    #define TFT_RST    22
 *    #define LOAD_GLCD
 *    #define LOAD_FONT2
 *    #define SPI_FREQUENCY 27000000
 *
 *  PIN WIRING (ESP32 DevKit V1):
 *    ILI9341  : SCK=GPIO18  MOSI=GPIO23  MISO=GPIO19  CS=GPIO5  DC=GPIO21
 *               RESET=GPIO22
 *    INMP441  : SCK=GPIO26  WS=GPIO25  SD=GPIO33
 *    MAX98357A: BCLK=GPIO27  LRC=GPIO32  DIN=GPIO13
 *    Button   : GPIO0 (boot button, INPUT_PULLUP)
 *    LED      : GPIO2 (onboard blue LED)
 * ============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <SPIFFS.h>
#define MQTT_MAX_PACKET_SIZE 48000
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>
#include <qrcode.h>
#include <HTTPClient.h>
#include <driver/i2s.h>

// ============================================================================
// KONFIGURASI JARINGAN
// ============================================================================
#define WIFI_SSID      "Infinix NOTE 60"
#define WIFI_PASSWORD  "bismillah"

#define MQTT_BROKER_HOST   "broker.hivemq.com"
#define MQTT_BROKER_PORT   1883
#define MQTT_TOPIC_PREFIX  "edubook/demo"

#define MQTT_TOPIC_PAGE   STR(MQTT_TOPIC_PREFIX) "/page"
#define MQTT_TOPIC_NAV    STR(MQTT_TOPIC_PREFIX) "/navbar"
#define MQTT_TOPIC_VOICE  STR(MQTT_TOPIC_PREFIX) "/voice"
#define MQTT_TOPIC_AUDIO  STR(MQTT_TOPIC_PREFIX) "/audio"
#define MQTT_TOPIC_SYNC   STR(MQTT_TOPIC_PREFIX) "/sync"
#define MQTT_TOPIC_CONFIG STR(MQTT_TOPIC_PREFIX) "/config"
#define STR(x) #x

#define DASHBOARD_URL "https://edubookdashboard.netlify.app"
#define SERVER_URL    "https://blazer-repaying-backlight.ngrok-free.dev"

#define MQTT_CLIENT_ID       "edubook-devkitv1"

// ============================================================================
// PIN
// ============================================================================
#define TFT_BL      15
#define BUTTON_PIN  0
#define LED_STATUS  2

#define I2S_MIC_SCK 26
#define I2S_MIC_WS  25
#define I2S_MIC_SD  33

#define I2S_SPK_SCK 27
#define I2S_SPK_WS  32
#define I2S_SPK_SD  13

// ============================================================================
// KONFIGURASI AUDIO / WAKTU
// ============================================================================
#define SAMPLE_RATE          16000
#define BITS_PER_SAMPLE      16
#define BYTES_PER_SEC        32000

#define RECORD_BUFFER_SIZE       32000
#define MAX_VOICE_DURATION_MS    60000
#define SILENCE_TIMEOUT_MS       5000
#define HAFALAN_DURATION_MS      10000
#define KEYWORD_CLIP_MS          2000
#define ASK_MODE_TIMEOUT_MS      15000
#define SERVER_REPLY_TIMEOUT_MS  15000
#define BOOK_FETCH_TIMEOUT_MS    8000
#define BUTTON_DEBOUNCE_MS       200

#define TOTAL_PAGES  10

// ============================================================================
// WARNA TFT
// ============================================================================
#define COLOR_BG       TFT_BLACK
#define COLOR_PRIMARY  TFT_CYAN
#define COLOR_SUCCESS  TFT_GREEN
#define COLOR_WARNING  TFT_YELLOW
#define COLOR_ERROR    TFT_RED
#define COLOR_TEXT     TFT_WHITE
#define COLOR_MUTED    TFT_DARKGREY
#define COLOR_ACCENT   TFT_MAGENTA
#define COLOR_ORANGE   TFT_ORANGE

// ============================================================================
// BAHASA
// ============================================================================
enum Language { LANG_ID, LANG_EN };
Language currentLanguage = LANG_ID;

// ============================================================================
// STATE MACHINE
// ============================================================================
enum DeviceState {
  ST_BOOT,
  ST_CONNECTING,
  ST_ASK_MODE,
  ST_WEB_MODE,
  ST_STANDALONE_MENU,
  ST_VOICE_COMMAND,
  ST_VOICE_RECORDING,
  ST_VOICE_PROCESSING,
  ST_RESULT,
  ST_CHAT,
  ST_READ,
  ST_QUIZ,
  ST_PROFILE,
  ST_LEADERBOARD,
  ST_MISSIONS,
  ST_SETTINGS
};

// ============================================================================
// GLOBAL
// ============================================================================
DeviceState currentState = ST_BOOT;
DeviceState previousState = ST_BOOT;
DeviceState prevStateForVoice = ST_ASK_MODE;

int currentPage = 1;
int currentParagraph = 1;
bool webMode = false;
char studentName[64] = "Siswa_EduBook";

uint8_t* recordBuffer = nullptr;
size_t recordSize = 0;
bool recordingState = false;
unsigned long voiceStartTime = 0;
unsigned long lastSoundTime = 0;
bool isRecording = false;

volatile bool gotFeedback = false;
int lastScore = 0;
char lastFeedback[256] = "";
volatile bool gotKeyword = false;
char lastKeyword[32] = "";
volatile bool gotVoiceResponse = false;
char voiceResponseText[512] = "";
char voiceResponseIntent[64] = "";
unsigned long waitStartTime = 0;

bool askScreenDrawn = false;
bool menuScreenDrawn = false;
bool webScreenDrawn = false;
bool quizScreenDrawn = false;
bool chatScreenDrawn = false;
bool resultScreenDrawn = false;
bool waitScreenDrawn = false;
bool voiceScreenDrawn = false;
bool profileScreenDrawn = false;
bool leaderboardScreenDrawn = false;
bool missionsScreenDrawn = false;
bool settingsScreenDrawn = false;

int menuSelection = 0;
int chatMessageCount = 0;
char chatMessages[5][256];

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
TFT_eSPI tft = TFT_eSPI();

// ============================================================================
// PROTOTYPES
// ============================================================================
static void setState(DeviceState s);
static void drawBootScreen();
static void drawConnectingScreen();
static void drawAskMode();
static void drawWebModeQR();
static void drawStandaloneMenu();
static void drawVoiceCommand();
static void drawRecordingUI();
static void drawRecBars(int level);
static void drawWaitingServer();
static void drawReadingPage();
static void drawQuizPlaceholder();
static void drawChatUI();
static void drawResultScreen(int score, const char* feedback);
static void drawProfileScreen();
static void drawLeaderboardScreen();
static void drawMissionsScreen();
static void drawSettingsScreen();
static void drawInfo(const char* line1, const char* line2, uint16_t color);
static void connectWiFi();
static void connectMQTT();
static void mqttCallback(char* topic, byte* payload, unsigned int length);
static void publishPage(int page);
static void publishNav(const char* action);
static void initMicI2S();
static void initSpeakerI2S();
static void startAudioCapture();
static void stopAudioCapture();
static int captureAudioTick();
static void sendAudioToServer();
static void playFeedbackSound(int score);
static bool fetchReadingPage(int page, char* titleOut, size_t titleLen, char* textOut, size_t textLen);
static void tftPrintWrap(const char* text, int16_t x, int16_t y, uint16_t width, uint16_t color);
static void checkButton();
static void handleAskModeVoice();
static void handleVoiceCommand();
static void handleServerKeyword();
static void handleVoiceResponse();
static char* base64Encode(const uint8_t* in, size_t len);
static void drawWaveform(int level);
static void drawCircularProgress(int percent);
static void drawStars(int score);
static void drawChatBubble(const char* text, bool isUser);
static void drawIconGrid(int selected);
static void saveLanguageToSPIFFS();
static void loadLanguageFromSPIFFS();
static void saveBookToCache(int page, const char* title, const char* text);
static bool loadBookFromCache(int page, char* title, char* text);
static const char* getLocalizedString(const char* idStr, const char* enStr);
static void toggleLanguage();

// ============================================================================
// SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_STATUS, OUTPUT);
  digitalWrite(LED_STATUS, LOW);
  if (TFT_BL >= 0) {
    pinMode(TFT_BL, OUTPUT);
    digitalWrite(TFT_BL, HIGH);
  }

  if (!SPIFFS.begin(true)) {
    Serial.println("[SPIFFS] Mount failed, formatting...");
  }

  loadLanguageFromSPIFFS();

  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);

  recordBuffer = (uint8_t*)malloc(RECORD_BUFFER_SIZE);
  if (!recordBuffer) {
    Serial.println("[FATAL] Out of memory untuk audio buffer!");
    tft.setCursor(10, 10);
    tft.println("Out of memory!");
    while (1) delay(1000);
  }

  initMicI2S();
  initSpeakerI2S();

  mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(MQTT_MAX_PACKET_SIZE);

  setState(ST_BOOT);
}

// ============================================================================
// MAIN LOOP
// ============================================================================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    return;
  }
  if (!mqttClient.connected()) {
    connectMQTT();
    if (mqttClient.connected()) mqttClient.loop();
    return;
  }
  mqttClient.loop();

  checkButton();

  switch (currentState) {
    case ST_BOOT:
      drawBootScreen();
      delay(1500);
      setState(ST_CONNECTING);
      break;

    case ST_CONNECTING:
      drawConnectingScreen();
      connectWiFi();
      connectMQTT();
      setState(ST_ASK_MODE);
      break;

    case ST_ASK_MODE:
      drawAskMode();
      handleAskModeVoice();
      break;

    case ST_WEB_MODE:
      drawWebModeQR();
      delay(100);
      break;

    case ST_STANDALONE_MENU:
      drawStandaloneMenu();
      delay(200);
      break;

    case ST_VOICE_COMMAND:
      drawVoiceCommand();
      handleVoiceCommand();
      break;

    case ST_VOICE_RECORDING:
      captureAudioTick();
      if (!recordingState || (millis() - voiceStartTime >= MAX_VOICE_DURATION_MS)) {
        stopAudioCapture();
        publishNav("stop_voice");
        sendAudioToServer();
        prevStateForVoice = ST_STANDALONE_MENU;
        waitStartTime = millis();
        setState(ST_VOICE_PROCESSING);
      }
      break;

    case ST_VOICE_PROCESSING:
      drawWaitingServer();
      if (gotVoiceResponse) {
        handleVoiceResponse();
      } else if (gotKeyword) {
        handleServerKeyword();
      } else if (gotFeedback) {
        gotFeedback = false;
        playFeedbackSound(lastScore);
        setState(ST_RESULT);
      } else if (millis() - waitStartTime >= SERVER_REPLY_TIMEOUT_MS) {
        tft.setTextColor(TFT_RED, TFT_BLACK);
        tft.setCursor(10, tft.height() - 30);
        tft.println("Tidak ada respon server.");
        delay(1200);
        setState(prevStateForVoice);
      }
      break;

    case ST_RESULT:
      drawResultScreen(lastScore, lastFeedback);
      break;

    case ST_CHAT:
      drawChatUI();
      break;

    case ST_READ:
      drawReadingPage();
      break;

    case ST_QUIZ:
      drawQuizPlaceholder();
      break;

    case ST_PROFILE:
      drawProfileScreen();
      break;

    case ST_LEADERBOARD:
      drawLeaderboardScreen();
      break;

    case ST_MISSIONS:
      drawMissionsScreen();
      break;

    case ST_SETTINGS:
      drawSettingsScreen();
      break;
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================
void setState(DeviceState s) {
  previousState = currentState;
  currentState = s;
  askScreenDrawn = false;
  menuScreenDrawn = false;
  webScreenDrawn = false;
  quizScreenDrawn = false;
  chatScreenDrawn = false;
  resultScreenDrawn = false;
  waitScreenDrawn = false;
  voiceScreenDrawn = false;
  profileScreenDrawn = false;
  leaderboardScreenDrawn = false;
  missionsScreenDrawn = false;
  settingsScreenDrawn = false;
}

// ============================================================================
// I2S AUDIO
// ============================================================================
void initMicI2S() {
  i2s_config_t cfg = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = (i2s_bits_per_sample_t)BITS_PER_SAMPLE,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 512,
    .use_apll = false
  };
  i2s_pin_config_t pins = {
    .bck_io_num = I2S_MIC_SCK,
    .ws_io_num = I2S_MIC_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_MIC_SD
  };
  i2s_driver_install(I2S_NUM_0, &cfg, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pins);
  Serial.println("[I2S] Microphone INMP441 OK (RX, I2S_NUM_0)");
}

void initSpeakerI2S() {
  i2s_config_t cfg = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = (i2s_bits_per_sample_t)BITS_PER_SAMPLE,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 512,
    .use_apll = true
  };
  i2s_pin_config_t pins = {
    .bck_io_num = I2S_SPK_SCK,
    .ws_io_num = I2S_SPK_WS,
    .data_out_num = I2S_SPK_SD,
    .data_in_num = I2S_PIN_NO_CHANGE
  };
  i2s_driver_install(I2S_NUM_1, &cfg, 0, NULL);
  i2s_set_pin(I2S_NUM_1, &pins);
  Serial.println("[I2S] Speaker MAX98357A OK (TX, I2S_NUM_1)");
}

void startAudioCapture() {
  recordSize = 0;
  recordingState = true;
  isRecording = true;
  lastSoundTime = millis();
}

void stopAudioCapture() {
  recordingState = false;
  isRecording = false;
}

int captureAudioTick() {
  static int16_t chunk[512];
  size_t bytesRead = 0;
  esp_err_t err = i2s_read(I2S_NUM_0, chunk, sizeof(chunk), &bytesRead, 10 / portTICK_PERIOD_MS);
  if (err != ESP_OK || bytesRead == 0) return 0;

  int n = bytesRead / 2;
  if (recordingState && recordBuffer && recordSize + bytesRead <= RECORD_BUFFER_SIZE) {
    memcpy(recordBuffer + recordSize, chunk, bytesRead);
    recordSize += bytesRead;
  }
  if (recordSize >= RECORD_BUFFER_SIZE) recordingState = false;

  long sum = 0;
  for (int i = 0; i < n; i++) sum += abs(chunk[i]);
  int rms = (n > 0) ? (int)(sum / n) : 0;

  if (currentState == ST_VOICE_RECORDING) drawRecBars(rms);
  return rms;
}

char* base64Encode(const uint8_t* in, size_t len) {
  static const char tab[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  size_t outLen = ((len + 2) / 3) * 4 + 1;
  char* out = (char*)malloc(outLen);
  if (!out) return nullptr;
  size_t oi = 0;
  for (size_t i = 0; i < len; i += 3) {
    uint32_t v = (uint32_t)in[i] << 16;
    if (i + 1 < len) v |= (uint32_t)in[i + 1] << 8;
    if (i + 2 < len) v |= in[i + 2];
    out[oi++] = tab[(v >> 18) & 63];
    out[oi++] = tab[(v >> 12) & 63];
    out[oi++] = (i + 1 < len) ? tab[(v >> 6) & 63] : '=';
    out[oi++] = (i + 2 < len) ? tab[v & 63] : '=';
  }
  out[oi] = '\0';
  return out;
}

void playFeedbackSound(int score) {
  static int16_t sine[512];
  int notes[4];
  int count;
  if (score >= 70) {
    notes[0] = 440; notes[1] = 554; notes[2] = 659; notes[3] = 880;
    count = 4;
  } else {
    notes[0] = 330; notes[1] = 262;
    count = 2;
  }
  for (int i = 0; i < count; i++) {
    for (int j = 0; j < 512; j++) {
      sine[j] = (int16_t)(10000.0 * sin(2.0 * PI * notes[i] * j / SAMPLE_RATE));
    }
    for (int repeat = 0; repeat < 4; repeat++) {
      size_t written = 0;
      i2s_write(I2S_NUM_1, sine, sizeof(sine), &written, portMAX_DELAY);
    }
    delay(40);
  }
}

// ============================================================================
// PUBLISH MQTT
// ============================================================================
void publishPage(int page) {
  JsonDocument doc;
  doc["page_number"] = page;
  String payload;
  serializeJson(doc, payload);
  mqttClient.publish(MQTT_TOPIC_PAGE, payload.c_str());
}

void publishNav(const char* action) {
  JsonDocument doc;
  doc["action"] = action;
  String payload;
  serializeJson(doc, payload);
  mqttClient.publish(MQTT_TOPIC_NAV, payload.c_str());
}

void sendAudioToServer() {
  if (recordSize == 0) {
    Serial.println("[VOICE] Tidak ada data audio untuk dikirim.");
    return;
  }

  char* b64 = base64Encode(recordBuffer, recordSize);
  if (!b64) {
    Serial.println("[VOICE] Gagal alokasi memori base64.");
    return;
  }

  size_t b64Len = strlen(b64);
  size_t payloadLen = b64Len + 512;
  if (payloadLen > MQTT_MAX_PACKET_SIZE) {
    Serial.printf("[VOICE] Ukuran payload (%u) melebihi batas.\n", (unsigned int)payloadLen);
    free(b64);
    return;
  }

  const char* context = (prevStateForVoice == ST_ASK_MODE) ? "ask_mode" : "voice_command";
  const char* lang = (currentLanguage == LANG_ID) ? "id" : "en";

  char* payload = (char*)malloc(payloadLen);
  if (payload) {
    snprintf(payload, payloadLen,
             "{\"student_name\":\"%s\",\"page\":%d,"
             "\"text_hafalan\":\"%s\",\"paragraph_id\":%d,"
             "\"context\":\"%s\",\"language\":\"%s\"}",
             studentName, currentPage, b64, currentParagraph, context, lang);
    bool pubOk = mqttClient.publish(MQTT_TOPIC_VOICE, payload);
    Serial.printf("[MQTT] Voice clip %d bytes (payload %u bytes, status=%s) -> %s\n",
                  recordSize, (unsigned int)payloadLen, pubOk ? "OK" : "FAILED", MQTT_TOPIC_VOICE);
    free(payload);
  } else {
    Serial.println("[VOICE] Gagal alokasi payload buffer.");
  }
  free(b64);
}

// ============================================================================
// MQTT CALLBACK
// ============================================================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  if (String(topic) == MQTT_TOPIC_AUDIO) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (err) return;

    if (doc.containsKey("keyword")) {
      String kw = doc["keyword"].as<String>();
      kw.toLowerCase();
      strncpy(lastKeyword, kw.c_str(), sizeof(lastKeyword) - 1);
      gotKeyword = true;
      Serial.printf("[MQTT] Keyword dari server: %s\n", lastKeyword);
    }

    if (doc.containsKey("feedback")) {
      strncpy(lastFeedback, doc["feedback"] | "", sizeof(lastFeedback) - 1);
      lastScore = doc["score"] | 0;
      gotFeedback = true;
      Serial.printf("[MQTT] Feedback: score=%d\n", lastScore);
    }

    if (doc.containsKey("text")) {
      strncpy(voiceResponseText, doc["text"] | "", sizeof(voiceResponseText) - 1);
      strncpy(voiceResponseIntent, doc["intent"] | "", sizeof(voiceResponseIntent) - 1);
      gotVoiceResponse = true;
      Serial.printf("[MQTT] Voice response: %s\n", voiceResponseText);
    }
  }

  if (String(topic) == MQTT_TOPIC_CONFIG) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err) {
      if (doc.containsKey("student_name")) {
        strncpy(studentName, doc["student_name"] | "Siswa_EduBook", sizeof(studentName) - 1);
        Serial.printf("[MQTT] student_name -> %s\n", studentName);
      }
      if (doc.containsKey("language")) {
        const char* lang = doc["language"] | "id";
        if (strcmp(lang, "en") == 0) {
          currentLanguage = LANG_EN;
        } else {
          currentLanguage = LANG_ID;
        }
        saveLanguageToSPIFFS();
        Serial.printf("[MQTT] language -> %s\n", lang);
      }
    }
  }

  if (String(topic) == MQTT_TOPIC_PAGE) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err && doc.containsKey("page")) {
      currentPage = doc["page"].as<int>();
      if (currentState == ST_READ) drawReadingPage();
    }
  }

  if (String(topic) == MQTT_TOPIC_NAV) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err && doc.containsKey("action") && strcmp(doc["action"] | "", "navigate_page") == 0) {
      currentPage = doc["page"] | currentPage;
      publishPage(currentPage);
    }
  }

  if (String(topic) == MQTT_TOPIC_SYNC) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (!err && doc.containsKey("page")) currentPage = doc["page"].as<int>();
  }
}

// ============================================================================
// HANDLE SERVER RESPONSES
// ============================================================================
void handleServerKeyword() {
  gotKeyword = false;
  if (strcmp(lastKeyword, "iya") == 0) {
    webMode = true;
    publishNav("web_mode_yes");
    setState(ST_WEB_MODE);
  } else if (strcmp(lastKeyword, "tidak") == 0) {
    webMode = false;
    publishNav("web_mode_no");
    setState(ST_STANDALONE_MENU);
  } else if (strcmp(lastKeyword, "smart_review") == 0) {
    setState(ST_VOICE_REVIEW);
  } else if (strcmp(lastKeyword, "quiz") == 0) {
    setState(ST_QUIZ);
  } else if (strcmp(lastKeyword, "chat") == 0) {
    setState(ST_CHAT);
  } else if (strcmp(lastKeyword, "baca") == 0) {
    currentPage = 1;
    setState(ST_READ);
  } else {
    setState(prevStateForVoice);
  }
}

void handleVoiceResponse() {
  gotVoiceResponse = false;

  if (strcmp(voiceResponseIntent, "show_hafalan_stats") == 0) {
    strncpy(lastFeedback, voiceResponseText, sizeof(lastFeedback) - 1);
    lastScore = 0;
    setState(ST_RESULT);
  } else if (strcmp(voiceResponseIntent, "show_leaderboard") == 0) {
    strncpy(lastFeedback, voiceResponseText, sizeof(lastFeedback) - 1);
    setState(ST_LEADERBOARD);
  } else if (strcmp(voiceResponseIntent, "show_missions") == 0) {
    strncpy(lastFeedback, voiceResponseText, sizeof(lastFeedback) - 1);
    setState(ST_MISSIONS);
  } else if (strcmp(voiceResponseIntent, "show_profile") == 0) {
    strncpy(lastFeedback, voiceResponseText, sizeof(lastFeedback) - 1);
    setState(ST_PROFILE);
  } else if (strcmp(voiceResponseIntent, "start_chat") == 0) {
    strncpy(lastFeedback, voiceResponseText, sizeof(lastFeedback) - 1);
    setState(ST_CHAT);
  } else if (strcmp(voiceResponseIntent, "read_materi") == 0) {
    currentPage = 1;
    setState(ST_READ);
  } else if (strcmp(voiceResponseIntent, "start_hafalan") == 0) {
    setState(ST_VOICE_REVIEW);
  } else if (strcmp(voiceResponseIntent, "start_quiz") == 0) {
    setState(ST_QUIZ);
  } else if (strcmp(voiceResponseIntent, "toggle_language") == 0) {
    toggleLanguage();
    setState(ST_SETTINGS);
  } else {
    strncpy(lastFeedback, voiceResponseText, sizeof(lastFeedback) - 1);
    setState(ST_RESULT);
  }
}

// ============================================================================
// INPUT SUARA
// ============================================================================
void handleAskModeVoice() {
  static unsigned long askStart = 0;
  static bool armed = false;
  if (askStart == 0) askStart = millis();

  if (millis() - askStart >= ASK_MODE_TIMEOUT_MS) {
    askStart = 0;
    armed = false;
    webMode = false;
    publishNav("web_mode_no");
    setState(ST_STANDALONE_MENU);
    return;
  }

  int level = captureAudioTick();
  if (!armed && level > 2000) {
    armed = true;
    Serial.println("[ASK_MODE] Suara terdeteksi, merekam...");
    startAudioCapture();
    voiceStartTime = millis();
  } else if (armed) {
    captureAudioTick();
    if (!recordingState || (millis() - voiceStartTime >= KEYWORD_CLIP_MS)) {
      stopAudioCapture();
      Serial.printf("[ASK_MODE] Kirim clip %d bytes ke server\n", recordSize);
      sendAudioToServer();
      prevStateForVoice = ST_ASK_MODE;
      waitStartTime = millis();
      askStart = 0;
      armed = false;
      setState(ST_VOICE_PROCESSING);
    }
  }
}

void handleVoiceCommand() {
  int level = captureAudioTick();

  if (level > 2000) {
    lastSoundTime = millis();
    if (!isRecording) {
      isRecording = true;
      startAudioCapture();
      voiceStartTime = millis();
      Serial.println("[VOICE_CMD] Suara terdeteksi, merekam...");
    }
  }

  if (isRecording) {
    if (millis() - lastSoundTime > SILENCE_TIMEOUT_MS) {
      stopAudioCapture();
      isRecording = false;
      Serial.printf("[VOICE_CMD] 5s diam, kirim %d bytes\n", recordSize);
      sendAudioToServer();
      prevStateForVoice = ST_STANDALONE_MENU;
      waitStartTime = millis();
      setState(ST_VOICE_PROCESSING);
    } else if (millis() - voiceStartTime > MAX_VOICE_DURATION_MS) {
      stopAudioCapture();
      isRecording = false;
      Serial.println("[VOICE_CMD] 60s timeout, kirim audio");
      sendAudioToServer();
      prevStateForVoice = ST_STANDALONE_MENU;
      waitStartTime = millis();
      setState(ST_VOICE_PROCESSING);
    }
  }
}

// ============================================================================
// TOMBOL FISIKA (Push-to-Talk)
// ============================================================================
void checkButton() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(BUTTON_DEBOUNCE_MS);
    unsigned long pressStart = millis();
    while (digitalRead(BUTTON_PIN) == LOW && (millis() - pressStart < 1500)) {
      delay(20);
      mqttClient.loop();
    }

    switch (currentState) {
      case ST_ASK_MODE:
        webMode = true;
        publishNav("web_mode_yes");
        setState(ST_WEB_MODE);
        break;
      case ST_WEB_MODE:
        webMode = false;
        publishNav("web_mode_no");
        setState(ST_STANDALONE_MENU);
        break;
      case ST_STANDALONE_MENU:
        setState(ST_VOICE_COMMAND);
        break;
      case ST_VOICE_COMMAND:
      case ST_VOICE_RECORDING:
        stopAudioCapture();
        isRecording = false;
        break;
      case ST_VOICE_PROCESSING:
        break;
      case ST_RESULT:
      case ST_LEADERBOARD:
      case ST_MISSIONS:
      case ST_PROFILE:
        setState(ST_STANDALONE_MENU);
        break;
      case ST_CHAT:
        sendAudioToServer();
        prevStateForVoice = ST_CHAT;
        waitStartTime = millis();
        setState(ST_VOICE_PROCESSING);
        break;
      case ST_READ:
        if (currentPage < TOTAL_PAGES) {
          currentPage++;
        } else {
          currentPage = 1;
          setState(ST_STANDALONE_MENU);
        }
        break;
      case ST_QUIZ:
        setState(ST_STANDALONE_MENU);
        break;
      case ST_SETTINGS:
        toggleLanguage();
        break;
      default:
        break;
    }
  }
}

// ============================================================================
// UI: LAYAR-LAYAR TFT 2.4" (ILI9341, 320x240)
// ============================================================================
void drawBootScreen() {
  tft.fillScreen(COLOR_BG);
  tft.setTextSize(2);
  tft.setCursor(40, 60);
  tft.setTextColor(COLOR_PRIMARY);
  tft.println("EduBook");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(30, 100);
  tft.println("SIC Batch 8");
  tft.setCursor(20, 140);
  tft.setTextColor(COLOR_MUTED);
  tft.println("Booting System...");
  for (int i = 0; i < 200; i += 10) {
    tft.fillRect(20, 170, i, 6, COLOR_PRIMARY);
    delay(30);
  }
  tft.fillRect(20, 170, 200, 6, COLOR_SUCCESS);
}

void drawConnectingScreen() {
  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_WARNING);
  tft.setCursor(20, 60);
  tft.println("Menghubungkan WiFi...");
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(20, 90);
  tft.print("SSID: ");
  tft.println(WIFI_SSID);
}

void drawInfo(const char* line1, const char* line2, uint16_t color) {
  tft.fillScreen(COLOR_BG);
  tft.setTextColor(color, COLOR_BG);
  tft.setTextSize(1);
  tft.setCursor(20, 100);
  tft.println(line1);
  if (line2) {
    tft.setCursor(20, 125);
    tft.println(line2);
  }
}

void drawAskMode() {
  if (askScreenDrawn) return;
  askScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextSize(1);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setCursor(20, 25);
  tft.println("Apakah kamu ingin");
  tft.setCursor(20, 45);
  tft.println("menggunakan Web Server");
  tft.setCursor(20, 65);
  tft.println("Display / Dashboard?");

  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(20, 100);
  tft.println("Ucapkan IYA / TIDAK,");
  tft.setCursor(20, 118);
  tft.println("atau tekan tombol:");

  tft.fillRect(20, 145, 80, 30, TFT_DARKGREEN);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(30, 153);
  tft.println("IYA");

  tft.fillRect(120, 145, 80, 30, TFT_MAROON);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(130, 153);
  tft.println("TIDAK");

  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(20, 195);
  tft.println("Atau tunggu 15 detik");
  tft.setCursor(20, 213);
  tft.println("untuk mode mandiri...");
}

void drawQRToTFT(esp_qrcode_handle_t qr) {
  int size = esp_qrcode_get_size(qr);
  int blockSize = 3;
  int qrSize = size * blockSize;
  int xOff = (tft.width() - qrSize) / 2;
  int yOff = 50;

  for (int y = 0; y < size; y++) {
    for (int x = 0; x < size; x++) {
      tft.fillRect(xOff + x * blockSize, yOff + y * blockSize,
                   blockSize, blockSize,
                   esp_qrcode_get_module(qr, x, y) ? TFT_BLACK : TFT_WHITE);
    }
  }

  tft.setTextColor(TFT_BLACK, TFT_WHITE);
  tft.setCursor(10, yOff + qrSize + 8);
  tft.print("URL : ");
  tft.println(DASHBOARD_URL);
  tft.setCursor(10, tft.getCursorY() + 13);
  tft.setTextColor(TFT_DARKGREY, TFT_WHITE);
  tft.println("Mode: Web Dashboard");
  tft.setCursor(10, tft.getCursorY() + 11);
  tft.setTextColor(TFT_BLACK, TFT_WHITE);
  tft.println("Scan QR / buka link di browser.");
  tft.setCursor(10, tft.getCursorY() + 11);
  tft.println("Mic laptop/HP utk input,");
  tft.setCursor(10, tft.getCursorY() + 11);
  tft.setTextColor(TFT_BLUE, TFT_WHITE);
  tft.println("output audio dari browser.");
}

void drawWebModeQR() {
  if (webScreenDrawn) return;
  webScreenDrawn = true;

  tft.fillScreen(TFT_WHITE);
  tft.setTextColor(TFT_BLACK, TFT_WHITE);
  tft.setTextSize(1);
  tft.setCursor(10, 5);
  tft.println("Web Dashboard Tersedia!");
  tft.setCursor(10, 22);
  tft.setTextColor(TFT_DARKGREY, TFT_WHITE);
  tft.print("IP  : ");
  tft.println(WiFi.localIP());

  esp_qrcode_config_t cfg = ESP_QRCODE_CONFIG_DEFAULT();
  cfg.qrcode_ecc_level = ESP_QRCODE_ECC_MED;
  cfg.display_func = drawQRToTFT;
  if (esp_qrcode_generate(&cfg, DASHBOARD_URL) != ESP_OK) {
    tft.setTextColor(TFT_RED, TFT_WHITE);
    tft.setCursor(10, 50);
    tft.println("Gagal generate QR!");
  }
}

void drawStandaloneMenu() {
  if (menuScreenDrawn) return;
  menuScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(20, 15);
  tft.println("MODE MANDIRI");
  tft.setTextSize(1);
  tft.drawFastHLine(0, 50, tft.width(), COLOR_MUTED);

  const char* menus[4] = {"1. Smart-Review Lisan", "2. Tantangan Kuis", "3. Tanya EduBot", "4. Baca Materi"};
  for (int i = 0; i < 4; i++) {
    if (i == menuSelection) {
      tft.fillRect(10, 60 + i * 25, 300, 22, COLOR_PRIMARY);
      tft.setTextColor(COLOR_BG);
    } else {
      tft.setTextColor(COLOR_TEXT);
    }
    tft.setCursor(20, 65 + i * 25);
    tft.println(menus[i]);
  }

  tft.setTextColor(COLOR_SUCCESS);
  tft.setCursor(20, 180);
  tft.println("Tekan tombol untuk");
  tft.setCursor(20, 198);
  tft.println("voice command!");

  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(20, 230);
  tft.println("INMP441: input  |  MAX98357A: output");
}

void drawVoiceCommand() {
  if (voiceScreenDrawn) return;
  voiceScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(30, 20);
  tft.println("MENDENGAR");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 60);
  tft.println("Tekan tombol dan bicara!");
  tft.setCursor(10, 80);
  tft.println("5 detik diam = selesai");
  tft.setCursor(10, 100);
  tft.println("Max 60 detik");

  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, 150);
  tft.println("Contoh:");
  tft.setCursor(10, 170);
  tft.println("\"gw mau liat rerata hafalan\"");
  tft.setCursor(10, 190);
  tft.println("\"tolong kasih leaderboard\"");
  tft.setCursor(10, 210);
  tft.println("\"saya mau chat teman\"");
}

void drawRecordingUI() {
  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_ERROR);
  tft.setTextSize(2);
  tft.setCursor(30, 20);
  tft.println("MEREKAM...");
  tft.fillCircle(tft.width() / 2, 80, 12, COLOR_ERROR);

  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 155);
  tft.println("Ucapkan hafalan Anda");
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, 175);
  tft.println("Tekan tombol utk selesai");
  tft.setCursor(10, 193);
  tft.println("Otomatis stop ~10 detik");
}

void drawRecBars(int level) {
  static unsigned long lastDraw = 0;
  if (millis() - lastDraw < 50) return;
  lastDraw = millis();

  tft.fillRect(0, 95, tft.width(), 45, COLOR_BG);
  for (int i = 0; i < 8; i++) {
    int off = random(-15, 15);
    int h = constrain(10 + (level >> 4) + off, 5, 45);
    tft.fillRect(30 + i * 25, 135 - h, 12, h, COLOR_SUCCESS);
  }
}

void drawWaitingServer() {
  static unsigned long lastBlink = 0;
  static int dotCount = 0;

  if (!waitScreenDrawn) {
    waitScreenDrawn = true;
    tft.fillScreen(COLOR_BG);
    tft.setTextColor(COLOR_WARNING);
    tft.setTextSize(2);
    tft.setCursor(15, 55);
    tft.println("Memproses");
    tft.setTextSize(1);
    tft.setTextColor(COLOR_MUTED);
    tft.setCursor(15, 100);
    tft.println("Server AI sedang menilai.");
    tft.setCursor(15, 120);
    tft.println("Sementara itu cek dashboard");
    tft.setCursor(15, 138);
    tft.println("untuk progres live.");
  }

  if (millis() - lastBlink > 400) {
    lastBlink = millis();
    dotCount = (dotCount + 1) % 4;
    tft.fillRect(145, 55, 60, 20, COLOR_BG);
    tft.setTextColor(COLOR_WARNING);
    tft.setTextSize(2);
    tft.setCursor(145, 55);
    for (int d = 0; d < dotCount; d++) tft.print(".");
  }
}

void drawReadingPage() {
  static int drawnPage = -1;
  if (drawnPage == currentPage) return;
  drawnPage = currentPage;

  char title[128];
  char text[2000];
  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setCursor(10, 5);
  tft.setTextSize(1);
  tft.print("Halaman ");
  tft.println(currentPage);
  tft.drawFastHLine(0, 22, tft.width(), COLOR_MUTED);

  if (fetchReadingPage(currentPage, title, sizeof(title), text, sizeof(text))) {
    tft.setTextColor(COLOR_TEXT);
    tft.setCursor(10, 30);
    tft.println(title);
    tft.setTextColor(TFT_LIGHTGREY);
    tftPrintWrap(text, 10, 55, tft.width() - 20, TFT_LIGHTGREY);
    publishPage(currentPage);
  } else {
    tft.setTextColor(COLOR_ERROR);
    tft.setCursor(10, 55);
    tft.println("Gagal memuat materi.");
    tft.setTextColor(COLOR_MUTED);
    tft.setCursor(10, 80);
    tft.println("Pastikan server aktif &");
    tft.setCursor(10, 98);
    tft.println("URL backend benar.");
  }

  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, tft.height() - 20);
  tft.println("Tombol = halaman berikutnya");
}

void drawQuizPlaceholder() {
  if (quizScreenDrawn) return;
  quizScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_WARNING);
  tft.setTextSize(2);
  tft.setCursor(10, 30);
  tft.println("TANTANGAN KUIS");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 65);
  tft.println("Buka Web Dashboard untuk");
  tft.setCursor(10, 85);
  tft.println("menjawab kuis interaktif.");
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, 130);
  tft.println("(tombol untuk kembali)");
}

void drawChatUI() {
  if (chatScreenDrawn) return;
  chatScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(10, 10);
  tft.println("CHAT MODE");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, 35);
  tft.println("Tekan tombol, bicara,");
  tft.setCursor(10, 50);
  tft.println("lepas = kirim pesan");

  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 80);
  tft.println("Pesan terakhir:");
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, 100);
  tft.println(voiceResponseText);

  tft.setTextColor(COLOR_SUCCESS);
  tft.setCursor(10, 200);
  tft.println("Tombol = kirim / kembali");
}

void drawResultScreen(int score, const char* feedback) {
  if (resultScreenDrawn) return;
  resultScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextSize(2);
  tft.setTextColor(score >= 70 ? COLOR_SUCCESS : COLOR_WARNING);
  tft.setCursor(40, 25);
  tft.print("Skor: ");
  tft.println(score);
  tft.drawFastHLine(0, 55, tft.width(), COLOR_MUTED);
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 75);
  tft.println(feedback);
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, tft.height() - 20);
  tft.println("Tombol untuk kembali");
}

void drawProfileScreen() {
  if (profileScreenDrawn) return;
  profileScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(10, 10);
  tft.println("PROFIL SAYA");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 40);
  tft.print("Nama: ");
  tft.println(studentName);
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, 60);
  tft.println("Level: Pemula AIoT");
  tft.setCursor(10, 80);
  tft.println("XP: 0");
  tft.setCursor(10, 100);
  tft.println("Streak: 0 hari");

  tft.setTextColor(COLOR_SUCCESS);
  tft.setCursor(10, 140);
  tft.println("Tombol = kembali");
}

void drawLeaderboardScreen() {
  if (leaderboardScreenDrawn) return;
  leaderboardScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(10, 10);
  tft.println("LEADERBOARD");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 40);
  tft.println("1. Raffa - 1500 XP");
  tft.setCursor(10, 60);
  tft.println("2. Kamu - 0 XP");
  tft.setCursor(10, 80);
  tft.println("3. Lainnya - 0 XP");

  tft.setTextColor(COLOR_SUCCESS);
  tft.setCursor(10, 140);
  tft.println("Tombol = kembali");
}

void drawMissionsScreen() {
  if (missionsScreenDrawn) return;
  missionsScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(10, 10);
  tft.println("MISI MINGGUAN");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 40);
  tft.println("1. Baca 5 halaman");
  tft.setCursor(10, 60);
  tft.println("2. Hafalan 5x");
  tft.setCursor(10, 80);
  tft.println("3. Kuis 3x");

  tft.setTextColor(COLOR_SUCCESS);
  tft.setCursor(10, 140);
  tft.println("Tombol = kembali");
}

void drawSettingsScreen() {
  if (settingsScreenDrawn) return;
  settingsScreenDrawn = true;

  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(10, 10);
  tft.println("PENGATURAN");
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(10, 40);
  tft.print("Bahasa: ");
  tft.println(currentLanguage == LANG_ID ? "Indonesia" : "English");
  tft.setTextColor(COLOR_MUTED);
  tft.setCursor(10, 60);
  tft.println("Tekan tombol untuk");
  tft.setCursor(10, 75);
  tft.println("ganti bahasa");

  tft.setTextColor(COLOR_SUCCESS);
  tft.setCursor(10, 140);
  tft.println("Tombol = ganti bahasa");
}

// ============================================================================
// ANIMASI CUSTOM
// ============================================================================
void drawWaveform(int level) {
  static unsigned long lastDraw = 0;
  if (millis() - lastDraw < 50) return;
  lastDraw = millis();

  tft.fillRect(0, 100, tft.width(), 40, COLOR_BG);
  for (int i = 0; i < 10; i++) {
    int h = constrain(5 + (level >> 4) + random(-10, 10), 3, 35);
    tft.fillRect(15 + i * 30, 120 - h, 15, h, COLOR_SUCCESS);
  }
}

void drawCircularProgress(int percent) {
  int cx = tft.width() / 2;
  int cy = 120;
  int r = 40;

  tft.drawCircle(cx, cy, r, COLOR_MUTED);
  int endAngle = map(percent, 0, 100, 0, 360);
  for (int angle = 0; angle < endAngle; angle += 5) {
    int x1 = cx + r * cos(angle * PI / 180);
    int y1 = cy + r * sin(angle * PI / 180);
    int x2 = cx + (r - 5) * cos(angle * PI / 180);
    int y2 = cy + (r - 5) * sin(angle * PI / 180);
    tft.drawLine(x1, y1, x2, y2, COLOR_SUCCESS);
  }
}

void drawStars(int score) {
  int starCount = (score >= 90) ? 3 : (score >= 70) ? 2 : (score >= 50) ? 1 : 0;
  for (int i = 0; i < 3; i++) {
    int x = 60 + i * 60;
    int y = 100;
    if (i < starCount) {
      tft.fillCircle(x, y, 15, COLOR_WARNING);
    } else {
      tft.drawCircle(x, y, 15, COLOR_MUTED);
    }
  }
}

void drawChatBubble(const char* text, bool isUser) {
  int y = 80;
  if (isUser) {
    tft.fillRect(20, y, 280, 40, COLOR_PRIMARY);
    tft.setTextColor(COLOR_BG);
  } else {
    tft.fillRect(20, y, 280, 40, COLOR_MUTED);
    tft.setTextColor(COLOR_TEXT);
  }
  tft.setCursor(30, y + 10);
  tft.println(text);
}

void drawIconGrid(int selected) {
  const char* labels[4] = {"Review", "Kuis", "Chat", "Baca"};
  for (int i = 0; i < 4; i++) {
    int x = 20 + (i % 2) * 150;
    int y = 60 + (i / 2) * 80;
    if (i == selected) {
      tft.fillRect(x, y, 140, 70, COLOR_PRIMARY);
      tft.setTextColor(COLOR_BG);
    } else {
      tft.drawRect(x, y, 140, 70, COLOR_MUTED);
      tft.setTextColor(COLOR_TEXT);
    }
    tft.setCursor(x + 10, y + 30);
    tft.println(labels[i]);
  }
}

// ============================================================================
// OFFLINE CACHE (SPIFFS)
// ============================================================================
void saveLanguageToSPIFFS() {
  File file = SPIFFS.open("/language.txt", FILE_WRITE);
  if (file) {
    file.print(currentLanguage == LANG_ID ? "id" : "en");
    file.close();
  }
}

void loadLanguageFromSPIFFS() {
  File file = SPIFFS.open("/language.txt", FILE_READ);
  if (file) {
    String lang = file.readString();
    currentLanguage = (lang == "en") ? LANG_EN : LANG_ID;
    file.close();
  }
}

void saveBookToCache(int page, const char* title, const char* text) {
  File file = SPIFFS.open("/book_cache.json", FILE_WRITE);
  if (file) {
    JsonDocument doc;
    doc["page"] = page;
    doc["title"] = title;
    doc["text"] = text;
    serializeJson(doc, file);
    file.close();
  }
}

bool loadBookFromCache(int page, char* title, char* text) {
  File file = SPIFFS.open("/book_cache.json", FILE_READ);
  if (file) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, file);
    file.close();
    if (!err && doc["page"] == page) {
      strncpy(title, doc["title"] | "", 128);
      strncpy(text, doc["text"] | "", 2000);
      return true;
    }
  }
  return false;
}

// ============================================================================
// BAHASA
// ============================================================================
const char* getLocalizedString(const char* idStr, const char* enStr) {
  return (currentLanguage == LANG_ID) ? idStr : enStr;
}

void toggleLanguage() {
  currentLanguage = (currentLanguage == LANG_ID) ? LANG_EN : LANG_ID;
  saveLanguageToSPIFFS();
  Serial.printf("[LANG] Switched to %s\n", currentLanguage == LANG_ID ? "Indonesia" : "English");
}

// ============================================================================
// UTILITAS
// ============================================================================
void tftPrintWrap(const char* text, int16_t x, int16_t y, uint16_t width, uint16_t color) {
  uint16_t yPos = y;
  uint16_t lineWidth = 0;
  bool first = true;
  for (const char* c = text; *c; c++) {
    if (*c == '\n') {
      yPos += 12;
      lineWidth = 0;
      first = true;
      continue;
    }
    String ch = String(*c);
    uint16_t w = tft.textWidth(ch);
    if (!first && lineWidth + w > width) {
      yPos += 12;
      lineWidth = 0;
      first = true;
    }
    tft.drawChar(x + lineWidth, yPos, *c, color, COLOR_BG, 1);
    lineWidth += w;
    first = false;
  }
}

bool fetchReadingPage(int page, char* titleOut, size_t titleLen, char* textOut, size_t textLen) {
  if (loadBookFromCache(page, titleOut, textOut)) {
    Serial.printf("[HTTP] Loaded page %d from cache\n", page);
    return true;
  }

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/book/" + String(page);
  Serial.printf("[HTTP] GET %s\n", url.c_str());

  bool beginOk = false;
  if (url.startsWith("https://")) {
    WiFiClientSecure secClient;
    secClient.setInsecure();
    beginOk = http.begin(secClient, url);
  } else {
    WiFiClient plainClient;
    beginOk = http.begin(plainClient, url);
  }

  if (!beginOk) {
    Serial.println("[HTTP] Inisialisasi koneksi gagal.");
    return false;
  }

  http.setTimeout(BOOK_FETCH_TIMEOUT_MS);
  http.addHeader("ngrok-skip-browser-warning", "true");
  http.addHeader("User-Agent", "EduBook-ESP32");

  int code = http.GET();
  if (code != 200) {
    Serial.printf("[HTTP] Gagal dengan status code: %d\n", code);
    http.end();
    return false;
  }

  String body = http.getString();
  http.end();

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err) {
    Serial.printf("[JSON] Parse error: %s\n", err.c_str());
    return false;
  }

  strncpy(titleOut, doc["title"] | "", titleLen - 1);
  titleOut[titleLen - 1] = '\0';

  const char* t = doc["paragraphs"][0]["text"] | "";
  strncpy(textOut, t, textLen - 1);
  textOut[textLen - 1] = '\0';

  saveBookToCache(page, titleOut, textOut);
  return true;
}

// ============================================================================
// JARINGAN
// ============================================================================
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[WiFi] Menghubungkan ke %s...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    attempts++;
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[WiFi] Terhubung! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(LED_STATUS, HIGH);
  } else {
    Serial.println("[WiFi] Gagal, restart...");
    digitalWrite(LED_STATUS, LOW);
    delay(500);
    ESP.restart();
  }
}

void connectMQTT() {
  int retries = 0;
  while (!mqttClient.connected() && retries < 5) {
    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      mqttClient.subscribe(MQTT_TOPIC_PAGE);
      mqttClient.subscribe(MQTT_TOPIC_NAV);
      mqttClient.subscribe(MQTT_TOPIC_AUDIO);
      mqttClient.subscribe(MQTT_TOPIC_SYNC);
      mqttClient.subscribe(MQTT_TOPIC_CONFIG);
      Serial.println("[MQTT] Terhubung ke broker.");
    } else {
      retries++;
      Serial.printf("[MQTT] Gagal (%d/5), coba lagi...\n", retries);
      delay(2000);
    }
  }
  if (!mqttClient.connected()) {
    drawInfo("MQTT broker tidak terhubung.", "Restart perangkat...", TFT_RED);
    delay(2000);
    ESP.restart();
  }
}
