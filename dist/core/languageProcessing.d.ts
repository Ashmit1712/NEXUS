import { ConfigManager } from '../config/configManager';
interface Entity {
    type: string;
    value: string;
    start: number;
    end: number;
    confidence: number;
}
interface ProcessingResult {
    intent: string;
    action: string;
    entities: Entity[];
    confidence: number;
    originalText: string;
}
export declare class LanguageProcessing {
    private logger;
    private config;
    private intentPatterns;
    private entityPatterns;
    constructor(config: ConfigManager);
    private initializePatterns;
    processCommand(command: string): Promise<ProcessingResult>;
    private extractIntent;
    private calculatePatternConfidence;
    private extractEntities;
    private normalizeEntityValue;
    private wordToNumber;
    private determineAction;
    private determineDeviceAction;
    private determineSystemAction;
    translate(text: string, targetLanguage: string): string;
    getSupportedLanguages(): string[];
    addCustomPattern(intent: string, pattern: RegExp): void;
    addCustomEntity(entityType: string, pattern: RegExp): void;
}
export {};
//# sourceMappingURL=languageProcessing.d.ts.map