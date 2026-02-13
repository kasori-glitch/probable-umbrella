/**
 * Computer Vision Utilities for Magnet-Snap (Edge Intelligence)
 */

interface Point {
    x: number;
    y: number;
}

/**
 * Finds the pixel with the highest contrast (gradient) in a small ROI around the point.
 * This is a lightweight "magnet-snap" implementation using HTML5 Canvas.
 */
export async function findBestSnapPoint(
    imageElement: HTMLImageElement,
    normalizedPoint: Point,
    roiSize: number = 40,
    sensitivity: number = 20
): Promise<Point | null> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const { naturalWidth, naturalHeight } = imageElement;

    // Pixel coordinates
    const px = normalizedPoint.x * naturalWidth;
    const py = normalizedPoint.y * naturalHeight;

    // ROI boundaries
    const startX = Math.max(0, px - roiSize / 2);
    const startY = Math.max(0, py - roiSize / 2);
    const width = Math.min(naturalWidth - startX, roiSize);
    const height = Math.min(naturalHeight - startY, roiSize);

    if (width <= 0 || height <= 0) return null;

    canvas.width = width;
    canvas.height = height;

    // Draw the ROI to the tiny temporary canvas
    ctx.drawImage(
        imageElement,
        startX, startY, width, height,
        0, 0, width, height
    );

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let maxGradient = -1;
    let bestX = roiSize / 2;
    let bestY = roiSize / 2;

    // Sobel-like simple gradient detection
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Greyscale luminance: 0.299R + 0.587G + 0.114B
            const getLum = (ox: number, oy: number) => {
                const i = ((y + oy) * width + (x + ox)) * 4;
                return (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            };

            // Simple Sobel kernels
            const gx =
                -1 * getLum(-1, -1) + 1 * getLum(1, -1) +
                -2 * getLum(-1, 0) + 2 * getLum(1, 0) +
                -1 * getLum(-1, 1) + 1 * getLum(1, 1);

            const gy =
                -1 * getLum(-1, -1) - 2 * getLum(0, -1) - 1 * getLum(1, -1) +
                1 * getLum(-1, 1) + 2 * getLum(0, 1) + 1 * getLum(1, 1);

            const gradient = Math.sqrt(gx * gx + gy * gy);

            if (gradient > maxGradient) {
                maxGradient = gradient;
                bestX = x;
                bestY = y;
            }
        }
    }

    // Only snap if the gradient is significant (avoid snapping to noise)
    if (maxGradient < sensitivity) {
        return null;
    }

    // Convert back to normalized coordinates
    return {
        x: (startX + bestX) / naturalWidth,
        y: (startY + bestY) / naturalHeight
    };
}
