#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Fonts/FreeSansBold9pt7b.h>
#include <Fonts/FreeSansBold12pt7b.h>
#include <Fonts/FreeSansBold18pt7b.h>
#include <Fonts/FreeSansBold24pt7b.h>
#include <WiFi.h>
#include <PubSubClient.h>

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
#define RGB_COMMON_ANODE 1

#define SCREEN_W 320
#define SCREEN_H 240
#define HEADER_H 44
#define FOOTER_Y 216

#define RGB565(r, g, b) \
    ((uint16_t)((((r) & 0xF8) << 8) | (((g) & 0xFC) << 3) | ((b) >> 3)))

#define ARRAY_COUNT(a) (sizeof(a) / sizeof((a)[0]))

const uint16_t C_BG          = RGB565(244, 247, 251);
const uint16_t C_CARD        = RGB565(255, 255, 255);
const uint16_t C_NAVY        = RGB565(30, 45, 78);
const uint16_t C_NAVY_SOFT   = RGB565(52, 72, 110);
const uint16_t C_INK         = RGB565(27, 38, 61);
const uint16_t C_BODY        = RGB565(54, 67, 91);
const uint16_t C_MUTED       = RGB565(93, 106, 128);
const uint16_t C_LINE        = RGB565(216, 225, 238);
const uint16_t C_WHITE       = RGB565(255, 255, 255);
const uint16_t C_SKY         = RGB565(31, 125, 214);
const uint16_t C_SKY_SOFT    = RGB565(225, 240, 253);
const uint16_t C_ORANGE      = RGB565(194, 91, 20);
const uint16_t C_ORANGE_SOFT = RGB565(255, 241, 224);
const uint16_t C_GREEN       = RGB565(25, 142, 91);
const uint16_t C_GREEN_SOFT  = RGB565(226, 247, 237);
const uint16_t C_RED         = RGB565(196, 58, 58);
const uint16_t C_RED_SOFT    = RGB565(255, 233, 233);
const uint16_t C_PURPLE      = RGB565(108, 78, 196);
const uint16_t C_TEAL        = RGB565(18, 132, 132);
const uint16_t C_YELLOW      = RGB565(247, 183, 52);

const GFXfont *FONT_HERO  = &FreeSansBold24pt7b;
const GFXfont *FONT_TITLE = &FreeSansBold18pt7b;
const GFXfont *FONT_BODY  = &FreeSansBold12pt7b;
const GFXfont *FONT_SMALL = &FreeSansBold9pt7b;

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);

struct ContentPage {
    const char *title;
    const char *body;
};

struct QuizQuestion {
    const char *question;
    const char *options[3];
    uint8_t correct;
};

const ContentPage GUIDE_PAGES[] = {
    {
        "EduBook",
        "EduBook punya layar TFT, tiga tombol, LED, dan buzzer."
    },
    {
        "Tombol",
        "NEXT untuk pindah, SELECT untuk buka, BACK untuk kembali."
    },
    {
        "Lampu LED",
        "LED hijau berhasil, kuning proses, merah salah."
    }
};

const ContentPage MATEMATIKA_PAGES[] = {
    {
        "Operasi hitung",
        "Kali dan bagi dulu, lalu tambah dan kurang."
    },
    {
        "Bangun datar",
        "Persegi punya 4 sisi sama. Persegi panjang punya 2 pasang sisi."
    }
};

const QuizQuestion MATEMATIKA_QUIZ[] = {
    {
        "Hasil dari 7 x 8 adalah?",
        {"54", "56", "64"},
        1
    },
    {
        "Hasil dari 144 : 12 adalah?",
        {"10", "12", "14"},
        1
    },
    {
        "Bangun dengan 4 sisi sama?",
        {"Persegi", "Persegi panjang", "Segitiga"},
        0
    }
};

const ContentPage IPA_PAGES[] = {
    {
        "Fotosintesis",
        "Fotosintesis butuh cahaya, air, dan karbon dioksida."
    },
    {
        "Tata surya",
        "Matahari pusat tata surya. Jupiter paling besar."
    }
};

const QuizQuestion IPA_QUIZ[] = {
    {
        "Proses tumbuhan membuat makanan?",
        {"Fotosintesis", "Respirasi", "Transpirasi"},
        0
    },
    {
        "Planet terdekat dari Matahari?",
        {"Merkurius", "Venus", "Bumi"},
        0
    },
    {
        "Alat untuk mengukur suhu?",
        {"Termometer", "Barometer", "Higrometer"},
        0
    }
};

const ContentPage BAHASA_PAGES[] = {
    {
        "Kalimat",
        "Kalimat punya subjek dan predikat."
    },
    {
        "Kata baku",
        "Kata baku: analisis, apotek, aktivitas."
    }
};

const QuizQuestion BAHASA_QUIZ[] = {
    {
        "Antonim dari kata tinggi adalah?",
        {"Rendah", "Besar", "Panjang"},
        0
    },
    {
        "Subjek pada 'Ayah membaca'?",
        {"Ayah", "Membaca", "Koran"},
        0
    },
    {
        "Kata baku yang benar adalah?",
        {"Analisis", "Analisa", "Analisys"},
        0
    }
};

const ContentPage IPS_PAGES[] = {
    {
        "Indonesia",
        "Indonesia negara kepulauan. Ibu kota: Jakarta."
    },
    {
        "Benua",
        "Asia benua terluas. Indonesia terletak di Asia."
    }
};

