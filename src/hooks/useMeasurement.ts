/**
 * Custom hook for calculating measurements
 */

import { useMemo } from 'react';
import type { Point, Calibration, Unit, Dimensions } from '../types';
import { calculateScreenDistance, convertDistance } from '../lib/measurements';

interface UseMeasurementReturn {
    screenDistancePx: number;
    displayValue: number;
}

export function useMeasurement(
    points: [Point, Point],
    dimensions: Dimensions,
    calibration: Calibration,
    unit: Unit
): UseMeasurementReturn {
    // Destructure to primitives so useMemo deps are stable
    const ax = points[0].x;
    const ay = points[0].y;
    const bx = points[1].x;
    const by = points[1].y;
    const dw = dimensions.width;
    const dh = dimensions.height;

    const screenDistancePx = useMemo(() => {
        return calculateScreenDistance({ x: ax, y: ay }, { x: bx, y: by }, { width: dw, height: dh });
    }, [ax, ay, bx, by, dw, dh]);

    const ppcm = calibration.pixelsPerCm;
    const isCalibrated = calibration.isCalibrated;

    const displayValue = useMemo(() => {
        return convertDistance(screenDistancePx, unit, { pixelsPerCm: ppcm, isCalibrated });
    }, [screenDistancePx, unit, ppcm, isCalibrated]);

    return {
        screenDistancePx,
        displayValue,
    };
}
