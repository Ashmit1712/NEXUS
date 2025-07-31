export interface Command {
    id: string;
    action: string;
    parameters?: Record<string, any>;
}
export interface Response {
    success: boolean;
    message: string;
    data?: any;
}
export interface Device {
    id: string;
    name: string;
    type: string;
    status: string;
}
export interface VoiceCommand {
    text: string;
    confidence: number;
    timestamp: number;
    language?: string;
}
export interface Intent {
    name: string;
    confidence: number;
    entities: Entity[];
}
export interface Entity {
    type: string;
    value: string;
    start: number;
    end: number;
    confidence: number;
}
export interface ProcessingResult {
    intent: string;
    action: string;
    entities: Entity[];
    confidence: number;
    originalText: string;
}
export interface DeviceState {
    id: string;
    status: 'online' | 'offline' | 'error';
    lastSeen: number;
    properties: Record<string, any>;
}
export interface SpeechRequest {
    text: string;
    language?: string;
    priority?: number;
}
export interface AssistantConfig {
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
export interface PerformanceMetrics {
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
    lastOptimization: number;
}
export interface ResponsivenessMetrics {
    averageLatency: number;
    processingTime: number;
    queueLength: number;
    activeConnections: number;
    lastOptimization: number;
}
export interface EventData {
    [key: string]: any;
}
export interface LogEntry {
    timestamp: string;
    level: string;
    component: string;
    message: string;
    data?: any;
}
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type DeviceType = 'smart_light' | 'thermostat' | 'smart_tv' | 'smart_speaker' | 'smart_lock' | 'security_camera' | 'smart_plug' | 'coffee_maker' | 'vacuum_cleaner' | 'air_conditioner' | 'generic';
export type IntentType = 'device_control' | 'information_request' | 'system_control' | 'greeting' | 'goodbye' | 'unknown';
export type ActionType = 'turn_on' | 'turn_off' | 'increase' | 'decrease' | 'dim' | 'brighten' | 'start' | 'stop' | 'pause' | 'resume' | 'set_value' | 'get_status' | 'control' | 'unknown';
export type EntityType = 'device' | 'room' | 'number' | 'color' | 'action' | 'temperature' | 'time' | 'date' | 'location';
export type SpeechRecognitionErrorType = 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
export interface SpeechRecognitionConfig {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    grammars?: any;
}
export interface SpeechSynthesisConfig {
    voice?: SpeechSynthesisVoice;
    volume: number;
    rate: number;
    pitch: number;
    lang: string;
}
export interface DeviceCapability {
    name: string;
    type: 'boolean' | 'number' | 'string' | 'enum';
    values?: string[];
    min?: number;
    max?: number;
    unit?: string;
}
export interface DeviceProtocol {
    name: string;
    version: string;
    connect(device: Device): Promise<boolean>;
    disconnect(device: Device): Promise<boolean>;
    sendCommand(device: Device, command: Command): Promise<Response>;
    getStatus(device: Device): Promise<DeviceState>;
}
//# sourceMappingURL=index.d.ts.map