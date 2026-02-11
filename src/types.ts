/**
 * Shared TypeScript types and interfaces
 */

// Units of measurement
export type Unit = 'px' | 'cm' | 'inch';

// Normalized point coordinates (0-1 range)
export interface Point {
    x: number; // 0-1, where 0 is left edge, 1 is right edge
    y: number; // 0-1, where 0 is top edge, 1 is bottom edge
}

// Calibration data
export interface Calibration {
    pixelsPerCm: number;
    isCalibrated: boolean;
}

// Dimensions in pixels
export interface Dimensions {
    width: number;
    height: number;
}

// Error state
export interface AppError {
    message: string;
    code?: string;
    timestamp: number;
}

// File validation result
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

// Measurement result
export interface MeasurementResult {
    value: number;
    unit: Unit;
    isValid: boolean;
}

// Calibration input
export interface CalibrationInput {
    realLength: number;
    unit: 'cm' | 'inch';
}
