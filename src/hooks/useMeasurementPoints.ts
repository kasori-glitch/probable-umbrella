/**
 * Custom hook for managing measurement points
 */

import { useState, useCallback } from 'react';
import type { Point } from '../types';
import { DEFAULTS } from '../constants';
import { logger } from '../utils/logger';

interface UseMeasurementPointsReturn {
    points: [Point, Point];
    setPoints: (points: [Point, Point]) => void;
    reset: () => void;
}

export function useMeasurementPoints(): UseMeasurementPointsReturn {
    const [points, setPoints] = useState<[Point, Point]>([
        { ...DEFAULTS.POINTS[0] },
        { ...DEFAULTS.POINTS[1] },
    ]);

    const reset = useCallback(() => {
        setPoints([
            { ...DEFAULTS.POINTS[0] },
            { ...DEFAULTS.POINTS[1] },
        ]);
        logger.info('Measurement points reset');
    }, []);

    return {
        points,
        setPoints,
        reset,
    };
}
