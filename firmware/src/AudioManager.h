#ifndef AUDIO_MANAGER_H
#define AUDIO_MANAGER_H

#include <Arduino.h>
#include <driver/i2s.h>
#include "Config.h"

class AudioManager {
public:
    void begin();
    bool startRecording();
    bool stopRecording();
    int readAudioData(uint8_t* buffer, size_t maxSize);
    bool playAudio(const uint8_t* data, size_t length);
    bool isRecording() { return recording; }
    size_t getRecordedSize() { return recordedSize; }
    const uint8_t* getRecordedData() { return recordBuffer; }
    void clearBuffer();

private:
    bool recording = false;
    size_t recordedSize = 0;
    uint8_t* recordBuffer = nullptr;
    static const size_t BUFFER_SIZE = 96000;

    void initMicI2S();
    void initSpeakerI2S();
};

#endif
