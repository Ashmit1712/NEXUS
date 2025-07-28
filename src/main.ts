import { SpeechRecognition } from './core/speechRecognition';
import { SpeechSynthesis } from './core/speechSynthesis';
import { LanguageProcessing } from './core/languageProcessing';
import { DeviceManager } from './deviceControl/deviceManager';
import { enhancePerformance } from './features/performanceEnhancer';
import { boostResponsiveness } from './features/responsivenessBooster';
import { EventEmitter } from './utils/eventEmitter';
import { Logger } from './utils/logger';
import { ConfigManager } from './config/configManager';

export class SmartVoiceAssistant {
    private speechRecognition: SpeechRecognition;
    private speechSynthesis: SpeechSynthesis;
    private languageProcessing: LanguageProcessing;
    private deviceManager: DeviceManager;
    private eventEmitter: EventEmitter;
    private logger: Logger;
    private config: ConfigManager;
    private isActive: boolean = false;

    constructor() {
        this.logger = new Logger('SmartVoiceAssistant');
        this.config = new ConfigManager();
        this.eventEmitter = new EventEmitter();
        
        this.initializeComponents();
        this.setupEventListeners();
        
        // Apply performance enhancements
        enhancePerformance();
        boostResponsiveness();
        
        this.logger.info('Smart Voice Assistant initialized successfully');
    }

    private initializeComponents(): void {
        try {
            this.speechRecognition = new SpeechRecognition(this.config, this.eventEmitter);
            this.speechSynthesis = new SpeechSynthesis(this.config);
            this.languageProcessing = new LanguageProcessing(this.config);
            this.deviceManager = new DeviceManager(this.config, this.eventEmitter);
        } catch (error) {
            this.logger.error('Failed to initialize components:', error);
            throw error;
        }
    }

    private setupEventListeners(): void {
        this.eventEmitter.on('speechRecognized', this.handleVoiceCommand.bind(this));
        this.eventEmitter.on('deviceControlled', this.handleDeviceResponse.bind(this));
        this.eventEmitter.on('error', this.handleError.bind(this));
    }

    public async start(): Promise<void> {
        if (this.isActive) {
            this.logger.warn('Assistant is already active');
            return;
        }

        try {
            await this.speechRecognition.initialize();
            this.speechRecognition.startRecognition();
            this.isActive = true;
            
            this.speechSynthesis.speak('Hello! I am your smart voice assistant. How can I help you today?');
            this.logger.info('Voice assistant started successfully');
        } catch (error) {
            this.logger.error('Failed to start voice assistant:', error);
            throw error;
        }
    }

    public stop(): void {
        if (!this.isActive) {
            this.logger.warn('Assistant is not active');
            return;
        }

        this.speechRecognition.stopRecognition();
        this.speechSynthesis.stopSpeaking();
        this.isActive = false;
        
        this.logger.info('Voice assistant stopped');
    }

    private async handleVoiceCommand(data: { command: string; confidence: number }): Promise<void> {
        const { command, confidence } = data;
        
        this.logger.info(`Processing voice command: "${command}" (confidence: ${confidence})`);

        if (confidence < this.config.get('minConfidence', 0.7)) {
            this.speechSynthesis.speak('I\'m sorry, I didn\'t understand that clearly. Could you please repeat?');
            return;
        }

        try {
            const result = await this.languageProcessing.processCommand(command);
            
            if (result.intent === 'device_control') {
                await this.executeDeviceCommand(result);
            } else if (result.intent === 'information_request') {
                await this.handleInformationRequest(result);
            } else if (result.intent === 'system_control') {
                await this.handleSystemControl(result);
            } else {
                this.speechSynthesis.speak('I understand your request, but I\'m not sure how to help with that yet.');
            }
        } catch (error) {
            this.logger.error('Error processing voice command:', error);
            this.speechSynthesis.speak('I encountered an error while processing your request. Please try again.');
        }
    }

    private async executeDeviceCommand(result: any): Promise<void> {
        const { entities, action } = result;
        const deviceId = entities.find((e: any) => e.type === 'device')?.value;
        const room = entities.find((e: any) => e.type === 'room')?.value;
        
        if (!deviceId) {
            this.speechSynthesis.speak('I need to know which device you want to control.');
            return;
        }

        const fullDeviceId = room ? `${room}-${deviceId}` : deviceId;
        const success = await this.deviceManager.controlDevice(fullDeviceId, action);
        
        if (success) {
            this.speechSynthesis.speak(`Successfully ${action.replace('_', ' ')} the ${deviceId}${room ? ` in the ${room}` : ''}.`);
        } else {
            this.speechSynthesis.speak(`I couldn't ${action.replace('_', ' ')} the ${deviceId}. Please check if the device is available.`);
        }
    }

    private async handleInformationRequest(result: any): Promise<void> {
        // Handle information requests like weather, time, etc.
        this.speechSynthesis.speak('I\'m working on getting that information for you.');
    }

    private async handleSystemControl(result: any): Promise<void> {
        const { action } = result;
        
        switch (action) {
            case 'stop':
            case 'pause':
                this.stop();
                this.speechSynthesis.speak('Voice assistant stopped.');
                break;
            case 'restart':
                this.stop();
                await this.start();
                break;
            default:
                this.speechSynthesis.speak('System command not recognized.');
        }
    }

    private handleDeviceResponse(data: { deviceId: string; success: boolean; message: string }): void {
        this.logger.info(`Device response: ${data.deviceId} - ${data.message}`);
    }

    private handleError(error: Error): void {
        this.logger.error('Assistant error:', error);
        this.speechSynthesis.speak('I encountered an error. Please try again.');
    }

    public getStatus(): { isActive: boolean; components: Record<string, boolean> } {
        return {
            isActive: this.isActive,
            components: {
                speechRecognition: this.speechRecognition?.isRecognizing || false,
                speechSynthesis: true,
                languageProcessing: true,
                deviceManager: true
            }
        };
    }
}

// Auto-start the assistant if running directly
if (require.main === module) {
    const assistant = new SmartVoiceAssistant();
    
    process.on('SIGINT', () => {
        console.log('\nShutting down gracefully...');
        assistant.stop();
        process.exit(0);
    });
    
    assistant.start().catch(console.error);
}