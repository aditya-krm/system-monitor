/**
 * System health utilities for evaluating system metrics
 */

/**
 * Determine system health status based on CPU load
 */
export function getCpuStatus(load: number): 'healthy' | 'warning' | 'critical' {
    if (load >= 90) return 'critical';
    if (load >= 75) return 'warning';
    return 'healthy';
}

/**
 * Determine system health status based on memory usage
 */
export function getMemoryStatus(usedPercentage: number): 'healthy' | 'warning' | 'critical' {
    if (usedPercentage >= 90) return 'critical';
    if (usedPercentage >= 75) return 'warning';
    return 'healthy';
}

/**
 * Determine system health status based on disk usage
 */
export function getDiskStatus(usedPercentage: number): 'healthy' | 'warning' | 'critical' {
    if (usedPercentage >= 95) return 'critical';
    if (usedPercentage >= 80) return 'warning';
    return 'healthy';
}

/**
 * Determine system health status based on temperature
 */
export function getTemperatureStatus(temp: number | null): 'healthy' | 'warning' | 'critical' {
    if (!temp) return 'healthy';
    if (temp >= 80) return 'critical';
    if (temp >= 70) return 'warning';
    return 'healthy';
}

/**
 * Get a readable status label
 */
export function getStatusLabel(status: 'healthy' | 'warning' | 'critical'): string {
    switch (status) {
        case 'healthy': return 'Healthy';
        case 'warning': return 'Warning';
        case 'critical': return 'Critical';
        default: return 'Unknown';
    }
}
