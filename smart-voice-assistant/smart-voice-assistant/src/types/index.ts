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