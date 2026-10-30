'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, HTMLMotionProps, useTransform, animate } from 'framer-motion';
import { LucideIcon, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'metal';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    IconLeading?: LucideIcon;
    IconTrailing?: LucideIcon;
    haptic?: boolean;
    fullWidth?: boolean;
    metalIntensity?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading,
        IconLeading,
        IconTrailing,
        haptic = true,
        fullWidth = false,
        children,
        disabled,
        metalIntensity = 1,
        ...props
    }, ref) => {

        const buttonRef = useRef<HTMLButtonElement>(null);
        const rippleRef = useRef<HTMLDivElement>(null);
        const highlightRef = useRef<HTMLDivElement>(null);

        // Metal shader values
        const metalX = useMotionValue(0);
        const metalY = useMotionValue(0);
        const metalRadius = useMotionValue(0);
        const metalOpacity = useSpring(0, {
            stiffness: 500,
            damping: 30,
            mass: 0.7
        });

        // Highlight effect values
        const highlightX = useMotionValue(0);
        const highlightY = useMotionValue(0);
        const highlightSize = useMotionValue(0);
        const highlightOpacity = useSpring(0, { stiffness: 400, damping: 25 });

        // Light values
        const lightX = useMotionValue(0);
        const lightY = useMotionValue(0);
        const lightIntensity = useSpring(0, { stiffness: 300, damping: 20 });

        // Ripple effect
        const rippleScale = useMotionValue(0);
        const rippleOpacity = useMotionValue(0);

        // Border animation
        const borderAngle = useMotionValue(0);

        // Animate border gradient continuously for metal variant
        React.useEffect(() => {
            if (variant !== 'metal') return;

            const animation = animate(borderAngle, 360, {
                duration: 15,
                repeat: Infinity,
                ease: "linear"
            });

            return animation.stop;
        }, [variant, borderAngle]);

        // Improved metal gradient - more Apple-like specular highlight
        const metalGradient = useTransform(
            [metalX, metalY, metalRadius],
            ([x, y, r]: number[]) => {
                return `radial-gradient(${r * 3}px at ${x}px ${y}px, 
                    rgba(255, 255, 255, 0.95) 0%,
                    rgba(255, 255, 255, 0.85) 15%,
                    rgba(255, 255, 255, 0.7) 30%,
                    rgba(255, 255, 255, 0.4) 50%,
                    rgba(255, 255, 255, 0.2) 70%,
                    rgba(255, 255, 255, 0.1) 85%,
                    transparent 100%)`;
            }
        );

        // Apple-style specular highlight (small, intense white spot)
        const highlightGradient = useTransform(
            [highlightX, highlightY, highlightSize],
            ([x, y, s]: number[]) => {
                return `radial-gradient(${s}px at ${x}px ${y}px, 
                    rgba(255, 255, 255, 0.9) 0%,
                    rgba(255, 255, 255, 0.6) 50%,
                    transparent 100%)`;
            }
        );

        // Dynamic border gradient
        const borderGradient = useTransform(
            borderAngle,
            (angle) => `linear-gradient(${angle}deg, 
                rgba(255, 255, 255, 0.4) 0%,
                rgba(255, 255, 255, 0.2) 25%,
                rgba(255, 255, 255, 0.05) 50%,
                rgba(255, 255, 255, 0.2) 75%,
                rgba(255, 255, 255, 0.4) 100%)`
        );

        // Light gradient for ambient lighting
        const lightGradient = useTransform(
            [lightX, lightY, lightIntensity],
            ([x, y, intensity]: number[]) => {
                return `radial-gradient(150px at ${x}px ${y}px, 
                    rgba(255, 255, 255, ${intensity * 0.4}) 0%,
                    rgba(255, 255, 255, ${intensity * 0.2}) 25%,
                    rgba(255, 255, 255, ${intensity * 0.05}) 50%,
                    transparent 100%)`;
            }
        );

        // Enhanced metal noise texture
        const metalNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.12'/%3E%3C/svg%3E")`;

        // Apple-style click effect with multiple layers
        const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const maxDimension = Math.max(rect.width, rect.height);

                // Metal shader (main effect)
                metalX.set(x);
                metalY.set(y);
                metalRadius.set(maxDimension * 0.5);
                metalOpacity.set(metalIntensity);

                // Apple-style specular highlight (small intense spot)
                highlightX.set(x);
                highlightY.set(y);
                highlightSize.set(20);
                highlightOpacity.set(0.8);

                // Animate highlight to expand and fade
                animate(highlightSize, maxDimension * 0.3, {
                    duration: 0.4,
                    ease: "easeOut"
                });
                animate(highlightOpacity, 0, {
                    duration: 0.4,
                    ease: "easeOut"
                });

                // Ripple effect
                if (rippleRef.current) {
                    rippleRef.current.style.left = `${x}px`;
                    rippleRef.current.style.top = `${y}px`;
                    rippleScale.set(0);
                    rippleOpacity.set(0.4);

                    animate(rippleScale, 4, {
                        duration: 0.7,
                        ease: "easeOut"
                    });

                    animate(rippleOpacity, 0, {
                        duration: 0.7,
                        ease: "easeOut"
                    });
                }

                // Ambient light pulse
                if (variant === 'metal') {
                    animate(lightIntensity, [0.8, 0.3], {
                        duration: 0.5,
                        ease: "easeOut"
                    });
                }
            }

            // Haptic feedback
            if (haptic && typeof window !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(8);
            }
        };

        const handlePointerUp = () => {
            // Fade out metal shader smoothly
            animate(metalOpacity, 0, {
                duration: 0.4,
                ease: "easeOut"
            });
        };

        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg relative overflow-hidden',
            secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-md',
            outline: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800',
            ghost: 'text-zinc-400 hover:text-white hover:bg-white/10',
            metal: `
                bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
                text-gray-100 relative overflow-hidden
                shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                border border-gray-700/60
                hover:shadow-[0_6px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
            `
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-5 py-2.5 text-sm',
            lg: 'px-8 py-4 text-base',
        };

        const gaps = {
            sm: 'gap-1.5',
            md: 'gap-2',
            lg: 'gap-3',
        };

        return (
            <motion.button
                ref={(node) => {
                    buttonRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                }}
                style={{
                    borderImage: variant === 'metal' ? borderGradient : undefined,
                    borderImageSlice: 1
                }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                whileTap={{ scale: variant === 'metal' ? 0.97 : 0.95 }}
                whileHover={{ scale: variant === 'metal' ? 1.01 : 1 }}
                disabled={disabled || isLoading}
                className={cn(
                    'items-center justify-center rounded-full font-medium transition-all duration-300 relative overflow-hidden cursor-pointer',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black',
                    'disabled:opacity-50 disabled:cursor-not-allowed select-none active:outline-none',
                    fullWidth ? 'flex w-full' : 'inline-flex',
                    'backdrop-blur-[2px]',
                    'transform-gpu', // Enable GPU acceleration
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {/* --- Ambient Light Gradient (Metal only) --- */}
                {variant === 'metal' && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
                        style={{
                            background: lightGradient,
                            opacity: lightIntensity
                        }}
                    />
                )}

                {/* --- Main Metal Shader (All variants) --- */}
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
                    style={{
                        background: metalGradient,
                        opacity: metalOpacity
                    }}
                />

                {/* --- Apple-style Specular Highlight --- */}
                <motion.div
                    ref={highlightRef}
                    className="absolute inset-0 pointer-events-none z-0 mix-blend-screen"
                    style={{
                        background: highlightGradient,
                        opacity: highlightOpacity
                    }}
                />

                {/* --- Metallic Noise Texture --- */}
                {variant === 'metal' && (
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay z-0"
                        style={{
                            backgroundImage: metalNoise,
                            backgroundSize: '150px',
                            backgroundRepeat: 'repeat'
                        }}
                    />
                )}

                {/* --- Subtle Radial Gradient Overlay --- */}
                {variant === 'metal' && (
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
                )}

                {/* --- Ripple Effect --- */}
                <motion.div
                    ref={rippleRef}
                    className="absolute w-16 h-16 rounded-full pointer-events-none z-0"
                    style={{
                        scale: rippleScale,
                        opacity: rippleOpacity,
                        x: '-50%',
                        y: '-50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 80%)'
                    }}
                />

                {/* --- Animated Border Gradient (Metal only) --- */}
                {variant === 'metal' && (
                    <div className="absolute -inset-[1px] rounded-full z-0 pointer-events-none overflow-hidden">
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: borderGradient,
                                opacity: 0.6
                            }}
                        />
                    </div>
                )}


                {/* --- Inner Border Glow --- */}
                {variant === 'metal' && (
                    <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none shadow-inner" />
                )}

                {/* --- Content Container --- */}
                <div className={cn(
                    "flex items-center justify-center relative z-10",
                    gaps[size],
                    variant === 'metal' ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : ''
                )}>
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        IconLeading && (
                            <IconLeading className={cn(
                                size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5',
                                variant === 'metal' ? 'drop-shadow-sm' : ''
                            )} />
                        )
                    )}

                    <span className={cn(
                        variant === 'metal' ? 'font-medium tracking-wide text-white' : '',
                        variant === 'metal' ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]' : ''
                    )}>
                        {children}
                    </span>

                    {!isLoading && IconTrailing && (
                        <IconTrailing className={cn(
                            size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5',
                            variant === 'metal' ? 'drop-shadow-sm' : ''
                        )} />
                    )}
                </div>
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
export default Button;