/**
 * Image processing utilities
 */

import { IMAGE_DISPLAY, ERROR_MESSAGES } from '../constants';
import { logger } from './logger';

/**
 * Resizes an image to fit within max dimensions while maintaining aspect ratio
 */
export async function resizeImage(
    file: File,
    maxWidth: number = IMAGE_DISPLAY.RESIZE_MAX_WIDTH,
    maxHeight: number = IMAGE_DISPLAY.RESIZE_MAX_HEIGHT
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => {
            logger.error('FileReader error', { fileName: file.name });
            reject(new Error(ERROR_MESSAGES.FILE_LOAD_FAILED));
        };

        reader.onload = async (e) => {
            try {
                const result = e.target?.result;

                if (typeof result !== 'string') {
                    throw new Error(ERROR_MESSAGES.INVALID_IMAGE_DATA);
                }

                // Create image element to get dimensions
                const img = new Image();

                img.onerror = () => {
                    logger.error('Image load error', { fileName: file.name });
                    reject(new Error(ERROR_MESSAGES.FILE_LOAD_FAILED));
                };

                img.onload = () => {
                    try {
                        // Calculate scale to fit within max dimensions
                        const scale = Math.min(
                            maxWidth / img.width,
                            maxHeight / img.height,
                            1 // Don't upscale
                        );

                        // If no resize needed, return original
                        if (scale === 1) {
                            logger.info('No resize needed', {
                                width: img.width,
                                height: img.height,
                            });
                            resolve(result);
                            return;
                        }

                        // Create canvas for resizing
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                            throw new Error('Failed to get canvas context');
                        }

                        canvas.width = img.width * scale;
                        canvas.height = img.height * scale;

                        // Draw resized image
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Convert to data URL
                        const resizedDataUrl = canvas.toDataURL(
                            'image/jpeg',
                            IMAGE_DISPLAY.RESIZE_QUALITY
                        );

                        logger.info('Image resized', {
                            originalWidth: img.width,
                            originalHeight: img.height,
                            newWidth: canvas.width,
                            newHeight: canvas.height,
                            scale,
                        });

                        resolve(resizedDataUrl);
                    } catch (error) {
                        logger.error('Image resize error', { error });
                        reject(error);
                    }
                };

                img.src = result;
            } catch (error) {
                logger.error('Image processing error', { error });
                reject(error);
            }
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Loads an image file and returns a data URL
 * Includes validation and error handling
 */
export async function loadImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => {
            logger.error('Failed to read file', { fileName: file.name, size: file.size });
            reject(new Error(ERROR_MESSAGES.FILE_LOAD_FAILED));
        };

        reader.onload = (e) => {
            const result = e.target?.result;

            if (typeof result !== 'string') {
                logger.error('Invalid file result type', { type: typeof result });
                reject(new Error(ERROR_MESSAGES.INVALID_IMAGE_DATA));
                return;
            }

            logger.info('Image loaded successfully', {
                fileName: file.name,
                size: file.size,
            });

            resolve(result);
        };

        reader.readAsDataURL(file);
    });
}
