#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <SPI.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include "time.h"

// === TFT ILI9341 Configuration ===
#define TFT_CS   15
#define TFT_DC   2
#define TFT_RST  4

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);

// === TFT Dimensions ===
#define TFT_WIDTH  320
#define TFT_HEIGHT 240

// === EduBuddy Animation Colors ===
#define EDU_BLUE    0x2D9A    // Biru edukatif
#define EDU_GREEN   0x3666    // Hijau
#define EDU_ORANGE  0xFD20    // Oranye
#define EDU_YELLOW  0xFF80    // Kuning
#define EDU_PINK    0xF9B6    // Pink
#define EDU_PURPLE  0x915C    // Ungu
#define EDU_WHITE   0xFFFF
#define EDU_BLACK   0x0000

// === Animasi Idle State ===
enum IdleAnimation {
  ANIM_IDLE = 0,
  ANIM_HAPPY = 1,
  ANIM_CURIOUS = 2,
  ANIM_THINKING = 3,
  ANIM_SLEEPING = 4
};

// === Layout Presisi dengan Zona ===
#define ZONE_HEADER    0
#define ZONE_CONTENT   40
#define ZONE_FACE      70
#define ZONE_TEXT      130
#define ZONE_FOOTER    200
#define FACE_RADIUS    35
#define HEAD_CENTER_X  160
#define HEAD_CENTER_Y  70

// === WiFi Configuration ===
const char* ssid = "Zsi";
const char* password = "malik123";

// === MQTT Configuration ===
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 8883;
const char* mqtt_username = "Zsiii";
const char* mqtt_password = "1234Malik";
const char* mqtt_topic_request = "edubuddy/request";
const char* mqtt_topic_response = "edubuddy/response";
const char* mqtt_topic_dht = "edubuddy/dht";
const char* mqtt_topic_output = "edubuddy/output";
const char* mqtt_topic_alarm = "edubuddy/alarm";
const char* mqtt_client_id = "esp32_edubuddy_tft";

// === Alarm Configuration ===
int ALARM_HOUR = 7;      // Default jam 7
int ALARM_MINUTE = 0;    // Default menit 0
bool alarmEnabled = true;
bool alarmTriggered = false;
bool alarmSounding = false;
unsigned long alarmStartTime = 0;
unsigned long alarmCheckTime = 0;
int alarmAnimationFrame = 0;

// === Alarm Setting Mode ===
bool settingAlarm = false;
int settingHour = ALARM_HOUR;
int settingMinute = ALARM_MINUTE;
bool settingHourMode = true; // true: atur jam, false: atur menit

// === Alarm Colors ===
#define ALARM_RED 0xF800
#define ALARM_YELLOW 0xFFE0
#define ALARM_ORANGE 0xFD20

// === Timing constants ===
const long debounceTime = 300;
const long MQTT_TIMEOUT = 15000;
const long MATH_QUIZ_TIME = 10000;
const long ANIMAL_QUIZ_TIME = 5000;

// === Global variables ===
int currentMode = 1;
String lastResponse = "";
String lastAnswer = "";
bool isProcessing = false;
bool waitingForResponse = false;
unsigned long lastButtonPress = 0;
unsigned long responseTimeout = 0;
unsigned long quizStartTime = 0;
bool showingQuestion = false;
bool showingAnswer = false;

// === DHT variables ===
float lastTemperature = 0.0;
float lastHumidity = 0.0;
bool dhtDataReceived = false;
unsigned long lastDHTUpdate = 0;

// === NTP ===
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;
const int daylightOffset_sec = 0;

// === MQTT client ===
WiFiClientSecure espClient;
PubSubClient client(espClient);

// === Animation states ===
IdleAnimation currentAnimation = ANIM_IDLE;
unsigned long lastActivityTime = 0;
unsigned long lastFrameTime = 0;
int animationState = 0;
bool eyesClosed = false;
unsigned long lastAnimChange = 0;
int animFrame = 0;
int bounceOffset = 0;
bool bounceUp = true;
int blushFrame = 0;
bool drawMochiNeeded = false;

bool timeInitialized = false;
unsigned long lastTimeUpdate = 0;

// === Button Pins ===
#define BTN_MODE 12
#define BTN_ACTION 14
#define BTN_REPEAT 22

// === LED Pins ===
#define LED_R 32
#define LED_G 26
#define LED_B 27

// === Buzzer Pin ===
#define BUZZER_PIN 25

// === Variabel Notifikasi ===
String lastNotification = "";
unsigned long notificationStartTime = 0;
bool showingNotification = false;
int notificationType = 0; // 0=info, 1=success, 2=error, 3=warning

// ===============================
// DEKLARASI FUNGSI (PROTOTYPES)
// ===============================
void setRGB(int r, int g, int b);
void updateActivityTime();
void drawSimpleBackground();
void drawMochiStyleFace(IdleAnimation anim, int frame, bool redrawAll = false);
void drawMochiStyleFaceAtPosition(IdleAnimation anim, int frame, int centerX, int centerY, bool redrawAll = false);
void drawExpressiveEyes(int centerX, int eyeY, int spacing, int size, int tilt, bool happy);
void drawBlinkingEyes(int centerX, int eyeY, int spacing, int size, int frame);
void drawSleepingEyes(int centerX, int eyeY, int spacing);
void drawExpressiveMouth(int centerX, int mouthY, IdleAnimation anim, int frame);
void updateIdleAnimation();
void drawPreciseLayout(String header, String content, String footer = "");
void centerText(String text, int y, int textSize = 2);
String splitString(String text, int maxLength, int startPos);
void clearMochiArea();
void clearMochiAreaAtPosition(int centerX, int centerY);

// Fungsi Intro Baru
void drawConnectingAnimation(String message, int progress);
void playStartupAnimation();
void showWelcomeScreen();
bool reconnectMQTTWithAnimation();

// Fungsi Display
void displayMessage(String header, String content, String footer = "");
void displayLoading(String message = "Berpikir...");
void displayBigNumber(int num);
void displayClock();
void displayMode();
void displayDHT(float temp, float hum);
void displayError();
void processResponse();
void showQuizAnswer();
void executeMode();
bool sendMQTTRequest(String prompt, int mode, int number);
void displayMathQuiz(String quiz);
void displayAnimalQuiz(String quiz);
void extractAnswerFromResponse(String response);
String getTimeGreeting(int hour);
bool isButtonPressed(int pin, int& lastState, unsigned long& lastPress);
void sendStatus(String status);
void callback(char* topic, byte* payload, unsigned int length);
bool reconnectMQTT();

// ===============================
// FUNGSI NOTIFIKASI
// ===============================
void showNotification(String message, int type = 0);
void updateNotification();
void drawNotification();
void drawNotificationIcon(int x, int y, int type);

// ===============================
// FUNGSI BUZZER
// ===============================
void beep(int frequency = 1000, int duration = 100);
void beepSuccess();
void beepError();
void beepWarning();
void beepInfo();
void beepButton();
void beepStartup();
void beepModeChange();
void beepLoading();
void beepQuizTime();
void beepAnswerReveal();
void beepTypewriter();

// ===============================
// FUNGSI MUSIK INTRO BARU
// ===============================
void playIntroMusic();
void playWelcomeMelody();
void playSuccessFanfare();
void playSystemReadyTone();

// ===============================
// FUNGSI TAMBAHAN UNTUK WAKTU
// ===============================
bool getLocalTimeWithTimeout(struct tm * info, uint32_t ms);

// ===============================
// FUNGSI ALARM
// ===============================
void checkAlarm();
void triggerAlarm();
void updateAlarm();
void drawAlarmAnimation();
void drawAlarmIcon(int x, int y, bool ringing);
void displayAlarmMenu();
void toggleAlarm();
void stopAlarm();
void processAlarmCommand(String command);
void playAlarmMelody();

// ===============================
// FUNGSI PENGATURAN ALARM
// ===============================
void displayAlarmSetting();
void changeAlarmTime(int hourChange, int minuteChange);
void saveAlarmTime();
void cancelAlarmSetting();
void processAlarmSettingButtons();

// ===============================
// IMPLEMENTASI FUNGSI MUSIK INTRO
// ===============================
void playIntroMusic() {
  int introMelody[] = {
    523, 587, 659, 698, 784, 880, 988, 1047
  };
  
  int introDuration[] = {
    150, 150, 150, 150, 150, 150, 150, 300
  };
  
  Serial.println("Playing intro music...");
  
  for (int i = 0; i < 8; i++) {
    tone(BUZZER_PIN, introMelody[i], introDuration[i]);
    delay(introDuration[i] + 20);
  }
  
  delay(100);
  tone(BUZZER_PIN, 659, 200);
  tone(BUZZER_PIN, 784, 200);
  delay(250);
  
  tone(BUZZER_PIN, 784, 300);
  tone(BUZZER_PIN, 988, 300);
  delay(350);
}

void playWelcomeMelody() {
  int welcomeMelody[] = {
    659, 659, 659, 523, 659, 784, 392,
    523, 523, 523, 392, 440, 523, 330,
    440, 440, 659, 784, 880, 659, 523, 440, 392
  };
  
  int welcomeDuration[] = {
    200, 200, 200, 150, 150, 400, 400,
    200, 200, 200, 150, 150, 400, 400,
    200, 200, 150, 150, 150, 150, 150, 150, 600
  };
  
  Serial.println("Playing welcome melody...");
  
  for (int i = 0; i < 22; i++) {
    tone(BUZZER_PIN, welcomeMelody[i], welcomeDuration[i]);
    delay(welcomeDuration[i] * 0.7);
  }
}

void playSuccessFanfare() {
  int fanfareMelody[] = {
    784, 0, 988, 0, 1175, 1319, 1568,
    1175, 1319, 1568, 1760, 1568, 1319, 1175, 988, 784
  };
  
  int fanfareDuration[] = {
    100, 50, 100, 50, 100, 100, 200,
    100, 100, 100, 300, 100, 100, 100, 100, 400
  };
  
  Serial.println("Playing success fanfare...");
  
  for (int i = 0; i < 16; i++) {
    if (fanfareMelody[i] > 0) {
      tone(BUZZER_PIN, fanfareMelody[i], fanfareDuration[i]);
    }
    delay(fanfareDuration[i]);
  }
}

void playSystemReadyTone() {
  tone(BUZZER_PIN, 1319, 100);
  delay(120);
  tone(BUZZER_PIN, 1568, 100);
  delay(120);
  tone(BUZZER_PIN, 1760, 150);
  delay(170);
  tone(BUZZER_PIN, 1568, 200);
}

void playAlarmMelody() {
  Serial.println("Playing alarm melody...");
  
  int alarmMelody[] = {
    784, 0, 880, 0, 784, 0, 880, 0,
    1047, 0, 1175, 0, 1047, 0, 1175, 0,
    784, 880, 784, 880, 1047, 1175, 1047, 1175
  };
  
  int alarmDuration[] = {
    200, 50, 200, 50, 200, 50, 200, 50,
    150, 50, 150, 50, 150, 50, 150, 50,
    100, 100, 100, 100, 100, 100, 100, 100
  };
  
  for (int i = 0; i < 24; i++) {
    if (alarmMelody[i] > 0) {
      tone(BUZZER_PIN, alarmMelody[i], alarmDuration[i]);
    }
    delay(alarmDuration[i]);
    
    if (!alarmSounding) break;
  }
  
  if (alarmSounding) {
    delay(500);
    playAlarmMelody();
  }
}

// ===============================
// IMPLEMENTASI FUNGSI BUZZER
// ===============================
void beep(int frequency, int duration) {
  tone(BUZZER_PIN, frequency, duration);
}

