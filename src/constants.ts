/**
 * Application-wide constants
 * Centralized to avoid magic numbers and ensure consistency
 */

// File Upload Constraints
export const FILE_UPLOAD = {
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// Image Display
export const IMAGE_DISPLAY = {
    MAX_HEIGHT: '80vh',
    MAX_WIDTH: '100%',
    RESIZE_MAX_WIDTH: 2000,
    RESIZE_MAX_HEIGHT: 2000,
    RESIZE_QUALITY: 0.9,
} as const;

// Layout
export const LAYOUT = {
    PANEL_WIDTH: '90%',
    PANEL_MAX_WIDTH_SM: '500px',
    PANEL_MAX_WIDTH_MD: '600px',
    SPACING_SM: '12px',
    SPACING_MD: '20px',
    SPACING_LG: '32px',
} as const;

// Measurement Points
export const MEASUREMENT = {
    DEFAULT_POINT_A: { x: 0.3, y: 0.5 },
    DEFAULT_POINT_B: { x: 0.7, y: 0.5 },
    HIT_AREA_SIZE: 40,
    POINT_SIZE: 24,
    MIN_CALIBRATION_CM: 0.1,
    MAX_CALIBRATION_CM: 1000,
    MIN_CALIBRATION_INCH: 0.04,
    MAX_CALIBRATION_INCH: 393.7, // ~1000cm
} as const;

// Magnifier
export const MAGNIFIER = {
    DEFAULT_ZOOM: 2,
    DEFAULT_SIZE: 120,
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
    CALIBRATION: 'measure-app-calibration',
    SAVED_MEASUREMENTS: 'measure-app-saved-measurements',
} as const;

// Calibration Presets
export const CALIBRATION_PRESETS = {
    CREDIT_CARD_CM: 8.56,
    CREDIT_CARD_INCH: 3.37,
    EUR_2_COIN_CM: 2.575,
    USD_QUARTER_CM: 2.426,
} as const;

// Animation Durations
export const ANIMATION = {
    FADE_DURATION_MS: 200,
    TRANSITION_DURATION: '0.2s',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE_BYTES / 1024 / 1024}MB`,
    INVALID_FILE_TYPE: 'Only JPEG, PNG, and WebP images are allowed',
    FILE_LOAD_FAILED: 'Failed to load image. Please try a different file.',
    INVALID_IMAGE_DATA: 'Invalid image data',
    CALIBRATION_LOAD_FAILED: 'Failed to load saved calibration',
    CALIBRATION_SAVE_FAILED: 'Failed to save calibration',
    INVALID_CALIBRATION_VALUE: 'Please enter a valid positive number',
    CALIBRATION_OUT_OF_RANGE: (min: number, max: number, unit: string) =>
        `Length must be between ${min}${unit} and ${max}${unit}`,
    CALIBRATION_CALCULATION_FAILED: 'Calibration calculation failed',
    ADJUST_POINTS_FIRST: 'Please adjust measurement points first',
    STORAGE_NOT_AVAILABLE: 'Browser storage is not available',
} as const;

// Default Values
export const DEFAULTS = {
    CALIBRATION: {
        pixelsPerCm: 0,
        isCalibrated: false,
    },
    POINTS: [
        MEASUREMENT.DEFAULT_POINT_A,
        MEASUREMENT.DEFAULT_POINT_B,
    ] as const,
    UNIT: 'px' as const,
} as const;
