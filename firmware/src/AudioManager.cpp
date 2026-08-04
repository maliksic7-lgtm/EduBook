#include "AudioManager.h"

void AudioManager::begin() {
    recordBuffer = (uint8_t*)malloc(BUFFER_SIZE);
    if (recordBuffer) {
        memset(recordBuffer, 0, BUFFER_SIZE);
    }
    initMicI2S();
}

void AudioManager::initMicI2S() {
    i2s_config_t i2s_mic_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = (i2s_bits_per_sample_t)BITS_PER_SAMPLE,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 4,
        .dma_buf_len = 1024
    };

    i2s_pin_config_t mic_pins = {
        .bck_io_num = I2S_MIC_SCK,
        .ws_io_num = I2S_MIC_WS,
        .data_out_num = I2S_PIN_NO_CHANGE,
        .data_in_num = I2S_MIC_SD
    };

    i2s_driver_install(I2S_NUM_0, &i2s_mic_config, 0, NULL);
    i2s_set_pin(I2S_NUM_0, &mic_pins);
}

void AudioManager::initSpeakerI2S() {
    i2s_config_t i2s_spk_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = (i2s_bits_per_sample_t)BITS_PER_SAMPLE,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 4,
        .dma_buf_len = 1024
    };

    i2s_pin_config_t spk_pins = {
        .bck_io_num = I2S_SPK_SCK,
        .ws_io_num = I2S_SPK_WS,
        .data_out_num = I2S_SPK_SD,
        .data_in_num = I2S_PIN_NO_CHANGE
    };

    i2s_driver_install(I2S_NUM_1, &i2s_spk_config, 0, NULL);
    i2s_set_pin(I2S_NUM_1, &spk_pins);
}

bool AudioManager::startRecording() {
    if (!recordBuffer) return false;
    recordedSize = 0;
    recording = true;
    return true;
}

bool AudioManager::stopRecording() {
    recording = false;
    return true;
}

int AudioManager::readAudioData(uint8_t* buffer, size_t maxSize) {
    size_t bytesRead = 0;
    esp_err_t err = i2s_read(I2S_NUM_0, buffer, maxSize, &bytesRead, portMAX_DELAY);
    if (err == ESP_OK && bytesRead > 0) {
        if (recordBuffer && recordedSize + bytesRead <= BUFFER_SIZE) {
            memcpy(recordBuffer + recordedSize, buffer, bytesRead);
            recordedSize += bytesRead;
        }
        return bytesRead;
    }
    return 0;
}

bool AudioManager::playAudio(const uint8_t* data, size_t length) {
    size_t bytesWritten = 0;
    esp_err_t err = i2s_write(I2S_NUM_1, data, length, &bytesWritten, portMAX_DELAY);
    return (err == ESP_OK);
}

void AudioManager::clearBuffer() {
    if (recordBuffer) {
        memset(recordBuffer, 0, BUFFER_SIZE);
    }
    recordedSize = 0;
}