void beepSuccess() {
  tone(BUZZER_PIN, 1500, 100);
  delay(120);
  tone(BUZZER_PIN, 2000, 100);
}

void beepError() {
  tone(BUZZER_PIN, 300, 300);
}

void beepWarning() {
  for (int i = 0; i < 2; i++) {
    tone(BUZZER_PIN, 800, 100);
    delay(150);
  }
}

void beepInfo() {
  tone(BUZZER_PIN, 1200, 80);
}

void beepButton() {
  tone(BUZZER_PIN, 1000, 50);
}

void beepStartup() {
  tone(BUZZER_PIN, 1500, 100);
  delay(120);
  tone(BUZZER_PIN, 2000, 100);
  delay(120);
  tone(BUZZER_PIN, 2500, 150);
}

void beepModeChange() {
  tone(BUZZER_PIN, 1200, 50);
  delay(60);
  tone(BUZZER_PIN, 1400, 50);
}

void beepLoading() {
  tone(BUZZER_PIN, 800, 80);
}

void beepQuizTime() {
  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, 600, 100);
    delay(150);
  }
}

void beepAnswerReveal() {
  tone(BUZZER_PIN, 1000, 100);
  delay(120);
  tone(BUZZER_PIN, 1500, 100);
  delay(120);
  tone(BUZZER_PIN, 2000, 200);
}

void beepTypewriter() {
  int typeFreqs[] = {800, 900, 1000, 1100};
  int randomFreq = typeFreqs[random(0, 4)];
  tone(BUZZER_PIN, randomFreq, 30);
}

// ===============================
// FUNGSI TAMBAHAN UNTUK WAKTU
// ===============================
bool getLocalTimeWithTimeout(struct tm * info, uint32_t ms) {
  uint32_t start = millis();
  time_t now;
  while ((millis() - start) <= ms) {
    time(&now);
    localtime_r(&now, info);
    if (info->tm_year > (2016 - 1900)) {
      return true;
    }
    delay(10);
  }
  return false;
}

// ===============================
// IMPLEMENTASI FUNGSI NOTIFIKASI
// ===============================

void showNotification(String message, int type) {
  lastNotification = message;
  notificationType = type;
  notificationStartTime = millis();
  showingNotification = true;
  
  Serial.print("Notification [");
  switch(type) {
    case 1: Serial.print("SUCCESS"); break;
    case 2: Serial.print("ERROR"); break;
    case 3: Serial.print("WARNING"); break;
    default: Serial.print("INFO"); break;
  }
  Serial.print("]: ");
  Serial.println(message);
  
  switch(type) {
    case 0:
      setRGB(1, 1, 1);
      beepInfo();
      break;
    case 1:
      setRGB(0, 1, 0);
      beepSuccess();
      delay(50);
      tone(BUZZER_PIN, 1319, 80);
      delay(100);
      tone(BUZZER_PIN, 1568, 100);
      break;
    case 2:
      setRGB(1, 0, 0);
      beepError();
      delay(50);
      tone(BUZZER_PIN, 220, 150);
      delay(170);
      tone(BUZZER_PIN, 196, 200);
      break;
    case 3:
      setRGB(1, 1, 0);
      beepWarning();
      delay(50);
      for (int i = 0; i < 2; i++) {
        tone(BUZZER_PIN, 880, 120);
        delay(140);
        tone(BUZZER_PIN, 784, 120);
        delay(140);
      }
      break;
  }
  
  drawNotification();
}

void updateNotification() {
  if (showingNotification) {
    unsigned long currentTime = millis();
    
    if (currentTime - notificationStartTime > 2000) {
      showingNotification = false;
      
      if (!isProcessing && !waitingForResponse) {
        setRGB(0, 0, 0);
      }
      
      tft.fillRect(0, 0, TFT_WIDTH, 25, tft.color565(240, 245, 255));
      
      if (!isProcessing && !waitingForResponse && !showingQuestion && !settingAlarm) {
        switch(currentMode) {
          case 1:
            tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
            tft.setTextColor(EDU_WHITE);
            tft.setTextSize(2);
            tft.setCursor(10, ZONE_HEADER + 12);
            tft.print("MODE 1: ANGKA");
            break;
          case 2:
            tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
            tft.setTextColor(EDU_WHITE);
            tft.setTextSize(2);
            tft.setCursor(10, ZONE_HEADER + 12);
            tft.print("MODE 2: MATEMATIKA");
            break;
          case 3:
            tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
            tft.setTextColor(EDU_WHITE);
            tft.setTextSize(2);
            tft.setCursor(10, ZONE_HEADER + 12);
            tft.print("MODE 3: HEWAN");
            break;
          case 4:
            tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x3666);
            tft.setTextColor(EDU_WHITE);
            tft.setTextSize(2);
            tft.setCursor(10, ZONE_HEADER + 12);
            tft.print("DATA CUACA");
            break;
          case 5:
            struct tm timeinfo;
            if (getLocalTime(&timeinfo)) {
              String greeting = getTimeGreeting(timeinfo.tm_hour);
              tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x915C);
              tft.setTextColor(EDU_WHITE);
              tft.setTextSize(2);
              tft.setCursor(10, ZONE_HEADER + 12);
              tft.print(greeting);
            }
            break;
          case 6:
            if (settingAlarm) {
              tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0xFD20);
              tft.setTextColor(EDU_WHITE);
              tft.setTextSize(2);
              tft.setCursor(10, ZONE_HEADER + 12);
              tft.print("ATUR WAKTU ALARM");
            } else {
              tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x915C);
              tft.setTextColor(EDU_WHITE);
              tft.setTextSize(2);
              tft.setCursor(10, ZONE_HEADER + 12);
              tft.print("PENGATURAN ALARM");
            }
            break;
        }
      }
    }
  }
}

void drawNotification() {
  if (!showingNotification) return;
  
  uint16_t bgColor;
  switch(notificationType) {
    case 0:
      bgColor = 0x4D5D;
      break;
    case 1:
      bgColor = 0x3666;
      break;
    case 2:
      bgColor = 0xF800;
      break;
    case 3:
      bgColor = 0xFD20;
      break;
    default:
      bgColor = 0x4D5D;
  }
  
  tft.fillRect(0, 0, TFT_WIDTH, 25, bgColor);
  
  drawNotificationIcon(10, 4, notificationType);
  
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(1);
  
  String displayText = lastNotification;
  if (displayText.length() > 35) {
    displayText = displayText.substring(0, 32) + "...";
  }
  
  tft.setCursor(35, 8);
  tft.print(displayText);
  
  unsigned long elapsed = millis() - notificationStartTime;
  int timeLeft = 2 - (elapsed / 1000);
  if (timeLeft >= 0) {
    tft.setCursor(TFT_WIDTH - 25, 8);
    tft.print(String(timeLeft) + "s");
  }
}

void drawNotificationIcon(int x, int y, int type) {
  switch(type) {
    case 0:
      tft.fillRect(x + 3, y, 10, 14, EDU_WHITE);
      tft.fillRect(x + 5, y + 2, 6, 10, 0x4D5D);
      tft.fillRect(x + 7, y + 4, 2, 2, EDU_WHITE);
      tft.fillRect(x + 7, y + 8, 2, 4, EDU_WHITE);
      break;
      
    case 1:
      tft.fillRect(x, y, 14, 14, EDU_WHITE);
      tft.fillRect(x + 2, y + 2, 10, 10, 0x3666);
      for (int i = 0; i < 5; i++) {
        tft.drawPixel(x + 4 + i, y + 7 + i, EDU_WHITE);
        tft.drawPixel(x + 5 + i, y + 7 + i, EDU_WHITE);
      }
      for (int i = 0; i < 6; i++) {
        tft.drawPixel(x + 7 + i, y + 9 - i, EDU_WHITE);
        tft.drawPixel(x + 8 + i, y + 9 - i, EDU_WHITE);
      }
      break;
      
    case 2:
      tft.fillRect(x, y, 14, 14, EDU_WHITE);
      tft.fillRect(x + 2, y + 2, 10, 10, 0xF800);
      for (int i = 0; i < 10; i++) {
        tft.drawPixel(x + 2 + i, y + 2 + i, EDU_WHITE);
        tft.drawPixel(x + 3 + i, y + 2 + i, EDU_WHITE);
      }
      for (int i = 0; i < 10; i++) {
        tft.drawPixel(x + 11 - i, y + 2 + i, EDU_WHITE);
        tft.drawPixel(x + 12 - i, y + 2 + i, EDU_WHITE);
      }
      break;
      
    case 3:
      tft.fillTriangle(x + 7, y, x + 2, y + 14, x + 12, y + 14, EDU_WHITE);
      tft.fillTriangle(x + 8, y + 2, x + 4, y + 12, x + 10, y + 12, 0xFD20);
      tft.fillRect(x + 7, y + 8, 2, 4, EDU_WHITE);
      tft.fillRect(x + 7, y + 5, 2, 2, EDU_WHITE);
      break;
  }
}

// ===============================
// FUNGSI INTRO ANIMASI DENGAN SOUND TYPEWRITER
// ===============================

void drawConnectingAnimation(String message, int progress) {
  tft.fillScreen(tft.color565(240, 245, 255));
  
  tft.setTextColor(0x4D5D);
  tft.setTextSize(3);
  tft.setCursor(80, 40);
  tft.print("EduBuddy");
  
  tft.fillCircle(160, 100, 40, 0x4D5D);
  
  for (int i = 0; i < 8; i++) {
    int angle = (millis() / 50 + i * 45) % 360;
    int x = 160 + 30 * cos(angle * PI / 180);
    int y = 100 + 30 * sin(angle * PI / 180);
    tft.fillCircle(x, y, 3, 0xFD34);
  }
  
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(2);
  tft.setCursor(50, 150);
  tft.print(message);
  
  tft.drawRect(40, 180, 240, 20, 0x4D5D);
  int fillWidth = map(progress, 0, 100, 0, 236);
  tft.fillRect(42, 182, fillWidth, 16, 0x3666);
  
  tft.setTextColor(0x915C);
  tft.setTextSize(2);
  tft.setCursor(140, 210);
  tft.print(progress);
  tft.print("%");
}

void playStartupAnimation() {
  Serial.println("Playing startup animation...");
  
  tft.fillScreen(EDU_BLACK);
  delay(500);
  
  tft.setTextColor(0x4D5D);
  tft.setTextSize(4);
  
  String eduText = "EduBuddy";
  for (int i = 0; i <= eduText.length(); i++) {
    tft.fillScreen(EDU_BLACK);
    tft.setCursor(80, 80);
    tft.print(eduText.substring(0, i));
    
    if (i > 0 && eduText.charAt(i-1) != ' ') {
      beepTypewriter();
    }
    
    delay(150);
  }
  
  delay(500);
  
  tft.setTextColor(0xFD34);
  tft.setTextSize(2);
  String tagline = "Teman Belajar Anak";
  for (int i = 0; i <= tagline.length(); i++) {
    tft.fillRect(60, 130, 200, 30, EDU_BLACK);
    tft.setCursor(60, 130);
    tft.print(tagline.substring(0, i));
    
    if (i > 0 && tagline.charAt(i-1) != ' ') {
      beepTypewriter();
    }
    
    delay(100);
  }
  
  delay(500);
  
  for (int r = 1; r <= 40; r++) {
    tft.fillCircle(160, 180, r, 0x4D5D);
    if (r % 5 == 0) {
      tone(BUZZER_PIN, 400 + r*10, 20);
    }
    delay(20);
  }
  
  delay(300);
  tft.fillCircle(140, 170, 8, EDU_WHITE);
  tone(BUZZER_PIN, 1000, 50);
  delay(100);
  tft.fillCircle(180, 170, 8, EDU_WHITE);
  tone(BUZZER_PIN, 1100, 50);
  delay(200);
  tft.fillCircle(142, 168, 5, EDU_BLACK);
  tone(BUZZER_PIN, 1200, 50);
  delay(50);
  tft.fillCircle(182, 168, 5, EDU_BLACK);
  tone(BUZZER_PIN, 1300, 50);
  delay(200);
  
  for (int i = -8; i <= 8; i++) {
    tft.drawPixel(160 + i, 195 + (i*i)/20, 0xFB2C);
    if (abs(i) % 2 == 0) {
      tone(BUZZER_PIN, 800 + abs(i)*20, 15);
      delay(30);
    }
  }
  
  for (int s = 0; s < 3; s++) {
    int x = random(100, 220);
    int y = random(140, 160);
    tft.fillCircle(x, y, 3, EDU_YELLOW);
    tone(BUZZER_PIN, 2000, 100);
    delay(200);
    tft.fillCircle(x, y, 3, 0x4D5D);
  }
  
  delay(1000);
  
  for (int y = 0; y < 240; y += 8) {
    tft.drawFastHLine(0, y, 320, tft.color565(240, 245, 255));
  }
  
  delay(500);
}

