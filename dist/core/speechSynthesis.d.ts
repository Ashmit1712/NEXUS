import { ConfigManager } from '../config/configManager';
export declare class SpeechSynthesis {
    private logger;
    private config;
    private speechQueue;
    private isPlaying;
    private currentUtterance;
    private voices;
    constructor(config: ConfigManager);
    private initializeVoices;
    speak(text: string, language?: string, priority?: number): void;
    private processQueue;
    private speakText;
    private getBestVoiceForLanguage;
    stopSpeaking(): void;
    pauseSpeaking(): void;
    resumeSpeaking(): void;
    getAvailableVoices(): SpeechSynthesisVoice[];
    setVoiceSettings(settings: {
        rate?: number;
        pitch?: number;
        volume?: number;
    }): void;
    getQueueLength(): number;
    isCurrentlySpeaking(): boolean;
}
//# sourceMappingURL=speechSynthesis.d.ts.map