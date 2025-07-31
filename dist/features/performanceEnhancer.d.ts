interface PerformanceMetrics {
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
    lastOptimization: number;
}
export declare function enhancePerformance(): void;
export declare function getPerformanceMetrics(): PerformanceMetrics | null;
export declare function stopPerformanceMonitoring(): void;
export declare function setPerformanceThresholds(thresholds: any): void;
export {};
//# sourceMappingURL=performanceEnhancer.d.ts.map