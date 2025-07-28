import { EventEmitter } from '../utils/eventEmitter';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../config/configManager';
import { Device, Command, Response } from '../types';

interface DeviceState {
    id: string;
    status: 'online' | 'offline' | 'error';
    lastSeen: number;
    properties: Record<string, any>;
}

export class DeviceManager {
    private devices: Map<string, Device> = new Map();
    private deviceStates: Map<string, DeviceState> = new Map();
    private logger: Logger;
    private config: ConfigManager;
    private eventEmitter: EventEmitter;
    private discoveryInterval: NodeJS.Timeout | null = null;

    constructor(config: ConfigManager, eventEmitter: EventEmitter) {
        this.logger = new Logger('DeviceManager');
        this.config = config;
        this.eventEmitter = eventEmitter;
        this.initializeDefaultDevices();
        this.startDeviceDiscovery();
    }

    private initializeDefaultDevices(): void {
        // Initialize some default mock devices
        const defaultDevices: Device[] = [
            {
                id: 'living_room-light',
                name: 'Living Room Light',
                type: 'smart_light',
                status: 'online'
            },
            {
                id: 'bedroom-light',
                name: 'Bedroom Light',
                type: 'smart_light',
                status: 'online'
            },
            {
                id: 'kitchen-light',
                name: 'Kitchen Light',
                type: 'smart_light',
                status: 'online'
            },
            {
                id: 'main-thermostat',
                name: 'Main Thermostat',
                type: 'thermostat',
                status: 'online'
            },
            {
                id: 'living_room-tv',
                name: 'Living Room TV',
                type: 'smart_tv',
                status: 'online'
            },
            {
                id: 'kitchen-speaker',
                name: 'Kitchen Speaker',
                type: 'smart_speaker',
                status: 'online'
            }
        ];

        defaultDevices.forEach(device => {
            this.devices.set(device.id, device);
            this.deviceStates.set(device.id, {
                id: device.id,
                status: 'online',
                lastSeen: Date.now(),
                properties: this.getDefaultProperties(device.type)
            });
        });

        this.logger.info(`Initialized ${defaultDevices.length} default devices`);
    }

    private getDefaultProperties(deviceType: string): Record<string, any> {
        switch (deviceType) {
            case 'smart_light':
                return { brightness: 100, color: 'white', power: true };
            case 'thermostat':
                return { temperature: 72, mode: 'auto', target: 72 };
            case 'smart_tv':
                return { power: false, volume: 50, channel: 1 };
            case 'smart_speaker':
                return { power: true, volume: 30, playing: false };
            default:
                return {};
        }
    }

    private startDeviceDiscovery(): void {
        const discoveryInterval = this.config.get('deviceManager.discoveryInterval', 30000);
        
        this.discoveryInterval = setInterval(() => {
            this.discoverDevices();
        }, discoveryInterval);

        // Initial discovery
        this.discoverDevices();
    }

    private async discoverDevices(): Promise<void> {
        this.logger.info('Starting device discovery...');
        
        try {
            // In a real implementation, this would scan the network for devices
            // For now, we'll just update the status of existing devices
            for (const [deviceId, state] of this.deviceStates) {
                // Simulate device availability check
                const isOnline = Math.random() > 0.1; // 90% chance device is online
                
                this.deviceStates.set(deviceId, {
                    ...state,
                    status: isOnline ? 'online' : 'offline',
                    lastSeen: isOnline ? Date.now() : state.lastSeen
                });
            }
            
            this.logger.info('Device discovery completed');
        } catch (error) {
            this.logger.error('Error during device discovery:', error);
        }
    }

    public async controlDevice(deviceId: string, action: string, parameters?: any): Promise<boolean> {
        this.logger.info(`Controlling device ${deviceId} with action: ${action}`);

        const device = this.devices.get(deviceId);
        if (!device) {
            this.logger.error(`Device ${deviceId} not found`);
            return false;
        }

        const deviceState = this.deviceStates.get(deviceId);
        if (!deviceState || deviceState.status !== 'online') {
            this.logger.error(`Device ${deviceId} is not online`);
            return false;
        }

        try {
            const command: Command = {
                id: `cmd-${Date.now()}`,
                action,
                parameters: parameters || {}
            };

            const response = await this.executeDeviceCommand(device, command);
            
            this.eventEmitter.emit('deviceControlled', {
                deviceId,
                success: response.success,
                message: response.message
            });

            return response.success;
        } catch (error) {
            this.logger.error(`Error controlling device ${deviceId}:`, error);
            return false;
        }
    }

    private async executeDeviceCommand(device: Device, command: Command): Promise<Response> {
        const deviceState = this.deviceStates.get(device.id);
        if (!deviceState) {
            return { success: false, message: 'Device state not found' };
        }

        // Simulate device control based on device type and action
        switch (device.type) {
            case 'smart_light':
                return this.controlLight(deviceState, command);
            case 'thermostat':
                return this.controlThermostat(deviceState, command);
            case 'smart_tv':
                return this.controlTV(deviceState, command);
            case 'smart_speaker':
                return this.controlSpeaker(deviceState, command);
            default:
                return this.controlGenericDevice(deviceState, command);
        }
    }

