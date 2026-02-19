import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Plus, Check } from 'lucide-react';
import { MeasurementPoint } from './MeasurementPoint';
import { Magnifier } from './Magnifier';
import type { Point, Unit } from '../types';

interface ImageWorkspaceProps {
    imageSrc: string;
    points: [Point, Point];
    distance: number;
    unit: Unit;
    onPointsChange: (points: [Point, Point]) => void;
    onSave?: (points: [Point, Point], value: number, unit: Unit) => void;
    onImageLoaded?: (width: number, height: number) => void;
    onDimensionsChange?: (width: number, height: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

// Simplified pointer movement logic without snapping
export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
    imageSrc,
    points,
    distance,
    unit,
    onPointsChange,
    onSave,
    onImageLoaded,
    onDimensionsChange,
    onDragStart,
    onDragEnd
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
    const [containerSize, setContainerSize] = useState<{ width: number, height: number } | null>(null);
    const [showSavedFeedback, setShowSavedFeedback] = useState(false);

    // Use refs for values that change during drag to avoid re-creating listeners
    const pointsRef = useRef(points);
    const onPointsChangeRef = useRef(onPointsChange);
    const onDragStartRef = useRef(onDragStart);
    const onDragEndRef = useRef(onDragEnd);

    useEffect(() => { pointsRef.current = points; }, [points]);
    useEffect(() => { onPointsChangeRef.current = onPointsChange; }, [onPointsChange]);
    useEffect(() => { onDragStartRef.current = onDragStart; }, [onDragStart]);
    useEffect(() => { onDragEndRef.current = onDragEnd; }, [onDragEnd]);

    // Track container size for Magnifier AND Parent App
    const handleDimensionsChange = useCallback((width: number, height: number) => {
        setContainerSize({ width, height });
        onDimensionsChange?.(width, height);
    }, [onDimensionsChange]);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                handleDimensionsChange(width, height);
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [handleDimensionsChange]);

    // Handle Dragging - uses refs for peak performance
    useEffect(() => {
        if (activePointIndex === null) return;

        // Notify drag start
        onDragStartRef.current?.();

        let animationFrameId: number | null = null;

        const handlePointerMove = (e: PointerEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();

            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            // Clamp to [0, 1] range
            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            const currentPoints = pointsRef.current;
            const newPoints = [...currentPoints] as [Point, Point];
            newPoints[activePointIndex] = { x, y };

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(() => {
                onPointsChangeRef.current(newPoints);
            });
        };

        const handlePointerUp = () => {
            setActivePointIndex(null);
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            onDragEndRef.current?.();
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            onDragEndRef.current?.();
        };
    }, [activePointIndex]);

    const handleQuickSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave?.(points, distance, unit);
        setShowSavedFeedback(true);
        setTimeout(() => setShowSavedFeedback(false), 1500);
    };

    return (
        <div
            className="image-workspace"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                touchAction: 'none' // Important for touch dragging
            }}
        >
            {/* Container that matches image aspect ratio exactly */}
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    maxWidth: '100%',
                    maxHeight: '100%',
                }}
            >
                <img
                    src={imageSrc}
                    onLoad={(e) => {
                        const img = e.currentTarget;
                        onImageLoaded?.(img.naturalWidth, img.naturalHeight);
                    }}
                    alt="Workspace"
                    style={{
                        display: 'block',
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        pointerEvents: 'none',
                        userSelect: 'none'
                    }}
                    draggable={false}
                />

                {/* SVG Overlay for the line */}
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 5
                    }}
                >
                    <line
                        x1={`${points[0].x * 100}%`}
                        y1={`${points[0].y * 100}%`}
                        x2={`${points[1].x * 100}%`}
                        y2={`${points[1].y * 100}%`}
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}
                    />
                </svg>

                {/* Midpoint Label and Quick Save Button */}
                <div
                    style={{
                        position: 'absolute',
                        left: `${((points[0].x + points[1].x) / 2) * 100}%`,
                        top: `${((points[0].y + points[1].y) / 2) * 100}%`,
                        transform: 'translate(-50%, -130%)', // Lift it above the line
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        pointerEvents: 'auto'
                    }}
                >
                    <div style={{
                        background: showSavedFeedback ? 'var(--success)' : 'rgba(5, 5, 5, 0.85)',
                        border: `1px solid ${showSavedFeedback ? 'var(--success)' : 'var(--primary)'}`,
                        borderRadius: '20px',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: showSavedFeedback ? '0 0 15px var(--success)' : '0 0 10px var(--primary-glow)',
                        backdropFilter: 'blur(4px)',
                        color: showSavedFeedback ? '#000' : 'white',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        transition: 'all 0.3s ease'
                    }}>
                        <span>{showSavedFeedback ? 'Saved!' : `${distance.toFixed(2)} ${unit}`}</span>
                        <button
                            onClick={handleQuickSave}
                            className="quick-save-btn"
                            style={{
                                background: showSavedFeedback ? '#000' : 'var(--primary)',
                                color: showSavedFeedback ? 'var(--success)' : 'black',
                                border: 'none',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            title="Quick Save"
                        >
                            {showSavedFeedback ? <Check size={14} /> : <Plus size={14} />}
                        </button>
                    </div>
                </div>

                {/* Magnifier - Rendered when active and size is known */}
                {activePointIndex !== null && containerSize && (
                    <Magnifier
                        imageSrc={imageSrc}
                        points={points}
                        activeIndex={activePointIndex}
                        x={points[activePointIndex].x}
                        y={points[activePointIndex].y}
                        parentWidth={containerSize.width}
                        parentHeight={containerSize.height}
                    />
                )}

                {/* Points */}
                <MeasurementPoint
                    x={points[0].x}
                    y={points[0].y}
                    label="A"
                    color="var(--primary)"
                    isActive={activePointIndex === 0}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        setActivePointIndex(0);
                    }}
                />
                <MeasurementPoint
                    x={points[1].x}
                    y={points[1].y}
                    label="B"
                    color="var(--primary)"
                    isActive={activePointIndex === 1}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActivePointIndex(1);
                    }}
                />
            </div>
        </div>
    );
};