const QuizQuestion IPS_QUIZ[] = {
    {
        "Ibu kota Indonesia adalah?",
        {"Jakarta", "Bandung", "Surabaya"},
        0
    },
    {
        "Pulau terbesar di Indonesia adalah?",
        {"Kalimantan", "Jawa", "Sumatra"},
        0
    },
    {
        "Benua terluas di dunia adalah?",
        {"Asia", "Afrika", "Eropa"},
        0
    }
};

const ContentPage UMUM_PAGES[] = {
    {
        "Tata surya",
        "Ada 8 planet. Jupiter terbesar. Bumi berpenghuni."
    },
    {
        "Tubuh manusia",
        "Jantung memompa darah. Paru-paru menukar oksigen."
    }
};

const QuizQuestion UMUM_QUIZ[] = {
    {
        "Planet terbesar di tata surya?",
        {"Jupiter", "Saturnus", "Neptunus"},
        0
    },
    {
        "Hewan mamalia terbesar di laut?",
        {"Paus biru", "Hiu putih", "Lumba-lumba"},
        0
    },
    {
        "Warna bendera Indonesia adalah?",
        {"Merah putih", "Merah biru", "Putih biru"},
        0
    }
};

const uint8_t GUIDE_COUNT = ARRAY_COUNT(GUIDE_PAGES);
const uint8_t MATEMATIKA_PAGE_COUNT = ARRAY_COUNT(MATEMATIKA_PAGES);
const uint8_t MATEMATIKA_QUIZ_COUNT = ARRAY_COUNT(MATEMATIKA_QUIZ);
const uint8_t IPA_PAGE_COUNT = ARRAY_COUNT(IPA_PAGES);
const uint8_t IPA_QUIZ_COUNT = ARRAY_COUNT(IPA_QUIZ);
const uint8_t BAHASA_PAGE_COUNT = ARRAY_COUNT(BAHASA_PAGES);
const uint8_t BAHASA_QUIZ_COUNT = ARRAY_COUNT(BAHASA_QUIZ);
const uint8_t IPS_PAGE_COUNT = ARRAY_COUNT(IPS_PAGES);
const uint8_t IPS_QUIZ_COUNT = ARRAY_COUNT(IPS_QUIZ);
const uint8_t UMUM_PAGE_COUNT = ARRAY_COUNT(UMUM_PAGES);
const uint8_t UMUM_QUIZ_COUNT = ARRAY_COUNT(UMUM_QUIZ);

struct Subject {
    const char *name;
    uint16_t accent;
    const ContentPage *pages;
    uint8_t pageCount;
    const QuizQuestion *quiz;
    uint8_t quizCount;
};

const Subject SUBJECTS[] = {
    {
        "Matematika",
        C_SKY,
        MATEMATIKA_PAGES,
        MATEMATIKA_PAGE_COUNT,
        MATEMATIKA_QUIZ,
        MATEMATIKA_QUIZ_COUNT
    },
    {
        "IPA",
        C_GREEN,
        IPA_PAGES,
        IPA_PAGE_COUNT,
        IPA_QUIZ,
        IPA_QUIZ_COUNT
    },
    {
        "B. Indonesia",
        C_ORANGE,
        BAHASA_PAGES,
        BAHASA_PAGE_COUNT,
        BAHASA_QUIZ,
        BAHASA_QUIZ_COUNT
    },
    {
        "IPS",
        C_PURPLE,
        IPS_PAGES,
        IPS_PAGE_COUNT,
        IPS_QUIZ,
        IPS_QUIZ_COUNT
    },
    {
        "Pengetahuan Umum",
        C_TEAL,
        UMUM_PAGES,
        UMUM_PAGE_COUNT,
        UMUM_QUIZ,
        UMUM_QUIZ_COUNT
    }
};

const uint8_t SUBJECT_COUNT = ARRAY_COUNT(SUBJECTS);
const char *SUBJECT_CODES[] = {"MTK", "IPA", "BIN", "IPS", "UMUM"};

const uint8_t MENU_COUNT = 3;
const char *MENU_TITLES[] = {"Panduan", "Materi", "Kuis"};
const uint16_t MENU_ACCENTS[] = {C_SKY, C_GREEN, C_ORANGE};

enum AppMode {
    MODE_MENU,
    MODE_GUIDE,
    MODE_MATERI_PICKER,
    MODE_MATERI,
    MODE_MATERI_DONE,
    MODE_QUIZ_PICKER,
    MODE_QUIZ,
    MODE_QUIZ_FEEDBACK,
    MODE_QUIZ_RESULT
};

AppMode mode = MODE_MENU;

uint8_t menuIndex = 0;
uint8_t guidePage = 0;

uint8_t materiPickerIndex = 0;
uint8_t materiSubject = 0;
uint8_t materiPage = 0;

uint8_t quizPickerIndex = 0;
uint8_t quizSubject = 0;
uint8_t quizIndex = 0;
uint8_t quizChoice = 0;
uint8_t quizScore = 0;
bool quizAnswered = false;
bool quizLastCorrect = false;

const int16_t HOME_X = 14;
const int16_t HOME_Y = 92;
const int16_t HOME_W = 292;
const int16_t HOME_H = 36;
const int16_t HOME_STEP = 40;

const int16_t OPTION_X = 14;
const int16_t OPTION_W = 292;
const int16_t OPTION_H = 24;
const int16_t OPTION_Y = 132;
const int16_t OPTION_STEP = 27;

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
bool nameNeedsRedraw = false;

