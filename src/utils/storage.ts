/**
 * Safe localStorage wrapper with error handling
 */

import { logger } from './logger';

/**
 * Checks if localStorage is available
 */
function isStorageAvailable(): boolean {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        logger.warn('localStorage not available', { error: e });
        return false;
    }
}

/**
 * Safely gets an item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
    if (!isStorageAvailable()) {
        logger.warn('Storage not available, using default value', { key });
        return defaultValue;
    }

    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }

        const parsed = JSON.parse(item);
        return parsed as T;
    } catch (e) {
        logger.error('Failed to get storage item', { key, error: e });
        return defaultValue;
    }
}

/**
 * Safely sets an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
    if (!isStorageAvailable()) {
        logger.warn('Storage not available, cannot save', { key });
        return false;
    }

    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (e) {
        logger.error('Failed to set storage item', { key, error: e });
        return false;
    }
}

/**
 * Safely removes an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
    if (!isStorageAvailable()) {
        return false;
    }

    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        logger.error('Failed to remove storage item', { key, error: e });
        return false;
    }
}

/**
 * Safely clears all localStorage
 */
export function clearStorage(): boolean {
    if (!isStorageAvailable()) {
        return false;
    }

    try {
        localStorage.clear();
        return true;
    } catch (e) {
        logger.error('Failed to clear storage', { error: e });
        return false;
    }
}
