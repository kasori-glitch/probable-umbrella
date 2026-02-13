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
    const [snappingIndices, setSnappingIndices] = useState<Set<number>>(new Set());

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
        if (activePointIndex === null) {
            setSnappingIndices(new Set());
            return;
        }

        // Notify drag start
        onDragStart?.();

        // RAF ID scoped within this effect to prevent memory leaks
        let animationFrameId: number | null = null;

        const handlePointerMove = async (e: PointerEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const img = containerRef.current.querySelector('img');

            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            // Magnet-Snap Logic
            let finalX = x;
            let finalY = y;
            let isSnapping = false;

            if (img && img.complete) {
                const { findBestSnapPoint } = await import('../lib/cvUtils');
                // ROI: 30 (smaller search area), Sensitivity: 25 (only snap to very clear edges)
                const snapPoint = await findBestSnapPoint(img, { x, y }, 30, 25);
                if (snapPoint) {
                    finalX = snapPoint.x;
                    finalY = snapPoint.y;
                    isSnapping = true;
                }
            }

            // Update snapping state
            setSnappingIndices((prev: Set<number>) => {
                const next = new Set(prev);
                if (isSnapping) next.add(activePointIndex);
                else next.delete(activePointIndex);
                return next;
            });

            const newPoints = [...points] as [Point, Point];
            newPoints[activePointIndex] = { x: finalX, y: finalY };

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(() => {
                onPointsChange(newPoints);
            });
        };

        const handlePointerUp = () => {
            setActivePointIndex(null);
            setSnappingIndices(new Set());
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
                    isSnapping={snappingIndices.has(0)}
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
                    isSnapping={snappingIndices.has(1)}
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
