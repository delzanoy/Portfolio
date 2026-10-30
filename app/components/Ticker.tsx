// app/components/Ticker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { m, useAnimation, useMotionValue, Variants, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MediaItem {
    id: string;
    type: 'image' | 'video';
    src: string;
    alt: string;
    width: number;
    height: number;
    poster?: string;
}

interface TickerColumn {
    id: string;
    type: 'A' | 'B' | 'C' | 'D';
    media: MediaItem[];
}

interface TickerProps {
    columns: TickerColumn[];
    className?: string;
}

export default function Ticker({ columns, className }: TickerProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [zoomedMedia, setZoomedMedia] = useState<{
        media: MediaItem;
        layoutId: string;
    } | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const trackRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const x = useMotionValue(0);

    const columnEntryVariants: Variants = {
        hidden: {
            opacity: 0,
            x: 20, // Starts 400px to the right of its natural spot
            filter: 'blur(20px)'
        },
        visible: (i: number) => ({
            opacity: 1,
            x: 0, // Glides into its natural flexbox position
            filter: 'blur(0px)',
            transition: {
                delay: 1.8 + (i * 0.2), // Entrance starts after text; 0.2s between columns
                duration: 1.5,
                ease: [0.215, 0.61, 0.355, 1], // Smooth "glide-in" easing
            }
        })
    };

    const columnWidths = (typeof window !== 'undefined') ? columns.map(column => {
        const containerHeight = 800;
        const gap = 4;

        if (column.type === 'A' || column.type === 'C') {
            const media = column.media[0];
            const aspectRatio = media.width / media.height;
            return containerHeight * aspectRatio;
        } else {
            const availableHeight = containerHeight - (gap * (column.media.length - 1));
            const sumInverseAspectRatios = column.media.reduce((sum, m) => sum + (m.height / m.width), 0);
            return availableHeight / sumInverseAspectRatios;
        }
    }) : [];

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsMounted(true);
            setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            setIsMobile(window.innerWidth < 768);
        }, 0);

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Calculate total width for animation
    const gap = 4;
    const totalOriginalWidth = columnWidths.reduce((sum, width) => sum + width + gap, 0) - gap;
    const duplicatedColumns = [...columns, ...columns];
    const duplicatedWidths = [...columnWidths, ...columnWidths];
    const totalDuplicatedWidth = duplicatedWidths.reduce((sum, width) => sum + width + gap, 0) - gap;

    useEffect(() => {
        if (!zoomedMedia) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setZoomedMedia(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedMedia]);

    useEffect(() => {
        if (!isMounted || isReducedMotion || columnWidths.length === 0) return;

        const animationDuration = 50;

        // Start moving horizontally almost immediately
        // but with a slight delay so the first column has a chance to start its blur-in
        controls.start({
            x: [0, -totalOriginalWidth],
            transition: {
                x: {
                    delay: 1.8, // Matches the start of the first column appearance
                    duration: animationDuration,
                    ease: 'linear',
                    repeat: Infinity,
                },
            },
        });
    }, [isMounted, isReducedMotion, controls, totalOriginalWidth, columnWidths.length]);

    // Handle hover - Slower animation
    const handleHoverStart = () => {
        if (isMobile || zoomedMedia) return;
        setIsHovered(true);
        const slowDuration = 200; // 4x slower than normal 50s
        controls.start({
            x: [x.get(), x.get() - totalOriginalWidth],
            transition: {
                x: {
                    duration: slowDuration,
                    ease: 'linear',
                    repeat: Infinity
                }
            },
        });
    };

    const handleHoverEnd = () => {
        if (isMobile || zoomedMedia) return;
        setIsHovered(false);
        // Resume animation at normal speed
        const animationDuration = 50;
        controls.start({
            x: [x.get(), x.get() - totalOriginalWidth],
            transition: {
                x: {
                    duration: animationDuration,
                    ease: 'linear',
                    repeat: Infinity
                }
            },
        });
    };

    // Pause animation when media is zoomed
    useEffect(() => {
        if (!isMounted || isReducedMotion || columnWidths.length === 0) return;

        if (zoomedMedia) {
            controls.stop();
        } else {
            // Resume animation - respect hover state
            const animationDuration = isHovered ? 200 : 180;
            controls.start({
                x: [x.get(), x.get() - totalOriginalWidth],
                transition: {
                    x: {
                        duration: animationDuration,
                        ease: 'linear',
                        repeat: Infinity
                    }
                },
            });
        }
    }, [zoomedMedia, isHovered, isMounted, isReducedMotion, controls, totalOriginalWidth, columnWidths.length, x]);

    if (!isMounted || columnWidths.length === 0) {
        return <div style={{ height: '800px', width: '100vw' }} className={className} />;
    }

    return (
        <div
            style={{
                position: 'relative',
                width: '100vw',
                height: '800px', // Fixed height of 800px
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
            }}
            className={className}
        >
            <m.div
                ref={trackRef}
                animate={controls}
                style={{
                    x,
                    width: totalDuplicatedWidth,
                    display: 'flex',
                    gap: `${gap}px`,
                    alignItems: 'center',
                    position: 'absolute',
                    left: 0,
                    height: '800px', // Fixed height to match container
                    willChange: 'transform',
                }}
                className="ticker-track"
            >
                {duplicatedColumns.map((column, index) => {
                    const isInitialSet = index < columns.length;
                    const columnWidth = duplicatedWidths[index];
                    const originalIndex = index % columns.length;
                    return (
                        <m.div
                            key={`${column.id}-${index}`}
                            custom={index}
                            initial={isInitialSet ? "hidden" : { opacity: 1, x: 0, filter: 'blur(0px)' }}
                            animate="visible"
                            variants={columnEntryVariants}
                            style={{ flexShrink: 0 }}
                        >
                            <ColumnContent
                                column={column}
                                columnIndex={index}
                                columnWidth={columnWidth}
                                originalIndex={originalIndex}
                                onHoverStart={handleHoverStart}
                                onHoverEnd={handleHoverEnd}
                                onSelectMedia={(media, layoutId) => setZoomedMedia({ media, layoutId })}
                            />
                        </m.div>
                    );
                })}
            </m.div>

            <AnimatePresence>
                {zoomedMedia && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomedMedia(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            cursor: 'zoom-out'
                        }}
                    >
                        <m.div
                            layoutId={zoomedMedia.layoutId}
                            style={{
                                width: `min(95vw, calc(80vh * ${zoomedMedia.media.width / zoomedMedia.media.height}))`,
                                height: `min(95vh, calc(80vw * ${zoomedMedia.media.height / zoomedMedia.media.width}))`,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                boxShadow: '0 4px 32px rgba(250,250,250,0.2)'
                            }}
                        >
                            {zoomedMedia.media.type === 'image' ? (
                                <Image
                                    src={zoomedMedia.media.src}
                                    alt={zoomedMedia.media.alt}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="z-200"
                                />
                            ) : (
                                <video
                                    src={zoomedMedia.media.src}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    className="z-200"
                                />
                            )}
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TickerVideo({ src, poster }: { src: string; poster?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            if (isInView) videoRef.current.play().catch(() => { });
            else videoRef.current.pause();
        }
    }, [isInView]);

    return (
        <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
            }}
        />
    );
}

