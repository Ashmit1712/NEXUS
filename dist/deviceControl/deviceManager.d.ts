import { EventEmitter } from '../utils/eventEmitter';
import { ConfigManager } from '../config/configManager';
import { Device } from '../types';
export declare class DeviceManager {
    private devices;
    private deviceStates;
    private logger;
    private config;
    private eventEmitter;
    private discoveryInterval;
    constructor(config: ConfigManager, eventEmitter: EventEmitter);
    private initializeDefaultDevices;
    private getDefaultProperties;
    private startDeviceDiscovery;
    private discoverDevices;
    controlDevice(deviceId: string, action: string, parameters?: any): Promise<boolean>;
    private executeDeviceCommand;
    private controlLight;
    private controlThermostat;
    private controlTV;
    private controlSpeaker;
    private controlGenericDevice;
    getDeviceStatus(deviceId: string): string;
    getAllDevices(): Device[];
    getOnlineDevices(): Device[];
    addDevice(device: Device): void;
    removeDevice(deviceId: string): boolean;
    destroy(): void;
}
//# sourceMappingURL=deviceManager.d.ts.map