void showWelcomeScreen() {
  tft.fillScreen(tft.color565(240, 245, 255));
  
  tft.fillRect(0, 0, 320, 50, 0x4D5D);
  tft.fillTriangle(0, 50, 50, 50, 0, 80, 0x4D5D);
  tft.fillTriangle(320, 50, 270, 50, 320, 80, 0x4D5D);
  
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(4);
  tft.setCursor(70, 10);
  tft.print("EDUBUDDY");
  
  tft.fillCircle(160, 130, 50, 0x4D5D);
  tft.fillCircle(140, 115, 15, EDU_WHITE);
  tft.fillCircle(180, 115, 15, EDU_WHITE);
  tft.fillCircle(142, 113, 10, EDU_BLACK);
  tft.fillCircle(182, 113, 10, EDU_BLACK);
  tft.fillCircle(144, 111, 4, EDU_YELLOW);
  tft.fillCircle(184, 111, 4, EDU_YELLOW);
  
  for (int i = -15; i <= 15; i++) {
    int x = 160 + i;
    int y = 145 - abs(i)/4;
    tft.drawPixel(x, y, 0xFB2C);
    if (abs(i) % 3 == 0) {
      tft.drawPixel(x, y+1, 0xFB2C);
    }
  }
  
  tft.fillCircle(120, 125, 8, 0xFD34);
  tft.fillCircle(200, 125, 8, 0xFD34);
  
  tft.setTextColor(0x3666);
  tft.setTextSize(2);
  tft.setCursor(70, 190);
  tft.print("Teman Belajar");
  tft.setCursor(90, 215);
  tft.print("Anak Indonesia");
  
  delay(3000);
  
  for (int x = 0; x < 320; x += 10) {
    tft.drawFastVLine(x, 0, 240, tft.color565(240, 245, 255));
  }
}

// ===============================
// FUNGSI ALARM
// ===============================

void checkAlarm() {
  if (!alarmEnabled || alarmTriggered || !timeInitialized) return;
  
  unsigned long currentTime = millis();
  if (currentTime - alarmCheckTime > 60000) {
    alarmCheckTime = currentTime;
    
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      int currentHour = timeinfo.tm_hour;
      int currentMinute = timeinfo.tm_min;
      
      if (currentHour == ALARM_HOUR && currentMinute == ALARM_MINUTE) {
        triggerAlarm();
      }
    }
  }
}

void triggerAlarm() {
  if (alarmTriggered) return;
  
  Serial.println("ALARM TERPICU!");
  alarmTriggered = true;
  alarmSounding = true;
  alarmStartTime = millis();
  
  showNotification("Waktunya bangun!", 3);
  
  StaticJsonDocument<200> doc;
  doc["type"] = "alarm";
  doc["status"] = "triggered";
  doc["time"] = String(ALARM_HOUR) + ":" + (ALARM_MINUTE < 10 ? "0" : "") + String(ALARM_MINUTE);
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  client.publish(mqtt_topic_alarm, payload.c_str());
  
  playAlarmMelody();
}

void updateAlarm() {
  if (!alarmSounding) return;
  
  unsigned long currentTime = millis();
  
  static unsigned long lastAlarmUpdate = 0;
  if (currentTime - lastAlarmUpdate > 200) {
    alarmAnimationFrame = (alarmAnimationFrame + 1) % 4;
    lastAlarmUpdate = currentTime;
    
    if (alarmSounding) {
      drawAlarmAnimation();
    }
  }
  
  if (currentTime - alarmStartTime > 30000) { // 30 detik
    stopAlarm();
  }
}

void drawAlarmAnimation() {
  if (!alarmSounding) return;
  
  int centerX = HEAD_CENTER_X;
  int centerY = HEAD_CENTER_Y;
  
  clearMochiArea();
  
  uint16_t faceColor = (alarmAnimationFrame % 2 == 0) ? ALARM_ORANGE : 0x4D5D;
  tft.fillCircle(centerX, centerY, FACE_RADIUS, faceColor);
  
  int eyeSpacing = 18;
  int eyeSize = 8;
  int eyeY = centerY - 3;
  
  if (alarmAnimationFrame % 2 == 0) {
    tft.fillCircle(centerX - eyeSpacing, eyeY, eyeSize, EDU_WHITE);
    tft.fillCircle(centerX + eyeSpacing, eyeY, eyeSize, EDU_WHITE);
    tft.fillCircle(centerX - eyeSpacing + 2, eyeY - 1, eyeSize - 3, EDU_BLACK);
    tft.fillCircle(centerX + eyeSpacing + 2, eyeY - 1, eyeSize - 3, EDU_BLACK);
  } else {
    tft.fillRect(centerX - eyeSpacing - eyeSize, eyeY - 3, eyeSize * 2, 6, faceColor);
    tft.fillRect(centerX + eyeSpacing - eyeSize, eyeY - 3, eyeSize * 2, 6, faceColor);
  }
  
  tft.fillCircle(centerX, centerY + 15, 6, ALARM_RED);
  
  drawAlarmIcon(centerX, centerY - FACE_RADIUS - 15, true);
  
  tft.setTextColor(ALARM_RED);
  tft.setTextSize(2);
  String alarmText = "BANGUN!";
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(alarmText.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, centerY + FACE_RADIUS + 10);
  tft.print(alarmText);
}

void drawAlarmIcon(int x, int y, bool ringing) {
  tft.fillCircle(x, y, 10, ringing ? ALARM_RED : 0x4D5D);
  tft.fillCircle(x, y, 8, EDU_WHITE);
  
  tft.fillRect(x - 12, y - 2, 24, 4, ringing ? ALARM_RED : 0x4D5D);
  tft.fillCircle(x - 12, y, 4, ringing ? ALARM_RED : 0x4D5D);
  tft.fillCircle(x + 12, y, 4, ringing ? ALARM_RED : 0x4D5D);
  
  tft.fillCircle(x, y, 4, ringing ? ALARM_YELLOW : 0x915C);
  
  if (ringing) {
    int radius = 12 + (alarmAnimationFrame % 3) * 4;
    tft.drawCircle(x, y, radius, ALARM_YELLOW);
  }
}

void displayAlarmMenu() {
  drawSimpleBackground();
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x915C);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  tft.setCursor(10, ZONE_HEADER + 12);
  tft.print("PENGATURAN ALARM");
  
  int centerX = HEAD_CENTER_X;
  int centerY = HEAD_CENTER_Y;
  drawAlarmIcon(centerX, centerY, alarmEnabled);
  
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(2);
  
  String statusText = "Status: " + String(alarmEnabled ? "AKTIF" : "NONAKTIF");
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(statusText.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, centerY + 50);
  tft.print(statusText);
  
  String timeText = String(ALARM_HOUR) + ":" + (ALARM_MINUTE < 10 ? "0" : "") + String(ALARM_MINUTE);
  tft.setTextSize(3);
  tft.setTextColor(0x001F);
  tft.getTextBounds(timeText.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, centerY + 80);
  tft.print(timeText);
  
  tft.setTextColor(0x915C);
  tft.setTextSize(1);
  tft.setCursor(40, ZONE_FOOTER);
  tft.print("MODE: Setting  ACTION: Matikan  REPEAT: UBAH");
}

// ===============================
// FUNGSI PENGATURAN ALARM
// ===============================

void displayAlarmSetting() {
  drawSimpleBackground();
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0xFD20);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  tft.setCursor(10, ZONE_HEADER + 12);
  tft.print("ATUR WAKTU ALARM");
  
  int centerX = HEAD_CENTER_X;
  int centerY = HEAD_CENTER_Y;
  
  // Gambar ikon alarm
  drawAlarmIcon(centerX, centerY - 30, false);
  
  // Tampilkan waktu yang sedang diatur
  tft.setTextSize(4);
  
  // Jam (highlight jika sedang diatur)
  if (settingHourMode) {
    tft.setTextColor(ALARM_RED); // Highlight jam
  } else {
    tft.setTextColor(0x001F);
  }
  
  String hourStr = String(settingHour < 10 ? "0" : "") + String(settingHour);
  tft.setCursor(120, centerY);
  tft.print(hourStr);
  
  // Titik dua
  tft.setTextColor(0x001F);
  tft.setCursor(150, centerY);
  tft.print(":");
  
  // Menit (highlight jika sedang diatur)
  if (!settingHourMode) {
    tft.setTextColor(ALARM_RED); // Highlight menit
  } else {
    tft.setTextColor(0x001F);
  }
  
  String minuteStr = String(settingMinute < 10 ? "0" : "") + String(settingMinute);
  tft.setCursor(170, centerY);
  tft.print(minuteStr);
  
  // Mode yang sedang aktif
  tft.setTextColor(0x915C);
  tft.setTextSize(2);
  tft.setCursor(100, centerY + 50);
  tft.print(settingHourMode ? "[ATUR JAM]" : "[ATUR MENIT]");
  
  // Instruksi
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(1);
  tft.setCursor(20, ZONE_FOOTER);
  tft.print("MODE: Ganti  ACTION: +1  REPEAT: -1");
  
  tft.setCursor(100, ZONE_FOOTER + 15);
  tft.print("Tahan 3 detik untuk SIMPAN");
}

void changeAlarmTime(int hourChange, int minuteChange) {
  if (settingHourMode) {
    settingHour += hourChange;
    if (settingHour < 0) settingHour = 23;
    if (settingHour > 23) settingHour = 0;
    
    // Bunyi untuk jam
    if (hourChange > 0) {
      tone(BUZZER_PIN, 1000, 50);
    } else if (hourChange < 0) {
      tone(BUZZER_PIN, 800, 50);
    }
  } else {
    settingMinute += minuteChange;
    if (settingMinute < 0) settingMinute = 59;
    if (settingMinute > 59) settingMinute = 0;
    
    // Bunyi untuk menit
    if (minuteChange > 0) {
      tone(BUZZER_PIN, 1200, 50);
    } else if (minuteChange < 0) {
      tone(BUZZER_PIN, 900, 50);
    }
  }
  
  // Update tampilan
  displayAlarmSetting();
}

