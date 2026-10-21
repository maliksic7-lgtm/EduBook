const sttService = require('./sttService');
const nluService = require('./nluService');
const intentRouter = require('./intentRouter');
const ttsService = require('./ttsService');

async function processVoiceCommand(audioBase64, studentName, userId, language = 'id') {
    try {
        const transcribedText = await sttService.transcribeAudio(audioBase64, language);

        if (!transcribedText) {
            return {
                text: language === 'id'
                    ? 'Tidak bisa mendengar suara. Silakan coba lagi.'
                    : 'Cannot hear the sound. Please try again.',
                intent: 'error',
                data: {}
            };
        }

        const userContext = {
            student_name: studentName,
            language: language
        };

        const nluResult = await nluService.understandIntent(transcribedText, userContext, language);

        if (nluResult.confidence < 0.3) {
            return {
                text: language === 'id'
                    ? 'Maaf, saya tidak mengerti. Silakan coba lagi.'
                    : 'Sorry, I don\'t understand. Please try again.',
                intent: 'unknown',
                data: { transcribed: transcribedText }
            };
        }

        const result = await intentRouter.routeIntent(
            nluResult.intent,
            nluResult.entities,
            userId,
            studentName,
            language
        );

        result.transcribed = transcribedText;
        result.confidence = nluResult.confidence;

        return result;
    } catch (error) {
        console.error('[VoiceCommand] Error:', error.message);
        return {
            text: language === 'id'
                ? 'Terjadi kesalahan. Silakan coba lagi.'
                : 'An error occurred. Please try again.',
            intent: 'error',
            data: { error: error.message }
        };
    }
}

module.exports = { processVoiceCommand };
