import React from 'react';
import { Image as ImageIcon, RotateCcw, Ruler, Share2, Download } from 'lucide-react'; // Import icons
import type { Unit } from '../types';

interface ControlPanelProps {
    distance: number;
    manualDistance: number | null;
    onManualDistanceChange: (val: number | null) => void;
    unit: Unit;
    isCalibrated: boolean;
    isCalibratingMode: boolean; // Used to conditionally render UI
    onUnitChange: (u: Unit) => void;
    onCalibrateStart: () => void; // Renamed from onCalibrate
    onCalibrateConfirm: () => void; // New handler for proceeding to input
    onCalibrateCancel: () => void;
    onResetPoints: () => void;
    onResetImage: () => void;
    onExport: () => void;
    onDownload: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    distance,
    manualDistance,
    onManualDistanceChange,
    unit,
    isCalibrated,
    isCalibratingMode,
    onUnitChange,
    onCalibrateStart,
    onCalibrateConfirm,
    onCalibrateCancel,
    onResetPoints,
    onResetImage,
    onExport,
    onDownload
}) => {
    // Local state for the input field to allow smooth typing
    const [inputValue, setInputValue] = React.useState<string>('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync local input value with distance/manualDistance when NOT focused
    React.useEffect(() => {
        if (!isFocused) {
            setInputValue(manualDistance !== null ? manualDistance.toString() : distance.toFixed(2));
        }
    }, [distance, manualDistance, isFocused]);

    // Conditional rendering for calibration mode
    if (isCalibratingMode) {
        return (
            <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '500px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: 10
            }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Calibration Mode</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                    Drag points A and B to match the edges of a real-world object (e.g., credit card).
                </p>
                <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
                    <button
                        className="btn"
                        onClick={onCalibrateCancel}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onCalibrateConfirm}
                        style={{ flex: 1 }}
                    >
                        Set Length (Done)
                    </button>
                </div>
            </div>
        );
    }

    const isManual = manualDistance !== null;

    // Default view for measurement mode
    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '40px', // Lift it up more
            left: '50%',
            transform: 'translateX(-50%)',
            width: '94%',
            maxWidth: '540px',
            padding: '16px',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', // Mobile safety
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 10,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
            {/* Top Section: Distance display and units */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '160px' }}>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setIsFocused(false);
                            const val = parseFloat(inputValue);
                            if (!isNaN(val) && val > 0) {
                                onManualDistanceChange(val);
                            } else {
                                onManualDistanceChange(null);
                            }
                        }}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                                onManualDistanceChange(val);
                            }
                        }}
                        className="allow-select"
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-family-display)',
                            color: isManual ? 'var(--primary)' : 'var(--text-light)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: isManual ? '2px solid var(--primary)' : '1px solid transparent',
                            width: '140px',
                            textAlign: 'right',
                            lineHeight: 1,
                            padding: '2px',
                            outline: 'none',
                            textShadow: isManual ? '0 0 10px var(--primary-glow)' : 'none',
                            borderRadius: 0,
                            WebkitAppearance: 'none',
                            margin: 0
                        }}
                    />
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {unit}
                    </span>
                    {isManual && (
                        <button
                            onClick={() => onManualDistanceChange(null)}
                            style={{
                                position: 'absolute',
                                right: '-25px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontSize: '8px'
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '6px' }}>
                    {(['px', 'cm', 'inch'] as Unit[]).map((u) => (
                        <button
                            key={u}
                            onClick={() => onUnitChange(u)}
                            style={{
                                background: unit === u ? 'var(--primary)' : 'transparent',
                                color: unit === u ? '#000' : 'var(--text-muted)',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                transition: 'all 0.15s'
                            }}
                        >
                            {u.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Section: Primary Actions */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    <button
                        className="btn"
                        onClick={onResetPoints}
                        title="Reset (Points Only)"
                        style={{
                            padding: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: 'transparent',
                            borderRadius: '8px',
                            flex: 1
                        }}
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        className="btn"
                        onClick={onResetImage}
                        title="New Image"
                        style={{
                            padding: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: 'transparent',
                            borderRadius: '8px',
                            flex: 1
                        }}
                    >
                        <ImageIcon size={18} />
                    </button>
                    <button
                        className="btn"
                        onClick={onCalibrateStart}
                        title={isCalibrated ? 'Recalibrate' : 'Calibrate'}
                        style={{
                            padding: '8px',
                            background: isCalibrated ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                            borderColor: isCalibrated ? '#2ecc71' : '#e74c3c',
                            color: isCalibrated ? '#2ecc71' : '#e74c3c',
                            borderRadius: '8px',
                            flex: 1.5,
                            gap: '4px',
                            fontSize: '0.75rem'
                        }}
                    >
                        <Ruler size={16} />
                        {isCalibrated ? 'Scale Set' : 'Need Scale'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '4px', flex: 1.2 }}>
                    <button
                        className="btn btn-primary"
                        onClick={onDownload}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            flex: 1,
                            fontSize: '0.85rem',
                            gap: '6px'
                        }}
                    >
                        <Download size={18} />
                        Save
                    </button>
                    <button
                        className="btn"
                        onClick={onExport}
                        style={{
                            padding: '8px 12px',
                            background: 'rgba(0, 240, 255, 0.15)',
                            borderColor: 'var(--primary)',
                            color: 'var(--primary)',
                            borderRadius: '8px',
                            flex: 1,
                            fontSize: '0.85rem',
                            gap: '6px'
                        }}
                    >
                        <Share2 size={18} />
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};
