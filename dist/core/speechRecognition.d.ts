import { EventEmitter } from '../utils/eventEmitter';
import { ConfigManager } from '../config/configManager';
export declare class SpeechRecognition {
    private recognition;
    private logger;
    private config;
    private eventEmitter;
    isRecognizing: boolean;
    private restartTimeout;
    private errorCount;
    private maxErrors;
    constructor(config: ConfigManager, eventEmitter: EventEmitter);
    initialize(): Promise<void>;
    private isSpeechRecognitionSupported;
    private setupRecognitionConfig;
    private setupEventHandlers;
    private handleRecognitionResult;
    private handleRecognitionError;
    private scheduleRestart;
    startRecognition(): void;
    stopRecognition(): void;
    setLanguage(language: string): void;
}
//# sourceMappingURL=speechRecognition.d.ts.map