enum LedState {
    LED_OFF,
    LED_PROCESS,
    LED_SUCCESS,
    LED_ERROR
};

uint32_t ledUntil = 0;
uint8_t ledPriority = 0;

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

void applyLed(LedState state) {
#if USE_RGB
    bool red = false;
    bool green = false;
    bool blue = false;

    if (state == LED_PROCESS) {
        red = true;
        green = true;
    } else if (state == LED_SUCCESS) {
        green = true;
    } else if (state == LED_ERROR) {
        red = true;
    }

#if RGB_COMMON_ANODE
    digitalWrite(PIN_RGB_R, red ? LOW : HIGH);
    digitalWrite(PIN_RGB_G, green ? LOW : HIGH);
    digitalWrite(PIN_RGB_B, blue ? LOW : HIGH);
#else
    digitalWrite(PIN_RGB_R, red ? HIGH : LOW);
    digitalWrite(PIN_RGB_G, green ? HIGH : LOW);
    digitalWrite(PIN_RGB_B, blue ? HIGH : LOW);
#endif
#else
    (void)state;
#endif
}

void showLed(LedState state, uint16_t holdMs, uint8_t priority) {
    uint32_t now = millis();
    bool holdActive = (ledUntil != 0) && ((int32_t)(ledUntil - now) > 0);

    if (holdActive && priority < ledPriority) return;

    applyLed(state);
    ledPriority = priority;
    ledUntil = holdMs ? (now + holdMs) : 0;
}

void updateLed() {
    if (ledUntil != 0 && (int32_t)(millis() - ledUntil) >= 0) {
        applyLed(LED_OFF);
        ledUntil = 0;
        ledPriority = 0;
    }
}

void beepClick() {
#if USE_BUZZER
    tone(PIN_BUZZER, 1800, 18);
#endif
}

void beepCorrect() {
#if USE_BUZZER
    tone(PIN_BUZZER, 880, 60);
    delay(70);
    noTone(PIN_BUZZER);
    tone(PIN_BUZZER, 1320, 90);
    delay(100);
    noTone(PIN_BUZZER);
#endif
}

void beepWrong() {
#if USE_BUZZER
    tone(PIN_BUZZER, 240, 140);
    delay(150);
    noTone(PIN_BUZZER);
    tone(PIN_BUZZER, 170, 180);
    delay(190);
    noTone(PIN_BUZZER);
#endif
}

void beepFinish() {
#if USE_BUZZER
    tone(PIN_BUZZER, 660, 60);
    delay(70);
    noTone(PIN_BUZZER);
    tone(PIN_BUZZER, 880, 60);
    delay(70);
    noTone(PIN_BUZZER);
    tone(PIN_BUZZER, 1100, 110);
    delay(120);
    noTone(PIN_BUZZER);
#endif
}

int16_t measureText(const String &text, const GFXfont *font) {
    if (text.length() == 0) return 0;

    tft.setFont(font);
    tft.setTextSize(1);
    int16_t x1, y1;
    uint16_t w, h;
    tft.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
    return (int16_t)w;
}

void drawTextAtBounds(const String &text, int16_t x, int16_t y,
                      const GFXfont *font, uint16_t color) {
    if (text.length() == 0) return;

    tft.setFont(font);
    tft.setTextSize(1);
    tft.setTextColor(color);

    int16_t x1, y1;
    uint16_t w, h;
    tft.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
    tft.setCursor(x - x1, y - y1);
    tft.print(text);
}

void drawTextTop(const String &text, int16_t x, int16_t y,
                 const GFXfont *font, uint16_t color) {
    drawTextAtBounds(text, x, y, font, color);
}

void drawTextCenter(const String &text, int16_t cx, int16_t y,
                    const GFXfont *font, uint16_t color) {
    int16_t w = measureText(text, font);
    drawTextAtBounds(text, cx - (w / 2), y, font, color);
}

void drawTextRight(const String &text, int16_t rightX, int16_t y,
                   const GFXfont *font, uint16_t color) {
    int16_t w = measureText(text, font);
    drawTextAtBounds(text, rightX - w, y, font, color);
}

void drawTextCenteredIn(const String &text, int16_t x, int16_t y,
                        int16_t w, int16_t h,
                        const GFXfont *font, uint16_t color) {
    if (text.length() == 0) return;

    tft.setFont(font);
    tft.setTextSize(1);
    int16_t x1, y1;
    uint16_t textW, textH;
    tft.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &textW, &textH);

    int16_t drawX = x + (w - (int16_t)textW) / 2;
    int16_t drawY = y + (h - (int16_t)textH) / 2;
    drawTextAtBounds(text, drawX, drawY, font, color);
}

String clipTextToWidth(const String &text, int16_t maxWidth,
                       const GFXfont *font) {
    if (measureText(text, font) <= maxWidth) return text;

    String clipped = text;
    while (clipped.length() > 0 &&
           measureText(clipped + "..", font) > maxWidth) {
        clipped.remove(clipped.length() - 1);
    }
    clipped.trim();
    return clipped + "..";
}