void saveAlarmTime() {
  ALARM_HOUR = settingHour;
  ALARM_MINUTE = settingMinute;
  settingAlarm = false;
  
  // Kirim notifikasi MQTT
  StaticJsonDocument<200> doc;
  doc["type"] = "alarm_set";
  doc["hour"] = ALARM_HOUR;
  doc["minute"] = ALARM_MINUTE;
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  client.publish(mqtt_topic_alarm, payload.c_str());
  
  showNotification("Alarm diatur jam " + String(ALARM_HOUR) + ":" + 
                   (ALARM_MINUTE < 10 ? "0" : "") + String(ALARM_MINUTE), 1);
  
  // Bunyi konfirmasi
  tone(BUZZER_PIN, 1500, 100);
  delay(120);
  tone(BUZZER_PIN, 1800, 100);
  
  // Kembali ke menu alarm
  displayAlarmMenu();
}

void cancelAlarmSetting() {
  settingAlarm = false;
  settingHour = ALARM_HOUR;
  settingMinute = ALARM_MINUTE;
  
  showNotification("Pengaturan alarm dibatalkan", 0);
  
  // Kembali ke menu alarm, bukan displayMode() agar tetap di mode 6
  displayAlarmMenu();
}

void processAlarmSettingButtons() {
  static int lastModeState = HIGH, lastActionState = HIGH, lastRepeatState = HIGH;
  static unsigned long modePressTime = 0;
  static unsigned long actionPressTime = 0;
  static unsigned long repeatPressTime = 0;
  static bool modePressed = false;
  static bool actionPressed = false;
  static bool repeatPressed = false;
  
  int currentModeState = digitalRead(BTN_MODE);
  int currentActionState = digitalRead(BTN_ACTION);
  int currentRepeatState = digitalRead(BTN_REPEAT);
  
  // Tombol MODE - Ganti mode (jam/menit) atau simpan jika ditekan lama
  if (currentModeState == LOW && lastModeState == HIGH) {
    modePressTime = millis();
    modePressed = true;
    tone(BUZZER_PIN, 600, 50);
  }
  
  if (modePressed && currentModeState == HIGH) {
    unsigned long pressDuration = millis() - modePressTime;
    
    if (pressDuration < 3000) {
      // Tekan pendek: ganti mode jam/menit
      settingHourMode = !settingHourMode;
      tone(BUZZER_PIN, 800, 50);
      displayAlarmSetting();
    } else {
      // Tekan lama (3 detik): simpan
      saveAlarmTime();
      tone(BUZZER_PIN, 1500, 100);
    }
    
    modePressed = false;
  }
  
  // Tombol ACTION - Tambah (+1)
  if (currentActionState == LOW && lastActionState == HIGH) {
    actionPressTime = millis();
    actionPressed = true;
  }
  
  if (actionPressed && currentActionState == HIGH) {
    unsigned long pressDuration = millis() - actionPressTime;
    
    if (pressDuration < 1000) {
      // Tekan pendek: +1
      changeAlarmTime(1, 1);
    } else {
      // Tekan lama: +10 untuk jam, +5 untuk menit
      if (settingHourMode) {
        changeAlarmTime(10, 0);
      } else {
        changeAlarmTime(0, 5);
      }
    }
    
    actionPressed = false;
  }
  
  // Tombol REPEAT - Kurang (-1)
  if (currentRepeatState == LOW && lastRepeatState == HIGH) {
    repeatPressTime = millis();
    repeatPressed = true;
  }
  
  if (repeatPressed && currentRepeatState == HIGH) {
    unsigned long pressDuration = millis() - repeatPressTime;
    
    if (pressDuration < 1000) {
      // Tekan pendek: -1
      changeAlarmTime(-1, -1);
    } else {
      // Tekan lama: -10 untuk jam, -5 untuk menit
      if (settingHourMode) {
        changeAlarmTime(-10, 0);
      } else {
        changeAlarmTime(0, -5);
      }
    }
    
    repeatPressed = false;
  }
  
  lastModeState = currentModeState;
  lastActionState = currentActionState;
  lastRepeatState = currentRepeatState;
}

void toggleAlarm() {
  alarmEnabled = !alarmEnabled;
  showNotification(alarmEnabled ? "Alarm diaktifkan" : "Alarm dimatikan", 
                   alarmEnabled ? 1 : 0);
  
  StaticJsonDocument<200> doc;
  doc["type"] = "alarm";
  doc["status"] = alarmEnabled ? "enabled" : "disabled";
  doc["time"] = String(ALARM_HOUR) + ":" + (ALARM_MINUTE < 10 ? "0" : "") + String(ALARM_MINUTE);
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  client.publish(mqtt_topic_alarm, payload.c_str());
}

void stopAlarm() {
  if (!alarmSounding) return;
  
  alarmSounding = false;
  alarmTriggered = false;
  
  showNotification("Alarm dimatikan", 0);
  
  updateActivityTime();
  displayMode();
  
  StaticJsonDocument<200> doc;
  doc["type"] = "alarm";
  doc["status"] = "stopped";
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  client.publish(mqtt_topic_alarm, payload.c_str());
}

void processAlarmCommand(String command) {
  // Parse JSON jika command adalah JSON
  if (command.startsWith("{") && command.endsWith("}")) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, command);
    
    if (!error) {
      String type = doc["type"];
      
      if (type == "set_time") {
        // Set waktu alarm dari MQTT
        int hour = doc["hour"];
        int minute = doc["minute"];
        
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          ALARM_HOUR = hour;
          ALARM_MINUTE = minute;
          showNotification("Alarm diatur ke " + String(hour) + ":" + 
                         (minute < 10 ? "0" : "") + String(minute), 1);
          
          // Kirim konfirmasi
          StaticJsonDocument<200> respDoc;
          respDoc["type"] = "alarm_set_confirm";
          respDoc["hour"] = ALARM_HOUR;
          respDoc["minute"] = ALARM_MINUTE;
          respDoc["timestamp"] = millis();
          
          String payload;
          serializeJson(respDoc, payload);
          client.publish(mqtt_topic_alarm, payload.c_str());
        }
      } else if (type == "get_time") {
        // Kirim waktu alarm saat ini
        StaticJsonDocument<200> respDoc;
        respDoc["type"] = "alarm_current_time";
        respDoc["hour"] = ALARM_HOUR;
        respDoc["minute"] = ALARM_MINUTE;
        respDoc["enabled"] = alarmEnabled;
        respDoc["timestamp"] = millis();
        
        String payload;
        serializeJson(respDoc, payload);
        client.publish(mqtt_topic_alarm, payload.c_str());
      } else if (type == "stop") {
        stopAlarm();
      } else if (type == "toggle") {
        toggleAlarm();
      } else if (type == "status") {
        StaticJsonDocument<200> doc;
        doc["type"] = "alarm_status";
        doc["enabled"] = alarmEnabled;
        doc["triggered"] = alarmTriggered;
        doc["sounding"] = alarmSounding;
        doc["time"] = String(ALARM_HOUR) + ":" + (ALARM_MINUTE < 10 ? "0" : "") + String(ALARM_MINUTE);
        doc["timestamp"] = millis();
        
        String payload;
        serializeJson(doc, payload);
        client.publish(mqtt_topic_alarm, payload.c_str());
      }
    }
  } else {
    // Command string sederhana
    if (command == "stop") {
      stopAlarm();
    } else if (command == "toggle") {
      toggleAlarm();
    } else if (command == "status") {
      StaticJsonDocument<200> doc;
      doc["type"] = "alarm_status";
      doc["enabled"] = alarmEnabled;
      doc["triggered"] = alarmTriggered;
      doc["sounding"] = alarmSounding;
      doc["time"] = String(ALARM_HOUR) + ":" + (ALARM_MINUTE < 10 ? "0" : "") + String(ALARM_MINUTE);
      doc["timestamp"] = millis();
      
      String payload;
      serializeJson(doc, payload);
      client.publish(mqtt_topic_alarm, payload.c_str());
    }
  }
}

// ===============================
// FUNGSI SEND MQTT REQUEST
// ===============================

bool sendMQTTRequest(String prompt, int mode, int number) {
  if (!client.connected()) {
    Serial.println("MQTT not connected!");
    return false;
  }

  StaticJsonDocument<512> doc;
  doc["prompt"] = prompt;
  doc["mode"] = mode;
  doc["number"] = number;
  doc["timestamp"] = millis();

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("Sending MQTT request: " + requestBody);

  if (client.publish(mqtt_topic_request, requestBody.c_str())) {
    Serial.println("MQTT request sent successfully");
    return true;
  } else {
    Serial.println("Failed to send MQTT request");
    return false;
  }
}

// ===============================
// MODIFIKASI FUNGSI UTAMA DENGAN NOTIFIKASI & BUZZER & ALARM
// ===============================

void executeMode() {
  isProcessing = true;
  setRGB(1, 1, 0);
  updateActivityTime();
  
  if (currentMode == 6) {
    if (settingAlarm) {
      // Jika sedang setting alarm, simpan
      saveAlarmTime();
    } else {
      // Masuk ke mode setting alarm
      showNotification("Mode setting alarm", 0);
      settingAlarm = true;
      settingHour = ALARM_HOUR;
      settingMinute = ALARM_MINUTE;
      settingHourMode = true;
      displayAlarmSetting();
    }
    isProcessing = false;
    updateActivityTime();
    return;
  }

  showNotification("Memulai permainan...", 0);

  String prompt = "";
  String header = "";
  int randomNum = 0;

  if (currentMode == 1) {
    randomNum = random(1, 10);
    
    int note = map(randomNum, 1, 9, 523, 1047);
    tone(BUZZER_PIN, note, 200);
    
    beepLoading();
    displayBigNumber(randomNum);
    
    delay(100);
    tone(BUZZER_PIN, note, 150);
    showNotification("Angka " + String(randomNum) + " dipilih", 0);
    
    prompt = "Berikan 1 fakta menarik tentang angka " + String(randomNum) + " untuk anak 6 tahun. Jawab dalam maksimal 15 kata. Bahasa Indonesia sederhana.";
    header = "Angka " + String(randomNum);
    sendStatus("processing");

    displayLoading("BERPIKIR...");

  } else if (currentMode == 2) {
    randomNum = random(1, 6) * 10 + random(1, 6);

    tone(BUZZER_PIN, 659, 100);
    delay(120);
    tone(BUZZER_PIN, 784, 100);
    delay(120);
    tone(BUZZER_PIN, 988, 150);

    showNotification("Membuat soal matematika...", 0);

    prompt = "Buat 1 soal penjumlahan untuk anak SD (angka 1-10). Format: angka1+angka2=jawaban. Contoh: 3+2=5. Hanya tulis soal dan jawaban, tanpa penjelasan.";
    header = "Quiz Matematika";
    sendStatus("processing");

    displayLoading("BUAT SOAL...");

  } else if (currentMode == 3) {
    tone(BUZZER_PIN, 330, 100);
    delay(120);
    tone(BUZZER_PIN, 392, 100);
    delay(120);
    tone(BUZZER_PIN, 494, 150);

    showNotification("Membuat tebakan hewan...", 0);

    prompt = "Buat tebakan hewan dengan 3 ciri. Format: [ciri1, ciri2, ciri3] = [jawaban]. Contoh: [Berkaki empat, suka wortel, lompat-lompat] = [kelinci].";
    header = "Quiz Hewan";
    sendStatus("processing");

    displayLoading("BUAT SOAL...");
  } else if (currentMode == 4) {
    if (dhtDataReceived) {
      showNotification("Data suhu diperbarui", 1);
      displayDHT(lastTemperature, lastHumidity);
    } else {
      showNotification("Data sensor belum tersedia", 2);
      displayMessage("DATA SUHU", "Menunggu data sensor", "CEK DHT");
      delay(2000);
    }
    isProcessing = false;
    updateActivityTime();
    return;
  } else if (currentMode == 5) {
    showNotification("Mode Jam Aktif", 0);
    displayClock();
    isProcessing = false;
    updateActivityTime();
    return;
  }

  Serial.println("Mengirim request MQTT...");
  Serial.println("Prompt: " + prompt);

  if (sendMQTTRequest(prompt, currentMode, randomNum)) {
    showNotification("Permintaan dikirim ke server", 0);
    waitingForResponse = true;
    responseTimeout = millis();
    Serial.println("Request terkirim, menunggu response...");
  } else {
    showNotification("Gagal mengirim permintaan", 2);
    Serial.println("Gagal mengirim request");
    displayError();
    isProcessing = false;
    updateActivityTime();
  }
}

