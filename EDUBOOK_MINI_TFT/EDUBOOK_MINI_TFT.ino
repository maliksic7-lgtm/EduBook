/*
 * ============================================================================
 *  EDUBOOK MINI TFT 2.8
 *  SKEMA WOKWI + RENCANA INTEGRASI DASHBOARD
 *  SIC Batch 8 - Stage 2
 *  Versi: 2.0
 *
 *  Board   : ESP32 DevKit V1
 *  Display : TFT 2.8" ILI9341 SPI, landscape 320 x 240
 *  Kontrol : NEXT, SELECT, BACK
 *  Opsional: RGB LED common-cathode, piezo buzzer
 *
 *  LIBRARY (Arduino IDE Library Manager / libraries.txt Wokwi):
 *  - Adafruit GFX Library
 *  - Adafruit ILI9341
 *  - PubSubClient
 *
 *  WIRING TFT ILI9341
 *    VCC       -> 3V3
 *    GND       -> GND
 *    CS        -> GPIO 5
 *    DC / D-C  -> GPIO 2
 *    RST       -> GPIO 4
 *    SCK / CLK -> GPIO 18
 *    MOSI/SDI  -> GPIO 23
 *    LED / BL  -> 3V3 (jika pin backlight terpisah)
 *    MISO/SDO  -> tidak dipakai untuk tampilan write-only
 *
 *  TOMBOL (INPUT_PULLUP, aktif LOW, kaki lain ke GND)
 *    NEXT   -> GPIO 32
 *    SELECT -> GPIO 33
 *    BACK   -> GPIO 13
 *
 *  RGB LED OPSIONAL (common-cathode)
 *    R -> 220-330 ohm -> GPIO 26
 *    G -> 220-330 ohm -> GPIO 27
 *    B -> 220-330 ohm -> GPIO 14
 *    Common -> GND
 *    Untuk common-anode: common ke 3V3 dan set RGB_COMMON_ANODE = 1.
 *
 *  BUZZER OPSIONAL
 *    (+) -> GPIO 25
 *    (-) -> GND
 *
 *  CATATAN INTEGRASI DASHBOARD
 *  ---------------------------------------------------------------
 *  Dashboard : https://edubookdashboard.netlify.app/
 *  Backend   : Node.js/Express + MongoDB + MQTT
 *
 *  Topik yang dipakai di sketch ini diverifikasi dari repository:
 *    edubook/demo/page    -> {"page_number":1}
 *    edubook/demo/config  <- {"student_name":"...","language":"id"}
 *
 *  Broker default mengikuti firmware/Config.h:
 *    broker.hivemq.com:1883 dengan prefix edubook/demo
 *
 *  Wokwi memakai Wi-Fi Wokwi-GUEST. Koneksi jaringan dibuat non-blocking
 *  untuk tampilan: jika Wi-Fi/MQTT gagal, seluruh menu lokal tetap bisa
 *  digunakan. Sketch hanya mengirim event halaman yang sudah memiliki
 *  handler backend. Skor kuis dan status device belum dikirim karena
 *  backend belum memiliki handler khusus untuk payload tersebut.
 *
 *  Ini bukan klaim bahwa dashboard sudah diuji end-to-end. URL Netlify
 *  bukan bukti integrasi; bukti harus berasal dari log backend/MQTT.
 *
 *  CATATAN KEAMANAN
 *  - Tidak ada token, JWT, atau kredensial privat di sketch ini.
 *  - Broker yang dipakai adalah broker demo publik. Jangan mengirim data
 *    pribadi melalui topik demo.
 *  - Untuk deployment, ganti broker/topik/kredensial sesuai backend privat.
 *
 *  SMART REVIEW
 *  - Hanya simulasi alur dengan jawaban contoh dan aturan kata kunci.
 *  - Tidak ada mikrofon, STT, atau penilaian AI sungguhan.
 * ============================================================================
 */

#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Fonts/FreeSans9pt7b.h>
#include <Fonts/FreeSansBold9pt7b.h>
#include <Fonts/FreeSansBold12pt7b.h>
#include <Fonts/FreeSansBold18pt7b.h>
#include <Fonts/FreeSansBold24pt7b.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ============================ KONFIGURASI ==================================

#define ENABLE_NETWORK 1
#define ENABLE_MQTT 1

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

#define MQTT_BROKER "broker.hivemq.com"
#define MQTT_PORT 1883
#define MQTT_TOPIC_PREFIX "edubook/demo"
#define MQTT_TOPIC_PAGE MQTT_TOPIC_PREFIX "/page"
#define MQTT_TOPIC_CONFIG MQTT_TOPIC_PREFIX "/config"

#define TFT_CS 5
#define TFT_DC 2
#define TFT_RST 4

const uint8_t PIN_BTN_NEXT = 32;
const uint8_t PIN_BTN_SELECT = 33;
const uint8_t PIN_BTN_BACK = 13;

const uint8_t PIN_RGB_R = 26;
const uint8_t PIN_RGB_G = 27;
const uint8_t PIN_RGB_B = 14;
const uint8_t PIN_BUZZER = 25;

const uint32_t DEBOUNCE_MS = 35;

#define USE_RGB 1
#define USE_BUZZER 1
#define RGB_COMMON_ANODE 0

#define SCREEN_W 320
#define SCREEN_H 240

#define RGB565(r, g, b) \
    ((uint16_t)((((r) & 0xF8) << 8) | (((g) & 0xFC) << 3) | ((b) >> 3)))

const uint16_t C_BG        = RGB565(7, 12, 24);
const uint16_t C_PANEL     = RGB565(17, 26, 45);
const uint16_t C_PANEL_2   = RGB565(26, 39, 65);
const uint16_t C_BORDER    = RGB565(51, 65, 85);
const uint16_t C_TEXT      = RGB565(241, 245, 249);
const uint16_t C_MUTED     = RGB565(148, 163, 184);
const uint16_t C_CYAN      = RGB565(34, 211, 238);
const uint16_t C_BLUE      = RGB565(59, 130, 246);
const uint16_t C_ORANGE    = RGB565(245, 158, 11);
const uint16_t C_PURPLE    = RGB565(168, 85, 247);
const uint16_t C_PINK      = RGB565(244, 114, 182);
const uint16_t C_GREEN     = RGB565(34, 197, 94);
const uint16_t C_RED       = RGB565(239, 68, 68);
const uint16_t C_YELLOW    = RGB565(250, 204, 21);
const uint16_t C_DARK      = RGB565(3, 7, 18);
const uint16_t C_SHADOW    = RGB565(2, 5, 14);
const uint16_t C_NAVY      = RGB565(9, 18, 44);
const uint16_t C_PLUM      = RGB565(54, 20, 87);
const uint16_t C_PLUM_SOFT = RGB565(77, 37, 122);

