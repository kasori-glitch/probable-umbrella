/**
 * Loading Spinner Component
 */

import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 999,
            }}
        >
            <div
                style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid rgba(0, 240, 255, 0.2)',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }}
            />
        </div>
    );
};
