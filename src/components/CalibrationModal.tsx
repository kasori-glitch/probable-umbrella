import React, { useState } from 'react';

interface CalibrationModalProps {
    currentPixels: number;
    onConfirm: (realLength: number, unit: 'cm' | 'inch') => void;
    onCancel: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
    currentPixels,
    onConfirm,
    onCancel
}) => {
    const [value, setValue] = useState<string>('');
    const [unit, setUnit] = useState<'cm' | 'inch'>('cm');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseFloat(value);
        if (!isNaN(num) && num > 0) {
            onConfirm(num, unit);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="glass-panel" style={{ padding: '30px', width: '90%', maxWidth: '400px' }}>
                <h2 style={{ marginTop: 0 }}>Calibrate Scale</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Enter the known real-world distance between points A and B.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => { setValue('8.56'); setUnit('cm'); }}
                        style={{ flex: 1, fontSize: '13px', padding: '8px', background: 'rgba(255,255,255,0.1)' }}
                    >
                        💳 Credit Card
                    </button>
                    {/* Add more presets here if needed */}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            placeholder="Length"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            style={{ flex: 1 }}
                            autoFocus
                            step="0.01"
                        />
                        <select
                            value={unit}
                            onChange={e => setUnit(e.target.value as any)}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '0 10px'
                            }}
                        >
                            <option value="cm">cm</option>
                            <option value="inch">inch</option>
                        </select>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Current separation: {currentPixels.toFixed(0)} image pixels
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="button" className="btn" onClick={onCancel} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Save Calibration
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
