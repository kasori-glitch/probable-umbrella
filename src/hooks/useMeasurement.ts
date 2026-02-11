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
    const screenDistancePx = useMemo(() => {
        return calculateScreenDistance(points[0], points[1], dimensions);
    }, [points, dimensions]);

    const displayValue = useMemo(() => {
        return convertDistance(screenDistancePx, unit, calibration);
    }, [screenDistancePx, unit, calibration]);

    return {
        screenDistancePx,
        displayValue,
    };
}