const GFXfont *FONT_HERO = &FreeSansBold24pt7b;
const GFXfont *FONT_TITLE = &FreeSansBold18pt7b;
const GFXfont *FONT_H1 = &FreeSansBold12pt7b;
const GFXfont *FONT_BOLD = &FreeSansBold9pt7b;
const GFXfont *FONT_BODY = &FreeSans9pt7b;

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);

// ============================ DATA MATERI ==================================

struct MateriPage {
    const char *title;
    const char *body;
};

const MateriPage MATERI_BANK[] = {
    {
        "Tentang EduBook Mini",
        "EduBook Mini adalah simulasi perangkat belajar pintar untuk SIC Batch 8. "
        "Layar TFT menampilkan materi, kuis, dan review."
    },
    {
        "Navigasi",
        "NEXT untuk berpindah. SELECT untuk memilih atau mengunci jawaban. "
        "BACK untuk kembali ke menu utama."
    },
    {
        "Kuis",
        "Pilih satu dari tiga jawaban. Gunakan NEXT untuk menggeser pilihan, "
        "lalu SELECT untuk mengunci jawaban."
    },
    {
        "Smart Review",
        "Smart Review menilai jawaban simulasi dengan aturan kata kunci. "
        "Fitur ini bukan mikrofon, STT, atau AI sungguhan."
    }
};

const uint8_t MATERI_COUNT =
    sizeof(MATERI_BANK) / sizeof(MATERI_BANK[0]);

// ============================ DATA KUIS ====================================

struct QuizQuestion {
    const char *question;
    const char *options[3];
    uint8_t correct;
};

const QuizQuestion QUIZ_BANK[] = {
    {
        "Apa ibu kota Indonesia?",
        {"Jakarta", "Bandung", "Surabaya"},
        0
    },
    {
        "Planet terdekat dari Matahari?",
        {"Merkurius", "Venus", "Bumi"},
        0
    },
    {
        "Hasil dari 7 x 8 adalah?",
        {"54", "56", "64"},
        1
    },
    {
        "Proses tumbuhan membuat makanan?",
        {"Fotosintesis", "Respirasi", "Transpirasi"},
        0
    },
    {
        "Alat untuk mengukur suhu?",
        {"Termometer", "Barometer", "Higrometer"},
        0
    }
};

const uint8_t QUIZ_COUNT =
    sizeof(QUIZ_BANK) / sizeof(QUIZ_BANK[0]);

// ======================== DATA SMART REVIEW ================================

struct ReviewItem {
    const char *prompt;
    const char *simulatedAnswer;
    const char *keyword;
};

const ReviewItem REVIEW_BANK[] = {
    {
        "Jelaskan proses fotosintesis.",
        "Fotosintesis adalah proses tumbuhan membuat makanan dengan bantuan cahaya matahari.",
        "fotosintesis"
    },
    {
        "Apa fungsi jantung?",
        "Organ yang berfungsi.",
        "darah"
    },
    {
        "Sebutkan ibu kota Indonesia.",
        "Jakarta.",
        "jakarta"
    }
};

const uint8_t REVIEW_COUNT =
    sizeof(REVIEW_BANK) / sizeof(REVIEW_BANK[0]);

// ============================ STATE APLIKASI ===============================

enum AppMode {
    MODE_MENU,
    MODE_MATERI,
    MODE_MATERI_DONE,
    MODE_QUIZ,
    MODE_QUIZ_FEEDBACK,
    MODE_QUIZ_RESULT,
    MODE_REVIEW,
    MODE_REVIEW_RESULT
};

AppMode mode = MODE_MENU;
bool dirty = true;

const uint8_t MENU_COUNT = 3;
uint8_t menuIndex = 0;

uint8_t materiPage = 0;

uint8_t quizIndex = 0;
uint8_t quizChoice = 0;
uint8_t quizScore = 0;
bool quizAnswered = false;
bool quizLastCorrect = false;

uint8_t reviewIndex = 0;
uint8_t reviewStage = 0;
uint16_t reviewScoreSum = 0;
uint8_t reviewLastScore = 0;
bool reviewKeywordOk = false;
String reviewMessage = "";

const char *MENU_TITLES[] = {"Materi", "Kuis", "Smart Review"};
const char *MENU_SUBS[] = {
    "4 halaman literasi",
    "5 soal pilihan",
    "Simulasi aturan"
};
const uint16_t MENU_COLORS[] = {C_CYAN, C_ORANGE, C_PURPLE};

// ============================ JARINGAN =====================================

enum LinkState {
    LINK_OFF,
    LINK_CONNECTING,
    LINK_ONLINE,
    LINK_ERROR
};

LinkState wifiLink = LINK_OFF;
LinkState mqttLink = LINK_OFF;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

char mqttClientId[24] = "edubook-tft";
String studentName = "Siswa";
uint8_t pendingPage = 0;
uint32_t wifiAttemptAt = 0;
uint32_t wifiRetryAt = 0;
uint32_t mqttRetryAt = 0;

// ============================ TOMBOL =======================================

struct Button {
    uint8_t pin;
    bool stableState;
    bool lastReading;
    uint32_t lastChange;

    void begin(uint8_t buttonPin) {
        pin = buttonPin;
        pinMode(pin, INPUT_PULLUP);
        stableState = digitalRead(pin);
        lastReading = stableState;
        lastChange = millis();
    }

    bool pressed() {
        bool reading = digitalRead(pin);
        if (reading != lastReading) {
            lastReading = reading;
            lastChange = millis();
        }

        if ((millis() - lastChange) >= DEBOUNCE_MS &&
            reading != stableState) {
            stableState = reading;
            if (stableState == LOW) {
                return true;
            }
        }
        return false;
    }
};

Button btnNext;
Button btnSelect;
Button btnBack;

// ============================ RGB DAN BUZZER ===============================

void setRgb(uint8_t r, uint8_t g, uint8_t b) {
#if USE_RGB
#if RGB_COMMON_ANODE
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
#endif
    analogWrite(PIN_RGB_R, r);
    analogWrite(PIN_RGB_G, g);
    analogWrite(PIN_RGB_B, b);
#else
    (void)r;
    (void)g;
    (void)b;
#endif
}

void beepTone(uint16_t frequency, uint16_t durationMs) {
#if USE_BUZZER
    tone(PIN_BUZZER, frequency, durationMs);
    delay(durationMs);
    noTone(PIN_BUZZER);
#else
    (void)frequency;
    (void)durationMs;
#endif
}

void beepClick() {
    beepTone(1500, 22);
}

void beepCorrect() {
    beepTone(880, 65);
    delay(20);
    beepTone(1320, 100);
}

void beepWrong() {
    beepTone(220, 160);
    delay(30);
    beepTone(160, 210);
}

void beepFinish() {
    beepTone(660, 70);
    delay(20);
    beepTone(880, 70);
    delay(20);
    beepTone(1100, 130);
}

