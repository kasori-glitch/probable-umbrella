/**
 * Custom hook for managing calibration state
 */

import { useState, useEffect, useCallback } from 'react';
import type { Calibration, CalibrationInput } from '../types';
import { STORAGE_KEYS, DEFAULTS, ERROR_MESSAGES } from '../constants';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { validateStoredCalibration } from '../utils/validation';
import { validateCalibrationValue, validateScreenDistance } from '../utils/validation';
import { createCalibration } from '../lib/measurements';
import { logger } from '../utils/logger';

interface UseCalibrationReturn {
    calibration: Calibration;
    calibrate: (screenDistancePx: number, input: CalibrationInput) => { success: boolean; error?: string };
    reset: () => void;
    isCalibrated: boolean;
}

export function useCalibration(): UseCalibrationReturn {
    // Load from storage with validation
    const [calibration, setCalibration] = useState<Calibration>(() => {
        const stored = getStorageItem(STORAGE_KEYS.CALIBRATION, null);

        if (stored === null) {
            return DEFAULTS.CALIBRATION;
        }

        const validated = validateStoredCalibration(stored);
        if (validated === null) {
            logger.warn('Invalid stored calibration, using default');
            return DEFAULTS.CALIBRATION;
        }

        logger.info('Loaded calibration from storage', { pixelsPerCm: validated.pixelsPerCm, isCalibrated: validated.isCalibrated });
        return validated;
    });

    // Persist to storage whenever calibration changes
    useEffect(() => {
        const success = setStorageItem(STORAGE_KEYS.CALIBRATION, calibration);
        if (!success) {
            logger.error(ERROR_MESSAGES.CALIBRATION_SAVE_FAILED);
        }
    }, [calibration]);

    // Calibrate with validation
    const calibrate = useCallback(
        (screenDistancePx: number, input: CalibrationInput): { success: boolean; error?: string } => {
            // Validate input value
            const valueValidation = validateCalibrationValue(input.realLength, input.unit);
            if (!valueValidation.valid) {
                logger.warn('Invalid calibration value', { input, error: valueValidation.error });
                return { success: false, error: valueValidation.error };
            }

            // Validate screen distance
            const distanceValidation = validateScreenDistance(screenDistancePx);
            if (!distanceValidation.valid) {
                logger.warn('Invalid screen distance', { screenDistancePx, error: distanceValidation.error });
                return { success: false, error: distanceValidation.error };
            }

            // Calculate calibration
            try {
                const newCalibration = createCalibration(screenDistancePx, input);
                setCalibration(newCalibration);
                logger.info('Calibration successful', { pixelsPerCm: newCalibration.pixelsPerCm, isCalibrated: newCalibration.isCalibrated });
                return { success: true };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.CALIBRATION_CALCULATION_FAILED;
                logger.error('Calibration failed', { error, input, screenDistancePx });
                return { success: false, error: errorMessage };
            }
        },
        []
    );

    // Reset calibration
    const reset = useCallback(() => {
        setCalibration(DEFAULTS.CALIBRATION);
        logger.info('Calibration reset');
    }, []);

    return {
        calibration,
        calibrate,
        reset,
        isCalibrated: calibration.isCalibrated,
    };
}
