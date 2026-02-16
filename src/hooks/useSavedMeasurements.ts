import { useState, useCallback } from 'react';
import type { Point, Unit, SavedMeasurement } from '../types';
import { logger } from '../utils/logger';

export function useSavedMeasurements() {
    const [savedMeasurements, setSavedMeasurements] = useState<SavedMeasurement[]>([]);

    const saveMeasurement = useCallback((points: [Point, Point], value: number, unit: Unit) => {
        setSavedMeasurements(prev => {
            if (prev.length >= 10) {
                logger.warn('Maximum 10 measurements reached');
                return prev;
            }

            const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const newMeasurement: SavedMeasurement = {
                id: newId,
                name: `Measure ${prev.length + 1}`,
                points: [...points],
                value,
                unit,
                timestamp: Date.now()
            };

            logger.info(`Measurement saved: ${newMeasurement.name}`);
            return [...prev, newMeasurement];
        });
    }, []);

    const deleteMeasurement = useCallback((id: string) => {
        setSavedMeasurements(prev => {
            const filtered = prev.filter(m => m.id !== id);
            logger.info(`Measurement deleted: ${id}`);
            return filtered;
        });
    }, []);

    const renameMeasurement = useCallback((id: string, newName: string) => {
        setSavedMeasurements(prev => {
            const updated = prev.map(m => m.id === id ? { ...m, name: newName } : m);
            logger.info(`Measurement renamed to: ${newName}`);
            return updated;
        });
    }, []);

    return {
        savedMeasurements,
        saveMeasurement,
        deleteMeasurement,
        renameMeasurement,
        canSave: savedMeasurements.length < 10
    };
}