uint8_t drawWrappedText(const String &text, int16_t x, int16_t y,
                        int16_t maxWidth, int16_t lineHeight,
                        const GFXfont *font, uint16_t color,
                        uint8_t maxLines) {
    if (maxLines == 0) return 0;

    String line = "";
    int start = 0;
    uint8_t lines = 0;

    while (start < (int)text.length() && lines < maxLines) {
        int space = text.indexOf(' ', start);
        String word = (space < 0)
                          ? text.substring(start)
                          : text.substring(start, space);

        while (word.length() > 1 &&
               measureText(word, font) > maxWidth) {
            word.remove(word.length() - 1);
        }

        String candidate = line.length() ? line + " " + word : word;
        if (measureText(candidate, font) > maxWidth && line.length() > 0) {
            drawTextTop(line, x, y + (lines * lineHeight), font, color);
            lines++;
            line = word;
        } else {
            line = candidate;
        }

        if (space < 0) break;
        start = space + 1;
    }

    if (line.length() > 0 && lines < maxLines) {
        drawTextTop(line, x, y + (lines * lineHeight), font, color);
        lines++;
    }

    return lines;
}

void drawChevron(int16_t x, int16_t y, uint16_t color) {
    for (int8_t offset = -1; offset <= 1; offset++) {
        tft.drawLine(x, y + offset, x + 5, y + 5 + offset, color);
        tft.drawLine(x + 5, y + 5 + offset, x, y + 10 + offset, color);
    }
}

void drawCard(int16_t x, int16_t y, int16_t w, int16_t h,
              uint16_t border, uint8_t radius) {
    tft.fillRoundRect(x, y, w, h, radius, C_CARD);
    tft.drawRoundRect(x, y, w, h, radius, border);
}

void drawBadge(const String &text, int16_t x, int16_t y,
               uint16_t fill, uint16_t color) {
    int16_t textW = measureText(text, FONT_SMALL);
    int16_t w = textW + 16;
    tft.fillRoundRect(x, y, w, 20, 10, fill);
    drawTextCenteredIn(text, x, y, w, 20, FONT_SMALL, color);
}

void drawProgressBar(int16_t x, int16_t y, int16_t w, int16_t h,
                     uint16_t value, uint16_t maximum, uint16_t color) {
    if (maximum == 0) maximum = 1;
    if (value > maximum) value = maximum;

    tft.fillRoundRect(x, y, w, h, h / 2, C_LINE);
    int16_t filled = (int16_t)(((int32_t)w * value) / maximum);
    if (filled > 0) {
        tft.fillRoundRect(x, y, filled, h, h / 2, color);
    }
}

void drawCheckIcon(int16_t cx, int16_t cy, int16_t radius,
                   uint16_t color, uint16_t fill) {
    tft.fillCircle(cx, cy, radius, fill);
    for (int8_t offset = -1; offset <= 1; offset++) {
        tft.drawLine(cx - 13, cy + offset,
                     cx - 4, cy + 9 + offset, color);
        tft.drawLine(cx - 4, cy + 9 + offset,
                     cx + 14, cy - 10 + offset, color);
    }
}

void drawHeader(const String &section) {
    tft.fillRect(0, 0, SCREEN_W, HEADER_H, C_NAVY);
    tft.fillRect(0, HEADER_H - 3, 107, 3, C_SKY);
    tft.fillRect(107, HEADER_H - 3, 106, 3, C_ORANGE);
    tft.fillRect(213, HEADER_H - 3, 107, 3, C_GREEN);

    tft.fillCircle(22, 21, 10, C_YELLOW);
    tft.fillRoundRect(16, 16, 12, 10, 2, C_NAVY);
    tft.drawFastVLine(22, 16, 10, C_YELLOW);

    drawTextTop("EduBook", 40, 9, FONT_TITLE, C_WHITE);
    String label = clipTextToWidth(section, 106, FONT_SMALL);
    drawTextRight(label, SCREEN_W - 14, 16, FONT_SMALL, C_SKY_SOFT);
}

void drawFooter(const String &hint) {
    tft.fillRect(0, FOOTER_Y, SCREEN_W, SCREEN_H - FOOTER_Y, C_NAVY_SOFT);
    String label = clipTextToWidth(hint, 292, FONT_SMALL);
    drawTextCenteredIn(label, 0, FOOTER_Y, SCREEN_W,
                       SCREEN_H - FOOTER_Y, FONT_SMALL, C_WHITE);
}

String homeHeaderLabel() {
    return clipTextToWidth(studentName, 106, FONT_SMALL);
}

void drawHomeCard(uint8_t index, bool selected) {
    int16_t y = HOME_Y + (index * HOME_STEP);
    uint16_t accent = MENU_ACCENTS[index];
    uint16_t titleColor = selected ? C_WHITE : C_INK;
    uint16_t chevronColor = selected ? C_WHITE : accent;

    tft.fillRoundRect(HOME_X, y, HOME_W, HOME_H, 10,
                      selected ? C_NAVY : C_CARD);
    tft.drawRoundRect(HOME_X, y, HOME_W, HOME_H, 10,
                      selected ? C_NAVY : C_LINE);

    tft.fillRoundRect(HOME_X + 10, y + 8, 6, HOME_H - 16, 3, accent);
    drawTextTop(MENU_TITLES[index], HOME_X + 30, y + 6,
                FONT_TITLE, titleColor);
    drawChevron(HOME_X + HOME_W - 18, y + 13, chevronColor);
}

void drawHomeCards() {
    for (uint8_t i = 0; i < MENU_COUNT; i++) {
        drawHomeCard(i, i == menuIndex);
    }
}

void redrawHomeSelection(uint8_t oldIndex) {
    if (oldIndex == menuIndex) return;

    drawHomeCard(oldIndex, false);
    drawHomeCard(menuIndex, true);
}