void processResponse() {
  if (lastResponse == "") {
    Serial.println("No response to process");
    showNotification("Tidak ada respon dari server", 2);
    return;
  }

  setRGB(0, 1, 0);
  Serial.println("Processing response: " + lastResponse);

  showNotification("Respon diterima!", 1);

  String cleanResponse = lastResponse;
  cleanResponse.trim();
  cleanResponse.replace("\"", "");
  cleanResponse.replace("\n", " ");
  cleanResponse.replace("\\n", " ");

  Serial.println("Cleaned response: " + cleanResponse);

  if (currentMode == 1) {
    if (cleanResponse.length() > 50) {
      cleanResponse = splitString(cleanResponse, 50, 0) + "...";
    }
    displayMessage("FAKTA ANGKA", cleanResponse, "TEKAN REPEAT");
    delay(3000);
    displayMode();
  } else if (currentMode == 2) {
    displayMathQuiz(cleanResponse);
  } else if (currentMode == 3) {
    displayAnimalQuiz(cleanResponse);
  }
  
  waitingForResponse = false;
  isProcessing = false;
}

void displayMathQuiz(String quiz) {
  Serial.println("Display Math Quiz: " + quiz);
  
  quiz.trim();
  quiz.replace("{\"response\":\"", "");
  quiz.replace("\"}", "");
  quiz.replace("\\\"", "\"");
  
  Serial.println("Cleaned quiz: " + quiz);

  int plusPos = quiz.indexOf('+');
  int equalPos = quiz.indexOf('=');

  if (plusPos > 0 && equalPos > plusPos) {
    String num1 = quiz.substring(0, plusPos);
    String num2 = quiz.substring(plusPos + 1, equalPos);
    
    num1.trim();
    num2.trim();
    
    showNotification("Soal matematika dibuat!", 1);
    Serial.println("Math question: " + num1 + " + " + num2);

    drawSimpleBackground();
    drawMochiStyleFace(ANIM_THINKING, 0, true);
    
    tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
    tft.setTextColor(EDU_WHITE);
    tft.setTextSize(2);
    
    String title = "SOAL MATEMATIKA";
    int16_t x1, y1;
    uint16_t w, h;
    tft.getTextBounds(title.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_HEADER + 12);
    tft.print(title);
    
    tft.setTextColor(0x001F);
    tft.setTextSize(4);
    
    String mathQuestion = num1 + "+" + num2 + "=?";
    tft.getTextBounds(mathQuestion.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT);
    tft.print(mathQuestion);
    
    tft.setTextColor(0x915C);
    tft.setTextSize(2);
    tft.setCursor(100, ZONE_FOOTER);
    tft.print("TUNGGU 10 DETIK");
    
    showingQuestion = true;
    quizStartTime = millis();
    Serial.println("Math quiz started, waiting 10 seconds...");
  } else {
    showNotification("Format soal tidak sesuai", 2);
    Serial.println("Format math quiz tidak sesuai");
    displayMessage("MATEMATIKA", "Format soal salah", "COBA LAGI");
    delay(5000);
    updateActivityTime();
    displayMode();
  }
}

void displayAnimalQuiz(String quiz) {
  quiz.trim();
  quiz.replace("{\"response\":\"", "");
  quiz.replace("\"}", "");

  Serial.println("Animal quiz: " + quiz);

  showNotification("Tebakan hewan dibuat!", 1);

  String ciriDisplay = lastResponse;
  if (ciriDisplay == "") ciriDisplay = quiz;

  ciriDisplay.replace("[", "");
  ciriDisplay.replace("]", "");
  
  if (ciriDisplay.length() > 50) {
    ciriDisplay = splitString(ciriDisplay, 50, 0) + "...";
  }

  drawSimpleBackground();
  drawMochiStyleFace(ANIM_CURIOUS, 0, true);
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  
  String title = "TEBAK HEWAN";
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(title.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_HEADER + 12);
  tft.print(title);
  
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(2);
  
  if (ciriDisplay.length() > 25) {
    int splitPoint = ciriDisplay.lastIndexOf(' ', 25);
    if (splitPoint == -1) splitPoint = 25;
    
    String line1 = ciriDisplay.substring(0, splitPoint);
    String line2 = ciriDisplay.substring(splitPoint + 1);
    
    tft.getTextBounds(line1.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT - 10);
    tft.print(line1);
    
    tft.getTextBounds(line2.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT + 15);
    tft.print(line2);
  } else {
    tft.getTextBounds(ciriDisplay.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT);
    tft.print(ciriDisplay);
  }
  
  tft.setTextColor(0x915C);
  tft.setTextSize(2);
  tft.setCursor(100, ZONE_FOOTER);
  tft.print("TUNGGU 5 DETIK");
  
  showingQuestion = true;
  quizStartTime = millis();
  Serial.println("Animal quiz started, waiting 5 seconds...");
}

void showQuizAnswer() {
  showingQuestion = false;
  showingAnswer = true;
  setRGB(0, 1, 0);
  
  playSuccessFanfare();
  
  showNotification("Menampilkan jawaban...", 0);

  drawSimpleBackground();
  drawMochiStyleFace(ANIM_HAPPY, 0, true);
  
  int16_t x1, y1;
  uint16_t w, h;
  
  if (currentMode == 2) {
    tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x3666);
    tft.setTextColor(EDU_WHITE);
    tft.setTextSize(2);
    tft.setCursor(10, ZONE_HEADER + 12);
    tft.print("JAWABAN");
    
    tft.setTextColor(0x915C);
    tft.setTextSize(6);
    
    tft.getTextBounds(lastAnswer.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT);
    tft.print(lastAnswer);
    
  } else if (currentMode == 3) {
    tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x3666);
    tft.setTextColor(EDU_WHITE);
    tft.setTextSize(2);
    tft.setCursor(10, ZONE_HEADER + 12);
    tft.print("JAWABAN");
    
    tft.setTextColor(0x3666);
    tft.setTextSize(4);
    
    tft.getTextBounds(lastAnswer.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT);
    tft.print(lastAnswer);
  }
  
  delay(3000);
  showingAnswer = false;
  updateActivityTime();
  displayMode();
}

void displayError() {
  showNotification("Koneksi gagal, coba lagi", 2);
  displayMessage("ERROR", "Koneksi gagal", "COBA LAGI");
  setRGB(1, 0, 0);
  delay(2500);
  isProcessing = false;
  waitingForResponse = false;
  updateActivityTime();
  displayMode();
}

// ===============================
// SETUP DENGAN NOTIFIKASI & BUZZER & MUSIK INTRO & ALARM
// ===============================

void setup() {
  Serial.begin(115200);
  Serial.println("EDUBUDDY TFT SEDERHANA STARTING...");

  pinMode(TFT_RST, OUTPUT);
  digitalWrite(TFT_RST, LOW);
  delay(100);
  digitalWrite(TFT_RST, HIGH);
  delay(500);
  
  tft.begin();
  tft.setRotation(1);
  
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("Starting intro sequence with music...");
  
  playIntroMusic();
  delay(300);
  
  beepStartup();
  playStartupAnimation();
  
  playWelcomeMelody();
  showNotification("Sistem EduBuddy dimulai", 0);
  
  showWelcomeScreen();
  
  delay(500);
  playSuccessFanfare();
  
  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(BTN_ACTION, INPUT_PULLUP);
  pinMode(BTN_REPEAT, INPUT_PULLUP);

  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);

  randomSeed(analogRead(A0));
  lastActivityTime = millis();

  setRGB(1, 1, 0);
  
  Serial.println("Connecting to WiFi...");
  showNotification("Menghubungkan ke WiFi...", 0);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  unsigned long wifiStartTime = millis();
  uint8_t attempts = 0;
  bool wifiConnected = false;
  
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    attempts++;
    int progress = map(attempts, 0, 30, 0, 100);
    
    drawConnectingAnimation("Menghubungkan WiFi...", progress);
    
    Serial.print(".");
    delay(500);
    
    if (WiFi.status() == WL_CONNECTED) {
      wifiConnected = true;
      break;
    }
  }
  
  if (wifiConnected) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    showNotification("WiFi terhubung: " + String(ssid), 1);
    delay(100);
    playSuccessFanfare();
    
    tft.fillScreen(tft.color565(240, 245, 255));
    tft.setTextColor(0x3666);
    tft.setTextSize(3);
    tft.setCursor(90, 80);
    tft.print("WiFi OK!");
    
    tft.setTextColor(EDU_BLACK);
    tft.setTextSize(2);
    tft.setCursor(40, 130);
    tft.print("WiFi Terhubung");
    
    for (int i = 0; i < 4; i++) {
      int radius = 15 + i * 8;
      tft.drawCircle(160, 200, radius, 0x3666);
    }
    tft.fillCircle(160, 200, 5, 0x3666);
    
    setRGB(0, 1, 0);
    delay(2000);
  } else {
    Serial.println("\nWiFi Connection Failed!");
    showNotification("Gagal menghubungkan WiFi", 2);
    
    tft.fillScreen(tft.color565(240, 245, 255));
    tft.setTextColor(0xFD20);
    tft.setTextSize(3);
    tft.setCursor(80, 80);
    tft.print("WiFi ERROR");
    
    tft.setTextColor(EDU_BLACK);
    tft.setTextSize(2);
    tft.setCursor(60, 130);
    tft.print("Gagal terhubung");
    
    tft.fillCircle(160, 200, 30, 0xFD20);
    tft.fillCircle(160, 200, 25, tft.color565(240, 245, 255));
    tft.setTextColor(0xFD20);
    tft.setTextSize(4);
    tft.setCursor(154, 192);
    tft.print("!");
    
    setRGB(1, 0, 0);
    delay(3000);
  }

  if (wifiConnected) {
    setRGB(0, 0, 1);
    
    Serial.println("Connecting to MQTT...");
    showNotification("Menghubungkan ke MQTT...", 0);
    
    espClient.setInsecure();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
    client.setKeepAlive(60);
    client.setSocketTimeout(30);
    
    tft.fillScreen(tft.color565(240, 245, 255));
    tft.setTextColor(0x4D5D);
    tft.setTextSize(3);
    tft.setCursor(70, 40);
    tft.print("MQTT Broker");
    
    bool mqttConnected = false;
    for (int i = 0; i < 5; i++) {
      tft.fillRect(80, 100, 160, 80, tft.color565(240, 245, 255));
      
      tft.fillRect(140, 110, 40, 40, 0x4D5D);
      tft.fillRect(150, 120, 20, 20, EDU_WHITE);
      
      for (int p = 0; p < 3; p++) {
        int x = 80 + (i + p) * 20;
        if (x < 140) {
          tft.fillRect(x, 130, 15, 10, 0x3666);
          tft.fillRect(x+2, 132, 11, 6, EDU_WHITE);
        }
      }
      
      tft.setTextColor(EDU_BLACK);
      tft.setTextSize(2);
      tft.setCursor(100, 170);
      tft.print("Menghubungkan");
      
      for (int d = 0; d < 3; d++) {
        if (d < (i % 4)) {
          tft.setCursor(220 + d*10, 170);
          tft.print(".");
        }
      }
      
      delay(500);
      
      if (i >= 2) {
        if (reconnectMQTT()) {
          mqttConnected = true;
          break;
        }
      }
    }
    
    if (mqttConnected) {
      showNotification("MQTT terhubung ke broker", 1);
      delay(100);
      playSuccessFanfare();
      
      tft.fillRect(80, 100, 160, 80, tft.color565(240, 245, 255));
      
      tft.setTextColor(0x3666);
      tft.setTextSize(3);
      tft.setCursor(120, 110);
      tft.print("MQTT OK!");
      
      tft.setTextColor(EDU_BLACK);
      tft.setTextSize(2);
      tft.setCursor(90, 150);
      tft.print("MQTT Terhubung");
      
      setRGB(0, 1, 0);
      delay(2000);
    } else {
      showNotification("Gagal menghubungkan MQTT", 2);
      
      tft.fillRect(80, 100, 160, 80, tft.color565(240, 245, 255));
      
      tft.setTextColor(0xFD20);
      tft.setTextSize(3);
      tft.setCursor(100, 110);
      tft.print("MQTT ERROR");
      
      tft.setTextColor(EDU_BLACK);
      tft.setTextSize(2);
      tft.setCursor(70, 150);
      tft.print("Gagal terhubung ke broker");
      
      setRGB(1, 0, 0);
      delay(3000);
    }
  }

  alarmCheckTime = millis();
  alarmStartTime = 0;
  Serial.println("Alarm initialized for " + String(ALARM_HOUR) + ":" + 
                 (ALARM_MINUTE < 10 ? "0" : "") + String(ALARM_MINUTE));
  
  tft.fillScreen(tft.color565(240, 245, 255));
  
  tft.drawRect(10, 10, 300, 220, 0x4D5D);
  tft.drawRect(12, 12, 296, 216, 0x4D5D);
  
  tft.setTextColor(0x4D5D);
  tft.setTextSize(4);
  
  int16_t x1, y1;
  uint16_t w, h;
  
  String title = "EduBuddy";
  tft.getTextBounds(title.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, 50);
  tft.print(title);
  
  tft.setTextColor(0xFD34);
  tft.setTextSize(2);
  tft.setCursor(110, 95);
  tft.print("Teman Belajar");
  
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(2);
  tft.setCursor(40, 140);
  if (WiFi.status() == WL_CONNECTED && client.connected()) {
    tft.print("Status: ONLINE");
    showNotification("Sistem siap digunakan!", 1);
  } else if (WiFi.status() == WL_CONNECTED) {
    tft.print("Status: SEMI-OFFLINE");
    showNotification("Mode semi-offline aktif", 3);
  } else {
    tft.print("Status: OFFLINE");
    showNotification("Mode offline aktif", 3);
  }

  for (int i = -4; i <= 4; i++) {
    tft.drawPixel(160 + i, 207 + (i*i)/10, 0xFB2C);
  }
  
  for (int count = 3; count > 0; count--) {
    tft.fillRect(140, 220, 40, 20, tft.color565(240, 245, 255));
    tft.setTextColor(0x915C);
    tft.setTextSize(2);
    tft.setCursor(155, 220);
    tft.print(count);
    
    if (count == 3) tone(BUZZER_PIN, 784, 100);
    else if (count == 2) tone(BUZZER_PIN, 880, 100);
    else if (count == 1) tone(BUZZER_PIN, 988, 100);
    
    delay(1000);
  }
  
  playSystemReadyTone();
  
  Serial.println("=== SETUP COMPLETE ===");
  
  drawSimpleBackground();
  displayMode();
}