// ============================ NETWORK HELPERS ==============================

String extractJsonString(const String &json, const char *key) {
    String needle = String("\"") + key + "\"";
    int keyPos = json.indexOf(needle);
    if (keyPos < 0) return "";

    int colon = json.indexOf(':', keyPos + needle.length());
    if (colon < 0) return "";

    int firstQuote = json.indexOf('"', colon + 1);
    if (firstQuote < 0) return "";

    int secondQuote = json.indexOf('"', firstQuote + 1);
    if (secondQuote < 0) return "";

    return json.substring(firstQuote + 1, secondQuote);
}

void sendPendingPage() {
    if (!ENABLE_MQTT || pendingPage == 0) return;
    if (!mqttClient.connected()) return;

    char payload[40];
    snprintf(payload, sizeof(payload), "{\"page_number\":%u}",
             (unsigned)pendingPage);

    if (mqttClient.publish(MQTT_TOPIC_PAGE, payload)) {
        Serial.print("MQTT page -> ");
        Serial.println(payload);
        pendingPage = 0;
    }
}

void publishPageEvent(uint8_t page) {
    if (page < 1 || page > 10) return;
    pendingPage = page;
    sendPendingPage();
}

void onMqttConnected() {
    mqttLink = LINK_ONLINE;
    mqttClient.subscribe(MQTT_TOPIC_CONFIG);
    Serial.println("MQTT terhubung.");
    dirty = true;
    sendPendingPage();
}

void mqttCallback(char *topic, byte *payload, unsigned int length) {
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    if (String(topic) == MQTT_TOPIC_CONFIG) {
        String name = extractJsonString(message, "student_name");
        if (name.length() > 0) {
            studentName = name;
            dirty = true;
            Serial.print("Config siswa: ");
            Serial.println(studentName);
        }
    }
}

void startNetwork() {
#if ENABLE_NETWORK
    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false);
    delay(20);

    uint8_t mac[6] = {0};
    WiFi.macAddress(mac);
    snprintf(mqttClientId, sizeof(mqttClientId),
             "edubook-tft-%02X%02X%02X",
             mac[3], mac[4], mac[5]);

    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setSocketTimeout(2);
    mqttClient.setKeepAlive(15);
    mqttClient.setBufferSize(512);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    wifiLink = LINK_CONNECTING;
    wifiAttemptAt = millis();
    dirty = true;

    Serial.print("Wi-Fi: ");
    Serial.println(WIFI_SSID);
    Serial.print("MQTT client: ");
    Serial.println(mqttClientId);
#else
    wifiLink = LINK_OFF;
    mqttLink = LINK_OFF;
#endif
}

void updateNetwork() {
#if ENABLE_NETWORK
    if (WiFi.status() == WL_CONNECTED) {
        if (wifiLink != LINK_ONLINE) {
            wifiLink = LINK_ONLINE;
            wifiAttemptAt = millis();
            dirty = true;
            Serial.print("Wi-Fi terhubung: ");
            Serial.println(WiFi.localIP());
        }

#if ENABLE_MQTT
        if (mqttClient.connected()) {
            if (mqttLink != LINK_ONLINE) {
                mqttLink = LINK_ONLINE;
                dirty = true;
            }
        } else {
            if (mqttLink == LINK_ONLINE) {
                mqttLink = LINK_ERROR;
                dirty = true;
            }

            if ((millis() - mqttRetryAt) >= 8000) {
                mqttRetryAt = millis();
                mqttLink = LINK_CONNECTING;
                dirty = true;

                if (mqttClient.connect(mqttClientId)) {
                    onMqttConnected();
                } else {
                    mqttLink = LINK_ERROR;
                    dirty = true;
                    Serial.print("MQTT gagal, state=");
                    Serial.println(mqttClient.state());
                }
            }
        }

        mqttClient.loop();
#endif
    } else {
        if (wifiLink == LINK_ONLINE) {
            wifiLink = LINK_CONNECTING;
            wifiAttemptAt = millis();
            dirty = true;
        }

        if (wifiLink == LINK_CONNECTING &&
            (millis() - wifiAttemptAt) > 12000) {
            wifiLink = LINK_ERROR;
            wifiRetryAt = millis();
            dirty = true;
        }

        if (wifiLink == LINK_ERROR &&
            (millis() - wifiRetryAt) > 15000) {
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
            wifiAttemptAt = millis();
            wifiLink = LINK_CONNECTING;
            dirty = true;
        }

        if (mqttLink != LINK_OFF) {
            mqttLink = LINK_OFF;
            dirty = true;
        }
    }
#else
    wifiLink = LINK_OFF;
    mqttLink = LINK_OFF;
#endif
}

// ============================ WARNA STATUS =================================

uint16_t linkColor(LinkState state) {
    switch (state) {
        case LINK_ONLINE: return C_GREEN;
        case LINK_CONNECTING: return C_ORANGE;
        case LINK_ERROR: return C_RED;
        default: return C_MUTED;
    }
}

const char *linkText(LinkState state) {
    switch (state) {
        case LINK_ONLINE: return "OK";
        case LINK_CONNECTING: return "LINK";
        case LINK_ERROR: return "ERR";
        default: return "OFF";
    }
}

String clipText(const String &text, uint8_t maxChars) {
    if (text.length() <= maxChars) return text;
    if (maxChars <= 2) return text.substring(0, maxChars);
    return text.substring(0, maxChars - 2) + "..";
}

// ============================ DRAWING HELPERS ==============================

uint16_t blend565(uint16_t a, uint16_t b, uint8_t amount) {
    uint8_t ar = (a >> 11) & 0x1F;
    uint8_t ag = (a >> 5) & 0x3F;
    uint8_t ab = a & 0x1F;
    uint8_t br = (b >> 11) & 0x1F;
    uint8_t bg = (b >> 5) & 0x3F;
    uint8_t bb = b & 0x1F;

    uint8_t r = (ar * (255 - amount) + br * amount) / 255;
    uint8_t g = (ag * (255 - amount) + bg * amount) / 255;
    uint8_t bl = (ab * (255 - amount) + bb * amount) / 255;

    return (uint16_t)((r << 11) | (g << 5) | bl);
}

void drawVerticalGradient(int16_t x, int16_t y, int16_t w, int16_t h,
                          uint16_t top, uint16_t bottom) {
    if (h <= 0) return;
    for (int16_t i = 0; i < h; i++) {
        uint8_t amount = (uint8_t)((i * 255) / (h - 1));
        tft.drawFastHLine(x, y + i, w, blend565(top, bottom, amount));
    }
}

void drawSmall(const String &text, int16_t x, int16_t y, uint16_t color) {
    tft.setFont(NULL);
    tft.setTextSize(1);
    tft.setTextColor(color);
    tft.setCursor(x, y);
    tft.print(text);
}

