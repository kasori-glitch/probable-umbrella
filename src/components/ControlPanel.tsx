import React from 'react';
import { Image as ImageIcon, RotateCcw, Ruler, Share2, Download } from 'lucide-react'; // Import icons
import type { Unit } from '../types';

interface ControlPanelProps {
    distance: number;
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

    // Default view for measurement mode
    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '600px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column', // Stacked layout for better mobile fit
            gap: '20px',
            zIndex: 10
        }}>
            {/* Top Row: Distance Display */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '12px' }}>
                <span style={{
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-family-display)',
                    color: 'var(--text-light)',
                    lineHeight: 1
                }}>
                    {distance.toFixed(2)}
                </span>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
                    {(['px', 'cm', 'inch'] as Unit[]).map((u) => (
                        <button
                            key={u}
                            onClick={() => onUnitChange(u)}
                            style={{
                                background: unit === u ? 'var(--primary)' : 'transparent',
                                color: unit === u ? '#000' : 'var(--text-muted)',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            </div>

            {/* Middle Row: Calibrate Button (Red/Green logic) */}
            <button
                className="btn"
                onClick={onCalibrateStart}
                style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1.1rem',
                    backgroundColor: isCalibrated ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                    borderColor: isCalibrated ? '#2ecc71' : '#e74c3c',
                    color: isCalibrated ? '#2ecc71' : '#e74c3c',
                    boxShadow: isCalibrated ? '0 0 15px rgba(46, 204, 113, 0.3)' : '0 0 15px rgba(231, 76, 60, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                <Ruler size={18} />
                {isCalibrated ? 'Calibrated (Click to Adjust)' : '⚠ Calibration Required'}
            </button>


            {/* Bottom Row: Reset Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    className="btn"
                    onClick={onResetPoints}
                    title="Reset Points & Calibration"
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '0.9rem',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <RotateCcw size={16} />
                    Reset
                </button>
                <button
                    className="btn"
                    onClick={onResetImage}
                    title="New Image"
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '0.9rem',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <ImageIcon size={16} />
                    New
                </button>
                <button
                    className="btn btn-primary"
                    onClick={onDownload}
                    title="Download to Device"
                    style={{
                        flex: 1,
                        fontSize: '0.85rem',
                        padding: '12px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}
                >
                    <Download size={16} />
                    Save
                </button>
                <button
                    className="btn"
                    onClick={onExport}
                    title="Share Overlay"
                    style={{
                        flex: 1,
                        background: 'rgba(0, 240, 255, 0.1)',
                        borderColor: 'var(--primary)',
                        color: 'var(--primary)',
                        fontSize: '0.85rem',
                        padding: '12px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}
                >
                    <Share2 size={16} />
                    Share
                </button>
            </div>
        </div>
    );
};
