# Smart Voice Assistant - API Documentation

## Overview

The Smart Voice Assistant is an AI-powered voice assistant that can speak and understand all languages, control devices through voice commands, and enhance performance and responsiveness. This documentation covers all public APIs, functions, and components available in the system.

## Table of Contents

1. [Core Classes](#core-classes)
   - [SmartVoiceAssistant](#smartvoiceassistant)
   - [SpeechRecognition](#speechrecognition)
   - [SpeechSynthesis](#speechsynthesis)
   - [LanguageProcessing](#languageprocessing)
   - [DeviceManager](#devicemanager)
2. [Feature Functions](#feature-functions)
   - [Performance Enhancer](#performance-enhancer)
   - [Responsiveness Booster](#responsiveness-booster)
3. [Type Definitions](#type-definitions)
4. [Usage Examples](#usage-examples)
5. [Installation and Setup](#installation-and-setup)

---

## Core Classes

### SmartVoiceAssistant

The main orchestrator class that coordinates all voice assistant functionality.

#### Constructor

```typescript
constructor()
```

Creates a new instance of the Smart Voice Assistant with all required components initialized.

**Example:**
```typescript
const assistant = new SmartVoiceAssistant();
```

#### Methods

##### `start(): void`

Starts the voice assistant, enabling speech recognition and command processing.

**Usage:**
```typescript
const assistant = new SmartVoiceAssistant();
assistant.start();
```

**Description:**
- Initializes speech recognition
- Sets up command handling pipeline
- Begins listening for voice commands

---

### SpeechRecognition

Handles speech-to-text conversion and voice command recognition.

#### Constructor

```typescript
constructor()
```

Initializes the speech recognition system with default settings.

#### Methods

##### `startRecognition(): void`

Begins listening for speech input.

**Usage:**
```typescript
const speechRecognition = new SpeechRecognition();
speechRecognition.startRecognition();
```

**Features:**
- Continuous listening mode
- Automatic error handling
- Multi-language support

##### `stopRecognition(): void`

Stops the speech recognition process.

**Usage:**
```typescript
speechRecognition.stopRecognition();
```

##### `onResult(callback: (command: string) => void): void`

Sets up a callback function to handle recognized speech.

**Parameters:**
- `callback`: Function that receives the recognized text as a string

**Usage:**
```typescript
speechRecognition.onResult((command) => {
    console.log('Recognized command:', command);
    // Process the command
});
```

#### Properties

- `isRecognizing: boolean` - Indicates whether the system is currently listening

---

### SpeechSynthesis

Converts text to speech with multi-language support.

#### Constructor

```typescript
constructor()
```

Initializes the text-to-speech system.

#### Methods

##### `speak(text: string, language?: string): void`

Converts text to speech and plays it through the audio output.

**Parameters:**
- `text`: The text to be spoken
- `language` (optional): Language code (default: 'en-US')

**Usage:**
```typescript
const speechSynthesis = new SpeechSynthesis();

// Basic usage
speechSynthesis.speak("Hello, how can I help you?");

// With specific language
speechSynthesis.speak("Bonjour, comment puis-je vous aider?", "fr-FR");
speechSynthesis.speak("Hola, ¿cómo puedo ayudarte?", "es-ES");
speechSynthesis.speak("こんにちは、どのようにお手伝いできますか？", "ja-JP");
```

**Supported Languages:**
- English (en-US)
- French (fr-FR)
- Spanish (es-ES)
- Japanese (ja-JP)
- German (de-DE)
- And many more...

##### `stopSpeaking(): void`

Immediately stops any ongoing speech synthesis.

**Usage:**
```typescript
speechSynthesis.stopSpeaking();
```

---

### LanguageProcessing

Handles natural language understanding and command processing.

#### Constructor

```typescript
constructor()
```

Initializes the language processing engine.

#### Methods

##### `processCommand(command: string): string`

Processes a natural language command and extracts actionable information.

**Parameters:**
- `command`: Raw voice command text

**Returns:**
- Processed command string with extracted intent and parameters

**Usage:**
```typescript
const languageProcessor = new LanguageProcessing();
const processed = languageProcessor.processCommand("Turn on the living room lights");
console.log(processed); // "Processed command: Turn on the living room lights"
```

**Examples of supported commands:**
```typescript
// Device control
languageProcessor.processCommand("Turn on the bedroom lights");
languageProcessor.processCommand("Set thermostat to 72 degrees");
languageProcessor.processCommand("Play music in the kitchen");

// Information requests
languageProcessor.processCommand("What's the weather like today?");
languageProcessor.processCommand("What time is it?");
```

##### `translate(text: string, targetLanguage: string): string`

Translates text from one language to another.

**Parameters:**
- `text`: Text to translate
- `targetLanguage`: Target language code

**Returns:**
- Translated text

**Usage:**
```typescript
const translated = languageProcessor.translate("Hello world", "es");
console.log(translated); // "Translated text: Hello world to es"
```

---

### DeviceManager

Manages and controls smart home devices and IoT equipment.

#### Constructor

```typescript
constructor()
```

Initializes the device management system.

#### Methods

##### `controlDevice(deviceId: string, action: string): boolean`

Controls a specific device by executing the requested action.

**Parameters:**
- `deviceId`: Unique identifier for the device
- `action`: Action to perform on the device

**Returns:**
- `true` if the action was successful, `false` otherwise

**Usage:**
```typescript
const deviceManager = new DeviceManager();

// Control lights
const success = deviceManager.controlDevice("living-room-light-1", "turn_on");
console.log(success); // true

// Control thermostat
deviceManager.controlDevice("main-thermostat", "set_temperature_72");

// Control entertainment system
deviceManager.controlDevice("tv-living-room", "power_on");
deviceManager.controlDevice("speaker-kitchen", "play_music");
```

**Common Device Types and Actions:**
```typescript
// Lights
deviceManager.controlDevice("light-id", "turn_on");
deviceManager.controlDevice("light-id", "turn_off");
deviceManager.controlDevice("light-id", "dim_50");

// Thermostat
deviceManager.controlDevice("thermostat-id", "set_temperature_70");
deviceManager.controlDevice("thermostat-id", "heat_mode");
deviceManager.controlDevice("thermostat-id", "cool_mode");

// Entertainment
deviceManager.controlDevice("tv-id", "power_on");
deviceManager.controlDevice("speaker-id", "volume_up");
deviceManager.controlDevice("speaker-id", "play_music");
```

##### `getDeviceStatus(deviceId: string): string`

Retrieves the current status of a specific device.

**Parameters:**
- `deviceId`: Unique identifier for the device

**Returns:**
- Status string describing the current state of the device

**Usage:**
```typescript
const status = deviceManager.getDeviceStatus("living-room-light-1");
console.log(status); // "Device is online and functioning properly."
```

---

## Feature Functions

### Performance Enhancer

Optimizes system performance and resource management.

#### `enhancePerformance(): void`

Activates performance optimization features.

**Usage:**
```typescript
import { enhancePerformance } from './features/performanceEnhancer';

enhancePerformance();
```

**Features:**
- Memory optimization
- CPU usage management
- Task prioritization
- Resource allocation optimization

**When to use:**
- During system initialization
- When experiencing performance issues
- Before processing intensive operations

### Responsiveness Booster

Improves system responsiveness and reduces latency.

#### `boostResponsiveness(): void`

Activates responsiveness enhancement features.

**Usage:**
```typescript
import { boostResponsiveness } from './features/responsivenessBooster';

boostResponsiveness();
```

**Features:**
- Latency reduction
- Processing optimization
- Response time improvement
- Algorithm optimization

---

## Type Definitions

### Command

Represents a voice command with associated metadata.

```typescript
interface Command {
    id: string;              // Unique command identifier
    action: string;          // Action to be performed
    parameters?: Record<string, any>; // Optional command parameters
}
```

**Example:**
```typescript
const command: Command = {
    id: "cmd-001",
    action: "turn_on_lights",
    parameters: {
        room: "living_room",
        brightness: 75
    }
};
```

### Response

Represents a system response to a command or query.

```typescript
interface Response {
    success: boolean;        // Whether the operation was successful
    message: string;         // Human-readable response message
    data?: any;             // Optional response data
}
```

**Example:**
```typescript
const response: Response = {
    success: true,
    message: "Living room lights turned on successfully",
    data: {
        deviceId: "living-room-light-1",
        newStatus: "on",
        brightness: 75
    }
};
```

### Device

Represents a controllable device in the system.

```typescript
interface Device {
    id: string;              // Unique device identifier
    name: string;            // Human-readable device name
    type: string;            // Device type (light, thermostat, etc.)
    status: string;          // Current device status
}
```

**Example:**
```typescript
const device: Device = {
    id: "living-room-light-1",
    name: "Living Room Main Light",
    type: "smart_light",
    status: "on"
};
```

---

## Usage Examples

### Basic Voice Assistant Setup

```typescript
import { SmartVoiceAssistant } from './src/main';

// Initialize and start the assistant
const assistant = new SmartVoiceAssistant();
assistant.start();

console.log("Voice assistant is now listening for commands...");
```

### Custom Speech Recognition Handler

```typescript
import { SpeechRecognition } from './src/core/speechRecognition';
import { LanguageProcessing } from './src/core/languageProcessing';
import { DeviceManager } from './src/deviceControl/deviceManager';

const speechRecognition = new SpeechRecognition();
const languageProcessor = new LanguageProcessing();
const deviceManager = new DeviceManager();

speechRecognition.onResult((command) => {
    console.log('Raw command:', command);
    
    // Process the command
    const processedCommand = languageProcessor.processCommand(command);
    console.log('Processed:', processedCommand);
    
    // Execute device control if needed
    if (command.includes('turn on') && command.includes('light')) {
        const success = deviceManager.controlDevice('living-room-light-1', 'turn_on');
        console.log('Device control result:', success);
    }
});

speechRecognition.startRecognition();
```

### Multi-language Voice Response

```typescript
import { SpeechSynthesis } from './src/core/speechSynthesis';
import { LanguageProcessing } from './src/core/languageProcessing';

const speechSynthesis = new SpeechSynthesis();
const languageProcessor = new LanguageProcessing();

// Respond in multiple languages
function respondInLanguage(message: string, language: string) {
    const translated = languageProcessor.translate(message, language);
    speechSynthesis.speak(translated, language);
}

// Examples
respondInLanguage("Good morning! How can I help you?", "en-US");
respondInLanguage("Good morning! How can I help you?", "es-ES");
respondInLanguage("Good morning! How can I help you?", "fr-FR");
```

### Device Control Automation

```typescript
import { DeviceManager } from './src/deviceControl/deviceManager';

const deviceManager = new DeviceManager();

// Morning routine
function morningRoutine() {
    console.log("Starting morning routine...");
    
    // Turn on lights
    deviceManager.controlDevice('bedroom-light', 'turn_on');
    deviceManager.controlDevice('kitchen-light', 'turn_on');
    
    // Set thermostat
    deviceManager.controlDevice('main-thermostat', 'set_temperature_72');
    
    // Start coffee maker
    deviceManager.controlDevice('coffee-maker', 'brew_coffee');
    
    console.log("Morning routine completed!");
}

// Evening routine
function eveningRoutine() {
    console.log("Starting evening routine...");
    
    // Dim lights
    deviceManager.controlDevice('living-room-light', 'dim_30');
    deviceManager.controlDevice('bedroom-light', 'dim_20');
    
    // Lower thermostat
    deviceManager.controlDevice('main-thermostat', 'set_temperature_68');
    
    // Turn on security system
    deviceManager.controlDevice('security-system', 'arm_night_mode');
    
    console.log("Evening routine completed!");
}
```

---

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- TypeScript (v4.5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smart-voice-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

### Development Setup

1. **Install development dependencies:**
   ```bash
   npm install --dev
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

### Configuration

The system can be configured through environment variables or configuration files:

```typescript
// config.ts
export const config = {
    speechRecognition: {
        language: 'en-US',
        continuous: true,
        interimResults: false
    },
    speechSynthesis: {
        defaultLanguage: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
    },
    devices: {
        discoveryTimeout: 5000,
        connectionRetries: 3
    }
};
```

### Troubleshooting

**Common Issues:**

1. **Microphone not working:**
   - Check browser permissions
   - Ensure HTTPS connection for web deployment
   - Verify microphone hardware

2. **Speech synthesis not working:**
   - Check audio output settings
   - Verify browser compatibility
   - Test with different languages

3. **Device control not responding:**
   - Check device connectivity
   - Verify device IDs
   - Test network connection

**Getting Help:**

- Check the console for error messages
- Enable debug logging
- Review the troubleshooting guide
- Contact support team

---

## API Reference Summary

| Component | Main Methods | Purpose |
|-----------|-------------|---------|
| `SmartVoiceAssistant` | `start()` | Main orchestrator |
| `SpeechRecognition` | `startRecognition()`, `stopRecognition()`, `onResult()` | Voice input |
| `SpeechSynthesis` | `speak()`, `stopSpeaking()` | Voice output |
| `LanguageProcessing` | `processCommand()`, `translate()` | NLP & translation |
| `DeviceManager` | `controlDevice()`, `getDeviceStatus()` | Device control |
| `enhancePerformance()` | Function | Performance optimization |
| `boostResponsiveness()` | Function | Responsiveness improvement |

This documentation provides comprehensive coverage of all public APIs, functions, and components in the Smart Voice Assistant system. Each component includes detailed method signatures, parameters, return values, and practical usage examples.