void drawSmallCenterAt(const String &text, int16_t cx, int16_t y,
                       uint16_t color) {
    int16_t width = (int16_t)text.length() * 6;
    drawSmall(text, cx - (width / 2), y, color);
}

void drawSmallCenteredIn(const String &text, int16_t x, int16_t y,
                         int16_t w, int16_t h, uint16_t color) {
    int16_t width = (int16_t)text.length() * 6;
    drawSmall(text, x + (w - width) / 2, y + (h - 8) / 2, color);
}

int16_t measureText(const String &text, const GFXfont *font) {
    tft.setFont(font);
    int16_t x1, y1;
    uint16_t w, h;
    tft.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
    return (int16_t)w;
}

void drawTextAt(const String &text, int16_t x, int16_t baseline,
                const GFXfont *font, uint16_t color) {
    if (text.length() == 0) return;

    tft.setFont(font);
    tft.setTextColor(color);

    int16_t x1, y1;
    uint16_t w, h;
    tft.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor(x - x1, baseline);
    tft.print(text);
}

void drawTextCenterAt(const String &text, int16_t cx, int16_t baseline,
                      const GFXfont *font, uint16_t color) {
    if (text.length() == 0) return;

    tft.setFont(font);
    tft.setTextColor(color);

    int16_t x1, y1;
    uint16_t w, h;
    tft.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor(cx - ((int16_t)w / 2) - x1, baseline);
    tft.print(text);
}

uint8_t drawWrappedText(const String &text, int16_t x, int16_t baseline,
                        int16_t maxWidth, int16_t lineHeight,
                        const GFXfont *font, uint16_t color,
                        uint8_t maxLines) {
    if (maxLines == 0) return 0;

    String line = "";
    int start = 0;
    int16_t y = baseline;
    uint8_t lines = 0;

    while (start < (int)text.length() && lines < maxLines) {
        int space = text.indexOf(' ', start);
        String word = (space < 0)
                          ? text.substring(start)
                          : text.substring(start, space);

        while (word.length() > 0 && measureText(word, font) > maxWidth) {
            word.remove(word.length() - 1);
        }

        String candidate = line.length() ? line + " " + word : word;
        if (measureText(candidate, font) > maxWidth && line.length() > 0) {
            drawTextAt(line, x, y, font, color);
            lines++;
            y += lineHeight;
            line = word;
        } else {
            line = candidate;
        }

        if (space < 0) break;
        start = space + 1;
    }

    if (line.length() > 0 && lines < maxLines) {
        drawTextAt(line, x, y, font, color);
        lines++;
    }

    return lines;
}

void drawCard(int16_t x, int16_t y, int16_t w, int16_t h,
              uint16_t fill, uint16_t border) {
    tft.fillRoundRect(x + 3, y + 4, w, h, 10, C_SHADOW);
    tft.fillRoundRect(x, y, w, h, 10, fill);
    tft.drawRoundRect(x, y, w, h, 10, border);
}

void drawPill(int16_t x, int16_t y, int16_t w, int16_t h,
              uint16_t fill, uint16_t border) {
    tft.fillRoundRect(x, y, w, h, h / 2, fill);
    tft.drawRoundRect(x, y, w, h, h / 2, border);
}

void drawProgressBar(int16_t x, int16_t y, int16_t w, int16_t h,
                     uint16_t value, uint16_t maximum, uint16_t color) {
    if (maximum == 0) maximum = 1;
    if (value > maximum) value = maximum;

    tft.fillRoundRect(x, y, w, h, h / 2, C_PANEL_2);
    int16_t filled = (int16_t)(((int32_t)w * value) / maximum);
    if (filled > 0) {
        tft.fillRoundRect(x, y, filled, h, h / 2, color);
    }
}

void drawPageDots(int16_t cx, int16_t y, uint8_t count, uint8_t active,
                  uint16_t color) {
    int16_t totalWidth = (count * 10) - 4;
    int16_t startX = cx - (totalWidth / 2);
    for (uint8_t i = 0; i < count; i++) {
        int16_t x = startX + (i * 10);
        if (i == active) {
            tft.fillRoundRect(x, y, 8, 6, 3, color);
        } else {
            tft.fillRoundRect(x + 1, y + 1, 6, 4, 2, C_PANEL_2);
        }
    }
}

void drawCheck(int16_t cx, int16_t cy, uint16_t color) {
    for (int8_t offset = -1; offset <= 1; offset++) {
        tft.drawLine(cx - 8, cy + offset,
                     cx - 2, cy + 6 + offset, color);
        tft.drawLine(cx - 2, cy + 6 + offset,
                     cx + 9, cy - 7 + offset, color);
    }
}

void drawCross(int16_t cx, int16_t cy, uint16_t color) {
    for (int8_t offset = -1; offset <= 1; offset++) {
        tft.drawLine(cx - 7, cy - 7 + offset,
                     cx + 7, cy + 7 + offset, color);
        tft.drawLine(cx + 7, cy - 7 + offset,
                     cx - 7, cy + 7 + offset, color);
    }
}

void drawWaveform(int16_t cx, int16_t cy) {
    const uint8_t heights[] = {14, 24, 34, 20, 30, 16, 22};
    for (uint8_t i = 0; i < 7; i++) {
        int16_t x = cx - 42 + (i * 14);
        int16_t h = heights[i];
        uint16_t color = (i % 2 == 0) ? C_PURPLE : C_CYAN;
        tft.fillRoundRect(x, cy - (h / 2), 7, h, 3, color);
    }
}

void drawMenuIcon(uint8_t index, int16_t cx, int16_t cy, uint16_t color) {
    if (index == 0) {
        tft.drawRect(cx - 9, cy - 7, 18, 14, color);
        tft.drawLine(cx, cy - 7, cx, cy + 7, color);
        tft.drawLine(cx - 5, cy - 3, cx - 2, cy - 3, color);
        tft.drawLine(cx - 5, cy + 1, cx - 2, cy + 1, color);
        tft.drawLine(cx + 3, cy - 3, cx + 6, cy - 3, color);
        tft.drawLine(cx + 3, cy + 1, cx + 6, cy + 1, color);
    } else if (index == 1) {
        tft.drawCircle(cx, cy, 10, color);
        drawTextCenterAt("?", cx, cy + 6, FONT_H1, color);
    } else {
        tft.drawLine(cx - 9, cy + 7, cx, cy - 8, color);
        tft.drawLine(cx, cy - 8, cx + 9, cy + 5, color);
        tft.drawLine(cx - 9, cy + 7, cx + 9, cy + 5, color);
        tft.fillCircle(cx - 9, cy + 7, 3, color);
        tft.fillCircle(cx, cy - 8, 3, color);
        tft.fillCircle(cx + 9, cy + 5, 3, color);
    }
}

