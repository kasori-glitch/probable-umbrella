/**
 * Custom hook for managing image upload and loading
 */

import { useState, useCallback } from 'react';
import { validateImageFile } from '../utils/validation';
import { resizeImage } from '../utils/imageUtils';
import { logger } from '../utils/logger';

interface UseImageUploadReturn {
    imageSrc: string | null;
    error: string | null;
    isLoading: boolean;
    loadImage: (file: File) => Promise<void>;
    clearImage: () => void;
    clearError: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadImage = useCallback(async (file: File) => {
        // Clear previous state
        setError(null);
        setIsLoading(true);

        try {
            // Validate file
            const validation = validateImageFile(file);
            if (!validation.valid) {
                setError(validation.error!);
                setIsLoading(false);
                return;
            }

            logger.info('Loading image', { fileName: file.name, size: file.size });

            // Resize and load image
            const dataUrl = await resizeImage(file);
            setImageSrc(dataUrl);

            logger.info('Image loaded successfully');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load image';
            logger.error('Image load failed', { error: err });
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearImage = useCallback(() => {
        setImageSrc(null);
        setError(null);
        logger.info('Image cleared');
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        imageSrc,
        error,
        isLoading,
        loadImage,
        clearImage,
        clearError,
    };
}
