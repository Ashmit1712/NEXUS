# Smart Voice Assistant - Developer Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Step-by-Step Tutorials](#step-by-step-tutorials)
4. [Best Practices](#best-practices)
5. [Common Use Cases](#common-use-cases)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Topics](#advanced-topics)
8. [Contributing](#contributing)

---

## Getting Started

### Quick Start

Get up and running with the Smart Voice Assistant in just a few minutes:

```typescript
// 1. Import the main class
import { SmartVoiceAssistant } from './src/main';

// 2. Create and start the assistant
const assistant = new SmartVoiceAssistant();
assistant.start();

// 3. That's it! The assistant is now listening for voice commands
console.log("🎤 Voice assistant is ready!");
```

### Development Environment Setup

1. **Prerequisites Check:**
   ```bash
   node --version  # Should be >= 14.0.0
   npm --version   # Should be >= 6.0.0
   ```

2. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd smart-voice-assistant
   npm install
   ```

3. **Development Mode:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## Core Concepts

### 1. Voice Command Flow

Understanding how voice commands are processed:

```
User Speech → SpeechRecognition → LanguageProcessing → DeviceManager → Response
     ↓              ↓                    ↓                 ↓            ↓
   "Turn on     Raw Text        Intent + Entities    Device Action   Success/Fail
    lights"    Recognition      Extraction           Execution       Feedback
```

### 2. Component Lifecycle

Each component follows a predictable lifecycle:

```typescript
// Initialization
const component = new Component();

// Configuration (optional)
component.configure(options);

// Activation
component.start();

// Usage
component.performAction();

// Cleanup
component.stop();
component.destroy();
```

### 3. Event-Driven Architecture

Components communicate through events:

```typescript
// Publisher
eventBus.emit('voiceCommandReceived', { 
    command: 'turn on lights',
    timestamp: Date.now()
});

// Subscriber
eventBus.on('voiceCommandReceived', (data) => {
    console.log('Processing command:', data.command);
});
```

---

## Step-by-Step Tutorials

### Tutorial 1: Building Your First Voice Command Handler

**Goal:** Create a custom handler for weather queries.

**Step 1: Create the Handler**

```typescript
// src/handlers/weatherHandler.ts
export class WeatherHandler {
    private apiKey: string;
    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    
    async handleWeatherQuery(location: string): Promise<string> {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.apiKey}`
            );
            const data = await response.json();
            
            return `The weather in ${location} is ${data.weather[0].description} with a temperature of ${Math.round(data.main.temp - 273.15)}°C`;
        } catch (error) {
            return `Sorry, I couldn't get the weather information for ${location}`;
        }
    }
}
```

**Step 2: Integrate with Language Processing**

```typescript
// src/core/languageProcessing.ts
import { WeatherHandler } from '../handlers/weatherHandler';

export class LanguageProcessing {
    private weatherHandler: WeatherHandler;
    
    constructor() {
        this.weatherHandler = new WeatherHandler(process.env.WEATHER_API_KEY);
    }
    
    async processCommand(command: string): Promise<string> {
        // Check if it's a weather query
        const weatherMatch = command.match(/weather.*in\s+(\w+)/i);
        if (weatherMatch) {
            const location = weatherMatch[1];
            return await this.weatherHandler.handleWeatherQuery(location);
        }
        
        // Existing processing logic...
        return `Processed command: ${command}`;
    }
}
```

**Step 3: Test Your Handler**

```typescript
// test/weatherHandler.test.ts
import { WeatherHandler } from '../src/handlers/weatherHandler';

describe('WeatherHandler', () => {
    const handler = new WeatherHandler('test-api-key');
    
    it('should handle weather queries', async () => {
        const result = await handler.handleWeatherQuery('London');
        expect(result).toContain('weather');
        expect(result).toContain('London');
    });
});
```

### Tutorial 2: Creating a Custom Device Controller

**Goal:** Add support for a smart coffee maker.

**Step 1: Define the Device Interface**

```typescript
// src/devices/coffeeMaker.ts
import { Device, Command, Response } from '../types';

export interface CoffeeMakerState {
    power: 'on' | 'off';
    brewing: boolean;
    waterLevel: number; // 0-100
    temperature: number;
    brewStrength: 'mild' | 'medium' | 'strong';
}

export class CoffeeMaker implements Device {
    id: string;
    name: string;
    type: string = 'coffee_maker';
    status: string;
    private state: CoffeeMakerState;
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.status = 'offline';
        this.state = {
            power: 'off',
            brewing: false,
            waterLevel: 100,
            temperature: 20,
            brewStrength: 'medium'
        };
    }
    
    async executeCommand(command: Command): Promise<Response> {
        switch (command.action) {
            case 'brew_coffee':
                return this.brewCoffee(command.parameters);
            case 'set_strength':
                return this.setBrewStrength(command.parameters.strength);
            case 'check_water':
                return this.checkWaterLevel();
            default:
                return {
                    success: false,
                    message: `Unknown command: ${command.action}`
                };
        }
    }
    
    private async brewCoffee(params: any): Promise<Response> {
        if (this.state.waterLevel < 20) {
            return {
                success: false,
                message: 'Cannot brew coffee: water level too low'
            };
        }
        
        this.state.brewing = true;
        this.state.power = 'on';
        
        // Simulate brewing process
        setTimeout(() => {
            this.state.brewing = false;
            this.state.waterLevel -= 20;
        }, 30000); // 30 seconds
        
        return {
            success: true,
            message: 'Coffee is brewing! It will be ready in 30 seconds.',
            data: { estimatedTime: 30 }
        };
    }
    
    private setBrewStrength(strength: string): Response {
        if (['mild', 'medium', 'strong'].includes(strength)) {
            this.state.brewStrength = strength as any;
            return {
                success: true,
                message: `Brew strength set to ${strength}`
            };
        }
        
        return {
            success: false,
            message: 'Invalid brew strength. Use: mild, medium, or strong'
        };
    }
    
    private checkWaterLevel(): Response {
        return {
            success: true,
            message: `Water level is at ${this.state.waterLevel}%`,
            data: { waterLevel: this.state.waterLevel }
        };
    }
}
```

**Step 2: Register with Device Manager**

```typescript
// src/deviceControl/deviceManager.ts
import { CoffeeMaker } from '../devices/coffeeMaker';

