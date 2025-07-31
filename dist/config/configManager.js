"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
class ConfigManager {
    constructor(initialConfig) {
        this.config = {};
        this.defaultConfig = {
            speechRecognition: {
                continuous: true,
                interimResults: false,
                language: 'en-US',
                maxAlternatives: 1,
                autoRestart: true
            },
            speechSynthesis: {
                defaultLanguage: 'en-US',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0
            },
            deviceManager: {
                discoveryInterval: 30000,
                connectionTimeout: 5000,
                retryAttempts: 3
            },
            minConfidence: 0.7,
            logLevel: 'INFO'
        };
        this.config = { ...this.defaultConfig, ...initialConfig };
        this.loadFromEnvironment();
    }
    loadFromEnvironment() {
        // Load configuration from environment variables if available
        if (typeof process !== 'undefined' && process.env) {
            const env = process.env;
            if (env.SPEECH_LANGUAGE) {
                this.set('speechRecognition.language', env.SPEECH_LANGUAGE);
                this.set('speechSynthesis.defaultLanguage', env.SPEECH_LANGUAGE);
            }
            if (env.MIN_CONFIDENCE) {
                this.set('minConfidence', parseFloat(env.MIN_CONFIDENCE));
            }
            if (env.LOG_LEVEL) {
                this.set('logLevel', env.LOG_LEVEL);
            }
            if (env.SPEECH_RATE) {
                this.set('speechSynthesis.rate', parseFloat(env.SPEECH_RATE));
            }
            if (env.SPEECH_PITCH) {
                this.set('speechSynthesis.pitch', parseFloat(env.SPEECH_PITCH));
            }
            if (env.SPEECH_VOLUME) {
                this.set('speechSynthesis.volume', parseFloat(env.SPEECH_VOLUME));
            }
        }
    }
    get(path, defaultValue) {
        const keys = path.split('.');
        let current = this.config;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return defaultValue;
            }
        }
        return current;
    }
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
    }
    getAll() {
        return { ...this.config };
    }
    reset() {
        this.config = { ...this.defaultConfig };
    }
    update(newConfig) {
        this.config = this.deepMerge(this.config, newConfig);
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    validate() {
        try {
            // Validate speech recognition settings
            const speechLang = this.get('speechRecognition.language');
            if (typeof speechLang !== 'string' || speechLang.length === 0) {
                throw new Error('Invalid speech recognition language');
            }
            // Validate speech synthesis settings
            const rate = this.get('speechSynthesis.rate');
            if (typeof rate !== 'number' || rate < 0.1 || rate > 10) {
                throw new Error('Speech synthesis rate must be between 0.1 and 10');
            }
            const pitch = this.get('speechSynthesis.pitch');
            if (typeof pitch !== 'number' || pitch < 0 || pitch > 2) {
                throw new Error('Speech synthesis pitch must be between 0 and 2');
            }
            const volume = this.get('speechSynthesis.volume');
            if (typeof volume !== 'number' || volume < 0 || volume > 1) {
                throw new Error('Speech synthesis volume must be between 0 and 1');
            }
            // Validate confidence threshold
            const minConfidence = this.get('minConfidence');
            if (typeof minConfidence !== 'number' || minConfidence < 0 || minConfidence > 1) {
                throw new Error('Minimum confidence must be between 0 and 1');
            }
            return true;
        }
        catch (error) {
            console.error('Configuration validation failed:', error);
            return false;
        }
    }
    export() {
        return JSON.stringify(this.config, null, 2);
    }
    import(configJson) {
        try {
            const importedConfig = JSON.parse(configJson);
            this.update(importedConfig);
        }
        catch (error) {
            throw new Error('Invalid configuration JSON');
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=configManager.js.map