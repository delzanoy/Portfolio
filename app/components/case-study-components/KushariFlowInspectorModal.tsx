'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Play, Pause, ChevronRight, ChevronLeft, Info, ShieldAlert, Cpu, Award } from 'lucide-react';
import type { KushariFlowModule } from '../../data/kushariFlowsData';

interface KushariFlowInspectorModalProps {
    module: KushariFlowModule | null;
    onClose: () => void;
}

export default function KushariFlowInspectorModal({ module, onClose }: KushariFlowInspectorModalProps) {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

    // Reset step index when module changes
    useEffect(() => {
        setActiveStepIndex(0);
        setIsPlaying(true);
        setActiveHotspot(null);
    }, [module]);

    // Auto-advance step timer if isPlaying is true
    useEffect(() => {
        if (!module || !isPlaying || module.steps.length <= 1) return;

        const interval = setInterval(() => {
            setActiveStepIndex((prev) => (prev + 1) % module.steps.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [module, isPlaying]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!module) return null;

    const currentStep = module.steps[activeStepIndex] || module.steps[0];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 md:p-6 lg:p-8 overflow-y-auto no-scrollbar">
                {/* Backdrop */}
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-2xl cursor-zoom-out"
                />

                {/* Modal Container */}
                <m.div
                    layoutId={`card-container-${module.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="relative w-full max-w-7xl max-h-[92vh] bg-[#0A0A0A] border border-white/15 rounded-3xl shadow-[0_16px_64px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col pointer-events-auto z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Bar */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/60 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-wider">
                                {module.category}
                            </span>
                            <m.h2
                                layoutId={`title-${module.id}`}
                                className="text-lg md:text-xl font-bold text-white font-[var(--font-tasa)]"
                            >
                                {module.title}
                            </m.h2>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
                            aria-label="Close Inspector"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Main Content Body: Grid Layout */}
                    <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-0">

                        {/* Left Column: Interactive Flow Stage (7 cols) */}
                        <div className="lg:col-span-7 bg-black/80 p-5 md:p-8 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between space-y-6">

                            {/* Media Viewport */}
                            <div className="relative w-full aspect-[16/10] bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl group">
                                <AnimatePresence mode="wait">
                                    <m.div
                                        key={currentStep.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative w-full h-full"
                                    >
                                        {currentStep.mediaUrl?.endsWith('.webm') || currentStep.mediaUrl?.endsWith('.mp4') ? (
                                            <video
                                                src={currentStep.mediaUrl}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Image
                                                src={currentStep.mediaUrl || module.previewMedia.src}
                                                alt={currentStep.title}
                                                fill
                                                priority
                                                sizes="(max-width: 1024px) 100vw, 700px"
                                                className="object-cover"
                                            />
                                        )}
                                    </m.div>
                                </AnimatePresence>

                                {/* Interactive Hotspot Markers */}
                                {currentStep.hotspots?.map((hotspot, idx) => (
                                    <div
                                        key={idx}
                                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                        className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
                                    >
                                        <button
                                            onClick={() => setActiveHotspot(activeHotspot === idx ? null : idx)}
                                            className={`relative group/hotspot w-6 h-6 rounded-full flex items-center justify-center transition-transform ${activeHotspot === idx ? 'scale-125 bg-blue-500 text-white' : 'bg-blue-600/80 hover:bg-blue-500 text-white'
                                                }`}
                                        >
                                            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-40" />
                                            <Info size={12} />
                                        </button>

                                        {/* Hotspot Tooltip */}
                                        <AnimatePresence>
                                            {activeHotspot === idx && (
                                                <m.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 p-3 bg-zinc-900/95 border border-white/20 backdrop-blur-xl rounded-xl shadow-2xl z-40 text-left pointer-events-auto"
                                                >
                                                    <p className="text-xs font-bold text-blue-400">{hotspot.label}</p>
                                                    <p className="text-[11px] text-white/80 mt-1 leading-snug font-[var(--font-geist-sans)]">
                                                        {hotspot.description}
                                                    </p>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            {/* Flow Step Scrubber Controls */}
                            <div className="space-y-4 bg-zinc-950/80 p-4 rounded-2xl border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                            title={isPlaying ? 'Pause auto-play' : 'Play auto-step'}
                                        >
                                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                        </button>

                                        <span className="text-xs font-mono text-white/60">
                                            Step {activeStepIndex + 1} of {module.steps.length}
                                        </span>
                                    </div>

                                    {/* Manual Step Arrows */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setActiveStepIndex((prev) => (prev - 1 + module.steps.length) % module.steps.length)}
                                            className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setActiveStepIndex((prev) => (prev + 1) % module.steps.length)}
                                            className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Step Tabs Bar */}
                                <div className="grid grid-cols-3 gap-2">
                                    {module.steps.map((step, idx) => (
                                        <button
                                            key={step.id}
                                            onClick={() => {
                                                setActiveStepIndex(idx);
                                                setIsPlaying(false);
                                            }}
                                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${idx === activeStepIndex
                                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                                                }`}
                                        >
                                            <p className="text-[10px] font-mono uppercase tracking-wider text-blue-400">Step 0{idx + 1}</p>
                                            <p className="text-xs font-medium truncate mt-0.5">{step.title}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* Active Step Description */}
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-xs md:text-sm text-white/90 leading-relaxed font-[var(--font-geist-sans)]">
                                        <strong className="text-blue-300 font-semibold">{currentStep.title}: </strong>
                                        {currentStep.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Executive Product Rationale & Systems (5 cols) */}
                        <div className="lg:col-span-5 p-6 md:p-8 space-y-8 overflow-y-auto no-scrollbar bg-[#0A0A0A]">

                            {/* Tagline & Impact Metric */}
                            <div className="space-y-3 border-b border-white/10 pb-6">
                                <p className="text-sm md:text-base text-white/80 font-[var(--font-geist-sans)] leading-relaxed">
                                    {module.tagline}
                                </p>
                                {module.metrics && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
                                        <Award size={16} className="shrink-0" />
                                        <span>{module.metrics}</span>
                                    </div>
                                )}
                            </div>

                            {/* Problem Statement */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-red-400 text-sm font-bold tracking-wide uppercase font-mono">
                                    <ShieldAlert size={16} />
                                    <h3>Friction & Problem Space</h3>
                                </div>
                                <p className="text-xs md:text-sm text-white/70 leading-relaxed font-[var(--font-geist-sans)]">
                                    {module.problemStatement}
                                </p>
                            </div>

                            {/* Design Rationale */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-blue-400 text-sm font-bold tracking-wide uppercase font-mono">
                                    <Info size={16} />
                                    <h3>Design Rationale</h3>
                                </div>
                                <p className="text-xs md:text-sm text-white/80 leading-relaxed font-[var(--font-geist-sans)]">
                                    {module.designRationale}
                                </p>
                            </div>

                            {/* Trade-offs Section */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">Explicit Trade-offs</h3>
                                <ul className="space-y-2">
                                    {module.tradeoffs.map((tradeoff, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-white/70 font-[var(--font-geist-sans)]">
                                            <span className="text-amber-400 font-mono mt-0.5">•</span>
                                            <span>{tradeoff}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Technical Architecture Notes */}
                            <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-white/10">
                                <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono uppercase font-bold">
                                    <Cpu size={14} />
                                    <span>Technical Architecture</span>
                                </div>
                                <p className="text-xs text-white/60 font-mono leading-relaxed">
                                    {module.architectureNotes}
                                </p>
                            </div>

                        </div>
                    </div>
                </m.div>
            </div>
        </AnimatePresence>
    );
}