export class DeviceManager {
    private devices: Map<string, Device> = new Map();
    
    constructor() {
        this.initializeDevices();
    }
    
    private initializeDevices() {
        // Register coffee maker
        const coffeeMaker = new CoffeeMaker('kitchen-coffee-maker', 'Kitchen Coffee Maker');
        this.devices.set(coffeeMaker.id, coffeeMaker);
    }
    
    async controlDevice(deviceId: string, action: string, parameters?: any): Promise<boolean> {
        const device = this.devices.get(deviceId);
        if (!device) {
            console.error(`Device ${deviceId} not found`);
            return false;
        }
        
        const command: Command = {
            id: `cmd-${Date.now()}`,
            action,
            parameters
        };
        
        const response = await device.executeCommand(command);
        console.log(response.message);
        
        return response.success;
    }
}
```

**Step 3: Add Voice Commands**

```typescript
// Update language processing to handle coffee commands
const coffeePatterns = {
    brew: /brew|make|start.*coffee/i,
    strength: /set.*coffee.*strength.*(mild|medium|strong)/i,
    water: /check.*water.*level/i
};

// In processCommand method:
if (coffeePatterns.brew.test(command)) {
    return this.deviceManager.controlDevice('kitchen-coffee-maker', 'brew_coffee');
}

if (coffeePatterns.strength.test(command)) {
    const match = command.match(coffeePatterns.strength);
    const strength = match[1];
    return this.deviceManager.controlDevice('kitchen-coffee-maker', 'set_strength', { strength });
}
```

### Tutorial 3: Multi-Language Support Implementation

**Goal:** Add support for Spanish voice commands.

**Step 1: Create Language Configuration**

```typescript
// src/config/languages.ts
export interface LanguageConfig {
    code: string;
    name: string;
    patterns: Record<string, RegExp[]>;
    responses: Record<string, string>;
}

