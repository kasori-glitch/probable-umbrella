import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
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

// Pre-import cvUtils so we don't dynamic-import on every pointer move
let snapModule: typeof import('../lib/cvUtils') | null = null;
import('../lib/cvUtils').then(m => { snapModule = m; });

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

    // Handle Dragging - uses refs so the effect only re-runs when activePointIndex changes
    useEffect(() => {
        if (activePointIndex === null) return;

        // Notify drag start
        onDragStartRef.current?.();

        let animationFrameId: number | null = null;

        const handlePointerMove = (e: PointerEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const img = containerRef.current.querySelector('img');

            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            // Magnet-Snap Logic (non-blocking, uses pre-loaded module)
            let finalX = x;
            let finalY = y;

            if (img && img.complete && snapModule) {
                const snapPoint = snapModule.findBestSnapPoint(img, { x, y }, 20, 15);
                // findBestSnapPoint returns a Promise, resolve it
                snapPoint.then(result => {
                    if (result) {
                        finalX = result.x;
                        finalY = result.y;
                    }

                    const currentPoints = pointsRef.current;
                    const newPoints = [...currentPoints] as [Point, Point];
                    newPoints[activePointIndex] = { x: finalX, y: finalY };

                    if (animationFrameId !== null) {
                        cancelAnimationFrame(animationFrameId);
                    }
                    animationFrameId = requestAnimationFrame(() => {
                        onPointsChangeRef.current(newPoints);
                    });
                });
            } else {
                const currentPoints = pointsRef.current;
                const newPoints = [...currentPoints] as [Point, Point];
                newPoints[activePointIndex] = { x: finalX, y: finalY };

                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId);
                }
                animationFrameId = requestAnimationFrame(() => {
                    onPointsChangeRef.current(newPoints);
                });
            }
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
                        background: 'rgba(5, 5, 5, 0.85)',
                        border: '1px solid var(--primary)',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 0 10px var(--primary-glow)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                    }}>
                        <span>{distance.toFixed(2)} {unit}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSave?.(points, distance, unit);
                            }}
                            className="quick-save-btn"
                            style={{
                                background: 'var(--primary)',
                                color: 'black',
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
                            <Plus size={14} />
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
