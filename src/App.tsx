import { useState, useCallback, useEffect } from 'react';
import './App.css';
import { ImageWorkspace } from './components/ImageWorkspace';
import { ControlPanel } from './components/ControlPanel';
import { CalibrationModal } from './components/CalibrationModal';
import { EmptyState } from './components/EmptyState';
import { ErrorAlert } from './components/ErrorAlert';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useCalibration } from './hooks/useCalibration';
import { useImageUpload } from './hooks/useImageUpload';
import { useMeasurementPoints } from './hooks/useMeasurementPoints';
import { useSavedMeasurements } from './hooks/useSavedMeasurements';
import { useMeasurement } from './hooks/useMeasurement';
import type { Unit, Dimensions, CalibrationInput } from './types';
import { DEFAULTS } from './constants';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { logger } from './utils/logger';
import { renderMeasurementToImage, type ExportMeasurement } from './lib/exportUtils';
import { App as CapApp } from '@capacitor/app';

function MeasureApp() {
  // Handle Android Back Button
  useEffect(() => {
    CapApp.addListener('backButton', (data: { canGoBack: boolean }) => {
      if (!data.canGoBack) {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      CapApp.removeAllListeners();
    };
  }, []);

  // Custom hooks for state management
  const calibration = useCalibration();
  const imageUpload = useImageUpload();
  const measurementPoints = useMeasurementPoints();
  const savedMeasurements = useSavedMeasurements();

  // Local UI state
  const [screenDimensions, setScreenDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [isDraggingPoints, setIsDraggingPoints] = useState(false);
  const [unit, setUnit] = useState<Unit>(DEFAULTS.UNIT);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [calibrationError, setCalibrationError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('tutorial_completed') !== 'true';
  });
  const [previewImage, setPreviewImage] = useState<{ blob: Blob; url: string } | null>(null);

  // Calculate measurements
  const measurement = useMeasurement(
    measurementPoints.points,
    screenDimensions,
    calibration.calibration,
    unit
  );

  // Handle file upload
  const handleFileLoad = useCallback(
    async (file: File, isCalibrationMode: boolean) => {
      await imageUpload.loadImage(file);

      if (isCalibrationMode && !imageUpload.error) {
        setIsCalibrating(true);
      }
    },
    [imageUpload]
  );

  // Handle calibration confirmation
  const handleCalibrationConfirm = useCallback(
    (realLength: number, inputUnit: 'cm' | 'inch') => {
      const input: CalibrationInput = { realLength, unit: inputUnit };
      const result = calibration.calibrate(measurement.screenDistancePx, input);

      if (!result.success) {
        setCalibrationError(result.error || 'Calibration failed');
        return;
      }

      // Success - close modals and update unit
      setIsInputModalOpen(false);
      setIsCalibrating(false);
      setCalibrationError(null);
      setUnit(inputUnit);

      logger.info('Calibration completed successfully');
    },
    [calibration, measurement.screenDistancePx]
  );

  // Handle reset points
  const handleResetPoints = useCallback(() => {
    measurementPoints.reset();
    calibration.reset();
    setUnit(DEFAULTS.UNIT);
    logger.info('Points and calibration reset');
  }, [measurementPoints, calibration]);

  // Handle reset image
  const handleResetImage = useCallback(() => {
    imageUpload.clearImage();
    measurementPoints.reset();
    calibration.reset();
    setUnit(DEFAULTS.UNIT);
    setIsCalibrating(false);
    setIsInputModalOpen(false);
    setIsDraggingPoints(false);
    setCalibrationError(null);
    logger.info('App reset to initial state');
  }, [imageUpload, measurementPoints, calibration]);

  // Handle dimension changes
  const handleDimensionsChange = useCallback((width: number, height: number) => {
    setScreenDimensions({ width, height });
  }, []);

  // Handle image export/download
  const prepareExportData = useCallback((): ExportMeasurement[] => {
    const current: ExportMeasurement = {
      points: measurementPoints.points,
      value: measurement.displayValue,
      unit: unit
    };

    const saved: ExportMeasurement[] = savedMeasurements.savedMeasurements.map(sm => ({
      points: sm.points,
      value: sm.value,
      unit: sm.unit
    }));

    return [current, ...saved];
  }, [measurementPoints.points, measurement.displayValue, unit, savedMeasurements.savedMeasurements]);

  const handleDownload = useCallback(async () => {
    if (!imageUpload.imageSrc) return;

    try {
      logger.info('Generating image for preview...');
      const measurements = prepareExportData();
      const blob = await renderMeasurementToImage(imageUpload.imageSrc, measurements);

      if (!blob) {
        throw new Error('Failed to render image');
      }

      setPreviewImage({ blob, url: URL.createObjectURL(blob) });
      logger.info('Image preview opened');
    } catch (error) {
      logger.error('Export failed', { error });
      setCalibrationError('Failed to prepare image. Please try again.');
    }
  }, [imageUpload.imageSrc, prepareExportData]);

  const handleShare = handleDownload; // Both now open the preview modal for consistency on mobile

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      {/* Error alerts */}
      {imageUpload.error && (
        <ErrorAlert message={imageUpload.error} onDismiss={imageUpload.clearError} />
      )}
      {calibrationError && (
        <ErrorAlert message={calibrationError} onDismiss={() => setCalibrationError(null)} />
      )}

      {/* Loading spinner */}
      {imageUpload.isLoading && <LoadingSpinner />}

      {/* Main content */}
      {!imageUpload.imageSrc ? (
        <EmptyState
          onImageSelect={(file) => handleFileLoad(file, false)}
          onCalibrateSelect={(file) => handleFileLoad(file, true)}
        />
      ) : (
        <div className="workspace-layout" style={{ display: 'flex', flex: 1, height: 'calc(100vh - var(--header-height))', overflow: 'hidden' }}>
          <div className="workspace" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <ImageWorkspace
                imageSrc={imageUpload.imageSrc}
                points={measurementPoints.points}
                onPointsChange={measurementPoints.setPoints}
                onDimensionsChange={handleDimensionsChange}
                onDragStart={() => setIsDraggingPoints(true)}
                onDragEnd={() => setIsDraggingPoints(false)}
              />
            </div>

            <div
              className={isDraggingPoints ? 'control-panel-hidden' : ''}
              style={{
                opacity: isDraggingPoints ? 0 : 1,
                pointerEvents: isDraggingPoints ? 'none' : 'auto',
                transition: 'opacity 0.2s ease-in-out'
              }}
            >
              <ControlPanel
                distance={measurement.displayValue}
                unit={unit}
                isCalibrated={calibration.isCalibrated}
                isCalibratingMode={isCalibrating}
                onUnitChange={setUnit}
                onCalibrateStart={() => setIsCalibrating(true)}
                onCalibrateConfirm={() => setIsInputModalOpen(true)}
                onCalibrateCancel={() => setIsCalibrating(false)}
                onResetPoints={handleResetPoints}
                onResetImage={handleResetImage}
                onExport={handleShare}
                onDownload={handleDownload}
              />
            </div>

            {isInputModalOpen && (
              <CalibrationModal
                currentPixels={measurement.screenDistancePx}
                onConfirm={handleCalibrationConfirm}
                onCancel={() => {
                  setIsInputModalOpen(false);
                  setCalibrationError(null);
                }}
              />
            )}
          </div>

          <Sidebar
            savedMeasurements={savedMeasurements.savedMeasurements}
            canSave={savedMeasurements.canSave}
            onSaveMeasurement={() => savedMeasurements.saveMeasurement(measurementPoints.points, measurement.displayValue, unit)}
            onDeleteMeasurement={savedMeasurements.deleteMeasurement}
            onRenameMeasurement={savedMeasurements.renameMeasurement}
          />
        </div>
      )}
      {/* Onboarding Tutorial Overlay */}
      {showTutorial && (
        <OnboardingTutorial
          onComplete={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorial_completed', 'true');
          }}
        />
      )}
      {/* Image Preview / Save Modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          imageBlob={previewImage.blob}
          onClose={() => {
            URL.revokeObjectURL(previewImage.url);
            setPreviewImage(null);
          }}
        />
      )}
    </div>
  );
}

export default MeasureApp;
