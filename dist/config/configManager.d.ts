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
export declare class ConfigManager {
    private config;
    private defaultConfig;
    constructor(initialConfig?: Partial<ConfigSchema>);
    private loadFromEnvironment;
    get<T = any>(path: string, defaultValue?: T): T;
    set(path: string, value: any): void;
    getAll(): Partial<ConfigSchema>;
    reset(): void;
    update(newConfig: Partial<ConfigSchema>): void;
    private deepMerge;
    validate(): boolean;
    export(): string;
    import(configJson: string): void;
}
export {};
//# sourceMappingURL=configManager.d.ts.map