void renderHome() {
    nameNeedsRedraw = false;
    drawHeader(homeHeaderLabel());
    drawTextTop("Belajar apa?", 16, 52, FONT_HERO, C_INK);
    drawHomeCards();
    drawFooter("NEXT pilih | SELECT buka");
}

void getSubjectCardBounds(uint8_t index, int16_t &x, int16_t &y,
                          int16_t &w, int16_t &h) {
    x = 14;
    y = 82 + (index * 26);
    w = 292;
    h = 24;
}

void drawSubjectCard(uint8_t index, bool selected) {
    int16_t x, y, w, h;
    getSubjectCardBounds(index, x, y, w, h);

    const Subject &subject = SUBJECTS[index];
    uint16_t titleColor = selected ? C_WHITE : C_INK;
    uint16_t chevronColor = selected ? C_WHITE : subject.accent;
    String label = clipTextToWidth(subject.name, w - 48, FONT_BODY);

    tft.fillRoundRect(x, y, w, h, 8, selected ? C_NAVY : C_CARD);
    tft.drawRoundRect(x, y, w, h, 8, selected ? C_NAVY : C_LINE);
    tft.fillRoundRect(x + 8, y + 5, 5, 14, 2, subject.accent);

    drawTextTop(label, x + 20, y + 3, FONT_BODY, titleColor);
    drawChevron(x + w - 18, y + 7, chevronColor);
}

void drawSubjectCards(bool quiz) {
    for (uint8_t i = 0; i < SUBJECT_COUNT; i++) {
        bool selected = quiz ? (i == quizPickerIndex)
                             : (i == materiPickerIndex);
        drawSubjectCard(i, selected);
    }
}

void redrawSubjectSelection(uint8_t oldIndex, bool quiz) {
    uint8_t currentIndex = quiz ? quizPickerIndex : materiPickerIndex;
    if (oldIndex == currentIndex) return;

    drawSubjectCard(oldIndex, false);
    drawSubjectCard(currentIndex, true);
}

void renderSubjectPicker(bool quiz) {
    drawHeader(quiz ? "KUIS" : "MATERI");
    drawTextTop(quiz ? "Pilih kuis" : "Pilih materi",
                16, 52, FONT_TITLE, C_INK);
    drawSubjectCards(quiz);
    drawFooter("NEXT pilih | SELECT buka");
}

void renderContentPage(const String &section, const String &label,
                       const String &title, const String &body,
                       uint16_t accent, uint8_t current, uint8_t total,
                       const String &footer) {
    drawHeader(section);
    drawProgressBar(14, 48, 292, 6, current, total, accent);
    drawCard(14, 58, 292, 154, accent, 12);
    drawTextTop(label, 28, 70, FONT_SMALL, accent);

    uint8_t titleLines = drawWrappedText(title, 28, 94, 264, 24,
                                         FONT_TITLE, C_INK, 2);
    int16_t bodyY = 94 + (titleLines * 24) + 8;
    uint8_t bodyLines = (titleLines == 1) ? 4 : 3;
    drawWrappedText(body, 28, bodyY, 264, 20,
                    FONT_BODY, C_BODY, bodyLines);

    drawFooter(footer);
}

void renderGuide() {
    const ContentPage &page = GUIDE_PAGES[guidePage];
    String footer = (guidePage + 1 >= GUIDE_COUNT)
                        ? "SELECT selesai | BACK"
                        : "NEXT/SELECT lanjut | BACK";

    renderContentPage("PANDUAN", "PANDUAN ALAT", page.title, page.body,
                      C_SKY, guidePage + 1, GUIDE_COUNT, footer);
}

void renderMateri() {
    const Subject &subject = SUBJECTS[materiSubject];
    const ContentPage &page = subject.pages[materiPage];
    String section = String(SUBJECT_CODES[materiSubject]) + " " +
                     String(materiPage + 1) + "/" +
                     String(subject.pageCount);
    String footer = (materiPage + 1 >= subject.pageCount)
                        ? "SELECT selesai | BACK mapel"
                        : "NEXT/SELECT | BACK mapel";

    renderContentPage(section, subject.name, page.title, page.body,
                      subject.accent, materiPage + 1, subject.pageCount,
                      footer);
}

void renderMateriDone() {
    const Subject &subject = SUBJECTS[materiSubject];
    drawHeader("MATERI");

    drawCard(14, 52, 292, 154, subject.accent, 12);
    drawCheckIcon(160, 84, 26, C_GREEN, C_GREEN_SOFT);
    drawTextCenter(subject.name, 160, 120, FONT_SMALL, subject.accent);
    drawTextCenter("Materi selesai", 160, 138, FONT_TITLE, C_GREEN);
    drawTextCenter("Siap untuk kuis?", 160, 174, FONT_BODY, C_BODY);

    drawFooter("SELECT kuis | BACK mapel");
}

void drawQuizOption(uint8_t index, bool selected) {
    int16_t y = OPTION_Y + (index * OPTION_STEP);
    uint16_t fill = selected ? C_NAVY : C_CARD;
    uint16_t border = selected ? C_NAVY : C_LINE;
    uint16_t textColor = selected ? C_WHITE : C_INK;
    uint16_t circleFill = selected ? C_WHITE : C_ORANGE_SOFT;
    uint16_t letterColor = selected ? C_NAVY : C_ORANGE;
    const QuizQuestion &question = SUBJECTS[quizSubject].quiz[quizIndex];

    tft.fillRoundRect(OPTION_X, y, OPTION_W, OPTION_H, 8, fill);
    tft.drawRoundRect(OPTION_X, y, OPTION_W, OPTION_H, 8, border);
    tft.fillCircle(OPTION_X + 16, y + 12, 9, circleFill);
    drawTextCenteredIn(String((char)('A' + index)),
                       OPTION_X + 7, y + 2, 18, 20,
                       FONT_SMALL, letterColor);
    String option = clipTextToWidth(question.options[index],
                                    OPTION_W - 42, FONT_BODY);
    drawTextCenteredIn(option, OPTION_X + 32, y, OPTION_W - 42,
                       OPTION_H, FONT_BODY, textColor);
}

