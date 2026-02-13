import React, { useRef, useState, useEffect } from 'react';
import { MeasurementPoint } from './MeasurementPoint';
import { Magnifier } from './Magnifier';
import type { Point } from '../types';

interface ImageWorkspaceProps {
    imageSrc: string;
    points: [Point, Point];
    onPointsChange: (points: [Point, Point]) => void;
    onImageLoaded?: (width: number, height: number) => void;
    onDimensionsChange?: (width: number, height: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
    imageSrc,
    points,
    onPointsChange,
    onImageLoaded,
    onDimensionsChange,
    onDragStart,
    onDragEnd
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
    const [containerSize, setContainerSize] = useState<{ width: number, height: number } | null>(null);

    // Track container size for Magnifier AND Parent App
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                setContainerSize({ width, height });
                if (onDimensionsChange) {
                    onDimensionsChange(width, height);
                }
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [onDimensionsChange]);

    // Handle Dragging
    useEffect(() => {
        if (activePointIndex === null) return;

        // Notify drag start
        onDragStart?.();

        // RAF ID scoped within this effect to prevent memory leaks
        let animationFrameId: number | null = null;

        const handlePointerMove = (e: PointerEvent) => {
            if (!containerRef.current) return;

            // We use getBoundingClientRect inside the event for 100% accuracy of touch position vs element
            const rect = containerRef.current.getBoundingClientRect();

            // Calculate normalized coordinates
            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            // Clamp to 0-1
            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            const newPoints = [...points] as [Point, Point];
            newPoints[activePointIndex] = { x, y };

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(() => {
                onPointsChange(newPoints);
            });
        };

        const handlePointerUp = () => {
            setActivePointIndex(null);
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            // Notify drag end
            onDragEnd?.();
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
            // Ensure we notify end if unmounting while dragging
            onDragEnd?.();
        };
    }, [activePointIndex, points, onPointsChange, onDragStart, onDragEnd]);

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
                    // We let the image define the size of this container
                }}
            >
                <img
                    src={imageSrc}
                    onLoad={(e) => {
                        const img = e.currentTarget;
                        if (onImageLoaded) {
                            onImageLoaded(img.naturalWidth, img.naturalHeight);
                        }
                    }}
                    alt="Workspace"
                    style={{
                        display: 'block',
                        maxWidth: '100%',
                        maxHeight: '80vh', // Leave room for controls
                        pointerEvents: 'none', // Let clicks pass through to container if needed, but mostly just visual
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

                {/* Magnifier - Rendered when active and size is known */}
                {activePointIndex !== null && containerSize && (
                    <Magnifier
                        imageSrc={imageSrc}
                        points={points}
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
                        e.stopPropagation(); // Prevent triggering other things
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
