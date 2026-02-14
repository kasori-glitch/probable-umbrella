/**
 * Export Utilities for Image Rendering and Sharing
 */
import type { Point, Unit } from '../types';
import { logger } from '../utils/logger';

/**
 * Renders the current measurement onto the original image using a canvas.
 * Returns a blob of the resulting image.
 */
export interface ExportMeasurement {
    points: [Point, Point];
    value: number;
    unit: Unit;
}

/**
 * Renders multiple measurements onto the original image using a canvas.
 * Returns a blob of the resulting image.
 */
export async function renderMeasurementToImage(
    imageSrc: string,
    measurements: ExportMeasurement[]
): Promise<Blob | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                logger.error('Could not get canvas context');
                resolve(null);
                return;
            }

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            // Styles
            const primaryColor = '#00f0ff';
            const fontSize = Math.max(24, canvas.width / 40);
            const pointRadius = Math.max(8, canvas.width / 100);
            const lineWidth = Math.max(4, canvas.width / 200);

            measurements.forEach((m) => {
                const { points, value, unit } = m;
                const x1 = points[0].x * canvas.width;
                const y1 = points[0].y * canvas.height;
                const x2 = points[1].x * canvas.width;
                const y2 = points[1].y * canvas.height;

                ctx.save();

                // Draw dark shadow
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;

                // Draw line
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw points
                ctx.beginPath();
                ctx.arc(x1, y1, pointRadius, 0, Math.PI * 2);
                ctx.fillStyle = primaryColor;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x2, y2, pointRadius, 0, Math.PI * 2);
                ctx.fillStyle = primaryColor;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw Label
                const text = `${value.toFixed(2)} ${unit}`;
                ctx.font = `bold ${fontSize}px "Exo 2", sans-serif`;
                const textMetrics = ctx.measureText(text);
                const padding = fontSize / 2;
                const pillWidth = textMetrics.width + padding * 2;
                const pillHeight = fontSize + padding;

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                ctx.translate(midX, midY);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.beginPath();
                const r = pillHeight / 2;
                ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, r);
                ctx.fill();
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 0, 0);

                ctx.restore();
            });

            // Add Watermark
            const watermarkText = 'Measured with On Screen Mesure';
            const watermarkSize = Math.max(16, canvas.width / 60);
            ctx.font = `${watermarkSize}px "Inter", sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.textAlign = 'right';
            ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        };

        img.onerror = () => {
            logger.error('Failed to load image for export');
            resolve(null);
        };
    });
}

/**
 * Downloads a blob as a file
 */
export async function downloadBlob(blob: Blob, fileName: string) {
    // Convert Blob to Data URL for better mobile compatibility
    // Many mobile browsers/WebViews block Blob URLs for security or simply don't handle them for 'a' tag downloads
    const reader = new FileReader();
    reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = dataUrl;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    };
    reader.onerror = () => {
        logger.error('Failed to convert blob to data URL for download');
    };
    reader.readAsDataURL(blob);
}

/**
 * Shares a blob using the Web Share API if supported
 */
export async function shareBlob(blob: Blob, fileName: string): Promise<boolean> {
    try {
        if (!navigator.share || !navigator.canShare) {
            logger.warn('Web Share API not supported');
            return false;
        }

        const file = new File([blob], fileName, { type: blob.type });
        const shareData = {
            files: [file],
            title: 'Measurement Export',
            text: 'Sent from On Screen Mesure app'
        };

        if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return true;
        } else {
            logger.warn('Browser cannot share this file data');
            return false;
        }
    } catch (error) {
        if ((error as Error).name !== 'AbortError') {
            logger.error('Error sharing image', { error: error as Error });
        }
        return false;
    }
}
