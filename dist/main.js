"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartVoiceAssistant = void 0;
const speechRecognition_1 = require("./core/speechRecognition");
const speechSynthesis_1 = require("./core/speechSynthesis");
const languageProcessing_1 = require("./core/languageProcessing");
const deviceManager_1 = require("./deviceControl/deviceManager");
const performanceEnhancer_1 = require("./features/performanceEnhancer");
const responsivenessBooster_1 = require("./features/responsivenessBooster");
const eventEmitter_1 = require("./utils/eventEmitter");
const logger_1 = require("./utils/logger");
const configManager_1 = require("./config/configManager");
class SmartVoiceAssistant {
    constructor() {
        this.isActive = false;
        this.logger = new logger_1.Logger('SmartVoiceAssistant');
        this.config = new configManager_1.ConfigManager();
        this.eventEmitter = new eventEmitter_1.EventEmitter();
        this.initializeComponents();
        this.setupEventListeners();
        // Apply performance enhancements
        (0, performanceEnhancer_1.enhancePerformance)();
        (0, responsivenessBooster_1.boostResponsiveness)();
        this.logger.info('Smart Voice Assistant initialized successfully');
    }
    initializeComponents() {
        try {
            this.speechRecognition = new speechRecognition_1.SpeechRecognition(this.config, this.eventEmitter);
            this.speechSynthesis = new speechSynthesis_1.SpeechSynthesis(this.config);
            this.languageProcessing = new languageProcessing_1.LanguageProcessing(this.config);
            this.deviceManager = new deviceManager_1.DeviceManager(this.config, this.eventEmitter);
        }
        catch (error) {
            this.logger.error('Failed to initialize components:', error);
            throw error;
        }
    }
    setupEventListeners() {
        this.eventEmitter.on('speechRecognized', this.handleVoiceCommand.bind(this));
        this.eventEmitter.on('deviceControlled', this.handleDeviceResponse.bind(this));
        this.eventEmitter.on('error', this.handleError.bind(this));
    }
    async start() {
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
        }
        catch (error) {
            this.logger.error('Failed to start voice assistant:', error);
            throw error;
        }
    }
    stop() {
        if (!this.isActive) {
            this.logger.warn('Assistant is not active');
            return;
        }
        this.speechRecognition.stopRecognition();
        this.speechSynthesis.stopSpeaking();
        this.isActive = false;
        this.logger.info('Voice assistant stopped');
    }
    async handleVoiceCommand(data) {
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
            }
            else if (result.intent === 'information_request') {
                await this.handleInformationRequest(result);
            }
            else if (result.intent === 'system_control') {
                await this.handleSystemControl(result);
            }
            else {
                this.speechSynthesis.speak('I understand your request, but I\'m not sure how to help with that yet.');
            }
        }
        catch (error) {
            this.logger.error('Error processing voice command:', error);
            this.speechSynthesis.speak('I encountered an error while processing your request. Please try again.');
        }
    }
    async executeDeviceCommand(result) {
        const { entities, action } = result;
        const deviceId = entities.find((e) => e.type === 'device')?.value;
        const room = entities.find((e) => e.type === 'room')?.value;
        if (!deviceId) {
            this.speechSynthesis.speak('I need to know which device you want to control.');
            return;
        }
        const fullDeviceId = room ? `${room}-${deviceId}` : deviceId;
        const success = await this.deviceManager.controlDevice(fullDeviceId, action);
        if (success) {
            this.speechSynthesis.speak(`Successfully ${action.replace('_', ' ')} the ${deviceId}${room ? ` in the ${room}` : ''}.`);
        }
        else {
            this.speechSynthesis.speak(`I couldn't ${action.replace('_', ' ')} the ${deviceId}. Please check if the device is available.`);
        }
    }
    async handleInformationRequest(_result) {
        // Handle information requests like weather, time, etc.
        this.speechSynthesis.speak('I\'m working on getting that information for you.');
    }
    async handleSystemControl(result) {
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
    handleDeviceResponse(data) {
        this.logger.info(`Device response: ${data.deviceId} - ${data.message}`);
    }
    handleError(error) {
        this.logger.error('Assistant error:', error);
        this.speechSynthesis.speak('I encountered an error. Please try again.');
    }
    getStatus() {
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
exports.SmartVoiceAssistant = SmartVoiceAssistant;
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
//# sourceMappingURL=main.js.map