// ===============================
// LOOP UTAMA DENGAN PERBAIKAN ALARM SETTING
// ===============================

void loop() {
  static int lastModeState = HIGH, lastActionState = HIGH, lastRepeatState = HIGH;
  static unsigned long lastIdleUpdate = 0;
  static unsigned long lastClockCheck = 0;

  if (!client.connected()) {
    showNotification("MQTT disconnected, reconnecting...", 3);
    reconnectMQTT();
  }
  client.loop();

  updateNotification();
  
  updateAlarm();
  
  if (!alarmSounding) {
    checkAlarm();
  }

  // ============================================
  // Handle alarm setting mode TANPA return
  // ============================================
  if (settingAlarm) {
    processAlarmSettingButtons();
    
    // Cek jika tombol MODE ditekan lama untuk keluar tanpa menyimpan
    static unsigned long modePressTime = 0;
    static bool modeLongPressHandled = false;
    
    int currentModeState = digitalRead(BTN_MODE);
    
    if (currentModeState == LOW && lastModeState == HIGH) {
      modePressTime = millis();
      modeLongPressHandled = false;
    }
    
    if (currentModeState == LOW && millis() - modePressTime > 5000 && !modeLongPressHandled) {
      // Tekan 5 detik untuk keluar tanpa menyimpan
      cancelAlarmSetting();
      tone(BUZZER_PIN, 300, 300);
      modeLongPressHandled = true;
    }
    
    lastModeState = currentModeState;
    
    // LANJUTKAN ke kode lainnya, jangan return!
    // Mode setting alarm akan aktif tapi tidak menghentikan loop
  }

  // ============================================
  // KODE NORMAL UNTUK SEMUA MODE
  // ============================================
  
  // Update idle animation hanya jika tidak setting alarm
  unsigned long currentTime = millis();
  if (!isProcessing && !waitingForResponse && !showingQuestion && !settingAlarm &&
      currentTime - lastActivityTime > 2000 && currentTime - lastIdleUpdate > 200) {
    updateIdleAnimation();
    lastIdleUpdate = currentTime;
  }

  if (waitingForResponse && millis() - responseTimeout > MQTT_TIMEOUT) {
    Serial.println("MQTT Response timeout!");
    showNotification("Waktu tunggu respon habis", 2);
    waitingForResponse = false;
    isProcessing = false;
    updateActivityTime();
    displayError();
  }

  if (showingQuestion && !showingAnswer) {
    unsigned long elapsedTime = millis() - quizStartTime;
    
    if (currentMode == 2) {
      if (elapsedTime >= MATH_QUIZ_TIME - 3000 && elapsedTime < MATH_QUIZ_TIME - 2000) {
        beepWarning();
      }
      if (elapsedTime >= MATH_QUIZ_TIME) {
        beepQuizTime();
        showQuizAnswer();
      }
    } else if (currentMode == 3) {
      if (elapsedTime >= ANIMAL_QUIZ_TIME - 2000 && elapsedTime < ANIMAL_QUIZ_TIME - 1000) {
        beepWarning();
      }
      if (elapsedTime >= ANIMAL_QUIZ_TIME) {
        beepQuizTime();
        showQuizAnswer();
      }
    }
  }

  if (currentMode == 4 && dhtDataReceived && millis() - lastDHTUpdate > 10000) {
    updateActivityTime();
    displayDHT(lastTemperature, lastHumidity);
    lastDHTUpdate = millis();
  }

  if (currentMode == 5 && millis() - lastClockCheck > 200) {
    displayClock();
    lastClockCheck = millis();
  }

  // ============================================
  // Tombol MODE harus bisa keluar dari setting alarm
  // ============================================
  if (isButtonPressed(BTN_MODE, lastModeState, lastButtonPress)) {
    Serial.println("MODE button pressed!");
    
    // Jika sedang setting alarm, tombol MODE sudah dihandle oleh processAlarmSettingButtons()
    // Tapi jika user ingin keluar dengan cepat tanpa menyimpan, bisa tekan MODE biasa
    if (settingAlarm) {
      // Tombol MODE pendek: ganti mode jam/menit (sudah dihandle)
      // Tombol MODE panjang: cancel (sudah dihandle di atas)
      // Biarkan processAlarmSettingButtons() yang handle
      beepButton();
    } 
    else if (!isProcessing && !waitingForResponse && !showingQuestion) {
      // Normal mode change
      int modeNotes[] = {523, 587, 659, 698, 784, 880};
      if (currentMode <= 6) {
        tone(BUZZER_PIN, modeNotes[currentMode-1], 100);
      }
      
      beepModeChange();
      showNotification("Mode diubah", 0);
      currentMode++;
      if (currentMode > 6) currentMode = 1;
      updateActivityTime();
      displayMode();
    }
  }

  // ============================================
  // Tombol ACTION
  // ============================================
  if (isButtonPressed(BTN_ACTION, lastActionState, lastButtonPress)) {
    Serial.println("ACTION button pressed!");
    
    if (settingAlarm) {
      // Jika sedang setting alarm, tombol ACTION dihandle oleh processAlarmSettingButtons()
      beepButton();
    }
    else if (currentMode == 6 && !settingAlarm) {
      beepButton();
      toggleAlarm();
      displayAlarmMenu();
    } else if (alarmSounding) {
      stopAlarm();
    } else if (!isProcessing && !waitingForResponse && !showingQuestion) {
      beepButton();
      showNotification("Action diproses...", 0);
      updateActivityTime();
      executeMode();
    }
  }

  // ============================================
  // Tombol REPEAT
  // ============================================
  if (isButtonPressed(BTN_REPEAT, lastRepeatState, lastButtonPress)) {
    Serial.println("REPEAT button pressed!");
    
    if (settingAlarm) {
      // Jika sedang setting alarm, tombol REPEAT dihandle oleh processAlarmSettingButtons()
      beepButton();
    }
    else if (alarmSounding) {
      stopAlarm();
    } else if (currentMode == 6 && !settingAlarm) {
      // Edit alarm time
      settingAlarm = true;
      settingHour = ALARM_HOUR;
      settingMinute = ALARM_MINUTE;
      settingHourMode = true;
      beepButton();
      showNotification("Edit waktu alarm", 0);
      displayAlarmSetting();
    } else if (!isProcessing && !waitingForResponse && !showingQuestion) {
      beepButton();
      showNotification("Mengulang respon terakhir", 0);
      updateActivityTime();
      if (lastResponse != "") {
        String shortResponse = lastResponse;
        if (shortResponse.length() > 50) {
          shortResponse = splitString(shortResponse, 50, 0) + "...";
        }
        displayMessage("ULANGI", shortResponse, "ACTION UNTUK LANJUT");
      } else {
        showNotification("Belum ada data untuk diulang", 3);
        displayMessage("INFO", "Belum ada data", "COBA ACTION DULU");
        delay(2000);
        updateActivityTime();
        displayMode();
      }
    }
  }

  // ============================================
  // Tambah cara keluar dari setting alarm dengan tombol ACTION lama
  // ============================================
  static unsigned long actionLongPressStart = 0;
  static bool actionLongPressHandled = false;
  
  int currentActionState = digitalRead(BTN_ACTION);
  
  if (settingAlarm) {
    if (currentActionState == LOW && lastActionState == HIGH) {
      actionLongPressStart = millis();
      actionLongPressHandled = false;
    }
    
    if (currentActionState == LOW && millis() - actionLongPressStart > 3000 && !actionLongPressHandled) {
      // Tahan ACTION 3 detik untuk keluar dan kembali ke menu alarm
      cancelAlarmSetting();
      tone(BUZZER_PIN, 500, 300);
      actionLongPressHandled = true;
    }
    
    if (currentActionState == HIGH) {
      actionLongPressHandled = false;
    }
  }
  
  lastActionState = currentActionState;

  delay(50);
}

// ===============================
// FUNGSI YANG TIDAK BERUBAH
// ===============================

void clearMochiArea() {
  tft.fillRect(HEAD_CENTER_X - FACE_RADIUS - 10, HEAD_CENTER_Y - FACE_RADIUS - 10, 
               (FACE_RADIUS + 10) * 2, (FACE_RADIUS + 10) * 2, tft.color565(240, 245, 255));
}

