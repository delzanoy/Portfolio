'use client';

import React, { useRef, useState } from 'react';
import { m, useMotionValue, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useInView } from 'framer-motion';
import Button from './Button';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const EarthPreview = dynamic(() => import('./telescope-src/components/Earth'), {
    loading: () => <div className="w-full h-full bg-black/20 animate-pulse" />,
    ssr: false
});

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
interface CaseStudyAction {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'metal';
    size?: 'sm' | 'md' | 'lg';
    IconLeading?: LucideIcon;
    IconTrailing?: LucideIcon;
    className?: string;
}

interface CaseStudyProps {
    title: string;
    chips: string[];
    description: string;
    images: string[];
    actions?: CaseStudyAction[];
    className?: string;
    note?: string;
    priority?: boolean;
    tooltip?: string;
    id: string;
    isOpen?: boolean;
    onClick?: () => void;
}

const CaseStudy = React.memo(function CaseStudy({
    title = "Title",
    chips = ["Strategy", "Design System"],
    description = "Designing systems that help users win & businesses succeed.",
    images = [],
    actions,
    className,
    note,
    priority = false,
    tooltip = "View Project",
    id,
    isOpen = false,
    onClick,
}: CaseStudyProps) {
    const rectRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const [isChildHovered, setIsChildHovered] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const checkInteractiveHover = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement | null;
        const isInteractive = !!target?.closest('button, a, [role="button"]');
        if (isInteractive !== isChildHovered) {
            setIsChildHovered(isInteractive);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        checkInteractiveHover(e);
    };
    const isInView = useInView(rectRef, {
        once: true,
        margin: "0px 0px -100px 0px", // Adjust this value
        amount: 0.5 // Adjust this value
    });

    const mainImage = images[0];

    return (
        <div
            ref={rectRef}
            onMouseMove={handleMouseMove}
            onMouseOver={checkInteractiveHover}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false);
                setIsChildHovered(false);
            }}
            onClick={onClick}
            className={cn("relative flex flex-col w-full cursor-pointer group", className)}
        >
            <m.div
                // layoutId removed – only the image will animate
                initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col w-full gap-4 pb-16 min-[1360px]:p-6 min-[1360px]:-m-6"
            >
                {/* Background Layer (Moved inside p-6 -m-6 wrapper) */}
                <m.div
                    className="absolute inset-0 bg-white/[0.08] -z-10"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={hovered ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                />

                <m.div
                    layoutId={id === 'telescope' ? undefined : `image-${id}`}
                    transition={{ layout: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }}
                    className={cn("w-full aspect-[4/3] overflow-hidden relative", id === 'telescope' ? "bg-black" : "bg-white/5")}
                    style={isOpen ? { pointerEvents: 'none' } : undefined}
                >
                    {id === 'telescope' ? (
                        <div className="w-full h-full relative pointer-events-none">
                            <EarthPreview isPreview={true} />
                        </div>
                    ) : mainImage ? (
                        <Image
                            src={mainImage}
                            alt={title}
                            fill
                            className="object-cover object-left-top"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={priority}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                            No Image
                        </div>
                    )}
                </m.div>

                <div className="flex flex-col gap-[16px] items-stretch justify-center w-full">
                    {/* Header Section (Left on Desktop) */}
                    <div className="flex flex-col gap-[10px] items-start justify-center">
                        {/* Title */}
                        <m.h2
                            className="text-[28px] leading-[1.1em] tracking-[-0.04em] font-[var(--font-tasa)] font-bold text-white"
                        >
                            {title}
                        </m.h2>

                        {/* Chips */}
                        <div className="flex flex-wrap gap-2">
                            {chips.map((chip, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-full bg-white/10 text-[10px] uppercase tracking-[0.01em] text-[#f5f5f5b3] font-[var(--font-geist-sans)] font-medium"
                                >
                                    {chip}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="w-full">
                        <m.p
                            className="text-[15px] leading-[1.4em] text-white/90 font-[var(--font-geist-sans)] whitespace-pre-line max-w-none min-[1360px]:max-w-md"
                        >
                            {description}
                        </m.p>
                    </div>
                    <div className='flex flex-col gap-[4px]'>
                        {actions && actions.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {actions.map((action, i) => {
                                    const ButtonContent = (
                                        <Button
                                            key={i}
                                            variant={action.variant ?? 'outline'}
                                            size={action.size ?? 'sm'}
                                            IconLeading={action.IconLeading}
                                            IconTrailing={action.IconTrailing}
                                            onClick={action.onClick}
                                        >
                                            {action.label}
                                        </Button>
                                    );

                                    const isInternal = action.href?.startsWith('/');
                                    return action.href ? (
                                        <a
                                            key={i}
                                            href={action.href}
                                            {...(!isInternal && { target: "_blank", rel: "noopener noreferrer" })}
                                            onClick={action.onClick ? (e) => { e.preventDefault(); action.onClick!(); } : undefined}
                                            className={action.className}
                                        >
                                            {ButtonContent}
                                        </a>
                                    ) : (
                                        <div key={i} className={action.className}>
                                            {ButtonContent}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {note && (
                            <div>
                                <p className="text-xs text-white/80 font-[var(--font-instrument)] italic">
                                    {note}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </m.div>

            <AnimatePresence>
                {hovered && !isChildHovered && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="pointer-events-none fixed z-[100] flex items-center justify-center rounded-full bg-white/90 px-4 py-2 backdrop-blur-sm whitespace-nowrap"
                        style={{
                            left: mouseX,
                            top: mouseY,
                            translateX: 12,
                            translateY: 12,
                        }}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-wider text-black font-[var(--font-tasa)]">
                            {tooltip}
                        </span>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default CaseStudy;
