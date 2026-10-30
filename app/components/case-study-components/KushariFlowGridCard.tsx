'use client';

import React, { useRef, useState, useEffect } from 'react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { Play, Maximize2, Layers } from 'lucide-react';
import type { KushariFlowModule } from '../../data/kushariFlowsData';

interface KushariFlowGridCardProps {
    module: KushariFlowModule;
    onSelect: (module: KushariFlowModule) => void;
}

export default function KushariFlowGridCard({ module, onSelect }: KushariFlowGridCardProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [scale, setScale] = useState(0.4);

    useEffect(() => {
        if (!stageRef.current) return;
        const updateScale = () => {
            if (stageRef.current) {
                const width = stageRef.current.clientWidth;
                setScale(width / 1440);
            }
        };
        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(stageRef.current);
        return () => observer.disconnect();
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <m.div
            layoutId={`card-container-${module.id}`}
            onClick={() => onSelect(module)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="group relative bg-[#0D0D0D]/90 border border-white/10 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-xl transition-all duration-300"
        >
            {/* Inset Hover Border Highlight */}
            <div className="absolute inset-0 rounded-2xl border border-blue-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />

            {/* Ambient Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Media Stage - Only the screen itself */}
            <div ref={stageRef} className="relative w-full aspect-[16/10] bg-black overflow-hidden rounded-2xl">
                <div className="relative w-full h-full overflow-hidden bg-black">
                    {module.previewMedia.type === 'iframe' && module.previewMedia.iframeUrl ? (
                        <iframe
                            src={module.previewMedia.iframeUrl}
                            title={module.title}
                            style={{
                                width: '1440px',
                                height: '900px',
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                            }}
                            className="pointer-events-none border-0 absolute top-0 left-0"
                        />
                    ) : module.previewMedia.type === 'video' ? (
                        <div className="relative w-full h-full">
                            <video
                                ref={videoRef}
                                src={module.previewMedia.src}
                                poster={module.previewMedia.poster}
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-105 ${module.previewMedia.fit === 'contain' ? 'object-contain p-1' : 'object-cover'}`}
                            />
                            {/* Play Icon Badge if paused */}
                            <div className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 group-hover:text-blue-400 group-hover:border-blue-400/50 transition-all duration-300">
                                <Play size={14} className="fill-current" />
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                            <Image
                                src={module.previewMedia.src}
                                alt={module.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 600px"
                                className={`transition-transform duration-700 ease-out group-hover:scale-105 ${module.previewMedia.fit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
                            />
                        </div>
                    )}
                </div>

                {/* Hover Quick Action Indicator */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/90 text-white text-xs font-semibold tracking-wide shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 size={14} />
                        <span>Inspect Flow</span>
                    </div>
                </div>
            </div>
        </m.div>
    );
}
