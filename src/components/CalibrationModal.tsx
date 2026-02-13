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

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => { setValue('8.56'); setUnit('cm'); }}
                        style={{
                            fontSize: '12px',
                            padding: '12px 8px',
                            background: unit === 'cm' && value === '8.56' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>💳</span>
                        <span>Credit Card</span>
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => { setValue('2.58'); setUnit('cm'); }}
                        style={{
                            fontSize: '12px',
                            padding: '12px 8px',
                            background: unit === 'cm' && value === '2.58' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>🪙</span>
                        <span>2€ Coin</span>
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => { setValue('0.95'); setUnit('inch'); }}
                        style={{
                            fontSize: '12px',
                            padding: '12px 8px',
                            background: unit === 'inch' && value === '0.95' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>🇺🇸</span>
                        <span>1$ Quarter</span>
                    </button>
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