void drawStatusChip(int16_t x, int16_t y, int16_t w, int16_t h,
                    const char *label, LinkState state) {
    uint16_t color = linkColor(state);
    tft.fillRoundRect(x, y, w, h, h / 2, C_PANEL_2);
    tft.drawRoundRect(x, y, w, h, h / 2, color);
    tft.fillCircle(x + 9, y + (h / 2), 3, color);
    drawSmall(label, x + 16, y + ((h - 8) / 2), C_MUTED);
}

void drawHeader(const String &title, const String &subtitle) {
    tft.fillRect(0, 0, SCREEN_W, 46, C_PANEL);
    tft.fillRect(0, 0, 4, 16, C_CYAN);
    tft.fillRect(0, 16, 4, 15, C_ORANGE);
    tft.fillRect(0, 31, 4, 15, C_PURPLE);

    drawTextAt(title, 14, 28, FONT_H1, C_TEXT);
    drawSmall(subtitle, 14, 33, C_MUTED);

    tft.fillRect(0, 44, 107, 2, C_CYAN);
    tft.fillRect(107, 44, 106, 2, C_ORANGE);
    tft.fillRect(213, 44, 107, 2, C_PURPLE);

    drawStatusChip(206, 13, 52, 20, "WIFI", wifiLink);
    drawStatusChip(262, 13, 52, 20, "MQTT", mqttLink);
}

void drawKeycap(int16_t x, int16_t y, const char *label, uint16_t accent) {
    int16_t w = (int16_t)strlen(label) * 6 + 14;
    tft.fillRoundRect(x, y, w, 16, 4, C_PANEL_2);
    tft.drawRoundRect(x, y, w, 16, 4, accent);
    drawSmallCenteredIn(label, x, y, w, 16, C_TEXT);
}

void drawFooter(const String &hint) {
    tft.fillRect(0, 214, SCREEN_W, 26, C_DARK);
    tft.drawFastHLine(0, 214, SCREEN_W, C_BORDER);

    drawKeycap(8, 219, "NEXT", C_CYAN);
    drawKeycap(56, 219, "SELECT", C_ORANGE);
    drawKeycap(112, 219, "BACK", C_PURPLE);

    drawSmall(hint, 158, 224, C_MUTED);
    drawSmall("TFT 2.8", 272, 224, C_MUTED);
}

// ============================ SPLASH =======================================

void showSplash() {
    drawVerticalGradient(0, 0, SCREEN_W, SCREEN_H, C_NAVY, C_PLUM);

    tft.drawCircle(290, 34, 54, C_PLUM_SOFT);
    tft.drawCircle(290, 34, 55, C_PLUM_SOFT);
    tft.drawCircle(24, 204, 42, C_PLUM_SOFT);
    tft.drawCircle(24, 204, 43, C_PLUM_SOFT);
    tft.drawLine(0, 174, 320, 118, C_PLUM_SOFT);
    tft.drawLine(0, 180, 320, 124, C_PLUM_SOFT);

    for (uint8_t i = 0; i < 9; i++) {
        tft.fillCircle(24 + (i * 34), 52 + ((i % 3) * 9), 2, C_CYAN);
    }

    drawStatusChip(206, 12, 52, 20, "WIFI", wifiLink);
    drawStatusChip(262, 12, 52, 20, "MQTT", mqttLink);

    drawTextCenterAt("EDUBOOK", 160, 96, FONT_HERO, C_TEXT);
    drawTextCenterAt("MINI", 160, 128, FONT_TITLE, C_CYAN);

    drawPill(85, 140, 150, 22, C_PANEL, C_ORANGE);
    drawSmallCenteredIn("SIC BATCH 8 | STAGE 2", 85, 140, 150, 22, C_ORANGE);

    drawTextCenterAt("TFT 2.8 | ILI9341 | SIMULASI", 160, 180,
                     FONT_BODY, C_MUTED);

    tft.fillRoundRect(60, 198, 200, 8, 4, C_PANEL);
    for (uint8_t progress = 0; progress <= 100; progress += 2) {
        uint16_t color = blend565(C_CYAN, C_PURPLE, progress * 2);
        tft.fillRect(60, 198, (progress * 2), 8, color);
        delay(14);
    }

    drawSmallCenterAt("LOCAL UI + DASHBOARD BRIDGE", 160, 216, C_MUTED);
    beepFinish();
    delay(450);
}

// ============================ MENU =========================================

void drawMenuCard(uint8_t index, int16_t y) {
    int16_t x = 12;
    int16_t w = 198;
    int16_t h = 44;
    uint16_t accent = MENU_COLORS[index];
    bool selected = (index == menuIndex);

    if (selected) {
        tft.fillRoundRect(x + 3, y + 4, w, h, 10, C_SHADOW);
        tft.fillRoundRect(x, y, w, h, 10, accent);
        tft.drawRoundRect(x, y, w, h, 10, C_TEXT);
        tft.fillCircle(x + 24, y + 22, 15, C_DARK);
        drawMenuIcon(index, x + 24, y + 22, accent);

        drawTextAt(MENU_TITLES[index], x + 48, y + 21, FONT_H1, C_DARK);
        drawSmall(MENU_SUBS[index], x + 48, y + 31, C_DARK);

        tft.drawLine(x + w - 18, y + 17, x + w - 12, y + 22, C_DARK);
        tft.drawLine(x + w - 12, y + 22, x + w - 18, y + 27, C_DARK);
    } else {
        tft.fillRoundRect(x + 3, y + 4, w, h, 10, C_SHADOW);
        tft.fillRoundRect(x, y, w, h, 10, C_PANEL);
        tft.drawRoundRect(x, y, w, h, 10, C_BORDER);
        tft.fillCircle(x + 24, y + 22, 15, accent);
        drawMenuIcon(index, x + 24, y + 22, C_DARK);

        drawTextAt(MENU_TITLES[index], x + 48, y + 21, FONT_H1, C_TEXT);
        drawSmall(MENU_SUBS[index], x + 48, y + 31, C_MUTED);

        tft.drawLine(x + w - 18, y + 17, x + w - 12, y + 22, accent);
        tft.drawLine(x + w - 12, y + 22, x + w - 18, y + 27, accent);
    }
}

void drawLinkRow(int16_t x, int16_t y, const char *label, LinkState state) {
    uint16_t color = linkColor(state);
    tft.fillCircle(x + 2, y + 3, 3, color);
    drawSmall(label, x + 9, y, C_MUTED);
    drawSmall(linkText(state), x + 48, y, color);
}

