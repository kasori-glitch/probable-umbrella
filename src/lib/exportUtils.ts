/**
 * Export Utilities for Image Rendering and Sharing
 */
import type { Point, Unit } from '../types';
import { logger } from '../utils/logger';

/**
 * Renders the current measurement onto the original image using a canvas.
 * Returns a blob of the resulting image.
 */
export async function renderMeasurementToImage(
    imageSrc: string,
    points: [Point, Point],
    value: number,
    unit: Unit
): Promise<Blob | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Important for external images if any
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                logger.error('Could not get canvas context');
                resolve(null);
                return;
            }

            // Set high resolution based on natural image size
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Calculate pixel positions
            const x1 = points[0].x * canvas.width;
            const y1 = points[0].y * canvas.height;
            const x2 = points[1].x * canvas.width;
            const y2 = points[1].y * canvas.height;

            // Styles for the measurement line
            const primaryColor = '#00f0ff'; // Cyberpunk Cyan

            // Draw dark shadow for better visibility on any background
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;

            // Draw the line
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = Math.max(4, canvas.width / 200); // Scale line width with image size
            ctx.lineCap = 'round';
            ctx.stroke();

            // Draw Points A and B
            const pointRadius = Math.max(8, canvas.width / 100);

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

            // Draw Label background pill
            const text = `${value.toFixed(2)} ${unit}`;
            const fontSize = Math.max(24, canvas.width / 40);
            ctx.font = `bold ${fontSize}px "Exo 2", sans-serif`;
            const textMetrics = ctx.measureText(text);
            const padding = fontSize / 2;
            const pillWidth = textMetrics.width + padding * 2;
            const pillHeight = fontSize + padding;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            ctx.save();
            ctx.translate(midX, midY);

            // Draw background pill
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            const r = pillHeight / 2;
            ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, r);
            ctx.fill();
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, 0);
            ctx.restore();

            // Add Watermark
            ctx.shadowBlur = 0; // Disable shadow for watermark
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
export function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Shares a blob using the Web Share API if supported
 */
export async function shareBlob(blob: Blob, fileName: string): Promise<boolean> {
    if (!navigator.share || !navigator.canShare) {
        return false;
    }

    const file = new File([blob], fileName, { type: blob.type });
    const shareData = {
        files: [file],
        title: 'Measurement Export',
        text: 'Sent from On Screen Mesure app'
    };

    if (navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            return true;
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                logger.error('Error sharing image', { error: error as Error });
            }
            return false;
        }
    }

    return false;
}