export const languages: Record<string, LanguageConfig> = {
    'en-US': {
        code: 'en-US',
        name: 'English',
        patterns: {
            greeting: [/hello|hi|hey/i],
            lights: [/turn\s+(on|off).*light/i],
            goodbye: [/goodbye|bye|see you/i]
        },
        responses: {
            greeting: 'Hello! How can I help you?',
            lightOn: 'Turning on the lights',
            lightOff: 'Turning off the lights',
            goodbye: 'Goodbye! Have a great day!'
        }
    },
    'es-ES': {
        code: 'es-ES',
        name: 'Spanish',
        patterns: {
            greeting: [/hola|buenos días|buenas tardes/i],
            lights: [/(encender|apagar).*luz/i],
            goodbye: [/adiós|hasta luego|nos vemos/i]
        },
        responses: {
            greeting: '¡Hola! ¿Cómo puedo ayudarte?',
            lightOn: 'Encendiendo las luces',
            lightOff: 'Apagando las luces',
            goodbye: '¡Adiós! ¡Que tengas un buen día!'
        }
    }
};
```

**Step 2: Implement Language Detection**

```typescript
// src/core/languageDetector.ts
export class LanguageDetector {
    private currentLanguage: string = 'en-US';
    
    detectLanguage(text: string): string {
        // Simple keyword-based detection
        const spanishKeywords = ['hola', 'gracias', 'por favor', 'buenos', 'adiós'];
        const englishKeywords = ['hello', 'thank', 'please', 'good', 'goodbye'];
        
        const spanishScore = this.calculateScore(text, spanishKeywords);
        const englishScore = this.calculateScore(text, englishKeywords);
        
        if (spanishScore > englishScore) {
            this.currentLanguage = 'es-ES';
            return 'es-ES';
        } else {
            this.currentLanguage = 'en-US';
            return 'en-US';
        }
    }
    
    private calculateScore(text: string, keywords: string[]): number {
        const words = text.toLowerCase().split(' ');
        return keywords.filter(keyword => 
            words.some(word => word.includes(keyword))
        ).length;
    }
    
    getCurrentLanguage(): string {
        return this.currentLanguage;
    }
}
```

**Step 3: Update Language Processing**

```typescript
// src/core/languageProcessing.ts
import { LanguageDetector } from './languageDetector';
import { languages } from '../config/languages';

export class LanguageProcessing {
    private languageDetector: LanguageDetector;
    
    constructor() {
        this.languageDetector = new LanguageDetector();
    }
    
    processCommand(command: string): string {
        // Detect language
        const detectedLang = this.languageDetector.detectLanguage(command);
        const langConfig = languages[detectedLang];
        
        // Process based on detected language
        for (const [intent, patterns] of Object.entries(langConfig.patterns)) {
            for (const pattern of patterns) {
                if (pattern.test(command)) {
                    return this.handleIntent(intent, langConfig, command);
                }
            }
        }
        
        return `Processed command: ${command}`;
    }
    
    private handleIntent(intent: string, langConfig: LanguageConfig, command: string): string {
        switch (intent) {
            case 'greeting':
                return langConfig.responses.greeting;
            case 'lights':
                const isOn = command.includes('on') || command.includes('encender');
                return isOn ? langConfig.responses.lightOn : langConfig.responses.lightOff;
            case 'goodbye':
                return langConfig.responses.goodbye;
            default:
                return `Intent ${intent} processed`;
        }
    }
}
```

---

## Best Practices

### 1. Error Handling

Always implement comprehensive error handling:

```typescript
// ❌ Bad
async function processCommand(command: string) {
    const result = await apiCall(command);
    return result.data;
}

// ✅ Good
async function processCommand(command: string): Promise<ProcessResult> {
    try {
        const result = await apiCall(command);
        return {
            success: true,
            data: result.data,
            message: 'Command processed successfully'
        };
    } catch (error) {
        console.error('Error processing command:', error);
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to process command'
        };
    }
}
```

### 2. Resource Management

Properly manage resources to prevent memory leaks:

```typescript
// ✅ Good resource management
class SpeechRecognition {
    private recognition: SpeechRecognitionAPI;
    private cleanup: Array<() => void> = [];
    
