# EduBook Firmware - ESP32-S3

Firmware untuk hardware EduBook berbasis ESP32-S3 dengan TFT 3.5", INMP441 (mic I2S), dan MAX98357 (audio amplifier I2S).

## Dua Varian Firmware

| Lokasi | Board | Toolchain | Keterangan |
|--------|-------|-----------|------------|
| `firmware/` | ESP32-S3 DevKitC-1 | PlatformIO | Varian utama, pinout ada di `include/Config.h` |
| `ESP32_EduBook/ESP32_EduBook.ino` | ESP32 DevKit V1 | Arduino IDE | Varian voice assistant; pinout TFT diatur lewat `User_Setup.h` TFT_eSPI |

Kedua varian memakai MQTT dan topik yang sama. Pilih salah satu sesuai board
yang tersedia; jangan mencampur konfigurasi pin antarvarian.

## Cara Pakai (PlatformIO)

### 1. Install PlatformIO

- Install [VS Code](https://code.visualstudio.com/)
- Install extension **PlatformIO IDE**
- Buka folder `firmware/` sebagai project PlatformIO

### 2. Konfigurasi

Edit `include/Config.h`:

```cpp
#define WIFI_SSID "your_wifi_name"
#define WIFI_PASSWORD "your_wifi_password"
#define MQTT_BROKER_HOST "broker.hivemq.com"
#define MQTT_TOPIC_PREFIX "edubook/demo"
```

Pastikan broker dan prefix topik sama dengan `MQTT_BROKER_URL` dan
`MQTT_TOPIC_PREFIX` di `backend/.env`. Broker publik hanya cocok untuk demo;
untuk penggunaan nyata gunakan broker privat dengan autentikasi/TLS.

### 3. Upload

```bash
# Build
pio run

# Upload
pio run --target upload

# Monitor serial
pio device monitor
```

### Varian Arduino IDE (ESP32 DevKit V1)

1. Install board ESP32 via Board Manager.
2. Install libraries: `TFT_eSPI`, `PubSubClient`, `ArduinoJson` (v7+).
3. Atur pin TFT di `User_Setup.h` milik library TFT_eSPI sesuai komentar di
   bagian atas `ESP32_EduBook/ESP32_EduBook.ino`.
4. Buka `ESP32_EduBook/ESP32_EduBook.ino`, compile, lalu upload.

## Struktur File

```
firmware/
├── platformio.ini       # Konfigurasi PlatformIO
├── include/
│   └── Config.h         # Pinout, WiFi, MQTT config
├── src/
│   ├── main.cpp         # State machine utama
│   ├── AudioManager.h   # I2S audio driver (INMP441 + MAX98357)
│   └── AudioManager.cpp # Implementasi I2S record/playback
└── README.md
```

## Skema Pinout (ESP32-S3)

| Fungsi | Pin |
|--------|-----|
| TFT_CS | 10 |
| TFT_DC | 11 |
| TFT_RST | 12 |
| TFT_LEDA | 45 |
| I2S MIC SD | 4 |
| I2S MIC WS | 5 |
| I2S MIC SCK | 6 |
| I2S SPK SD | 7 |
| I2S SPK WS | 8 |
| I2S SPK SCK | 9 |
| Button | 0 |
| LED Status | 48 |

## Topik MQTT

| Topik | Arah | Fungsi |
|-------|------|--------|
| `edubook/demo/page` | Device → Server | Nomor halaman aktif |
| `edubook/demo/navbar` | Device → Server | `start_voice`, `stop_voice`, `next_tab`, `web_mode_yes/no` |
| `edubook/demo/voice` | Device → Server | Data suara/teks hafalan |
| `edubook/demo/audio` | Server → Device | Feedback AI, skor, jawaban voice command |
| `edubook/demo/sync` | Dua arah | Sinkronisasi status/halaman |
| `edubook/demo/config` | Server → Device | Konfigurasi device (bila dipakai) |

## Alur Hardware

1. ESP32 boot → TFT splash screen
2. Connect WiFi + MQTT
3. TFT: "Gunakan Web Dashboard? Iya/Tidak"
4. **Iya** → Tampilkan QR + IP → user buka web
5. **Tidak** → Mode mandiri (mic → speaker)
6. Smart-Review: INMP record → MQTT ke server → AI evaluasi → feedback via speaker
7. Voice assistant: push-to-talk → STT/NLU di server → aksi atau jawaban audio