void drawQuizOptions() {
    for (uint8_t i = 0; i < 3; i++) {
        drawQuizOption(i, i == quizChoice);
    }
}

void redrawQuizOptions(uint8_t oldChoice) {
    if (oldChoice == quizChoice) return;

    drawQuizOption(oldChoice, false);
    drawQuizOption(quizChoice, true);
}

void renderQuizQuestion() {
    const Subject &subject = SUBJECTS[quizSubject];
    const QuizQuestion &question = subject.quiz[quizIndex];
    String section = String(SUBJECT_CODES[quizSubject]) + " " +
                     String(quizIndex + 1) + "/" + String(subject.quizCount);

    drawHeader(section);
    drawProgressBar(14, 48, 292, 6, quizIndex + 1, subject.quizCount,
                    subject.accent);
    drawCard(14, 58, 292, 68, C_LINE, 12);
    drawWrappedText(question.question, 28, 72, 264, 20,
                    FONT_BODY, C_INK, 2);
    drawQuizOptions();
    drawFooter("NEXT pilih | SELECT kunci");
}

void renderQuizFeedback() {
    const Subject &subject = SUBJECTS[quizSubject];
    const QuizQuestion &question = subject.quiz[quizIndex];
    String section = String(SUBJECT_CODES[quizSubject]) + " " +
                     String(quizIndex + 1) + "/" + String(subject.quizCount);

    drawHeader(section);

    uint16_t resultColor = quizLastCorrect ? C_GREEN : C_RED;
    uint16_t resultSoft = quizLastCorrect ? C_GREEN_SOFT : C_RED_SOFT;

    drawCard(14, 52, 292, 86, resultColor, 12);
    drawTextTop(quizLastCorrect ? "BENAR!" : "BELUM TEPAT",
                28, 64, FONT_TITLE, resultColor);
    drawTextTop("Skor " + String(quizScore) + "/" +
                String(subject.quizCount),
                28, 94, FONT_BODY, C_INK);
    drawBadge(quizLastCorrect ? "JAWABAN TEPAT" : "COBA LAGI",
              28, 114, resultSoft, resultColor);

    drawCard(14, 146, 292, 62, C_LINE, 12);
    drawTextTop("JAWABAN BENAR", 28, 156, FONT_SMALL, C_MUTED);
    String answer = String((char)('A' + question.correct)) + ". " +
                    question.options[question.correct];
    answer = clipTextToWidth(answer, 264, FONT_BODY);
    drawTextTop(answer, 28, 178, FONT_BODY, C_INK);

    drawFooter("NEXT/SELECT lanjut");
}

void renderQuizResult() {
    const Subject &subject = SUBJECTS[quizSubject];
    uint8_t percent = (uint8_t)(((uint16_t)quizScore * 100) /
                                subject.quizCount);
    uint16_t scoreColor = percent >= 80 ? C_GREEN :
                          (percent >= 60 ? C_ORANGE : C_RED);

    drawHeader("HASIL KUIS");
    drawCard(14, 52, 292, 154, scoreColor, 12);
    drawTextTop(subject.name, 28, 66, FONT_SMALL, subject.accent);
    drawTextTop(String(percent) + "%", 28, 88, FONT_HERO, scoreColor);
    drawTextTop("Benar " + String(quizScore) + " dari " +
                String(subject.quizCount),
                28, 126, FONT_BODY, C_INK);
    drawProgressBar(28, 154, 264, 8, quizScore, subject.quizCount,
                    scoreColor);

    String message;
    if (percent >= 80) {
        message = "Luar biasa!";
    } else if (percent >= 60) {
        message = "Terus berlatih!";
    } else {
        message = "Coba lagi!";
    }
    drawTextTop(message, 28, 176, FONT_TITLE, scoreColor);

    drawFooter("SELECT/BACK pilih mapel");
}

void renderCurrent() {
    tft.fillRect(0, HEADER_H, SCREEN_W, FOOTER_Y - HEADER_H, C_BG);

    switch (mode) {
        case MODE_MENU:
            renderHome();
            break;
        case MODE_GUIDE:
            renderGuide();
            break;
        case MODE_MATERI_PICKER:
            renderSubjectPicker(false);
            break;
        case MODE_MATERI:
            renderMateri();
            break;
        case MODE_MATERI_DONE:
            renderMateriDone();
            break;
        case MODE_QUIZ_PICKER:
            renderSubjectPicker(true);
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
    }
}

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
    sendPendingPage();
}

