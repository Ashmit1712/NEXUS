interface ResponsivenessMetrics {
    averageLatency: number;
    processingTime: number;
    queueLength: number;
    activeConnections: number;
    lastOptimization: number;
}
export declare function boostResponsiveness(): void;
export declare function addResponsivenessTask(task: Function, priority?: number): void;
export declare function getResponsivenessMetrics(): ResponsivenessMetrics | null;
export declare function stopResponsivenessOptimization(): void;
export {};
//# sourceMappingURL=responsivenessBooster.d.ts.map