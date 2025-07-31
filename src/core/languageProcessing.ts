import { Logger } from '../utils/logger';
import { LogLevel } from '../utils/logger';
import { ConfigManager } from '../config/configManager';

interface Intent {
    name: string;
    confidence: number;
    entities: Entity[];
}

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

export class LanguageProcessing {
    private logger: Logger;
    private config: ConfigManager;
    private intentPatterns!: Record<string, RegExp[]>;
    private entityPatterns!: Record<string, RegExp>;

    constructor(config: ConfigManager) {
        this.config = config;
        const logLevelString = this.config.get('logLevel', 'INFO');
        const logLevel = LogLevel[logLevelString as keyof typeof LogLevel] || LogLevel.INFO;
        this.logger = new Logger('LanguageProcessing', logLevel);
        this.initializePatterns();
    }

    private initializePatterns(): void {
        this.intentPatterns = {
            device_control: [
                /turn\s+(on|off)\s+(?:the\s+)?(.+)/i,
                /switch\s+(on|off)\s+(?:the\s+)?(.+)/i,
                /(dim|brighten)\s+(?:the\s+)?(.+)/i,
                /set\s+(?:the\s+)?(.+)\s+to\s+(.+)/i,
                /(start|stop)\s+(?:the\s+)?(.+)/i,
                /(increase|decrease)\s+(?:the\s+)?(.+)/i
            ],
            information_request: [
                /what(?:'s|\s+is)\s+(?:the\s+)?(.+)/i,
                /how\s+(.+)/i,
                /when\s+(.+)/i,
                /where\s+(.+)/i,
                /tell\s+me\s+about\s+(.+)/i,
                /what\s+time\s+is\s+it/i,
                /what(?:'s|\s+is)\s+the\s+weather/i
            ],
            system_control: [
                /stop|pause|halt/i,
                /resume|continue/i,
                /restart|reboot/i,
                /help|assist/i,
                /volume\s+(up|down)/i,
                /repeat\s+that/i
            ],
            greeting: [
                /hello|hi|hey|good\s+(morning|afternoon|evening)/i
            ],
            goodbye: [
                /goodbye|bye|see\s+you|farewell/i
            ]
        };

        this.entityPatterns = {
            device: /\b(light|lamp|thermostat|tv|television|music|speaker|fan|heater|air\s*conditioner|coffee\s*maker|vacuum|camera|lock|alarm)\b/gi,
            room: /\b(living\s*room|bedroom|kitchen|bathroom|dining\s*room|office|garage|basement|attic|hallway|study)\b/gi,
            number: /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/gi,
            color: /\b(red|blue|green|yellow|orange|purple|pink|white|black|gray|grey|brown)\b/gi,
            action: /\b(on|off|up|down|increase|decrease|dim|brighten|start|stop|play|pause|resume)\b/gi,
            temperature: /\b(\d+)\s*(?:degrees?|°)\s*(?:fahrenheit|celsius|f|c)?\b/gi
        };
    }

    public async processCommand(command: string): Promise<ProcessingResult> {
        const normalizedCommand = command.toLowerCase().trim();
        this.logger.info(`Processing command: "${command}"`);

        try {
            // Extract intent
            const intent = this.extractIntent(normalizedCommand);
            
            // Extract entities
            const entities = this.extractEntities(command);
            
            // Determine action based on intent and entities
            const action = this.determineAction(intent, entities, normalizedCommand);
            
            const result: ProcessingResult = {
                intent: intent.name,
                action,
                entities,
                confidence: intent.confidence,
                originalText: command
            };

            this.logger.info(`Processing result:`, result);
            return result;

        } catch (error) {
            this.logger.error('Error processing command:', error);
            throw error;
        }
    }

    private extractIntent(command: string): Intent {
        let bestMatch: Intent = {
            name: 'unknown',
            confidence: 0,
            entities: []
        };

        for (const [intentName, patterns] of Object.entries(this.intentPatterns)) {
            for (const pattern of patterns) {
                const match = command.match(pattern);
                if (match) {
                    const confidence = this.calculatePatternConfidence(match, command);
                    if (confidence > bestMatch.confidence) {
                        bestMatch = {
                            name: intentName,
                            confidence,
                            entities: []
                        };
                    }
                }
            }
        }

        return bestMatch;
    }

    private calculatePatternConfidence(match: RegExpMatchArray, command: string): number {
        // Base confidence on how much of the command was matched
        const matchedLength = match[0].length;
        const commandLength = command.length;
        const coverage = matchedLength / commandLength;
        
        // Boost confidence for exact matches and common patterns
        let confidence = coverage * 0.8;
        
        // Add bonus for complete word matches
        if (match.index === 0 || /\s/.test(command[match.index! - 1])) {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }

    private extractEntities(text: string): Entity[] {
        const entities: Entity[] = [];

        for (const [entityType, pattern] of Object.entries(this.entityPatterns)) {
            let match;
            const regex = new RegExp(pattern.source, pattern.flags);
            
            while ((match = regex.exec(text)) !== null) {
                entities.push({
                    type: entityType,
                    value: this.normalizeEntityValue(match[0], entityType),
                    start: match.index,
                    end: match.index + match[0].length,
                    confidence: 0.9
                });
            }
        }

        return entities;
    }

    private normalizeEntityValue(value: string, entityType: string): string {
        const normalized = value.toLowerCase().trim();
        
        switch (entityType) {
            case 'number':
                return this.wordToNumber(normalized).toString();
            case 'device':
                return normalized.replace(/\s+/g, '_');
            case 'room':
                return normalized.replace(/\s+/g, '_');
            default:
                return normalized;
        }
    }

    private wordToNumber(word: string): number {
        const numberMap: Record<string, number> = {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
            'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
            'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
            'eighty': 80, 'ninety': 90, 'hundred': 100
        };

        return numberMap[word] || parseInt(word) || 0;
    }

    private determineAction(intent: Intent, entities: Entity[], command: string): string {
        switch (intent.name) {
            case 'device_control':
                return this.determineDeviceAction(entities, command);
            case 'information_request':
                return 'get_information';
            case 'system_control':
                return this.determineSystemAction(command);
            case 'greeting':
                return 'greet';
            case 'goodbye':
                return 'farewell';
            default:
                return 'unknown';
        }
    }

    private determineDeviceAction(entities: Entity[], command: string): string {
        const actionEntity = entities.find(e => e.type === 'action');
        
        if (actionEntity) {
            switch (actionEntity.value) {
                case 'on':
                    return 'turn_on';
                case 'off':
                    return 'turn_off';
                case 'up':
                case 'increase':
                    return 'increase';
                case 'down':
                case 'decrease':
                    return 'decrease';
                case 'dim':
                    return 'dim';
                case 'brighten':
                    return 'brighten';
                case 'start':
                case 'play':
                    return 'start';
                case 'stop':
                case 'pause':
                    return 'stop';
                default:
                    return actionEntity.value;
            }
        }

        // Fallback to pattern matching
        if (/turn\s+on|switch\s+on/i.test(command)) return 'turn_on';
        if (/turn\s+off|switch\s+off/i.test(command)) return 'turn_off';
        if (/dim/i.test(command)) return 'dim';
        if (/brighten/i.test(command)) return 'brighten';
        if (/start|play/i.test(command)) return 'start';
        if (/stop|pause/i.test(command)) return 'stop';
        if (/set.*to/i.test(command)) return 'set_value';

        return 'control';
    }

    private determineSystemAction(command: string): string {
        if (/stop|pause|halt/i.test(command)) return 'stop';
        if (/resume|continue/i.test(command)) return 'resume';
        if (/restart|reboot/i.test(command)) return 'restart';
        if (/help|assist/i.test(command)) return 'help';
        if (/volume\s+up/i.test(command)) return 'volume_up';
        if (/volume\s+down/i.test(command)) return 'volume_down';
        if (/repeat/i.test(command)) return 'repeat';
        
        return 'system_control';
    }

    public translate(text: string, targetLanguage: string): string {
        // This is a placeholder for translation functionality
        // In a real implementation, you would integrate with a translation service
        this.logger.info(`Translation requested: "${text}" to ${targetLanguage}`);
        return `[Translated to ${targetLanguage}]: ${text}`;
    }

    public getSupportedLanguages(): string[] {
        return [
            'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'fr-CA',
            'de-DE', 'it-IT', 'pt-BR', 'pt-PT', 'ja-JP', 'ko-KR',
            'zh-CN', 'zh-TW', 'ru-RU', 'ar-SA', 'hi-IN'
        ];
    }

    public addCustomPattern(intent: string, pattern: RegExp): void {
        if (!this.intentPatterns[intent]) {
            this.intentPatterns[intent] = [];
        }
        this.intentPatterns[intent].push(pattern);
        this.logger.info(`Added custom pattern for intent: ${intent}`);
    }

    public addCustomEntity(entityType: string, pattern: RegExp): void {
        this.entityPatterns[entityType] = pattern;
        this.logger.info(`Added custom entity pattern: ${entityType}`);
    }
}