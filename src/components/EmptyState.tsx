import React from 'react';
import { Upload, AlertTriangle, Scan, Ruler, MousePointer2 } from 'lucide-react';

interface EmptyStateProps {
    onImageSelect: (file: File) => void;
    onCalibrateSelect: (file: File) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onImageSelect, onCalibrateSelect }) => {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isCalibration: boolean) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isCalibration) {
                onCalibrateSelect(file);
            } else {
                onImageSelect(file);
            }
        }
    };

    return (
        <div className="empty-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            gap: '32px',
            textAlign: 'center',
            background: 'radial-gradient(circle at center, rgba(0,255,136,0.03) 0%, rgba(0,0,0,0) 70%)'
        }}>

            {/* Visual Hero Section */}
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid var(--primary)', borderRadius: '50%', opacity: 0.2, animation: 'pulse 3s infinite' }}></div>
                <div style={{ position: 'absolute', width: '70%', height: '70%', border: '1px dashed var(--primary)', borderRadius: '50%', opacity: 0.5, animation: 'spin 10s linear infinite' }}></div>
                <Scan size={48} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px var(--primary-glow))' }} />

                {/* Floating decor icons */}
                <Ruler size={20} style={{
                    position: 'absolute',
                    top: -10,
                    right: 0,
                    color: 'var(--text-muted)',
                    opacity: 0.5,
                    animation: 'float 4s ease-in-out infinite'
                }} />
                <MousePointer2 size={20} style={{
                    position: 'absolute',
                    bottom: 10,
                    left: -10,
                    color: 'var(--text-muted)',
                    opacity: 0.5,
                    animation: 'float-reverse 5s ease-in-out infinite'
                }} />
            </div>

            <div>
                <h1 style={{
                    fontSize: '4rem',
                    margin: '0',
                    background: 'linear-gradient(to right, var(--primary), #fff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px',
                    fontFamily: '"Exo 2", sans-serif'
                }}>
                    MEASURE
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '8px', maxWidth: '400px', lineHeight: 1.5 }}>
                    Precision On-Screen Tool
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', maxWidth: '320px', zIndex: 10 }}>

                {/* Main Action */}
                <label
                    className="btn"
                    style={{
                        fontSize: '1.2rem',
                        padding: '16px 32px',
                        width: '100%',
                        background: 'var(--primary)',
                        color: '#000',
                        border: 'none',
                        boxShadow: '0 0 25px var(--primary-glow)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Upload size={24} />
                    START MEASURE
                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, false)} />
                </label>

                {/* Secondary Action */}
                <label
                    className="btn"
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text-light)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        fontSize: '0.9rem'
                    }}
                >
                    <Ruler size={16} color="var(--primary)" />
                    Calibrate Scale (Upload Ref)
                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, true)} />
                </label>
            </div>

            {/* Disclaimer / Warning Section */}
            <div style={{
                marginTop: '32px',
                maxWidth: '500px',
                background: 'rgba(255,50,50,0.05)',
                border: '1px solid rgba(255,50,50,0.1)',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'start',
                textAlign: 'left'
            }}>
                <AlertTriangle size={20} color="#ff4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <strong style={{ color: '#ff4444', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Accuracy Warning</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Measurements are estimates. Perspective distortion, camera angle, and lens curvature can affect accuracy.
                        Ensure the camera was parallel to the object for best results.
                    </p>
                </div>
            </div>

        </div>
    );
};
