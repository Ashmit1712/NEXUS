import { EventEmitter } from '../utils/eventEmitter';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../config/configManager';

interface SpeechRecognitionAPI {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onstart: (() => void) | null;
    onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
}

export class SpeechRecognition {
    private recognition: SpeechRecognitionAPI | null = null;
    private logger: Logger;
    private config: ConfigManager;
    private eventEmitter: EventEmitter;
    public isRecognizing: boolean = false;
    private restartTimeout: NodeJS.Timeout | null = null;
    private errorCount: number = 0;
    private maxErrors: number = 5;

    constructor(config: ConfigManager, eventEmitter: EventEmitter) {
        this.logger = new Logger('SpeechRecognition');
        this.config = config;
        this.eventEmitter = eventEmitter;
    }

    public async initialize(): Promise<void> {
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
        } catch (error) {
            this.logger.error('Failed to initialize speech recognition:', error);
            throw error;
        }
    }

    private isSpeechRecognitionSupported(): boolean {
        // @ts-ignore - Browser API check
        return typeof window !== 'undefined' && 
               ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    }

    private setupRecognitionConfig(): void {
        if (!this.recognition) return;

        this.recognition.continuous = this.config.get('speechRecognition.continuous', true);
        this.recognition.interimResults = this.config.get('speechRecognition.interimResults', false);
        this.recognition.lang = this.config.get('speechRecognition.language', 'en-US');
        this.recognition.maxAlternatives = this.config.get('speechRecognition.maxAlternatives', 1);
    }

    private setupEventHandlers(): void {
        if (!this.recognition) return;

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

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            this.handleRecognitionResult(event);
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            this.handleRecognitionError(event);
        };
    }

    private handleRecognitionResult(event: SpeechRecognitionEvent): void {
        const result = event.results[event.resultIndex];
        const alternative = result[0];
        
        if (result.isFinal) {
            const command = alternative.transcript.trim();
            const confidence = alternative.confidence;
            
            this.logger.info(`Recognized: "${command}" (confidence: ${confidence})`);
            
            this.eventEmitter.emit('speechRecognized', { command, confidence });
        }
    }

    private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
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

    private scheduleRestart(delay: number = 1000): void {
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
        }

        this.restartTimeout = setTimeout(() => {
            if (!this.isRecognizing && this.recognition) {
                this.startRecognition();
            }
        }, delay);
    }

    public startRecognition(): void {
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
        } catch (error) {
            this.logger.error('Failed to start speech recognition:', error);
            this.eventEmitter.emit('error', error);
        }
    }

    public stopRecognition(): void {
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }

        if (this.recognition && this.isRecognizing) {
            this.recognition.stop();
        }
    }

    public setLanguage(language: string): void {
        if (this.recognition) {
            this.recognition.lang = language;
            this.config.set('speechRecognition.language', language);
            this.logger.info(`Speech recognition language set to: ${language}`);
        }
    }
}