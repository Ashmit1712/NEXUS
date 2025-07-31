export declare class EventEmitter {
    private events;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    emit(event: string, data?: any): void;
    once(event: string, callback: Function): void;
    removeAllListeners(event?: string): void;
    listenerCount(event: string): number;
    eventNames(): string[];
}
//# sourceMappingURL=eventEmitter.d.ts.map