void drawNetworkPanel(int16_t x, int16_t y, int16_t w, int16_t h) {
    drawCard(x, y, w, h, C_PANEL, C_BORDER);
    tft.fillRoundRect(x + 8, y + 7, w - 16, 2, 1, C_CYAN);

    drawSmall("LIVE STATUS", x + 8, y + 13, C_MUTED);
    drawLinkRow(x + 8, y + 28, "WIFI", wifiLink);
    drawLinkRow(x + 8, y + 42, "MQTT", mqttLink);

    tft.drawFastHLine(x + 8, y + 54, w - 16, C_BORDER);

    drawSmall("SISWA", x + 8, y + 61, C_MUTED);
    drawSmall(clipText(studentName, 10), x + 8, y + 71, C_TEXT);

    drawSmall("MODE", x + 8, y + 84, C_MUTED);
    drawSmall(mqttLink == LINK_ONLINE ? "DASH" : "LOKAL",
              x + 8, y + 94, C_CYAN);

    drawSmall("TFT 2.8", x + 8, y + 107, C_MUTED);
    drawSmall("ILI9341", x + 8, y + 117, C_TEXT);
    drawSmall("v2.0", x + 8, y + 131, C_MUTED);
}

void renderMenu() {
    drawHeader("EDUBOOK MINI", "SIC Batch 8 | Stage 2");
    drawSmall("PILIH MODE", 12, 50, C_MUTED);

    for (uint8_t i = 0; i < MENU_COUNT; i++) {
        drawMenuCard(i, 60 + (i * 50));
    }

    drawNetworkPanel(220, 60, 88, 146);
    drawFooter("GESER / BUKA");
}

// ============================ MATERI =======================================

void renderMateri() {
    drawHeader("MATERI", "Halaman " + String(materiPage + 1) + "/" +
               String(MATERI_COUNT));

    drawCard(12, 56, 296, 152, C_PANEL, C_BORDER);
    tft.fillRoundRect(22, 68, 4, 128, 2, C_CYAN);

    drawPill(32, 68, 92, 18, C_PANEL_2, C_CYAN);
    drawSmallCenteredIn("LITERASI", 32, 68, 92, 18, C_CYAN);

    drawTextAt(MATERI_BANK[materiPage].title, 32, 106,
               FONT_H1, C_TEXT);
    drawWrappedText(MATERI_BANK[materiPage].body, 32, 128, 256, 17,
                    FONT_BODY, C_MUTED, 4);

    drawPageDots(160, 188, MATERI_COUNT, materiPage, C_CYAN);
    drawSmall("HALAMAN " + String(materiPage + 1) + " / " +
              String(MATERI_COUNT), 32, 198, C_MUTED);

    if (materiPage + 1 >= MATERI_COUNT) {
        drawFooter("SEL selesai/BACK");
    } else {
        drawFooter("NEXT/SEL lanjut");
    }
}

void renderMateriDone() {
    drawHeader("MATERI", "Selesai");

    drawCard(12, 56, 296, 152, C_PANEL, C_GREEN);
    tft.fillRoundRect(22, 68, 4, 128, 2, C_GREEN);
    tft.fillCircle(58, 104, 27, C_GREEN);
    drawCheck(58, 104, C_DARK);

    drawTextAt("MATERI", 100, 94, FONT_H1, C_TEXT);
    drawTextAt("SELESAI", 100, 122, FONT_TITLE, C_GREEN);
    drawSmall("Semua halaman sudah dibaca.", 100, 138, C_MUTED);

    tft.drawFastHLine(32, 156, 256, C_BORDER);
    drawTextAt("Lanjut ke kuis?", 32, 180, FONT_H1, C_TEXT);
    drawSmall("Uji pemahaman lewat 5 soal pilihan.", 32, 194, C_MUTED);

    drawFooter("SEL/BACK ke menu");
}

// ============================ KUIS =========================================

void renderQuizQuestion() {
    drawHeader("KUIS", "Soal " + String(quizIndex + 1) + "/" +
               String(QUIZ_COUNT) + " | Skor " + String(quizScore));

    drawProgressBar(12, 51, 296, 4, quizIndex + 1, QUIZ_COUNT, C_ORANGE);

    drawCard(12, 62, 296, 58, C_PANEL, C_BORDER);
    tft.fillRoundRect(20, 70, 4, 42, 2, C_ORANGE);
    drawSmall("PERTANYAAN", 32, 73, C_ORANGE);
    drawWrappedText(QUIZ_BANK[quizIndex].question, 32, 97, 256, 19,
                    FONT_H1, C_TEXT, 2);

    for (uint8_t i = 0; i < 3; i++) {
        int16_t y = 130 + (i * 28);
        bool selected = (i == quizChoice);

        if (selected) {
            tft.fillRoundRect(12, y, 296, 24, 8, C_ORANGE);
            tft.drawRoundRect(12, y, 296, 24, 8, C_YELLOW);
            tft.fillCircle(28, y + 12, 8, C_DARK);
            drawSmallCenteredIn(String((char)('A' + i)), 20, y + 4, 16, 16,
                                C_ORANGE);
            drawTextAt(QUIZ_BANK[quizIndex].options[i], 44, y + 17,
                       FONT_BODY, C_DARK);
        } else {
            tft.fillRoundRect(12, y, 296, 24, 8, C_PANEL);
            tft.drawRoundRect(12, y, 296, 24, 8, C_BORDER);
            tft.fillCircle(28, y + 12, 8, C_PANEL_2);
            drawSmallCenteredIn(String((char)('A' + i)), 20, y + 4, 16, 16,
                                C_ORANGE);
            drawTextAt(QUIZ_BANK[quizIndex].options[i], 44, y + 17,
                       FONT_BODY, C_TEXT);
        }
    }

    drawFooter("PILIH / KUNCI");
}

void renderQuizFeedback() {
    uint16_t resultColor = quizLastCorrect ? C_GREEN : C_RED;
    drawHeader("HASIL KUIS", "Soal " + String(quizIndex + 1) + "/" +
               String(QUIZ_COUNT));

    drawCard(12, 56, 296, 70, C_PANEL, resultColor);
    tft.fillCircle(52, 91, 21, resultColor);
    if (quizLastCorrect) {
        drawCheck(52, 91, C_DARK);
    } else {
        drawCross(52, 91, C_DARK);
    }

    drawTextAt(quizLastCorrect ? "BENAR!" : "SALAH", 84, 87,
               FONT_TITLE, resultColor);
    drawSmall("Skor " + String(quizScore) + "/" + String(QUIZ_COUNT) +
              " | " + (quizLastCorrect ? "Jawaban tepat" : "Coba lagi"),
              84, 104, C_MUTED);

    drawCard(12, 134, 296, 66, C_PANEL, C_BORDER);
    tft.fillRoundRect(20, 142, 4, 50, 2, resultColor);
    drawSmall("JAWABAN BENAR", 32, 146, C_MUTED);

    String answer = String((char)('A' + QUIZ_BANK[quizIndex].correct)) +
                    ". " + QUIZ_BANK[quizIndex].options[
                        QUIZ_BANK[quizIndex].correct];
    drawTextAt(answer, 32, 174, FONT_H1, C_TEXT);

    drawFooter(quizIndex + 1 >= QUIZ_COUNT ? "NEXT lihat skor"
                                           : "SOAL BERIKUT");
}

