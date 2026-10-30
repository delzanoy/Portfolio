'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';

interface FragmentedGalleryProps {
    images: string[];
    className?: string;
}

const POSITIONS = [
    { top: '5%', left: '5%', rotate: -5, scale: 0.85, zIndex: 10 },
    { top: '10%', left: '40%', rotate: 8, scale: 0.95, zIndex: 20 },
    { top: '45%', left: '2%', rotate: -12, scale: 0.9, zIndex: 30 },
    { top: '35%', left: '60%', rotate: 4, scale: 1, zIndex: 40 },
    { top: '0%', left: '25%', rotate: 2, scale: 0.8, zIndex: 15 },
    { top: '40%', left: '30%', rotate: -6, scale: 0.9, zIndex: 25 },
];

export default function FragmentedGallery({ images, className = "" }: FragmentedGalleryProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className={`relative w-full h-[600px] md:h-[350px] ${className}`}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent blur-3xl opacity-20" />
            </div>

            {images.map((src, index) => {
                const pos = POSITIONS[index % POSITIONS.length];
                const isHovered = hoveredIndex === index;

                return (
                    <m.div
                        key={src}
                        initial={{ opacity: 0, scale: 0.8, y: 20, rotate: pos.rotate * 2 }}
                        whileInView={{ opacity: 1, scale: pos.scale, y: 0, rotate: pos.rotate }}
                        whileHover={{
                            scale: pos.scale * 1.05,
                            rotate: pos.rotate * 0.5,
                            zIndex: 100,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        viewport={{ once: true, margin: "-100px" }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        className="absolute cursor-pointer group"
                        style={{
                            top: pos.top,
                            left: pos.left,
                            zIndex: isHovered ? 100 : pos.zIndex,
                            width: '35%',
                            maxWidth: '300px',
                        }}
                    >
                        <div className="relative w-full h-auto">
                            <Image
                                src={src}
                                alt="Case study screenshot"
                                width={800}
                                height={600}
                                className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 400px"
                            />
                            <div className="absolute inset-0 group-hover:bg-transparent transition-colors duration-500" />
                        </div>
                    </m.div>
                );
            })}
        </div>
    );
}
