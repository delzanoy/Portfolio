'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface HoverZoomImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
}

export default function HoverZoomImage({
    src,
    alt,
    className = "",
    aspectRatio = "aspect-video"
}: HoverZoomImageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const originX = useMotionValue(50);
    const originY = useMotionValue(50);

    const springConfig = { damping: 30, stiffness: 100 };
    const springX = useSpring(originX, springConfig);
    const springY = useSpring(originY, springConfig);

    const transformOrigin = useTransform(
        [springX, springY],
        ([x, y]) => `${x}% ${y}%`
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        originX.set(x);
        originY.set(y);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        // Reset to center smoothly
        originX.set(50);
        originY.set(50);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden cursor-crosshair ${aspectRatio} ${className}`}
        >
            <m.div
                style={{
                    transformOrigin,
                    scale: isHovered ? 1.3 : 1,
                }}
                transition={{
                    scale: {
                        type: "spring",
                        stiffness: 100,
                        damping: 25,
                    }
                }}
                className="w-full h-full relative"
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                />
            </m.div>
        </div>
    );
}