void renderQuizResult() {
    uint8_t percent = (uint8_t)(((uint16_t)quizScore * 100) / QUIZ_COUNT);
    uint16_t scoreColor = percent >= 80 ? C_GREEN :
                          (percent >= 60 ? C_ORANGE : C_RED);

    drawHeader("SKOR AKHIR", "Kuis selesai");
    drawCard(12, 56, 296, 152, C_PANEL, scoreColor);
    tft.fillRoundRect(24, 64, 272, 4, 2, scoreColor);

    drawSmallCenterAt("HASIL KUIS", 160, 78, C_MUTED);
    drawTextCenterAt(String(percent) + "%", 160, 126, FONT_HERO, scoreColor);
    drawSmallCenterAt(String(quizScore) + " dari " + String(QUIZ_COUNT) +
                      " jawaban benar", 160, 144, C_TEXT);

    drawProgressBar(44, 158, 232, 8, quizScore, QUIZ_COUNT, scoreColor);

    for (uint8_t i = 0; i < QUIZ_COUNT; i++) {
        uint16_t color = (i < quizScore) ? C_YELLOW : C_PANEL_2;
        tft.fillCircle(132 + (i * 14), 182, 4, color);
    }

    String message;
    if (percent >= 80) {
        message = "Luar biasa, pertahankan!";
    } else if (percent >= 60) {
        message = "Bagus, terus berlatih.";
    } else {
        message = "Ayo coba lagi!";
    }
    drawSmallCenterAt(message, 160, 194, scoreColor);

    drawFooter("SEL/BACK ke menu");
}

// ============================ SMART REVIEW =================================

void renderReview() {
    drawHeader("SMART REVIEW", "Simulasi aturan | " +
               String(reviewIndex + 1) + "/" + String(REVIEW_COUNT));

    drawCard(12, 56, 296, 152, C_PANEL, C_PURPLE);
    tft.fillRoundRect(22, 68, 4, 128, 2, C_PURPLE);

    drawPill(32, 68, 104, 18, C_PANEL_2, C_ORANGE);
    drawSmallCenteredIn("SIMULASI", 32, 68, 104, 18, C_ORANGE);

    if (reviewStage == 0) {
        drawWaveform(160, 104);
        drawSmallCenterAt("TANPA MIKROFON / STT", 160, 126, C_MUTED);
        drawTextCenterAt("Tekan SELECT untuk mulai", 160, 154,
                         FONT_H1, C_TEXT);
        drawSmallCenterAt("Penilaian memakai aturan kata kunci",
                          160, 174, C_MUTED);
        drawFooter("SEL mulai");
        return;
    }

    if (reviewStage == 1) {
        drawSmall("PROMPT " + String(reviewIndex + 1) + "/" +
                  String(REVIEW_COUNT), 32, 80, C_MUTED);
        drawWrappedText(REVIEW_BANK[reviewIndex].prompt, 32, 108, 256, 20,
                        FONT_H1, C_TEXT, 2);

        tft.drawFastHLine(32, 146, 256, C_BORDER);
        drawSmall("Jawaban simulasi siap dikirim.", 32, 158, C_TEXT);
        drawTextAt("Tekan SELECT untuk menilai.", 32, 180,
                   FONT_BOLD, C_PURPLE);
        drawSmall("Bukan rekaman audio atau AI.", 32, 194, C_MUTED);
        drawFooter("SEL kirim");
        return;
    }

    uint16_t scoreColor = reviewLastScore >= 100 ? C_GREEN :
                          (reviewLastScore >= 60 ? C_ORANGE : C_RED);
    drawPill(32, 68, 140, 20, C_PANEL_2, scoreColor);
    drawSmallCenteredIn("HASIL SIMULASI", 32, 68, 140, 20, scoreColor);

    tft.fillCircle(68, 112, 28, scoreColor);
    drawTextCenterAt(String(reviewLastScore), 68, 119, FONT_TITLE, C_DARK);

    drawSmall("SKOR ITEM", 108, 94, C_MUTED);
    drawSmall(reviewKeywordOk ? "Kata kunci: cocok" : "Kata kunci: belum",
              108, 111, reviewKeywordOk ? C_GREEN : C_RED);
    drawWrappedText(reviewMessage, 108, 134, 176, 17,
                    FONT_BODY, C_TEXT, 3);

    drawSmall("SIMULASI ATURAN - BUKAN AI", 32, 192, C_MUTED);
    drawFooter("SEL lanjut");
}

void renderReviewResult() {
    uint8_t average = (uint8_t)(reviewScoreSum / REVIEW_COUNT);
    uint16_t scoreColor = average >= 60 ? C_GREEN : C_RED;

    drawHeader("SMART REVIEW", "Selesai");
    drawCard(12, 56, 296, 152, C_PANEL, C_PURPLE);
    tft.fillRoundRect(24, 64, 272, 4, 2, C_PURPLE);

    drawSmallCenterAt("RATA-RATA SIMULASI", 160, 78, C_MUTED);
    drawTextCenterAt(String(average) + "/100", 160, 130,
                     FONT_HERO, scoreColor);
    drawSmallCenterAt(String(REVIEW_COUNT) + " prompt simulasi selesai",
                      160, 148, C_TEXT);

    drawProgressBar(44, 162, 232, 8, average, 100, scoreColor);

    drawSmallCenterAt(average >= 60 ? "Pemahaman cukup baik."
                                    : "Perlu review ulang.",
                      160, 188, C_TEXT);
    drawSmallCenterAt("Hasil ini bukan penilaian AI.",
                      160, 200, C_MUTED);

    drawFooter("SEL/BACK ke menu");
}

// ============================ RENDER =======================================

void render() {
    tft.fillScreen(C_BG);

    switch (mode) {
        case MODE_MENU:
            renderMenu();
            break;
        case MODE_MATERI:
            renderMateri();
            break;
        case MODE_MATERI_DONE:
            renderMateriDone();
            break;
        case MODE_QUIZ:
            renderQuizQuestion();
            break;
        case MODE_QUIZ_FEEDBACK:
            renderQuizFeedback();
            break;
        case MODE_QUIZ_RESULT:
            renderQuizResult();
            break;
        case MODE_REVIEW:
            renderReview();
            break;
        case MODE_REVIEW_RESULT:
            renderReviewResult();
            break;
    }
}

// ============================ STATE HANDLERS ===============================

void enterMenu() {
    mode = MODE_MENU;
    pendingPage = 0;
    setRgb(59, 130, 246);
}

