"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechRecognition = void 0;
const logger_1 = require("../utils/logger");
class SpeechRecognition {
    constructor(config, eventEmitter) {
        this.recognition = null;
        this.isRecognizing = false;
        this.restartTimeout = null;
        this.errorCount = 0;
        this.maxErrors = 5;
        this.logger = new logger_1.Logger('SpeechRecognition');
        this.config = config;
        this.eventEmitter = eventEmitter;
    }
    async initialize() {
        if (!this.isSpeechRecognitionSupported()) {
            throw new Error('Speech recognition is not supported in this environment');
        }
        try {
            // @ts-ignore - Browser API
            const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognitionConstructor();
            this.setupRecognitionConfig();
            this.setupEventHandlers();
            this.logger.info('Speech recognition initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize speech recognition:', error);
            throw error;
        }
    }
    isSpeechRecognitionSupported() {
        // @ts-ignore - Browser API check
        return typeof window !== 'undefined' &&
            ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    }
    setupRecognitionConfig() {
        if (!this.recognition)
            return;
        this.recognition.continuous = this.config.get('speechRecognition.continuous', true);
        this.recognition.interimResults = this.config.get('speechRecognition.interimResults', false);
        this.recognition.lang = this.config.get('speechRecognition.language', 'en-US');
        this.recognition.maxAlternatives = this.config.get('speechRecognition.maxAlternatives', 1);
    }
    setupEventHandlers() {
        if (!this.recognition)
            return;
        this.recognition.onstart = () => {
            this.isRecognizing = true;
            this.errorCount = 0;
            this.logger.info('Speech recognition started');
        };
        this.recognition.onend = () => {
            this.isRecognizing = false;
            this.logger.info('Speech recognition ended');
            // Auto-restart if configured and no errors
            if (this.config.get('speechRecognition.autoRestart', true) && this.errorCount < this.maxErrors) {
                this.scheduleRestart();
            }
        };
        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };
        this.recognition.onerror = (event) => {
            this.handleRecognitionError(event);
        };
    }
    handleRecognitionResult(event) {
        const result = event.results[event.resultIndex];
        const alternative = result[0];
        if (result.isFinal) {
            const command = alternative.transcript.trim();
            const confidence = alternative.confidence;
            this.logger.info(`Recognized: "${command}" (confidence: ${confidence})`);
            this.eventEmitter.emit('speechRecognized', { command, confidence });
        }
    }
    handleRecognitionError(event) {
        this.errorCount++;
        this.logger.error(`Speech recognition error: ${event.error} - ${event.message}`);
        switch (event.error) {
            case 'no-speech':
                if (this.errorCount < this.maxErrors) {
                    this.scheduleRestart(1000);
                }
                break;
            case 'audio-capture':
                this.eventEmitter.emit('error', new Error('Microphone not accessible'));
                break;
            case 'not-allowed':
                this.eventEmitter.emit('error', new Error('Microphone permission denied'));
                break;
            case 'network':
                this.scheduleRestart(5000);
                break;
            default:
                if (this.errorCount >= this.maxErrors) {
                    this.eventEmitter.emit('error', new Error('Too many speech recognition errors'));
                }
        }
    }
    scheduleRestart(delay = 1000) {
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
        }
        this.restartTimeout = setTimeout(() => {
            if (!this.isRecognizing && this.recognition) {
                this.startRecognition();
            }
        }, delay);
    }
    startRecognition() {
        if (!this.recognition) {
            this.logger.error('Speech recognition not initialized');
            return;
        }
        if (this.isRecognizing) {
            this.logger.warn('Speech recognition is already running');
            return;
        }
        try {
            this.recognition.start();
        }
        catch (error) {
            this.logger.error('Failed to start speech recognition:', error);
            this.eventEmitter.emit('error', error);
        }
    }
    stopRecognition() {
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
        if (this.recognition && this.isRecognizing) {
            this.recognition.stop();
        }
    }
    setLanguage(language) {
        if (this.recognition) {
            this.recognition.lang = language;
            this.config.set('speechRecognition.language', language);
            this.logger.info(`Speech recognition language set to: ${language}`);
        }
    }
}
exports.SpeechRecognition = SpeechRecognition;
//# sourceMappingURL=speechRecognition.js.map