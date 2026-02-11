/**
 * Error Alert Component
 * Displays user-friendly error messages
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
    onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
    return (
        <div
            className="glass-panel"
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '500px',
                padding: '16px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderColor: 'var(--error)',
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
                zIndex: 1000,
                animation: 'slideDown 0.3s ease-out',
            }}
        >
            <AlertTriangle size={20} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--error)', display: 'block', marginBottom: '4px' }}>
                    Error
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {message}
                </p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    aria-label="Dismiss error"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};