    constructor() {
        this.recognition = new SpeechRecognitionAPI();
        
        // Register cleanup functions
        this.cleanup.push(() => {
            if (this.recognition) {
                this.recognition.stop();
                this.recognition = null;
            }
        });
    }
    
    destroy(): void {
        // Execute all cleanup functions
        this.cleanup.forEach(cleanupFn => cleanupFn());
        this.cleanup = [];
    }
}
```

### 3. Configuration Management

Use configuration objects for flexibility:

```typescript
// ✅ Good configuration pattern
interface AssistantConfig {
    speechRecognition: {
        language: string;
        continuous: boolean;
        confidence: number;
    };
    speechSynthesis: {
        voice: string;
        rate: number;
        pitch: number;
    };
    devices: {
        discoveryTimeout: number;
        retryAttempts: number;
    };
}

class SmartVoiceAssistant {
    constructor(private config: AssistantConfig) {
        this.initializeComponents();
    }
    
    private initializeComponents(): void {
        this.speechRecognition = new SpeechRecognition(this.config.speechRecognition);
        this.speechSynthesis = new SpeechSynthesis(this.config.speechSynthesis);
        // ...
    }
}
```

### 4. Testing Strategies

Implement comprehensive testing:

```typescript
// Unit test example
describe('LanguageProcessing', () => {
    let processor: LanguageProcessing;
    
    beforeEach(() => {
        processor = new LanguageProcessing();
    });
    
    describe('processCommand', () => {
        it('should handle device control commands', () => {
            const result = processor.processCommand('turn on the lights');
            expect(result).toContain('lights');
            expect(result).toContain('on');
        });
        
        it('should handle multiple languages', () => {
            const englishResult = processor.processCommand('hello');
            const spanishResult = processor.processCommand('hola');
            
            expect(englishResult).toBe('Hello! How can I help you?');
            expect(spanishResult).toBe('¡Hola! ¿Cómo puedo ayudarte?');
        });
    });
});

// Integration test example
describe('Voice Assistant Integration', () => {
    let assistant: SmartVoiceAssistant;
    
    beforeEach(() => {
        assistant = new SmartVoiceAssistant(testConfig);
    });
    
    it('should process voice commands end-to-end', async () => {
        // Mock speech recognition
        const mockCommand = 'turn on the kitchen lights';
        
        // Process command
        const result = await assistant.processVoiceCommand(mockCommand);
        
        // Verify result
        expect(result.success).toBe(true);
        expect(result.message).toContain('kitchen lights');
    });
});
```

### 5. Performance Optimization

Optimize for performance:

```typescript
// ✅ Good performance practices
class DeviceManager {
    private deviceCache = new Map<string, Device>();
    private statusCache = new Map<string, { status: string; timestamp: number }>();
    
    async getDeviceStatus(deviceId: string): Promise<string> {
        // Check cache first
        const cached = this.statusCache.get(deviceId);
        if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
            return cached.status;
        }
        
        // Fetch fresh status
        const device = this.deviceCache.get(deviceId);
        if (!device) {
            throw new Error(`Device ${deviceId} not found`);
        }
        
        const status = await device.getStatus();
        
        // Update cache
        this.statusCache.set(deviceId, {
            status,
            timestamp: Date.now()
        });
        
        return status;
    }
}
```

---

## Common Use Cases

### 1. Smart Home Automation

```typescript
// Morning routine automation
class MorningRoutine {
    constructor(
        private deviceManager: DeviceManager,
        private speechSynthesis: SpeechSynthesis
    ) {}
    
