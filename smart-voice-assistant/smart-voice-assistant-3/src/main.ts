import { SpeechRecognition } from './core/speechRecognition';
import { SpeechSynthesis } from './core/speechSynthesis';
import { LanguageProcessing } from './core/languageProcessing';
import { DeviceController } from './deviceControl/controller';
import { enhancePerformance } from './features/performanceEnhancer';
import { boostResponsiveness } from './features/responsivenessBooster';

class SmartVoiceAssistant {
    private speechRecognition: SpeechRecognition;
    private speechSynthesis: SpeechSynthesis;
    private languageProcessing: LanguageProcessing;
    private deviceController: DeviceController;

    constructor() {
        this.speechRecognition = new SpeechRecognition();
        this.speechSynthesis = new SpeechSynthesis();
        this.languageProcessing = new LanguageProcessing();
        this.deviceController = new DeviceController();
        
        enhancePerformance();
        boostResponsiveness();
    }

    public start() {
        this.speechRecognition.startRecognition(this.handleVoiceInput.bind(this));
    }

    private handleVoiceInput(command: string) {
        const processedCommand = this.languageProcessing.processCommand(command);
        this.deviceController.controlDevice(processedCommand);
        this.speechSynthesis.speak(`Executing command: ${processedCommand}`);
    }

    public stop() {
        this.speechRecognition.stopRecognition();
        this.speechSynthesis.stopSpeaking();
    }
}

const assistant = new SmartVoiceAssistant();
assistant.start();