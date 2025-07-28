interface ConfigSchema {
    speechRecognition: {
        continuous: boolean;
        interimResults: boolean;
        language: string;
        maxAlternatives: number;
        autoRestart: boolean;
    };
    speechSynthesis: {
        defaultLanguage: string;
        rate: number;
        pitch: number;
        volume: number;
    };
    deviceManager: {
        discoveryInterval: number;
        connectionTimeout: number;
        retryAttempts: number;
    };
    minConfidence: number;
    logLevel: string;
}

export class ConfigManager {
    private config: Partial<ConfigSchema> = {};
    private defaultConfig: ConfigSchema = {
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

    constructor(initialConfig?: Partial<ConfigSchema>) {
        this.config = { ...this.defaultConfig, ...initialConfig };
        this.loadFromEnvironment();
    }

    private loadFromEnvironment(): void {
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

    public get<T = any>(path: string, defaultValue?: T): T {
        const keys = path.split('.');
        let current: any = this.config;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue as T;
            }
        }
        
        return current as T;
    }

    public set(path: string, value: any): void {
        const keys = path.split('.');
        let current: any = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    public getAll(): Partial<ConfigSchema> {
        return { ...this.config };
    }

    public reset(): void {
        this.config = { ...this.defaultConfig };
    }

    public update(newConfig: Partial<ConfigSchema>): void {
        this.config = this.deepMerge(this.config, newConfig);
    }

    private deepMerge(target: any, source: any): any {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    public validate(): boolean {
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
        } catch (error) {
            console.error('Configuration validation failed:', error);
            return false;
        }
    }

    public export(): string {
        return JSON.stringify(this.config, null, 2);
    }

    public import(configJson: string): void {
        try {
            const importedConfig = JSON.parse(configJson);
            this.update(importedConfig);
        } catch (error) {
            throw new Error('Invalid configuration JSON');
        }
    }
}