    async execute(): Promise<void> {
        this.speechSynthesis.speak("Good morning! Starting your morning routine.");
        
        // Turn on lights gradually
        await this.deviceManager.controlDevice('bedroom-light', 'dim_10');
        await this.delay(2000);
        await this.deviceManager.controlDevice('bedroom-light', 'dim_50');
        await this.delay(2000);
        await this.deviceManager.controlDevice('bedroom-light', 'turn_on');
        
        // Start coffee maker
        await this.deviceManager.controlDevice('coffee-maker', 'brew_coffee');
        
        // Set thermostat
        await this.deviceManager.controlDevice('thermostat', 'set_temperature_72');
        
        this.speechSynthesis.speak("Your morning routine is complete. Have a great day!");
    }
    
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

### 2. Voice-Controlled Entertainment System

```typescript
class EntertainmentController {
    constructor(
        private deviceManager: DeviceManager,
        private languageProcessor: LanguageProcessing
    ) {}
    
    async handleEntertainmentCommand(command: string): Promise<string> {
        const intent = this.languageProcessor.extractIntent(command);
        
        switch (intent.action) {
            case 'play_music':
                return this.playMusic(intent.entities);
            case 'adjust_volume':
                return this.adjustVolume(intent.entities);
            case 'change_channel':
                return this.changeChannel(intent.entities);
            default:
                return "I didn't understand that entertainment command.";
        }
    }
    
    private async playMusic(entities: any[]): Promise<string> {
        const artist = entities.find(e => e.type === 'artist')?.value;
        const genre = entities.find(e => e.type === 'genre')?.value;
        
        if (artist) {
            await this.deviceManager.controlDevice('music-system', 'play_artist', { artist });
            return `Playing music by ${artist}`;
        } else if (genre) {
            await this.deviceManager.controlDevice('music-system', 'play_genre', { genre });
            return `Playing ${genre} music`;
        } else {
            await this.deviceManager.controlDevice('music-system', 'play');
            return "Playing music";
        }
    }
}
```

### 3. Multi-User Voice Recognition

```typescript
class VoiceProfileManager {
    private profiles: Map<string, VoiceProfile> = new Map();
    private currentUser: string | null = null;
    
    async identifyUser(voiceData: AudioBuffer): Promise<string | null> {
        // Voice recognition logic would go here
        // For demo purposes, we'll use a simple approach
        
        const features = this.extractVoiceFeatures(voiceData);
        let bestMatch: string | null = null;
        let bestScore = 0;
        
        for (const [userId, profile] of this.profiles) {
            const score = this.compareVoiceFeatures(features, profile.features);
            if (score > bestScore && score > 0.8) { // 80% confidence threshold
                bestScore = score;
                bestMatch = userId;
            }
        }
        
        this.currentUser = bestMatch;
        return bestMatch;
    }
    
    getPersonalizedResponse(baseResponse: string): string {
        if (!this.currentUser) return baseResponse;
        
        const profile = this.profiles.get(this.currentUser);
        if (!profile) return baseResponse;
        
        // Customize response based on user preferences
        return baseResponse.replace(/Hello/g, profile.preferredGreeting);
    }
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Speech Recognition Not Working

**Problem:** Speech recognition fails to start or doesn't recognize speech.

**Solutions:**

```typescript
// Check browser compatibility
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    // Provide fallback UI for text input
    showTextInputFallback();
}

// Check permissions
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        console.log('Microphone access granted');
        stream.getTracks().forEach(track => track.stop()); // Clean up
    })
    .catch(error => {
        console.error('Microphone access denied:', error);
        showPermissionError();
    });

// Handle recognition errors
speechRecognition.onerror = (event) => {
    switch (event.error) {
        case 'no-speech':
            console.log('No speech detected, restarting...');
            setTimeout(() => speechRecognition.start(), 1000);
            break;
        case 'audio-capture':
            console.error('Microphone not available');
            showMicrophoneError();
            break;
        case 'not-allowed':
            console.error('Permission denied');
            showPermissionDialog();
            break;
    }
};
```

#### 2. Device Control Failures

**Problem:** Devices don't respond to commands.

**Solutions:**

```typescript
// Implement retry logic
class DeviceManager {
    async controlDeviceWithRetry(deviceId: string, action: string, maxRetries = 3): Promise<boolean> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const success = await this.controlDevice(deviceId, action);
                if (success) return true;
                
                console.log(`Attempt ${attempt} failed, retrying...`);
                await this.delay(1000 * attempt); // Exponential backoff
            } catch (error) {
                console.error(`Attempt ${attempt} error:`, error);
                if (attempt === maxRetries) throw error;
            }
        }
        return false;
    }
    
    // Check device connectivity
    async isDeviceOnline(deviceId: string): Promise<boolean> {
        try {
            const status = await this.getDeviceStatus(deviceId);
            return status !== 'offline';
        } catch (error) {
            return false;
        }
    }
}
```

#### 3. Performance Issues

**Problem:** Assistant becomes slow or unresponsive.

**Solutions:**

```typescript
// Monitor performance
class PerformanceMonitor {
    private metrics: PerformanceMetrics = {
        responseTime: [],
        memoryUsage: [],
        errorCount: 0
    };
    
