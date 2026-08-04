#ifndef CONFIG_H
#define CONFIG_H

#define FIRMWARE_VERSION "1.0.0"

#define WIFI_SSID "EduBook_AP"
#define WIFI_PASSWORD "edubook123"

#define MQTT_BROKER_HOST "broker.hivemq.com"
#define MQTT_BROKER_PORT 1883
#define MQTT_TOPIC_PREFIX "edubook/demo"
#define MQTT_CLIENT_ID "edubook-esp32-001"

#define MQTT_TOPIC_PAGE MQTT_TOPIC_PREFIX "/page"
#define MQTT_TOPIC_NAV MQTT_TOPIC_PREFIX "/navbar"
#define MQTT_TOPIC_VOICE MQTT_TOPIC_PREFIX "/voice"
#define MQTT_TOPIC_AUDIO MQTT_TOPIC_PREFIX "/audio"
#define MQTT_TOPIC_SYNC MQTT_TOPIC_PREFIX "/sync"

#define TFT_CS 10
#define TFT_DC 11
#define TFT_RST 12
#define TFT_LEDA 45

#define I2S_MIC_SD 4
#define I2S_MIC_WS 5
#define I2S_MIC_SCK 6
#define I2S_SPK_SD 7
#define I2S_SPK_WS 8
#define I2S_SPK_SCK 9

#define BUTTON_PIN 0
#define LED_STATUS 48

#define SAMPLE_RATE 16000
#define BITS_PER_SAMPLE 16

#define TOTAL_PAGES 10

#define MAX_VOICE_DURATION_MS 30000

#endif
