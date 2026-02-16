import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Info } from 'lucide-react';
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
    const [dataUrl, setDataUrl] = useState<string>(imageUrl);
    const [fileName] = useState(() => `measurement-${Date.now()}.png`);

    useEffect(() => {
        // Convert Blob to Data URL for better mobile "Save Image" compatibility
        // Blob URLs are blocked by many mobile WebViews; data URLs enable native long-press save
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setDataUrl(reader.result);
            }
        };
        reader.readAsDataURL(imageBlob);
    }, [imageBlob]);

    const handleDownload = async () => {
        try {
            await downloadBlob(imageBlob, fileName);
        } catch (error) {
            logger.error('Download failed', { error });
            alert('Download failed. Try long-pressing the image to save.');
        }
    };

    const handleShare = async () => {
        const success = await shareBlob(imageBlob, fileName);
        if (!success) {
            alert('Sharing is not supported on this device or failed. Try long-pressing the image to save.');
        }
    };

    return (
        <div className="preview-overlay allow-select" style={{
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
                <h2 style={{ color: 'var(--primary)', margin: '0 0 8px 0', fontFamily: 'var(--font-family-display)' }}>Ready to Save</h2>
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

            <div
                className="allow-select"
                style={{
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
                }}
            >
                {/* 
                    The <a> wrapper enables native long-press "Save Image" on both
                    iOS Safari/WKWebView and Android Chrome/WebView.
                    download attribute triggers save instead of navigation.
                */}
                <a
                    href={dataUrl}
                    download={fileName}
                    className="allow-select"
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        lineHeight: 0
                    }}
                    onClick={(e) => e.preventDefault()}
                >
                    <img
                        src={dataUrl}
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
                </a>
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
        </div>
    );
};
