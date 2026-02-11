/**
 * Input validation utilities
 */

import { FILE_UPLOAD, MEASUREMENT, ERROR_MESSAGES } from '../constants';
import type { FileValidationResult, Calibration } from '../types';
import { logger } from './logger';

/**
 * Validates an uploaded image file
 */
export function validateImageFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
        logger.warn('File too large', { size: file.size, maxSize: FILE_UPLOAD.MAX_SIZE_BYTES });
        return {
            valid: false,
            error: ERROR_MESSAGES.FILE_TOO_LARGE,
        };
    }

    // Check file type
    if (!(FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
        logger.warn('Invalid file type', { type: file.type, allowedTypes: FILE_UPLOAD.ALLOWED_TYPES });
        return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_FILE_TYPE,
        };
    }

    // Additional check: file extension
    const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (extension && !(FILE_UPLOAD.ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
        logger.warn('Invalid file extension', { extension, allowedExtensions: FILE_UPLOAD.ALLOWED_EXTENSIONS });
        return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_FILE_TYPE,
        };
    }

    return { valid: true };
}

/**
 * Validates calibration input value
 */
export function validateCalibrationValue(
    value: number,
    unit: 'cm' | 'inch'
): { valid: boolean; error?: string } {
    // Check if it's a finite number
    if (!Number.isFinite(value)) {
        return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_CALIBRATION_VALUE,
        };
    }

    // Check if positive
    if (value <= 0) {
        return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_CALIBRATION_VALUE,
        };
    }

    // Check range based on unit
    const min = unit === 'cm' ? MEASUREMENT.MIN_CALIBRATION_CM : MEASUREMENT.MIN_CALIBRATION_INCH;
    const max = unit === 'cm' ? MEASUREMENT.MAX_CALIBRATION_CM : MEASUREMENT.MAX_CALIBRATION_INCH;

    if (value < min || value > max) {
        return {
            valid: false,
            error: ERROR_MESSAGES.CALIBRATION_OUT_OF_RANGE(min, max, unit),
        };
    }

    return { valid: true };
}

/**
 * Validates screen distance for calibration
 */
export function validateScreenDistance(distance: number): { valid: boolean; error?: string } {
    if (!Number.isFinite(distance) || distance <= 0) {
        return {
            valid: false,
            error: ERROR_MESSAGES.ADJUST_POINTS_FIRST,
        };
    }

    return { valid: true };
}

/**
 * Type guard for Calibration object
 */
export function isValidCalibration(obj: unknown): obj is Calibration {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    const cal = obj as Record<string, unknown>;

    return (
        typeof cal.pixelsPerCm === 'number' &&
        Number.isFinite(cal.pixelsPerCm) &&
        typeof cal.isCalibrated === 'boolean'
    );
}

/**
 * Validates and sanitizes calibration data from storage
 */
export function validateStoredCalibration(data: unknown): Calibration | null {
    if (!isValidCalibration(data)) {
        logger.warn('Invalid calibration data from storage', { data });
        return null;
    }

    return data;
}