void clearMochiAreaAtPosition(int centerX, int centerY) {
  tft.fillRect(centerX - FACE_RADIUS - 10, centerY - FACE_RADIUS - 10, 
               (FACE_RADIUS + 10) * 2, (FACE_RADIUS + 10) * 2, tft.color565(240, 245, 255));
}

void drawMochiStyleFace(IdleAnimation anim, int frame, bool redrawAll) {
  int centerX = HEAD_CENTER_X;
  int centerY = HEAD_CENTER_Y + bounceOffset;
  
  if (redrawAll) {
    clearMochiArea();
  }
  
  tft.fillCircle(centerX, centerY, FACE_RADIUS, 0x4D5D);
  
  if (blushFrame < 10) {
    tft.fillCircle(centerX - 18, centerY + 5, 8, 0xFD34);
    tft.fillCircle(centerX + 18, centerY + 5, 8, 0xFD34);
  }
  
  int eyeSize = 7;
  int eyeSpacing = 18;
  int eyeY = centerY - 3;
  
  switch(anim) {
    case ANIM_IDLE:
      if (frame % 100 < 95) {
        drawExpressiveEyes(centerX, eyeY, eyeSpacing, eyeSize, 0, false);
      } else {
        drawBlinkingEyes(centerX, eyeY, eyeSpacing, eyeSize, frame);
      }
      break;
      
    case ANIM_HAPPY:
      drawExpressiveEyes(centerX, eyeY - 2, eyeSpacing, eyeSize - 1, 10, true);
      break;
      
    case ANIM_CURIOUS:
      drawExpressiveEyes(centerX, eyeY - 1, eyeSpacing, eyeSize + 1, -5, false);
      break;
      
    case ANIM_THINKING:
      drawExpressiveEyes(centerX, eyeY - 4, eyeSpacing, eyeSize, 15, false);
      break;
      
    case ANIM_SLEEPING:
      drawSleepingEyes(centerX, eyeY, eyeSpacing);
      break;
  }
  
  drawExpressiveMouth(centerX, centerY + 12, anim, frame);
}

void drawMochiStyleFaceAtPosition(IdleAnimation anim, int frame, int centerX, int centerY, bool redrawAll) {
  if (redrawAll) {
    clearMochiAreaAtPosition(centerX, centerY);
  }
  
  tft.fillCircle(centerX, centerY, FACE_RADIUS, 0x4D5D);
  
  if (blushFrame < 10) {
    tft.fillCircle(centerX - 18, centerY + 5, 8, 0xFD34);
    tft.fillCircle(centerX + 18, centerY + 5, 8, 0xFD34);
  }
  
  int eyeSize = 7;
  int eyeSpacing = 18;
  int eyeY = centerY - 3;
  
  switch(anim) {
    case ANIM_IDLE:
      if (frame % 100 < 95) {
        drawExpressiveEyes(centerX, eyeY, eyeSpacing, eyeSize, 0, false);
      } else {
        drawBlinkingEyes(centerX, eyeY, eyeSpacing, eyeSize, frame);
      }
      break;
      
    case ANIM_HAPPY:
      drawExpressiveEyes(centerX, eyeY - 2, eyeSpacing, eyeSize - 1, 10, true);
      break;
      
    case ANIM_CURIOUS:
      drawExpressiveEyes(centerX, eyeY - 1, eyeSpacing, eyeSize + 1, -5, false);
      break;
      
    case ANIM_THINKING:
      drawExpressiveEyes(centerX, eyeY - 4, eyeSpacing, eyeSize, 15, false);
      break;
      
    case ANIM_SLEEPING:
      drawSleepingEyes(centerX, eyeY, eyeSpacing);
      break;
  }
  
  drawExpressiveMouth(centerX, centerY + 12, anim, frame);
}

void drawExpressiveEyes(int centerX, int eyeY, int spacing, int size, int tilt, bool happy) {
  int leftEyeX = centerX - spacing;
  int rightEyeX = centerX + spacing;
  
  if (happy) {
    for (int i = -size; i <= size; i+=2) {
      int x1 = leftEyeX + i;
      int x2 = rightEyeX + i;
      int y = eyeY - abs(i)/4 + tilt/10;
      tft.drawPixel(x1, y, 0x0000);
      tft.drawPixel(x2, y, 0x0000);
    }
  } else {
    tft.fillCircle(leftEyeX, eyeY, size, EDU_WHITE);
    tft.fillCircle(rightEyeX, eyeY, size, EDU_WHITE);
    
    tft.fillCircle(leftEyeX + 1, eyeY - 1, size - 3, EDU_BLACK);
    tft.fillCircle(rightEyeX + 1, eyeY - 1, size - 3, EDU_BLACK);
  }
}

void drawBlinkingEyes(int centerX, int eyeY, int spacing, int size, int frame) {
  int blinkProgress = (frame % 100 - 95) * 3;
  int blinkHeight = max(1, size - blinkProgress);
  
  tft.fillRect(centerX - spacing - size, eyeY - blinkHeight, size * 2, blinkHeight * 2, 0x4D5D);
  tft.fillRect(centerX + spacing - size, eyeY - blinkHeight, size * 2, blinkHeight * 2, 0x4D5D);
}

void drawSleepingEyes(int centerX, int eyeY, int spacing) {
  for (int i = -4; i <= 4; i+=2) {
    int x1 = centerX - spacing + i;
    int x2 = centerX + spacing + i;
    int y = eyeY + abs(i)/2;
    tft.drawPixel(x1, y, 0x0000);
    tft.drawPixel(x2, y, 0x0000);
  }
}

void drawExpressiveMouth(int centerX, int mouthY, IdleAnimation anim, int frame) {
  switch(anim) {
    case ANIM_IDLE:
      for (int i = -6; i <= 6; i+=2) {
        int x = centerX + i;
        int y = mouthY + (i*i)/50;
        tft.drawPixel(x, y, 0xFB2C);
      }
      break;
      
    case ANIM_HAPPY:
      for (int i = -8; i <= 8; i+=2) {
        int x = centerX + i;
        int y = mouthY - abs(i)/3 + 3;
        tft.drawPixel(x, y, 0xFB2C);
      }
      break;
      
    case ANIM_CURIOUS:
      tft.drawCircle(centerX, mouthY, 4, 0xFB2C);
      break;
      
    case ANIM_THINKING:
      tft.drawLine(centerX - 6, mouthY, centerX + 6, mouthY, 0xFB2C);
      break;
      
    case ANIM_SLEEPING:
      tft.fillCircle(centerX, mouthY, 3, 0xFB2C);
      break;
  }
}

void updateIdleAnimation() {
  unsigned long currentTime = millis();
  
  static unsigned long lastBounceUpdate = 0;
  if (currentTime - lastBounceUpdate > 100) {
    if (bounceUp) {
      bounceOffset++;
      if (bounceOffset > 2) bounceUp = false;
    } else {
      bounceOffset--;
      if (bounceOffset < -2) bounceUp = true;
    }
    lastBounceUpdate = currentTime;
  }
  
  blushFrame = (blushFrame + 1) % 40;
  
  if (currentTime - lastAnimChange > random(10000, 15000)) {
    int newAnim = random(0, 5);
    currentAnimation = (IdleAnimation)newAnim;
    lastAnimChange = currentTime;
    animFrame = 0;
    drawMochiNeeded = true;
  }
  
  animFrame++;
  
  drawMochiStyleFace(currentAnimation, animFrame, drawMochiNeeded);
  drawMochiNeeded = false;
}

void drawSimpleBackground() {
  tft.fillScreen(tft.color565(240, 245, 255));
}

void drawPreciseLayout(String header, String content, String footer) {
  drawSimpleBackground();
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
  
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  
  int16_t x1, y1;
  uint16_t w, h;
  
  tft.getTextBounds(header.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_HEADER + 12);
  tft.print(header);
  
  tft.drawFastHLine(0, ZONE_HEADER + 40, TFT_WIDTH, EDU_YELLOW);
  
  drawMochiStyleFace(currentAnimation, animFrame, true);
  
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(2);
  
  if (content.length() > 20) {
    int splitPoint = content.lastIndexOf(' ', 20);
    if (splitPoint == -1) splitPoint = 20;
    
    String line1 = content.substring(0, splitPoint);
    String line2 = content.substring(splitPoint + 1);
    
    while (line2.length() > 0 && line2.charAt(0) == ' ') {
      line2 = line2.substring(1);
    }
    
    if (line2.length() > 20) {
      line2 = line2.substring(0, 17) + "...";
    }
    
    tft.getTextBounds(line1.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT);
    tft.print(line1);
    
    tft.getTextBounds(line2.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT + 25);
    tft.print(line2);
  } else {
    tft.getTextBounds(content.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT + 10);
    tft.print(content);
  }
  
  if (footer != "") {
    tft.setTextColor(0x915C);
    tft.setTextSize(2);
    
    tft.getTextBounds(footer.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_FOOTER);
    tft.print(footer);
  }
}

void centerText(String text, int y, int textSize) {
  tft.setTextSize(textSize);
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
  int x = (TFT_WIDTH - w) / 2;
  tft.setCursor(x, y);
  tft.print(text);
}

String splitString(String text, int maxLength, int startPos) {
  if (startPos >= text.length()) return "";
  
  String result = text.substring(startPos);
  if (result.length() > maxLength) {
    int lastSpace = result.lastIndexOf(' ', maxLength);
    if (lastSpace > 0) {
      result = result.substring(0, lastSpace);
    } else {
      result = result.substring(0, maxLength);
    }
  }
  return result;
}

void setRGB(int r, int g, int b) {
  digitalWrite(LED_R, r ? LOW : HIGH);
  digitalWrite(LED_G, g ? LOW : HIGH);
  digitalWrite(LED_B, b ? LOW : HIGH);
}

void updateActivityTime() {
  lastActivityTime = millis();
}

String getTimeGreeting(int hour) {
  if (hour >= 5 && hour < 12) return "Selamat Pagi!";
  else if (hour >= 12 && hour < 15) return "Selamat Siang!";
  else if (hour >= 15 && hour < 18) return "Selamat Sore!";
  else if (hour >= 18 && hour < 22) return "Selamat Malam!";
  else return "Waktunya Tidur!";
}

void displayMode() {
  String modeName = "";
  String modeDesc = "";
  
  switch(currentMode) {
    case 1:
      modeName = "MODE 1: ANGKA";
      modeDesc = "Belajar fakta angka";
      break;
    case 2:
      modeName = "MODE 2: MATEMATIKA";
      modeDesc = "Kuis penjumlahan";
      break;
    case 3:
      modeName = "MODE 3: HEWAN";
      modeDesc = "Tebak hewan";
      break;
    case 4:
      modeName = "MODE 4: SUHU";
      modeDesc = "Lihat suhu udara";
      if (dhtDataReceived) {
        displayDHT(lastTemperature, lastHumidity);
        return;
      }
      break;
    case 5:
      modeName = "MODE 5: JAM";
      modeDesc = "Lihat waktu";
      updateActivityTime();
      displayClock();
      return;
    case 6:
      // PERBAIKAN: Reset settingAlarm saat masuk mode alarm
      settingAlarm = false;
      modeName = "MODE 6: ALARM";
      modeDesc = "Pengaturan alarm";
      updateActivityTime();
      displayAlarmMenu();
      return;
  }
  
  int16_t x1, y1;
  uint16_t w, h;
  
  drawSimpleBackground();
  drawMochiStyleFace(currentAnimation, animFrame, true);
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  
  tft.getTextBounds(modeName.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_HEADER + 12);
  tft.print(modeName);
  
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(2);
  
  tft.getTextBounds(modeDesc.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT + 10);
  tft.print(modeDesc);
  
  tft.setTextColor(0x915C);
  tft.setTextSize(2);
  
  String footer = "TEKAN ACTION";
  tft.getTextBounds(footer.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_FOOTER);
  tft.print(footer);
}

