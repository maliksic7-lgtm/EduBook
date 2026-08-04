# EduBook Firmware - ESP32-S3

Firmware untuk hardware EduBook berbasis ESP32-S3 dengan TFT 3.5", INMP441 (mic I2S), dan MAX98357 (audio amplifier I2S).

## Cara Pakai

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
```

### 3. Upload

```bash
# Build
pio run

# Upload
pio run --target upload

# Monitor serial
pio device monitor
```

### Atau pakai Arduino IDE

1. Install board ESP32-S3 via Board Manager
2. Install libraries: TFT_eSPI, PubSubClient, ArduinoJson, QRCode
3. Buka `src/main.cpp`, compile & upload

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

## Alur Hardware

1. ESP32 boot → TFT splash screen
2. Connect WiFi + MQTT
3. TFT: "Gunakan Web Dashboard? Iya/Tidak"
4. **Iya** → Tampilkan QR + IP → user buka web
5. **Tidak** → Mode mandiri (mic → speaker)
6. Smart-Review: INMP record → MQTT ke server → AI evaluasi → feedback via speaker
