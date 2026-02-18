import React, { useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { downloadBlob, shareBlob } from '../lib/exportUtils';
import { logger } from '../utils/logger';

interface ImagePreviewModalProps {
    imageUrl: string;
    imageBlob: Blob;
    onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    imageUrl,
    imageBlob,
    onClose
}) => {
    const [fileName] = useState(() => `measurement-${Date.now()}.png`);
    const [saving, setSaving] = useState(false);

    const handleDownload = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await downloadBlob(imageBlob, fileName);
        } catch (error) {
            logger.error('Download failed', { error });
            alert('Download failed. Try long-pressing the image to save manually.');
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const success = await shareBlob(imageBlob, fileName);
            if (!success) {
                alert('Sharing is not supported on this device. Please use the Save button.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="preview-overlay" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    zIndex: 2010
                }}
            >
                <X size={24} />
            </button>

            <div style={{
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ color: 'var(--primary)', margin: '0 0 8px 0', fontFamily: 'var(--font-family-display)' }}>Measurement Ready</h2>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    margin: 0
                }}>
                    Save to device or share with others
                </p>
                <p style={{
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    marginTop: '8px',
                    opacity: 0.8,
                    fontStyle: 'italic'
                }} className="mobile-only">
                    Tip: Long press image to save manually if buttons fail
                </p>
            </div>

            <div style={{
                flex: 1,
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: '12px',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
                background: '#000'
            }}>
                <img
                    src={imageUrl}
                    alt="Measurement Preview"
                    className="selectable-image"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        width: '100%'
                    }}
                />
            </div>

            <div style={{
                display: 'flex',
                gap: '16px',
                width: '100%',
                maxWidth: '400px',
                marginTop: '24px'
            }}>
                <button
                    className="btn btn-primary"
                    onClick={handleDownload}
                    disabled={saving}
                    style={{ flex: 1, padding: '16px', opacity: saving ? 0.6 : 1 }}
                >
                    <Download size={20} />
                    {saving ? 'Processing...' : 'Save'}
                </button>
                <button
                    className="btn"
                    onClick={handleShare}
                    disabled={saving}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        opacity: saving ? 0.6 : 1
                    }}
                >
                    <Share2 size={20} />
                    Share
                </button>
            </div>
        </div>
    );
};