void startMateri() {
    materiPage = 0;
    mode = MODE_MATERI;
    setRgb(34, 211, 238);
    publishPageEvent(materiPage + 1);
}

void startQuiz() {
    quizIndex = 0;
    quizChoice = 0;
    quizScore = 0;
    quizAnswered = false;
    pendingPage = 0;
    mode = MODE_QUIZ;
    setRgb(245, 158, 11);
}

void startReview() {
    reviewIndex = 0;
    reviewStage = 0;
    reviewScoreSum = 0;
    reviewLastScore = 0;
    reviewKeywordOk = false;
    reviewMessage = "";
    pendingPage = 0;
    mode = MODE_REVIEW;
    setRgb(168, 85, 247);
}

void advanceQuiz() {
    if (quizIndex + 1 < QUIZ_COUNT) {
        quizIndex++;
        quizChoice = 0;
        quizAnswered = false;
        mode = MODE_QUIZ;
        setRgb(245, 158, 11);
    } else {
        mode = MODE_QUIZ_RESULT;
        setRgb(168, 85, 247);
        beepFinish();
    }
}

void advanceReview() {
    if (reviewIndex + 1 < REVIEW_COUNT) {
        reviewIndex++;
        reviewStage = 0;
        setRgb(168, 85, 247);
    } else {
        mode = MODE_REVIEW_RESULT;
        setRgb(168, 85, 247);
        beepFinish();
    }
}

uint8_t countWords(const String &text) {
    uint8_t count = 0;
    bool inWord = false;

    for (int i = 0; i < (int)text.length(); i++) {
        char c = text.charAt(i);
        bool separator = (c == ' ' || c == '\t' || c == '\n' ||
                          c == '.' || c == ',' || c == '!' || c == '?');

        if (separator) {
            inWord = false;
        } else if (!inWord) {
            inWord = true;
            count++;
        }
    }

    return count;
}

uint8_t evaluateReview(const ReviewItem &item) {
    String answer = String(item.simulatedAnswer);
    String lower = answer;
    lower.toLowerCase();

    reviewKeywordOk = lower.indexOf(String(item.keyword)) >= 0;
    uint8_t words = countWords(answer);

    if (reviewKeywordOk && words >= 5) {
        reviewMessage = "Jawaban lengkap dan sesuai.";
        return 100;
    }

    if (reviewKeywordOk) {
        reviewMessage = "Kata kunci benar, terlalu singkat.";
        return 60;
    }

    reviewMessage = "Kata kunci belum muncul.";
    return 20;
}

void handleNext() {
    switch (mode) {
        case MODE_MENU:
            menuIndex = (menuIndex + 1) % MENU_COUNT;
            setRgb(59, 130, 246);
            break;

        case MODE_MATERI:
            if (materiPage + 1 < MATERI_COUNT) {
                materiPage++;
                publishPageEvent(materiPage + 1);
            }
            break;

        case MODE_QUIZ:
            if (!quizAnswered) {
                quizChoice = (quizChoice + 1) % 3;
            }
            break;

        case MODE_QUIZ_FEEDBACK:
            advanceQuiz();
            break;

        case MODE_REVIEW:
            if (reviewStage == 2) {
                advanceReview();
            }
            break;

        default:
            break;
    }
}

void handleSelect() {
    switch (mode) {
        case MODE_MENU:
            if (menuIndex == 0) {
                startMateri();
            } else if (menuIndex == 1) {
                startQuiz();
            } else {
                startReview();
            }
            break;

        case MODE_MATERI:
            if (materiPage + 1 < MATERI_COUNT) {
                materiPage++;
                publishPageEvent(materiPage + 1);
            } else {
                mode = MODE_MATERI_DONE;
                setRgb(34, 197, 94);
                beepFinish();
            }
            break;

        case MODE_MATERI_DONE:
            enterMenu();
            break;

        case MODE_QUIZ:
            if (!quizAnswered) {
                quizAnswered = true;
                quizLastCorrect =
                    (quizChoice == QUIZ_BANK[quizIndex].correct);

                if (quizLastCorrect) {
                    quizScore++;
                    setRgb(34, 197, 94);
                    beepCorrect();
                } else {
                    setRgb(239, 68, 68);
                    beepWrong();
                }

                mode = MODE_QUIZ_FEEDBACK;
            }
            break;

        case MODE_QUIZ_RESULT:
            enterMenu();
            break;

        case MODE_REVIEW:
            if (reviewStage == 0) {
                reviewStage = 1;
            } else if (reviewStage == 1) {
                reviewLastScore = evaluateReview(REVIEW_BANK[reviewIndex]);
                reviewScoreSum += reviewLastScore;
                reviewStage = 2;

                if (reviewLastScore >= 100) {
                    setRgb(34, 197, 94);
                    beepCorrect();
                } else if (reviewLastScore >= 60) {
                    setRgb(245, 158, 11);
                    beepTone(600, 120);
                } else {
                    setRgb(239, 68, 68);
                    beepWrong();
                }
            } else {
                advanceReview();
            }
            break;

        case MODE_REVIEW_RESULT:
            enterMenu();
            break;

        default:
            break;
    }
}

void handleBack() {
    if (mode != MODE_MENU) {
        enterMenu();
    }
}

// ============================ SETUP DAN LOOP ===============================

void setup() {
    Serial.begin(115200);
    delay(150);

    btnNext.begin(PIN_BTN_NEXT);
    btnSelect.begin(PIN_BTN_SELECT);
    btnBack.begin(PIN_BTN_BACK);

#if USE_RGB
    pinMode(PIN_RGB_R, OUTPUT);
    pinMode(PIN_RGB_G, OUTPUT);
    pinMode(PIN_RGB_B, OUTPUT);
    setRgb(0, 0, 0);
#endif

#if USE_BUZZER
    pinMode(PIN_BUZZER, OUTPUT);
#endif

    tft.begin();
    tft.setRotation(1);
    tft.fillScreen(C_BG);
    tft.setFont(NULL);
    tft.setTextSize(1);

    startNetwork();
    showSplash();

    enterMenu();
    dirty = true;

    Serial.println("EDUBOOK MINI TFT siap.");
    Serial.println("Kontrol: NEXT=32, SELECT=33, BACK=13");
    Serial.println("Hanya event page/config yang dipakai untuk bridge.");
}

void loop() {
    bool nextPressed = btnNext.pressed();
    bool selectPressed = btnSelect.pressed();
    bool backPressed = btnBack.pressed();

    if (nextPressed || selectPressed || backPressed) {
        beepClick();

        if (nextPressed) {
            handleNext();
        } else if (selectPressed) {
            handleSelect();
        } else if (backPressed) {
            handleBack();
        }

        dirty = true;
    }

    if (dirty) {
        render();
        dirty = false;
    }

    updateNetwork();
    delay(5);
}
