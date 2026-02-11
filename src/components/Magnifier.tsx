import React from 'react';

interface MagnifierProps {
    imageSrc: string;
    x: number; // Normalized 0-1
    y: number; // Normalized 0-1
    parentWidth: number; // Width of the displayed image in pixels
    parentHeight: number; // Height of the displayed image in pixels
    zoom?: number;
    size?: number;
}

export const Magnifier: React.FC<MagnifierProps> = ({
    imageSrc,
    x,
    y,
    parentWidth,
    parentHeight,
    zoom = 2,
    size = 120
}) => {
    // Calculate the dimensions of the zoomed image
    const zoomedWidth = parentWidth * zoom;
    const zoomedHeight = parentHeight * zoom;

    // Calculate the position to center the view on (x, y)
    // We want the point (x, y) on the zoomed image to be at the center of the loupe (size/2)
    const left = -x * zoomedWidth + size / 2;
    const top = -y * zoomedHeight + size / 2;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                transform: 'translate(-50%, -120%)', // Lift it up above the finger
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                zIndex: 100,
                backgroundColor: '#000',
                pointerEvents: 'none', // Allow events to pass through to the drag handler below if needed
                backgroundImage: `url(${imageSrc})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `${left}px ${top}px`,
                backgroundSize: `${zoomedWidth}px ${zoomedHeight}px`
            }}
        >
            {/* Background Image is used for performance and pixel perfection. 
          The background position and size are calculated to show exactly the zoomed area.
      */}

            {/* Crosshair inside magnifier */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '12px',
                height: '2px',
                background: 'rgba(255, 0, 60, 0.8)', // High contrast red
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 2px white'
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2px',
                height: '12px',
                background: 'rgba(255, 0, 60, 0.8)',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 2px white'
            }} />
        </div>
    );
};
