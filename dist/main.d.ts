export declare class SmartVoiceAssistant {
    private speechRecognition;
    private speechSynthesis;
    private languageProcessing;
    private deviceManager;
    private eventEmitter;
    private logger;
    private config;
    private isActive;
    constructor();
    private initializeComponents;
    private setupEventListeners;
    start(): Promise<void>;
    stop(): void;
    private handleVoiceCommand;
    private executeDeviceCommand;
    private handleInformationRequest;
    private handleSystemControl;
    private handleDeviceResponse;
    private handleError;
    getStatus(): {
        isActive: boolean;
        components: Record<string, boolean>;
    };
}
//# sourceMappingURL=main.d.ts.map