function MediaItem({
    media,
    containerHeight,
    containerWidth,
    columnIndex,
    originalIndex,
    itemIndex = 0,
    onHoverStart,
    onHoverEnd,
    onSelectMedia,
}: {
    media: MediaItem;
    containerHeight: number;
    containerWidth: number;
    columnIndex: number;
    originalIndex: number;
    itemIndex?: number;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    onSelectMedia: (media: MediaItem, layoutId: string) => void;
}) {
    const uniqueId = `ticker-media-${media.id}-${columnIndex}-${itemIndex}`;
    return (
        <m.div
            layoutId={uniqueId}
            style={{
                position: 'relative',
                width: '100%',
                height: containerHeight,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onClick={() => onSelectMedia(media, uniqueId)}
        >
            {media.type === 'image' ? (
                <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                    }}
                    sizes={`(max-width: 768px) 100vw, ${containerWidth}px`}
                    priority={originalIndex < 2} // Prioritize first few columns
                />
            ) : (
                <TickerVideo src={media.src} poster={media.poster} />
            )}
        </m.div>
    );
}


// Inside ColumnContent component
function ColumnContent({
    column,
    columnIndex,
    columnWidth,
    originalIndex,
    onHoverStart,
    onHoverEnd,
    onSelectMedia
}: {
    column: TickerColumn;
    columnIndex: number;
    columnWidth: number;
    originalIndex: number;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    onSelectMedia: (media: MediaItem, layoutId: string) => void;
}) {
    const containerHeight = 800;
    const gap = 4;

    const renderContent = () => {
        switch (column.type) {
            case 'A':
            case 'C':
                return (
                    <MediaItem
                        media={column.media[0]}
                        containerHeight={containerHeight}
                        containerWidth={columnWidth}
                        columnIndex={columnIndex}
                        originalIndex={originalIndex}
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                        onSelectMedia={onSelectMedia}
                    />
                );
            case 'B':
            case 'D':
                // 1. Calculate the total aspect ratio sum of all items in this column
                // Height / Width gives us a "relative height" unit for a fixed width
                const totalRelativeHeight = column.media.reduce((sum: number, m: MediaItem) =>
                    sum + (m.height / m.width), 0
                );

                // 2. Adjust for the gap (total available pixels for images)
                const availableHeight = containerHeight - (gap * (column.media.length - 1));

                return (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: containerHeight,
                        gap: `${gap}px`,
                        width: '100%',
                    }}>
                        {column.media.map((media: MediaItem, idx: number) => {
                            // 3. Calculate this specific item's height based on its proportion
                            const itemRelativeHeight = media.height / media.width;
                            const calculatedHeight = (itemRelativeHeight / totalRelativeHeight) * availableHeight;

                            return (
                                <div key={media.id} style={{
                                    height: calculatedHeight, // Variable height!
                                    width: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                    <MediaItem
                                        media={media}
                                        containerHeight={calculatedHeight}
                                        containerWidth={columnWidth}
                                        columnIndex={columnIndex}
                                        originalIndex={originalIndex}
                                        itemIndex={idx}
                                        onHoverStart={onHoverStart}
                                        onHoverEnd={onHoverEnd}
                                        onSelectMedia={onSelectMedia}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ height: containerHeight, width: columnWidth, flexShrink: 0 }}>
            {renderContent()}
        </div>
    );
}