import React from 'react';
import { X, Download, Share2, Info } from 'lucide-react';
import { downloadBlob, shareBlob } from '../lib/exportUtils';

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
    const fileName = `measurement-${Date.now()}.png`;

    const handleDownload = () => {
        downloadBlob(imageBlob, fileName);
    };

    const handleShare = async () => {
        await shareBlob(imageBlob, fileName);
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
                <h2 style={{ color: 'var(--primary)', margin: '0 0 8px 0', fontFamily: 'Exo 2' }}>Ready to Save</h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px 16px',
                    borderRadius: '20px'
                }}>
                    <Info size={16} />
                    <span>Long-press image to save directly to gallery</span>
                </div>
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
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block'
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
                    style={{ flex: 1, padding: '16px' }}
                >
                    <Download size={20} />
                    Download
                </button>
                <button
                    className="btn"
                    onClick={handleShare}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <Share2 size={20} />
                    Share
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}} />
        </div>
    );
};
