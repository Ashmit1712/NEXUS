export class DeviceController {
    controlDevice(deviceId: string, action: string): void {
        // Logic to control the device based on the action
        console.log(`Controlling device ${deviceId} to perform action: ${action}`);
    }

    getDeviceStatus(deviceId: string): string {
        // Logic to get the status of the device
        console.log(`Getting status for device ${deviceId}`);
        return `Status of device ${deviceId}`;
    }
}