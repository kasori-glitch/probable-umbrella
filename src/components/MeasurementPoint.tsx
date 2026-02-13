import React from 'react';

interface MeasurementPointProps {
    x: number; // Percentage 0-1
    y: number; // Percentage 0-1
    label: string;
    color: string;
    isActive?: boolean;
    isSnapping?: boolean;
    onPointerDown: (e: React.PointerEvent) => void;
}

export const MeasurementPoint: React.FC<MeasurementPointProps> = ({
    x,
    y,
    label,
    color,
    isActive,
    isSnapping,
    onPointerDown
}) => {
    return (
        <div
            className={`measurement-point ${isSnapping ? 'point-snapping' : ''}`}
            onPointerDown={onPointerDown}
            style={{
                position: 'absolute',
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'grab',
                zIndex: isActive ? 20 : 10,
                touchAction: 'none' // Prevent scrolling while dragging
            }}
        >
            {/* Outer glow/hit area */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: color,
                opacity: 0.2,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
            }} />

            {/* Core point */}
            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: `2px solid ${color}`,
                backgroundColor: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(2px)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
                {/* Crosshair center */}
                <div style={{ width: '2px', height: '8px', background: color, position: 'absolute' }} />
                <div style={{ width: '8px', height: '2px', background: color, position: 'absolute' }} />
            </div>

            {/* Label */}
            <div style={{
                position: 'absolute',
                top: '-24px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                color: 'white',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
            }}>
                {label}
            </div>
        </div>
    );
};
