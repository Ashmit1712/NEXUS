import { Logger } from '../utils/logger';
import { ConfigManager } from '../config/configManager';

interface SpeechRequest {
    text: string;
    language?: string;
    priority?: number;
}

export class SpeechSynthesis {
    private logger: Logger;
    private config: ConfigManager;
    private speechQueue: SpeechRequest[] = [];
    private isPlaying: boolean = false;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private voices: SpeechSynthesisVoice[] = [];

    constructor(config: ConfigManager) {
        this.logger = new Logger('SpeechSynthesis');
        this.config = config;
        this.initializeVoices();
    }

    private initializeVoices(): void {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // Load voices when they become available
            const loadVoices = () => {
                this.voices = speechSynthesis.getVoices();
                this.logger.info(`Loaded ${this.voices.length} voices`);
            };

            loadVoices();
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    public speak(text: string, language?: string, priority: number = 1): void {
        if (!text.trim()) {
            this.logger.warn('Empty text provided for speech synthesis');
            return;
        }

        const request: SpeechRequest = {
            text: text.trim(),
            language: language || this.config.get('speechSynthesis.defaultLanguage', 'en-US'),
            priority
        };

        // Insert based on priority (higher priority first)
        const insertIndex = this.speechQueue.findIndex(item => (item.priority || 1) < priority);
        if (insertIndex === -1) {
            this.speechQueue.push(request);
        } else {
            this.speechQueue.splice(insertIndex, 0, request);
        }

        this.processQueue();
    }

    private async processQueue(): Promise<void> {
        if (this.isPlaying || this.speechQueue.length === 0) {
            return;
        }

        const request = this.speechQueue.shift();
        if (!request) return;

        this.isPlaying = true;

        try {
            await this.speakText(request.text, request.language);
        } catch (error) {
            this.logger.error('Error during speech synthesis:', error);
        } finally {
            this.isPlaying = false;
            // Process next item in queue
            if (this.speechQueue.length > 0) {
                setTimeout(() => this.processQueue(), 100);
            }
        }
    }

    private speakText(text: string, language?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
                this.logger.warn('Speech synthesis not available, logging text:', text);
                resolve();
                return;
            }

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance
            this.currentUtterance.lang = language || 'en-US';
            this.currentUtterance.rate = this.config.get('speechSynthesis.rate', 1.0);
            this.currentUtterance.pitch = this.config.get('speechSynthesis.pitch', 1.0);
            this.currentUtterance.volume = this.config.get('speechSynthesis.volume', 1.0);

            // Select best voice for language
            const voice = this.getBestVoiceForLanguage(this.currentUtterance.lang);
            if (voice) {
                this.currentUtterance.voice = voice;
            }

            // Set up event handlers
            this.currentUtterance.onend = () => {
                this.logger.info(`Finished speaking: "${text}"`);
                resolve();
            };

            this.currentUtterance.onerror = (event) => {
                this.logger.error('Speech synthesis error:', event.error);
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };

            this.currentUtterance.onstart = () => {
                this.logger.info(`Started speaking: "${text}"`);
            };

            // Speak the text
            speechSynthesis.speak(this.currentUtterance);
        });
    }

    private getBestVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
        if (this.voices.length === 0) return null;

        // First, try to find an exact match
        let voice = this.voices.find(v => v.lang === language);
        
        // If no exact match, try language code only (e.g., 'en' from 'en-US')
        if (!voice) {
            const langCode = language.split('-')[0];
            voice = this.voices.find(v => v.lang.startsWith(langCode));
        }

        // Prefer local voices over remote ones
        if (voice) {
            const localVoice = this.voices.find(v => 
                v.lang === voice!.lang && v.localService
            );
            return localVoice || voice;
        }

        return null;
    }

    public stopSpeaking(): void {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        
        this.speechQueue = [];
        this.isPlaying = false;
        this.currentUtterance = null;
        
        this.logger.info('Speech synthesis stopped and queue cleared');
    }

    public pauseSpeaking(): void {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthesis.pause();
            this.logger.info('Speech synthesis paused');
        }
    }

    public resumeSpeaking(): void {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthesis.resume();
            this.logger.info('Speech synthesis resumed');
        }
    }

    public getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    public setVoiceSettings(settings: {
        rate?: number;
        pitch?: number;
        volume?: number;
    }): void {
        if (settings.rate !== undefined) {
            this.config.set('speechSynthesis.rate', Math.max(0.1, Math.min(10, settings.rate)));
        }
        if (settings.pitch !== undefined) {
            this.config.set('speechSynthesis.pitch', Math.max(0, Math.min(2, settings.pitch)));
        }
        if (settings.volume !== undefined) {
            this.config.set('speechSynthesis.volume', Math.max(0, Math.min(1, settings.volume)));
        }
        
        this.logger.info('Voice settings updated:', settings);
    }

    public getQueueLength(): number {
        return this.speechQueue.length;
    }

    public isCurrentlySpeaking(): boolean {
        return this.isPlaying;
    }
}