/*
 * ============================================================================
 *  EDUBOOK MINI - FULL SKEMA SIMULASI WOKWI
 *  SIC Batch 8 - Stage 2
 *  Versi: 1.0
 *
 *  Tujuan:
 *  Simulasi interaksi belajar EduBook menggunakan ESP32, OLED, tombol,
 *  buzzer, dan RGB LED. Seluruh materi, kuis, dan Smart Review berjalan
 *  lokal di ESP32 (tanpa Wi-Fi/MQTT/backend).
 *
 *  Catatan penting:
 *  - Ini adalah simulasi alur perangkat, bukan pengganti hardware EduBook.
 *  - Tidak ada mikrofon INMP441, speech-to-text, atau evaluasi AI sungguhan.
 *  - Smart Review memakai aturan sederhana untuk mendemonstrasikan feedback.
 *
 *  BOARD: ESP32 DevKit V1
 *
 *  LIBRARY (Arduino IDE Library Manager / libraries.txt Wokwi):
 *  - Adafruit GFX Library
 *  - Adafruit SSD1306
 *
 *  WIRING:
 *  OLED SSD1306 128x64 I2C
 *    VCC -> 3V3
 *    GND -> GND
 *    SDA -> GPIO 21
 *    SCL -> GPIO 22
 *    Alamat I2C umum: 0x3C
 *
 *  Tombol (INPUT_PULLUP, aktif LOW; kaki lain ke GND)
 *    NEXT   -> GPIO 18
 *    SELECT -> GPIO 19
 *    BACK   -> GPIO 23
 *
 *  Buzzer opsional
 *    (+) -> GPIO 25
 *    (-) -> GND
 *
 *  RGB LED opsional (common-cathode)
 *    R -> resistor 220-330 ohm -> GPIO 26
 *    G -> resistor 220-330 ohm -> GPIO 27
 *    B -> resistor 220-330 ohm -> GPIO 14
 *    Common -> GND
 *
 *  Jika memakai RGB LED common-anode:
 *    - Common -> 3V3
 *    - Ubah RGB_COMMON_ANODE menjadi 1 di bawah.
 *
 *  ALUR TOMBOL:
 *    NEXT   : geser menu / pilihan jawaban / halaman materi / soal berikut
 *    SELECT : buka menu / kunci jawaban / kirim jawaban simulasi
 *    BACK   : kembali ke menu utama
 * ============================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ============================ KONFIGURASI ==================================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

#define USE_RGB 1
#define USE_BUZZER 1
#define RGB_COMMON_ANODE 0   // 0 = common-cathode, 1 = common-anode

const uint8_t PIN_BTN_NEXT = 18;
const uint8_t PIN_BTN_SELECT = 19;
const uint8_t PIN_BTN_BACK = 23;
const uint8_t PIN_BUZZER = 25;
const uint8_t PIN_RGB_R = 26;
const uint8_t PIN_RGB_G = 27;
const uint8_t PIN_RGB_B = 14;

const uint32_t DEBOUNCE_MS = 35;
const uint8_t OLED_SDA = 21;
const uint8_t OLED_SCL = 22;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ============================ DATA MATERI ==================================

struct MateriPage {
    const char *title;
    const char *body;
};

const MateriPage MATERI_BANK[] = {
    {
        "Tentang EduBook Mini",
        "Simulasi perangkat belajar pintar untuk SIC Batch 8."
    },
    {
        "Navigasi",
        "NEXT: pindah. SELECT: pilih. BACK: kembali."
    },
    {
        "Kuis",
        "Pilih jawaban dengan NEXT, lalu kunci dengan SELECT."
    },
    {
        "Smart Review",
        "Simulasi berbasis aturan, bukan AI atau mikrofon."
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

// Menu
const char *MENU_ITEMS[] = {
    "Materi",
    "Kuis",
    "Smart Review"
};
const uint8_t MENU_COUNT =
    sizeof(MENU_ITEMS) / sizeof(MENU_ITEMS[0]);
uint8_t menuIndex = 0;

// Materi
uint8_t materiPage = 0;

// Kuis
uint8_t quizIndex = 0;
uint8_t quizChoice = 0;
uint8_t quizScore = 0;
bool quizAnswered = false;
bool quizLastCorrect = false;

// Smart Review
uint8_t reviewIndex = 0;
uint8_t reviewStage = 0;       // 0 mulai, 1 kirim, 2 feedback
uint16_t reviewScoreSum = 0;
uint8_t reviewLastScore = 0;
bool reviewKeywordOk = false;
String reviewMessage = "";

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

// ============================ RGB LED ======================================

void setRgb(uint8_t r, uint8_t g, uint8_t b) {
#if USE_RGB
#if RGB_COMMON_ANODE
    // Common-anode: logika dibalik.
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

// ============================ BUZZER =======================================

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
    beepTone(1400, 25);
}

void beepCorrect() {
    beepTone(880, 70);
    delay(20);
    beepTone(1320, 110);
}

void beepWrong() {
    beepTone(220, 180);
    delay(30);
    beepTone(160, 220);
}

void beepFinish() {
    beepTone(660, 80);
    delay(20);
    beepTone(880, 80);
    delay(20);
    beepTone(1100, 140);
}

// ============================ OLED HELPER ==================================

void printCentered(const String &text, int16_t y) {
    int16_t x1, y1;
    uint16_t w, h;
    display.getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
    int16_t x = (SCREEN_WIDTH - (int16_t)w) / 2;
    if (x < 0) x = 0;
    display.setCursor(x, y);
    display.print(text);
}

void drawHeader(const String &title) {
    display.setTextSize(1);
    display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
    display.fillRect(0, 0, SCREEN_WIDTH, 12, SSD1306_WHITE);
    display.setCursor(2, 2);
    display.print(title);
    display.setTextColor(SSD1306_WHITE, SSD1306_BLACK);
}

void drawFooter(const String &text) {
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE, SSD1306_BLACK);
    display.drawLine(0, 54, SCREEN_WIDTH - 1, 54, SSD1306_WHITE);
    display.setCursor(2, 56);
    display.print(text);
}

uint8_t drawWrapped(const String &text, int16_t x, int16_t y,
                    uint8_t maxChars, uint8_t lineHeight,
                    uint8_t maxLines) {
    String line = "";
    uint8_t lines = 0;
    int start = 0;

    while (start < (int)text.length() && lines < maxLines) {
        int space = text.indexOf(' ', start);
        String word = (space < 0)
                          ? text.substring(start)
                          : text.substring(start, space);

        if (word.length() > maxChars) {
            word = word.substring(0, maxChars);
        }

        String candidate = line.length() ? line + " " + word : word;
        if (candidate.length() > maxChars && line.length() > 0) {
            display.setCursor(x, y + (lines * lineHeight));
            display.print(line);
            lines++;
            line = word;
        } else {
            line = candidate;
        }

        if (space < 0) break;
        start = space + 1;
    }

    if (line.length() > 0 && lines < maxLines) {
        display.setCursor(x, y + (lines * lineHeight));
        display.print(line);
        lines++;
    }

    return lines;
}

// ============================ SPLASH =======================================

void showSplash() {
    setRgb(0, 0, 255);

    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    printCentered("EDUBOOK MINI", 6);
    display.drawLine(12, 18, 115, 18, SSD1306_WHITE);
    printCentered("SIC Batch 8 - Stage 2", 24);
    printCentered("Simulasi Wokwi", 34);
    printCentered("Versi 1.0", 46);
    display.display();
    delay(900);

    display.clearDisplay();
    printCentered("System Ready", 22);
    printCentered("Menyiapkan menu...", 36);
    display.display();

    beepTone(1000, 80);
    delay(40);
    beepTone(1300, 100);
    delay(650);
}

// ============================ MODE MENU ====================================

void enterMenu() {
    mode = MODE_MENU;
    setRgb(0, 0, 255);
}

void startMateri() {
    materiPage = 0;
    mode = MODE_MATERI;
    setRgb(0, 0, 255);
}

void startQuiz() {
    quizIndex = 0;
    quizChoice = 0;
    quizScore = 0;
    quizAnswered = false;
    mode = MODE_QUIZ;
    setRgb(0, 0, 255);
}

void startReview() {
    reviewIndex = 0;
    reviewStage = 0;
    reviewScoreSum = 0;
    reviewLastScore = 0;
    reviewKeywordOk = false;
    reviewMessage = "";
    mode = MODE_REVIEW;
    setRgb(0, 0, 255);
}

void renderMenu() {
    drawHeader("EDUBOOK MINI");

    for (uint8_t i = 0; i < MENU_COUNT; i++) {
        int16_t y = 18 + (i * 12);
        bool selected = (i == menuIndex);

        if (selected) {
            display.fillRect(0, y - 2, SCREEN_WIDTH, 11, SSD1306_WHITE);
            display.setTextColor(SSD1306_BLACK);
        } else {
            display.setTextColor(SSD1306_WHITE);
        }

        display.setCursor(4, y);
        display.print(selected ? "> " : "  ");
        display.print(MENU_ITEMS[i]);
    }

    display.setTextColor(SSD1306_WHITE);
    drawFooter("NEXT:geser SEL:buka");
}

// ============================ MODE MATERI ==================================

void renderMateri() {
    drawHeader("MATERI " + String(materiPage + 1) + "/" +
               String(MATERI_COUNT));

    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(2, 15);
    display.print(MATERI_BANK[materiPage].title);
    drawWrapped(MATERI_BANK[materiPage].body, 2, 27, 21, 9, 3);

    if (materiPage + 1 >= MATERI_COUNT) {
        drawFooter("SEL selesai/BACK");
    } else {
        drawFooter("NEXT/SEL lanjut");
    }
}

void renderMateriDone() {
    drawHeader("MATERI");
    display.setTextSize(2);
    display.setCursor(2, 18);
    display.print("SELESAI");
    display.setTextSize(1);
    display.setCursor(2, 40);
    display.print("Semua sudah dibaca.");
    drawFooter("SEL/BACK ke menu");
}

// ============================ MODE KUIS ====================================

void renderQuizQuestion() {
    drawHeader("KUIS " + String(quizIndex + 1) + "/" + String(QUIZ_COUNT) +
               "  SKOR " + String(quizScore));

    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    drawWrapped(QUIZ_BANK[quizIndex].question, 2, 14, 20, 9, 2);

    for (uint8_t i = 0; i < 3; i++) {
        int16_t y = 36 + (i * 9);
        bool selected = (i == quizChoice);

        if (selected) {
            display.fillRect(0, y - 1, SCREEN_WIDTH, 9, SSD1306_WHITE);
            display.setTextColor(SSD1306_BLACK);
        } else {
            display.setTextColor(SSD1306_WHITE);
        }

        display.setCursor(2, y);
        display.print(selected ? "> " : "  ");
        display.print((char)('A' + i));
        display.print(". ");
        display.print(QUIZ_BANK[quizIndex].options[i]);
    }

    display.setTextColor(SSD1306_WHITE);
}

void renderQuizFeedback() {
    drawHeader("HASIL KUIS");

    display.setTextSize(2);
    display.setCursor(2, 16);
    display.print(quizLastCorrect ? "BENAR" : "SALAH");

    display.setTextSize(1);
    display.setCursor(2, 35);
    display.print("Skor: ");
    display.print(quizScore);
    display.print("/");
    display.print(QUIZ_COUNT);

    display.setCursor(2, 45);
    display.print("Kunci: ");
    display.print((char)('A' + QUIZ_BANK[quizIndex].correct));

    display.setCursor(52, 45);
    display.print(QUIZ_BANK[quizIndex].options[QUIZ_BANK[quizIndex].correct]);

    if (quizIndex + 1 >= QUIZ_COUNT) {
        drawFooter("NEXT lihat skor");
    } else {
        drawFooter("NEXT soal berikutnya");
    }
}

void renderQuizResult() {
    drawHeader("SKOR AKHIR");

    uint8_t percent = (uint8_t)(((uint16_t)quizScore * 100) / QUIZ_COUNT);
    String scoreText = String(quizScore) + "/" + String(QUIZ_COUNT);

    display.setTextSize(2);
    printCentered(scoreText, 14);

    display.setTextSize(1);
    display.setCursor(2, 38);
    display.print("Nilai: ");
    display.print(percent);
    display.print(" / 100");

    display.setCursor(2, 46);
    if (percent >= 80) {
        display.print("Luar biasa!");
    } else if (percent >= 60) {
        display.print("Bagus, lanjutkan!");
    } else {
        display.print("Ayo coba lagi!");
    }

    drawFooter("SEL/BACK ke menu");
}

// ============================ SMART REVIEW =================================

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

    reviewKeywordOk =
        lower.indexOf(String(item.keyword)) >= 0;
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

void renderReview() {
    drawHeader("REVIEW " + String(reviewIndex + 1) + "/" +
               String(REVIEW_COUNT));

    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);

    if (reviewStage == 0) {
        display.setCursor(2, 18);
        display.print("Tekan SELECT untuk");
        display.setCursor(2, 30);
        display.print("mulai sesi simulasi.");
        drawFooter("SEL: mulai");
        return;
    }

    if (reviewStage == 1) {
        display.setCursor(2, 15);
        display.print("Prompt:");
        drawWrapped(REVIEW_BANK[reviewIndex].prompt, 2, 26, 21, 9, 2);
        drawFooter("SEL: kirim jawaban");
        return;
    }

    drawHeader("HASIL (SIMULASI)");
    display.setCursor(2, 16);
    display.print("Skor item: ");
    display.print(reviewLastScore);

    display.setCursor(2, 26);
    display.print("Kata kunci: ");
    display.print(reviewKeywordOk ? "cocok" : "belum");

    drawWrapped(reviewMessage, 2, 37, 21, 9, 2);
    drawFooter("SEL: lanjut");
}

void renderReviewResult() {
    drawHeader("REVIEW SELESAI");

    uint8_t average = (uint8_t)(reviewScoreSum / REVIEW_COUNT);
    String scoreText = String(average) + "/100";

    display.setTextSize(2);
    printCentered(scoreText, 14);

    display.setTextSize(1);
    display.setCursor(2, 38);
    display.print("Rata-rata simulasi.");
    display.setCursor(2, 46);
    display.print(average >= 60 ? "Cukup baik."
                                : "Perlu review ulang.");

    drawFooter("SEL/BACK ke menu");
}

// ============================ RENDER =======================================

void render() {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);

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

    display.display();
}

// ============================ HANDLER TOMBOL ===============================

void advanceQuiz() {
    if (quizIndex + 1 < QUIZ_COUNT) {
        quizIndex++;
        quizChoice = 0;
        quizAnswered = false;
        mode = MODE_QUIZ;
        setRgb(0, 0, 255);
    } else {
        mode = MODE_QUIZ_RESULT;
        setRgb(0, 0, 255);
        beepFinish();
    }
}

void advanceReview() {
    if (reviewIndex + 1 < REVIEW_COUNT) {
        reviewIndex++;
        reviewStage = 0;
        setRgb(0, 0, 255);
    } else {
        mode = MODE_REVIEW_RESULT;
        setRgb(0, 0, 255);
        beepFinish();
    }
}

void handleNext() {
    switch (mode) {
        case MODE_MENU:
            menuIndex = (menuIndex + 1) % MENU_COUNT;
            setRgb(0, 0, 255);
            break;

        case MODE_MATERI:
            if (materiPage + 1 < MATERI_COUNT) {
                materiPage++;
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
            } else {
                mode = MODE_MATERI_DONE;
                setRgb(0, 255, 0);
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
                    setRgb(0, 255, 0);
                    beepCorrect();
                } else {
                    setRgb(255, 0, 0);
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
                    setRgb(0, 255, 0);
                    beepCorrect();
                } else if (reviewLastScore >= 60) {
                    setRgb(255, 140, 0);
                    beepTone(600, 120);
                } else {
                    setRgb(255, 0, 0);
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

// ============================ SETUP & LOOP =================================

void setup() {
    Serial.begin(115200);
    delay(150);

    pinMode(PIN_BTN_NEXT, INPUT_PULLUP);
    pinMode(PIN_BTN_SELECT, INPUT_PULLUP);
    pinMode(PIN_BTN_BACK, INPUT_PULLUP);

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

    Wire.begin(OLED_SDA, OLED_SCL);

    if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
        Serial.println("OLED SSD1306 tidak terdeteksi di alamat 0x3C.");
        Serial.println("Periksa VCC, GND, SDA/SCL, dan alamat I2C.");
        setRgb(255, 0, 0);

        while (true) {
            beepWrong();
            delay(1200);
        }
    }

    display.clearDisplay();
    display.display();

    Serial.println("EDUBOOK MINI siap.");
    showSplash();
    enterMenu();
    dirty = true;
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

    delay(5);
}