    measureResponseTime<T>(operation: () => Promise<T>): Promise<T> {
        const start = performance.now();
        
        return operation().then(result => {
            const duration = performance.now() - start;
            this.metrics.responseTime.push(duration);
            
            // Keep only last 100 measurements
            if (this.metrics.responseTime.length > 100) {
                this.metrics.responseTime.shift();
            }
            
            // Alert if response time is too high
            if (duration > 2000) { // 2 seconds
                console.warn(`Slow operation detected: ${duration}ms`);
            }
            
            return result;
        });
    }
    
    getAverageResponseTime(): number {
        if (this.metrics.responseTime.length === 0) return 0;
        
        const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
        return sum / this.metrics.responseTime.length;
    }
}
```

---

## Advanced Topics

### 1. Custom Protocol Implementation

```typescript
// Implement a custom device protocol
class MQTTProtocolHandler implements ProtocolHandler {
    private client: MQTTClient;
    
    constructor(brokerUrl: string) {
        this.client = mqtt.connect(brokerUrl);
    }
    
    async sendCommand(device: Device, command: Command): Promise<Response> {
        return new Promise((resolve) => {
            const topic = `devices/${device.id}/commands`;
            const responseTimeout = setTimeout(() => {
                resolve({
                    success: false,
                    message: 'Command timeout'
                });
            }, 5000);
            
            // Listen for response
            this.client.once(`devices/${device.id}/responses`, (message) => {
                clearTimeout(responseTimeout);
                resolve(JSON.parse(message.toString()));
            });
            
            // Send command
            this.client.publish(topic, JSON.stringify(command));
        });
    }
}
```

### 2. Machine Learning Integration

```typescript
// Intent classification using ML
class MLIntentClassifier {
    private model: any; // TensorFlow.js model
    
    async loadModel(): Promise<void> {
        this.model = await tf.loadLayersModel('/models/intent-classifier.json');
    }
    
    async classifyIntent(text: string): Promise<Intent> {
        const tokens = this.tokenize(text);
        const features = this.extractFeatures(tokens);
        const prediction = this.model.predict(features);
        
        const intentIndex = prediction.argMax().dataSync()[0];
        const confidence = prediction.max().dataSync()[0];
        
        return {
            name: this.getIntentName(intentIndex),
            confidence,
            entities: await this.extractEntities(text)
        };
    }
}
```

### 3. Cloud Integration

```typescript
// Cloud-based speech processing
class CloudSpeechProcessor {
    private apiKey: string;
    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    
    async processAudio(audioBlob: Blob): Promise<string> {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('language', 'en-US');
        
        const response = await fetch('https://api.speech-service.com/recognize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: formData
        });
        
        const result = await response.json();
        return result.transcript;
    }
}
```

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and add tests**
4. **Run the test suite:**
   ```bash
   npm test
   ```

5. **Submit a pull request**

### Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing naming conventions
- Add JSDoc comments for public APIs
- Include unit tests for new features
- Update documentation as needed

### Adding New Device Support

1. **Create device class:**
   ```typescript
   // src/devices/yourDevice.ts
   export class YourDevice implements Device {
       // Implementation
   }
   ```

2. **Add to device registry:**
   ```typescript
   // src/deviceControl/deviceRegistry.ts
   import { YourDevice } from '../devices/yourDevice';
   
   export const deviceTypes = {
       // existing types...
       'your_device': YourDevice
   };
   ```

3. **Add voice command patterns:**
   ```typescript
   // src/config/commandPatterns.ts
   export const patterns = {
       // existing patterns...
       yourDevice: [
           /your device pattern/i
       ]
   };
   ```

This developer guide provides comprehensive guidance for working with the Smart Voice Assistant system, from basic usage to advanced customization and contribution.