void mqttCallback(char *topic, byte *payload, unsigned int length) {
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    if (String(topic) == MQTT_TOPIC_CONFIG) {
        String name = extractJsonString(message, "student_name");
        name.trim();
        if (name.length() > 0) {
            studentName = name;
            nameNeedsRedraw = true;
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
    mqttClient.setSocketTimeout(1);
    mqttClient.setKeepAlive(15);
    mqttClient.setBufferSize(512);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    wifiLink = LINK_CONNECTING;
    wifiAttemptAt = millis();
    showLed(LED_PROCESS, 0, 1);

    Serial.print("Wi-Fi: ");
    Serial.println(WIFI_SSID);
    Serial.print("MQTT client: ");
    Serial.println(mqttClientId);
#else
    wifiLink = LINK_OFF;
    mqttLink = LINK_OFF;
    showLed(LED_OFF, 0, 1);
#endif
}

void updateNetwork() {
#if ENABLE_NETWORK
    if (WiFi.status() == WL_CONNECTED) {
        if (wifiLink != LINK_ONLINE) {
            wifiLink = LINK_ONLINE;
            wifiAttemptAt = millis();
            showLed(LED_OFF, 0, 1);
            Serial.print("Wi-Fi terhubung: ");
            Serial.println(WiFi.localIP());
        }

#if ENABLE_MQTT
        if (mqttClient.connected()) {
            mqttLink = LINK_ONLINE;
        } else {
            if (mqttLink == LINK_ONLINE) {
                mqttLink = LINK_ERROR;
            }

            if ((millis() - mqttRetryAt) >= 8000) {
                mqttRetryAt = millis();
                mqttLink = LINK_CONNECTING;

                if (mqttClient.connect(mqttClientId)) {
                    onMqttConnected();
                } else {
                    mqttLink = LINK_ERROR;
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
            showLed(LED_PROCESS, 0, 1);
        }

        if (wifiLink == LINK_CONNECTING &&
            (millis() - wifiAttemptAt) > 12000) {
            wifiLink = LINK_ERROR;
            wifiRetryAt = millis();
            showLed(LED_ERROR, 1400, 1);
        }

        if (wifiLink == LINK_ERROR &&
            (millis() - wifiRetryAt) > 15000) {
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
            wifiAttemptAt = millis();
            wifiLink = LINK_CONNECTING;
            showLed(LED_PROCESS, 0, 1);
        }

        if (mqttLink != LINK_OFF) {
            mqttLink = LINK_OFF;
        }
    }
#else
    wifiLink = LINK_OFF;
    mqttLink = LINK_OFF;
#endif
}

void enterMenu() {
    mode = MODE_MENU;
    pendingPage = 0;
}

void enterGuide() {
    guidePage = 0;
    mode = MODE_GUIDE;
    publishPageEvent(guidePage + 1);
}

void enterMateriPicker() {
    materiPickerIndex = materiSubject;
    mode = MODE_MATERI_PICKER;
    pendingPage = 0;
}

void enterQuizPicker() {
    quizPickerIndex = quizSubject;
    mode = MODE_QUIZ_PICKER;
    pendingPage = 0;
}

void startMateri(uint8_t subjectIndex) {
    materiSubject = subjectIndex;
    materiPickerIndex = subjectIndex;
    materiPage = 0;
    mode = MODE_MATERI;
    publishPageEvent(materiPage + 1);
}

void startQuiz(uint8_t subjectIndex) {
    quizSubject = subjectIndex;
    quizPickerIndex = subjectIndex;
    quizIndex = 0;
    quizChoice = 0;
    quizScore = 0;
    quizAnswered = false;
    pendingPage = 0;
    mode = MODE_QUIZ;
}

void advanceQuiz() {
    const Subject &subject = SUBJECTS[quizSubject];

    if (quizIndex + 1 < subject.quizCount) {
        quizIndex++;
        quizChoice = 0;
        quizAnswered = false;
        mode = MODE_QUIZ;
    } else {
        mode = MODE_QUIZ_RESULT;
        showLed(LED_SUCCESS, 1400, 2);
        beepFinish();
    }
}

void handleNext() {
    switch (mode) {
        case MODE_MENU:
            menuIndex = (menuIndex + 1) % MENU_COUNT;
            break;

        case MODE_GUIDE:
            if (guidePage + 1 < GUIDE_COUNT) {
                guidePage++;
                publishPageEvent(guidePage + 1);
            }
            break;

        case MODE_MATERI_PICKER:
            materiPickerIndex =
                (materiPickerIndex + 1) % SUBJECT_COUNT;
            break;

        case MODE_MATERI:
            if (materiPage + 1 < SUBJECTS[materiSubject].pageCount) {
                materiPage++;
                publishPageEvent(materiPage + 1);
            }
            break;

        case MODE_QUIZ_PICKER:
            quizPickerIndex = (quizPickerIndex + 1) % SUBJECT_COUNT;
            break;

        case MODE_QUIZ:
            if (!quizAnswered) {
                quizChoice = (quizChoice + 1) % 3;
            }
            break;

        case MODE_QUIZ_FEEDBACK:
            advanceQuiz();
            break;

        default:
            break;
    }
}

void handleSelect() {
    switch (mode) {
        case MODE_MENU:
            if (menuIndex == 0) {
                enterGuide();
            } else if (menuIndex == 1) {
                enterMateriPicker();
            } else {
                enterQuizPicker();
            }
            break;

        case MODE_GUIDE:
            if (guidePage + 1 < GUIDE_COUNT) {
                guidePage++;
                publishPageEvent(guidePage + 1);
            } else {
                enterMenu();
            }
            break;

        case MODE_MATERI_PICKER:
            startMateri(materiPickerIndex);
            break;

        case MODE_MATERI:
            if (materiPage + 1 < SUBJECTS[materiSubject].pageCount) {
                materiPage++;
                publishPageEvent(materiPage + 1);
            } else {
                mode = MODE_MATERI_DONE;
                showLed(LED_SUCCESS, 1400, 2);
                beepFinish();
            }
            break;

        case MODE_MATERI_DONE:
            startQuiz(materiSubject);
            break;

        case MODE_QUIZ_PICKER:
            startQuiz(quizPickerIndex);
            break;

        case MODE_QUIZ:
            if (!quizAnswered) {
                const QuizQuestion &question =
                    SUBJECTS[quizSubject].quiz[quizIndex];

                quizAnswered = true;
                quizLastCorrect = (quizChoice == question.correct);

                if (quizLastCorrect) {
                    quizScore++;
                    showLed(LED_SUCCESS, 1200, 2);
                    beepCorrect();
                } else {
                    showLed(LED_ERROR, 1200, 2);
                    beepWrong();
                }

                mode = MODE_QUIZ_FEEDBACK;
            }
            break;

        case MODE_QUIZ_FEEDBACK:
            advanceQuiz();
            break;

        case MODE_QUIZ_RESULT:
            enterQuizPicker();
            break;

        default:
            break;
    }
}

void handleBack() {
    switch (mode) {
        case MODE_MENU:
            break;

        case MODE_GUIDE:
        case MODE_MATERI_PICKER:
        case MODE_QUIZ_PICKER:
            enterMenu();
            break;

        case MODE_MATERI:
        case MODE_MATERI_DONE:
            enterMateriPicker();
            break;

        case MODE_QUIZ:
        case MODE_QUIZ_FEEDBACK:
        case MODE_QUIZ_RESULT:
            enterQuizPicker();
            break;

        default:
            break;
    }
}

void showSplash() {
    tft.fillScreen(C_NAVY);
    tft.fillCircle(160, 82, 38, C_YELLOW);
    tft.fillRoundRect(139, 66, 21, 32, 4, C_WHITE);
    tft.fillRoundRect(160, 66, 21, 32, 4, C_WHITE);
    tft.fillRect(159, 66, 2, 32, C_NAVY);

    drawTextCenter("EduBook", 160, 132, FONT_HERO, C_WHITE);
    drawTextCenter("Belajar lebih mudah.", 160, 174, FONT_BODY, C_SKY_SOFT);
    drawTextCenter("Menyiapkan...", 160, 203, FONT_SMALL, C_SKY_SOFT);

    delay(550);
}

void setup() {
    Serial.begin(115200);
    delay(100);
    Serial.println("BOOT: mulai");

    btnNext.begin(PIN_BTN_NEXT);
    btnSelect.begin(PIN_BTN_SELECT);
    btnBack.begin(PIN_BTN_BACK);
    Serial.println("BOOT: tombol siap");

#if USE_RGB
    pinMode(PIN_RGB_R, OUTPUT);
    pinMode(PIN_RGB_G, OUTPUT);
    pinMode(PIN_RGB_B, OUTPUT);
    applyLed(LED_OFF);
#endif

#if USE_BUZZER
    pinMode(PIN_BUZZER, OUTPUT);
#endif
    Serial.println("BOOT: output siap");

    tft.begin();
    tft.setRotation(1);
    tft.setFont(NULL);
    tft.setTextSize(1);
    Serial.println("BOOT: layar siap");

    showSplash();
    Serial.println("BOOT: splash selesai");

    mode = MODE_MENU;
    renderCurrent();
    Serial.println("BOOT: home tampil");

    startNetwork();
    Serial.println("BOOT: jaringan dimulai");
}

void loop() {
    static uint32_t lastHeartbeat = 0;

    bool nextPressed = btnNext.pressed();
    bool selectPressed = btnSelect.pressed();
    bool backPressed = btnBack.pressed();

    if (nextPressed || selectPressed || backPressed) {
        beepClick();

        if (nextPressed) {
            if (mode == MODE_MENU) {
                uint8_t oldIndex = menuIndex;
                handleNext();
                redrawHomeSelection(oldIndex);
            } else if (mode == MODE_GUIDE) {
                uint8_t oldPage = guidePage;
                handleNext();
                if (guidePage != oldPage) renderCurrent();
            } else if (mode == MODE_MATERI_PICKER) {
                uint8_t oldIndex = materiPickerIndex;
                handleNext();
                redrawSubjectSelection(oldIndex, false);
            } else if (mode == MODE_MATERI) {
                uint8_t oldPage = materiPage;
                handleNext();
                if (materiPage != oldPage) renderCurrent();
            } else if (mode == MODE_QUIZ_PICKER) {
                uint8_t oldIndex = quizPickerIndex;
                handleNext();
                redrawSubjectSelection(oldIndex, true);
            } else if (mode == MODE_QUIZ) {
                uint8_t oldChoice = quizChoice;
                handleNext();
                redrawQuizOptions(oldChoice);
            } else if (mode == MODE_QUIZ_FEEDBACK) {
                handleNext();
                renderCurrent();
            }
        } else if (selectPressed) {
            handleSelect();
            renderCurrent();
        } else if (backPressed) {
            if (mode != MODE_MENU) {
                handleBack();
                renderCurrent();
            }
        }
    }

    updateNetwork();

    if (nameNeedsRedraw && mode == MODE_MENU) {
        nameNeedsRedraw = false;
        drawHeader(homeHeaderLabel());
    }

    updateLed();

    if ((millis() - lastHeartbeat) >= 10000) {
        lastHeartbeat = millis();
        Serial.print("LOOP mode=");
        Serial.println((int)mode);
    }

    delay(5);
}