void displayDHT(float temp, float hum) {
  drawSimpleBackground();
  drawMochiStyleFace(ANIM_CURIOUS, 0, true);
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x3666);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  
  int16_t x1, y1;
  uint16_t w, h;
  
  String title = "DATA CUACA";
  tft.getTextBounds(title.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_HEADER + 12);
  tft.print(title);
  
  tft.setTextColor(0x001F);
  tft.setTextSize(3);
  
  String tempStr = "Suhu: " + String(temp, 1) + "°C";
  tft.getTextBounds(tempStr.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT - 5);
  tft.print(tempStr);
  
  tft.setTextColor(0x3666);
  tft.setTextSize(3);
  
  String humStr = "Kelembapan: " + String(hum, 0) + "%";
  tft.getTextBounds(humStr.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_TEXT + 35);
  tft.print(humStr);
  
  tft.fillCircle(280, 165, 15, 0xFD20);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  tft.setCursor(276, 161);
  tft.print("C");
}

void displayClock() {
  static String lastTimeStr = "";
  static String lastDateStr = "";
  static String lastDayStr = "";
  static String lastGreeting = "";
  static bool firstRun = true;
  
  if (!timeInitialized) {
    if (firstRun) {
      drawPreciseLayout("JAM", "Menyiapkan waktu...", "TUNGGU");
      configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
      firstRun = false;
    }
    
    static unsigned long lastTry = 0;
    if (millis() - lastTry > 5000) {
      lastTry = millis();
      if (time(nullptr)) {
        timeInitialized = true;
        lastTimeUpdate = millis();
      }
    }
    return;
  }
  
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    timeInitialized = false;
    firstRun = true;
    return;
  }
  
  char timeStr[9];
  char dateStr[20];
  char dayStr[20];
  strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
  strftime(dateStr, sizeof(dateStr), "%d/%m/%Y", &timeinfo);
  strftime(dayStr, sizeof(dayStr), "%A", &timeinfo);
  
  String currentTimeStr = String(timeStr);
  String currentDateStr = String(dateStr);
  String currentDayStr = String(dayStr);
  String currentGreeting = getTimeGreeting(timeinfo.tm_hour);
  currentDayStr.toUpperCase();
  
  if (firstRun || currentGreeting != lastGreeting) {
    drawSimpleBackground();
    drawMochiStyleFace(ANIM_IDLE, 0, true);
    
    tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x915C);
    tft.setTextColor(EDU_WHITE);
    tft.setTextSize(2);
    tft.setCursor(10, ZONE_HEADER + 12);
    tft.print(currentGreeting);
    
    lastGreeting = currentGreeting;
    firstRun = false;
  }
  
  if (currentTimeStr != lastTimeStr) {
    tft.fillRect(40, ZONE_TEXT, 240, 45, tft.color565(240, 245, 255));
    
    tft.setTextColor(0x001F);
    tft.setTextSize(5);
    tft.setCursor(40, ZONE_TEXT);
    tft.print(currentTimeStr);
    
    lastTimeStr = currentTimeStr;
  }
  
  if (currentDateStr != lastDateStr) {
    tft.fillRect(80, ZONE_TEXT + 50, 160, 30, tft.color565(240, 245, 255));
    
    tft.setTextColor(0x915C);
    tft.setTextSize(3);
    tft.setCursor(80, ZONE_TEXT + 50);
    tft.print(currentDateStr);
    
    lastDateStr = currentDateStr;
  }
  
  if (currentDayStr != lastDayStr) {
    tft.fillRect(100, ZONE_TEXT + 90, 120, 25, tft.color565(240, 245, 255));
    
    tft.setTextSize(2);
    tft.setCursor(100, ZONE_TEXT + 90);
    tft.print(currentDayStr);
    
    lastDayStr = currentDayStr;
  }
  
  lastTimeUpdate = millis();
}

void displayMessage(String header, String content, String footer) {
  drawSimpleBackground();
  
  drawMochiStyleFace(ANIM_HAPPY, 0, true);
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  
  int16_t x1, y1;
  uint16_t w, h;
  
  tft.getTextBounds(header.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, ZONE_HEADER + 12);
  tft.print(header);
  
  tft.setTextColor(EDU_BLACK);
  tft.setTextSize(2);
  
  int contentY = ZONE_TEXT + 20;
  
  if (content.length() > 20) {
    int splitPoint = content.lastIndexOf(' ', 25);
    if (splitPoint == -1) splitPoint = 25;
    
    String line1 = content.substring(0, splitPoint);
    String line2 = content.substring(splitPoint + 1);
    
    while (line2.length() > 0 && line2.charAt(0) == ' ') {
      line2 = line2.substring(1);
    }
    
    if (line2.length() > 25) {
      line2 = line2.substring(0, 22) + "...";
    }
    
    tft.getTextBounds(line1.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, contentY);
    tft.print(line1);
    
    tft.getTextBounds(line2.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, contentY + 30);
    tft.print(line2);
  } else {
    tft.getTextBounds(content.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, contentY + 15);
    tft.print(content);
  }
  
  if (footer != "") {
    tft.setTextColor(0x915C);
    tft.setTextSize(2);
    
    tft.getTextBounds(footer.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor((TFT_WIDTH - w) / 2, ZONE_FOOTER + 10);
    tft.print(footer);
  }
}

void displayBigNumber(int num) {
  drawSimpleBackground();
  
  tft.fillRect(0, 0, TFT_WIDTH, 30, 0x4D5D);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  
  String headerText = "ANGKA " + String(num);
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(headerText.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, 8);
  
  int adjustedFaceY = 50;
  drawMochiStyleFaceAtPosition(ANIM_HAPPY, 0, HEAD_CENTER_X, adjustedFaceY, true);
  
  tft.setTextSize(9);
  tft.setTextColor(0x915C);
  
  String numStr = String(num);
  tft.getTextBounds(numStr.c_str(), 0, 0, &x1, &y1, &w, &h);
  
  int angkaY = 110;
  
  tft.setCursor((TFT_WIDTH - w) / 2, angkaY);
  tft.print(numStr);
  
  String numberNames[] = {"", "SATU", "DUA", "TIGA", "EMPAT", "LIMA", "ENAM", "TUJUH", "DELAPAN", "SEMBILAN"};
  if (num >= 1 && num <= 9) {
    tft.setTextColor(0xFD34);
    tft.setTextSize(3);
    
    String namaAngka = numberNames[num];
    tft.getTextBounds(namaAngka.c_str(), 0, 0, &x1, &y1, &w, &h);
    
    int namaY = 180;
    
    tft.setCursor((TFT_WIDTH - w) / 2, namaY);
    tft.print(namaAngka);
  }
  
  tft.setTextColor(0x4D5D);
  tft.setTextSize(1);
  
  String footerText = "TEKAN ACTION UNTUK FAKTA";
  tft.getTextBounds(footerText.c_str(), 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((TFT_WIDTH - w) / 2, TFT_HEIGHT - 15);
  tft.print(footerText);
  
  delay(3000);
}

void displayLoading(String message) {
  drawSimpleBackground();
  drawMochiStyleFace(ANIM_THINKING, 0, true);
  
  tft.fillRect(0, ZONE_HEADER, TFT_WIDTH, 40, 0x4D5D);
  tft.setTextColor(EDU_WHITE);
  tft.setTextSize(2);
  tft.setCursor(10, ZONE_HEADER + 12);
  tft.print(message);
  
  for (int i = 0; i < 3; i++) {
    tft.fillCircle(140 + i*30, ZONE_TEXT + 10, 10, 0xFD20);
    delay(300);
    tft.fillCircle(140 + i*30, ZONE_TEXT + 10, 10, tft.color565(240, 245, 255));
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("], length: ");
  Serial.println(length);

  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  if (String(topic) == mqtt_topic_response) {
    Serial.println("Response dari AI diterima!");
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      String response = doc["response"];
      int mode = doc["mode"];
      
      lastResponse = response;
      waitingForResponse = false;
      isProcessing = false;
      updateActivityTime();

      extractAnswerFromResponse(response);
      processResponse();
    }
  }
  else if (String(topic) == mqtt_topic_dht) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (!error) {
      float temp = doc["temp"];
      float hum = doc["hum"];

      lastTemperature = temp;
      lastHumidity = hum;
      dhtDataReceived = true;
      lastDHTUpdate = millis();
      
      if (currentMode == 4) {
        updateActivityTime();
        displayDHT(temp, hum);
      }
    }
  }
  else if (String(topic) == mqtt_topic_alarm) {
    Serial.println("Alarm command received!");
    
    String messageStr = message;
    processAlarmCommand(messageStr);
  }
}

void extractAnswerFromResponse(String response) {
  lastAnswer = "";
  Serial.println("Extracting from: " + response);

  if (currentMode == 1) {
    lastResponse = response;
  }
  else if (currentMode == 2) {
    response.trim();
    int equalPos = response.indexOf('=');
    if (equalPos > 0) {
      lastAnswer = response.substring(equalPos + 1);
      lastAnswer.trim();
      while (lastAnswer.length() > 0 && !isdigit(lastAnswer.charAt(lastAnswer.length() - 1))) {
        lastAnswer = lastAnswer.substring(0, lastAnswer.length() - 1);
      }
    } else {
      String temp = response;
      temp.replace(" ", "");
      for (int i = temp.length() - 1; i >= 0; i--) {
        if (isdigit(temp.charAt(i))) {
          int start = i;
          while (start > 0 && isdigit(temp.charAt(start - 1))) start--;
          lastAnswer = temp.substring(start, i + 1);
          break;
        }
      }
      if (lastAnswer == "") lastAnswer = "?";
    }
  } 
  else if (currentMode == 3) {
    int equalPos = response.indexOf('=');
    if (equalPos > 0) {
      String ciriPart = response.substring(0, equalPos);
      String answerPart = response.substring(equalPos + 1);

      ciriPart.replace("[", "");
      ciriPart.replace("]", "");
      ciriPart.trim();

      answerPart.replace("[", "");
      answerPart.replace("]", "");
      answerPart.trim();

      lastResponse = ciriPart;
      lastAnswer = answerPart;
    } else {
      lastResponse = response;
      lastAnswer = "?";
    }
  }
}

bool reconnectMQTT() {
  Serial.print("Attempting MQTT connection...");

  if (client.connect(mqtt_client_id, mqtt_username, mqtt_password)) {
    Serial.println("MQTT Connected!");

    client.subscribe(mqtt_topic_response);
    client.subscribe(mqtt_topic_dht);
    client.subscribe(mqtt_topic_output);
    client.subscribe(mqtt_topic_alarm);

    return true;
  } else {
    Serial.print("MQTT failed, rc=");
    Serial.print(client.state());
    return false;
  }
}

bool reconnectMQTTWithAnimation() {
  return reconnectMQTT();
}

bool isButtonPressed(int pin, int& lastState, unsigned long& lastPress) {
  int currentState = digitalRead(pin);
  bool pressed = false;

  if (currentState != lastState) {
    delay(5);
    currentState = digitalRead(pin);

    if (currentState == LOW && lastState == HIGH && millis() - lastPress > debounceTime) {
      pressed = true;
      lastPress = millis();
    }

    lastState = currentState;
  }

  return pressed;
}

void sendStatus(String status) {
  StaticJsonDocument<100> doc;
  doc["status"] = status;
  doc["timestamp"] = millis();

  String payload;
  serializeJson(doc, payload);

  client.publish("edubuddy/status", payload.c_str());
}