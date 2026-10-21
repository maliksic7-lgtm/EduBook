async function textToSpeech(text, language = 'id') {
    return {
        text: text,
        audioBase64: null,
        language: language,
        note: 'TTS handled by browser Web Speech API'
    };
}

module.exports = { textToSpeech };
