/**
 * Business logic for measurements and calibration
 * Separated from UI components for testability
 */

import type { Point, Calibration, Unit, Dimensions, CalibrationInput } from '../types';
import { logger } from '../utils/logger';
import { ERROR_MESSAGES } from '../constants';

/**
 * Calculates Euclidean distance between two points in screen pixels
 */
export function calculateScreenDistance(
    pointA: Point,
    pointB: Point,
    dimensions: Dimensions
): number {
    if (dimensions.width === 0 || dimensions.height === 0) {
        return 0;
    }

    const dx = (pointB.x - pointA.x) * dimensions.width;
    const dy = (pointB.y - pointA.y) * dimensions.height;

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Converts a distance from pixels to the specified unit
 */
export function convertDistance(
    pixels: number,
    unit: Unit,
    calibration: Calibration
): number {
    // Pixels don't need conversion
    if (unit === 'px') {
        return pixels;
    }

    // Check if calibrated
    if (!calibration.isCalibrated || calibration.pixelsPerCm <= 0) {
        logger.warn('Attempted to convert without valid calibration', { unit, calibration });
        return 0;
    }

    // Convert to centimeters first
    const cm = pixels / calibration.pixelsPerCm;

    // Then to target unit
    switch (unit) {
        case 'cm':
            return cm;
        case 'inch':
            return cm / 2.54;
        default:
            logger.error('Unknown unit', { unit });
            return 0;
    }
}

/**
 * Calculates pixels per centimeter from calibration input
 */
export function calculatePixelsPerCm(
    screenDistancePx: number,
    input: CalibrationInput
): number {
    // Convert input to centimeters
    let lengthCm = input.realLength;
    if (input.unit === 'inch') {
        lengthCm = input.realLength * 2.54;
    }

    // Validate
    if (lengthCm <= 0) {
        throw new Error(ERROR_MESSAGES.INVALID_CALIBRATION_VALUE);
    }

    if (screenDistancePx <= 0) {
        throw new Error(ERROR_MESSAGES.ADJUST_POINTS_FIRST);
    }

    // Calculate
    const ppcm = screenDistancePx / lengthCm;

    // Validate result
    if (!Number.isFinite(ppcm) || ppcm <= 0) {
        throw new Error(ERROR_MESSAGES.CALIBRATION_CALCULATION_FAILED);
    }

    logger.info('Calibration calculated', {
        screenDistancePx,
        lengthCm,
        pixelsPerCm: ppcm,
    });

    return ppcm;
}

/**
 * Creates a new calibration object
 */
export function createCalibration(
    screenDistancePx: number,
    input: CalibrationInput
): Calibration {
    const pixelsPerCm = calculatePixelsPerCm(screenDistancePx, input);

    return {
        pixelsPerCm,
        isCalibrated: true,
    };
}

/**
 * Formats a measurement value for display
 */
export function formatMeasurement(value: number, decimals: number = 2): string {
    if (!Number.isFinite(value)) {
        return '0.00';
    }

    return value.toFixed(decimals);
}
