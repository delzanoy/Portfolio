import React, { useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface ImageSliderItem {
    id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
}

interface ImageSliderGalleryProps {
    images: ImageSliderItem[];
    className?: string;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.95,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.95,
    })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

export default function ImageSliderGallery({
    images,
    className = ""
}: ImageSliderGalleryProps) {
    const [[page, direction], setPage] = useState([0, 0]);

    // We only have 3 images, but we paginate them endlessly
    const imageIndex = Math.abs(page % images.length);
    const currentImage = images[imageIndex];

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };

    return (
        <div className={`relative w-full ${className}`}>
            {/* Image & Background Container - Maintains aspect ratio and overflow */}
            <div className="group relative w-full aspect-[16/10] overflow-hidden border border-white/10">
                {/* Background Layer - Gradient */}
                <div
                    className="absolute inset-0 z-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(180deg, #005271 0%, #070F13 64%, #000000 100%)'
                    }}
                />

                {/* Light Effects Layer - Sits above the images */}
                <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                    {/* Top Left Spotlight */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(1000px at 25% 25%, rgba(255,255,255,0.1), rgba(0,82,113,0.05) 40%, transparent 70%)`,
                            mixBlendMode: 'plus-lighter'
                        }}
                    />

                    {/* Top Right Spotlight */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(1000px at 55% 55%, rgba(255,255,255,0.05), rgba(0,82,113,0.05) 40%, transparent 70%)`,
                            mixBlendMode: 'plus-lighter'
                        }}
                    />

                    {/* Volumetric Rays from top left */}
                    <m.div
                        className="absolute inset-0"
                        animate={{ opacity: [0.4, 0.6, 0.4] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            backgroundImage: `conic-gradient(from 135deg at 0% 0%, transparent 0deg, rgba(255,255,255,0.04) 8deg, transparent 20deg)`,
                            filter: 'blur(20px)',
                            transformOrigin: '0% 0%'
                        }}
                    />

                    {/* Volumetric Rays from top right */}
                    <m.div
                        className="absolute inset-0"
                        animate={{ opacity: [0.4, 0.6, 0.4] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        style={{
                            backgroundImage: `conic-gradient(from 225deg at 100% 0%, transparent 0deg, rgba(255,255,255,0.05) 10deg, transparent 0deg)`,
                            filter: 'blur(20px)',
                            transformOrigin: '100% 0%'
                        }}
                    />

                    {/* Subtle grain for texture */}
                    <div
                        className="absolute inset-0 opacity-[0.3] mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3dyZWVlZYWFhcXFxpaWl3d3d5eXl7e3t9fX1/f39fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11vZmI6AAAAf0lEQVQ4y2NgYGRiZmFmYWVjZWNnY8AG2DjYOLm4ebh5ePl4+fj5BfABAYIBAkJCwkTFRMXExSVEJSWlJMUlpaSlZWVl5eXlU9NS09Iz0zIzM7OyS7NL9SsyS/UqMkr1cjJK9XIKSIqKiksKSkpKyiUlpSXlZSXVJTXVf7o/A5pQvUshAAAAAElFTkSuQmCC")`,
                            backgroundSize: '100px 100px',
                        }}
                    />
                </div>

                {/* Slider Container - z-index: 5 */}
                <div className="absolute inset-0 z-[5]">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <m.div
                            key={page}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);
                                if (swipe < -swipeConfidenceThreshold) {
                                    paginate(1);
                                } else if (swipe > swipeConfidenceThreshold) {
                                    paginate(-1);
                                }
                            }}
                            className="absolute inset-0 flex items-center justify-center p-8 md:p-12 group"
                        >
                            {/* Foreground Image - Full Size / Contain */}
                            <div className="relative w-full h-full max-w-6xl mx-auto">
                                <Image
                                    src={currentImage.src}
                                    alt={currentImage.alt}
                                    fill
                                    className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                                    sizes="100vw"
                                    priority
                                />
                            </div>
                        </m.div>
                    </AnimatePresence>
                </div>

                {/* Controls - Bottom Right / Integrated */}
                <div className="absolute bottom-8 right-8 z-30 flex items-center gap-4">
                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        <button
                            className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all backdrop-blur-sm group-hover:bg-white/20 active:scale-95 cursor-pointer"
                            onClick={() => paginate(-1)}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all backdrop-blur-sm group-hover:bg-white/20 active:scale-95 cursor-pointer"
                            onClick={() => paginate(1)}
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Title Navigation - Bottom Center/Integrated */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-6">
                    {images.map((img, index) => (
                        <button
                            key={img.id}
                            onClick={() => {
                                const diff = index - imageIndex;
                                if (diff !== 0) {
                                    setPage([page + diff, diff > 0 ? 1 : -1]);
                                }
                            }}
                            className="relative group/nav flex flex-col items-start gap-1 transition-all duration-300 cursor-pointer"
                        >
                            <span className={`text-[12px] md:text-[14px] font-[var(--font-tasa)] font-medium tracking-tight transition-all duration-300 ${index === imageIndex
                                ? 'text-white'
                                : 'text-white/40 group-hover/nav:text-white/70'
                                }`}>
                                {img.title}
                            </span>
                            <div className={`h-[2px] rounded-full transition-all duration-500 ${index === imageIndex
                                ? 'w-full bg-blue-500'
                                : 'w-0 bg-white/20 group-hover/nav:w-4'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Text Content - Positioned below the image slider */}
            <div className="relative w-full pt-8 pb-4 md:pt-10">
                <AnimatePresence mode="wait">
                    <div key={currentImage.id} className="max-w-xl space-y-4">
                        <m.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="text-[24px] md:text-[28px] lg:text-[32px] leading-[1.1em] tracking-[-0.04em] font-[var(--font-tasa)] font-bold text-white"
                        >
                            {currentImage.title}
                        </m.h3>
                        <m.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
                            className="text-[14px] md:text-[15px] leading-[1.5em] text-white/90 font-[var(--font-geist-sans)] whitespace-pre-line max-w-md"
                        >
                            {currentImage.description}
                        </m.p>
                    </div>
                </AnimatePresence>
            </div>
        </div>
    );
}