    private controlLight(deviceState: DeviceState, command: Command): Response {
        const { action, parameters } = command;
        
        switch (action) {
            case 'turn_on':
                deviceState.properties.power = true;
                deviceState.properties.brightness = parameters?.brightness || 100;
                return { success: true, message: 'Light turned on' };
                
            case 'turn_off':
                deviceState.properties.power = false;
                return { success: true, message: 'Light turned off' };
                
            case 'dim':
                deviceState.properties.brightness = Math.max(10, deviceState.properties.brightness - 20);
                return { success: true, message: `Light dimmed to ${deviceState.properties.brightness}%` };
                
            case 'brighten':
                deviceState.properties.brightness = Math.min(100, deviceState.properties.brightness + 20);
                return { success: true, message: `Light brightened to ${deviceState.properties.brightness}%` };
                
            case 'set_brightness':
                const brightness = parameters?.value || 50;
                deviceState.properties.brightness = Math.max(0, Math.min(100, brightness));
                return { success: true, message: `Light brightness set to ${deviceState.properties.brightness}%` };
                
            default:
                return { success: false, message: `Unknown light action: ${action}` };
        }
    }

    private controlThermostat(deviceState: DeviceState, command: Command): Response {
        const { action, parameters } = command;
        
        switch (action) {
            case 'set_temperature':
            case 'set_value':
                const temperature = parameters?.value || parameters?.temperature || 72;
                deviceState.properties.target = Math.max(50, Math.min(90, temperature));
                return { success: true, message: `Thermostat set to ${deviceState.properties.target}°F` };
                
            case 'increase':
                deviceState.properties.target = Math.min(90, deviceState.properties.target + 2);
                return { success: true, message: `Temperature increased to ${deviceState.properties.target}°F` };
                
            case 'decrease':
                deviceState.properties.target = Math.max(50, deviceState.properties.target - 2);
                return { success: true, message: `Temperature decreased to ${deviceState.properties.target}°F` };
                
            default:
                return { success: false, message: `Unknown thermostat action: ${action}` };
        }
    }

    private controlTV(deviceState: DeviceState, command: Command): Response {
        const { action, parameters } = command;
        
        switch (action) {
            case 'turn_on':
                deviceState.properties.power = true;
                return { success: true, message: 'TV turned on' };
                
            case 'turn_off':
                deviceState.properties.power = false;
                return { success: true, message: 'TV turned off' };
                
            case 'volume_up':
            case 'increase':
                deviceState.properties.volume = Math.min(100, deviceState.properties.volume + 5);
                return { success: true, message: `Volume increased to ${deviceState.properties.volume}` };
                
            case 'volume_down':
            case 'decrease':
                deviceState.properties.volume = Math.max(0, deviceState.properties.volume - 5);
                return { success: true, message: `Volume decreased to ${deviceState.properties.volume}` };
                
            default:
                return { success: false, message: `Unknown TV action: ${action}` };
        }
    }

    private controlSpeaker(deviceState: DeviceState, command: Command): Response {
        const { action } = command;
        
        switch (action) {
            case 'start':
            case 'play':
                deviceState.properties.playing = true;
                return { success: true, message: 'Music started playing' };
                
            case 'stop':
            case 'pause':
                deviceState.properties.playing = false;
                return { success: true, message: 'Music stopped' };
                
            case 'volume_up':
            case 'increase':
                deviceState.properties.volume = Math.min(100, deviceState.properties.volume + 10);
                return { success: true, message: `Volume increased to ${deviceState.properties.volume}` };
                
            case 'volume_down':
            case 'decrease':
                deviceState.properties.volume = Math.max(0, deviceState.properties.volume - 10);
                return { success: true, message: `Volume decreased to ${deviceState.properties.volume}` };
                
            default:
                return { success: false, message: `Unknown speaker action: ${action}` };
        }
    }

    private controlGenericDevice(deviceState: DeviceState, command: Command): Response {
        const { action } = command;
        
        switch (action) {
            case 'turn_on':
                deviceState.properties.power = true;
                return { success: true, message: 'Device turned on' };
                
            case 'turn_off':
                deviceState.properties.power = false;
                return { success: true, message: 'Device turned off' };
                
            default:
                return { success: true, message: `Command ${action} executed` };
        }
    }

    public getDeviceStatus(deviceId: string): string {
        const device = this.devices.get(deviceId);
        const deviceState = this.deviceStates.get(deviceId);
        
        if (!device || !deviceState) {
            return `Device ${deviceId} not found`;
        }

        const statusInfo = [
            `Device: ${device.name}`,
            `Status: ${deviceState.status}`,
            `Type: ${device.type}`,
            `Last seen: ${new Date(deviceState.lastSeen).toLocaleString()}`
        ];

        if (deviceState.properties && Object.keys(deviceState.properties).length > 0) {
            statusInfo.push(`Properties: ${JSON.stringify(deviceState.properties)}`);
        }

        return statusInfo.join(', ');
    }

    public getAllDevices(): Device[] {
        return Array.from(this.devices.values());
    }

    public getOnlineDevices(): Device[] {
        return Array.from(this.devices.values()).filter(device => {
            const state = this.deviceStates.get(device.id);
            return state?.status === 'online';
        });
    }

    public addDevice(device: Device): void {
        this.devices.set(device.id, device);
        this.deviceStates.set(device.id, {
            id: device.id,
            status: 'online',
            lastSeen: Date.now(),
            properties: this.getDefaultProperties(device.type)
        });
        
        this.logger.info(`Added device: ${device.name} (${device.id})`);
    }

    public removeDevice(deviceId: string): boolean {
        const device = this.devices.get(deviceId);
        if (device) {
            this.devices.delete(deviceId);
            this.deviceStates.delete(deviceId);
            this.logger.info(`Removed device: ${device.name} (${deviceId})`);
            return true;
        }
        return false;
    }

    public destroy(): void {
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = null;
        }
        
        this.devices.clear();
        this.deviceStates.clear();
        this.logger.info('DeviceManager destroyed');
    }
}