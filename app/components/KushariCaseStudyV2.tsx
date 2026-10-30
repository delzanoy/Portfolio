'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ExternalLink, ShieldCheck, Layers, Zap, Code2, LayoutGrid } from 'lucide-react';
import KushariFlowGridCard from './case-study-components/KushariFlowGridCard';
import KushariFlowInspectorModal from './case-study-components/KushariFlowInspectorModal';
import { kushariFlowModules, type KushariFlowModule } from '../data/kushariFlowsData';
import Button from './Button';

interface KushariCaseStudyV2Props {
    data?: any;
    tweet?: any;
}

export default function KushariCaseStudyV2({ data }: KushariCaseStudyV2Props) {
    const [selectedModule, setSelectedModule] = useState<KushariFlowModule | null>(null);

    return (
        <div className="min-h-screen bg-[#070707] text-white rounded-[24px] overflow-hidden">

            {/* Hero Executive Brief Header */}
            <div className="relative border-b border-white/10 overflow-hidden bg-gradient-to-b from-blue-950/20 via-zinc-950 to-[#070707]">
                {/* Background Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}
                />

                <div className="max-w-7xl mx-auto px-5 py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 relative z-10 space-y-8">

                    {/* Meta Badge Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-wider">
                                Case Study • Product Design
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono">
                                2026 Edition
                            </span>
                        </div>

                        {/* External Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="metal"
                                size="sm"
                                onClick={() => window.open("https://kushari-next.onrender.com/", "_blank", "noopener,noreferrer")}
                                IconTrailing={ExternalLink}
                            >
                                Live Product Demo
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open("https://kushari-next.onrender.com/designsystem/tokens", "_blank", "noopener,noreferrer")}
                                IconTrailing={Code2}
                            >
                                Design Tokens
                            </Button>
                        </div>
                    </div>

                    {/* Main Title & Description */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 space-y-4">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight font-[var(--font-tasa)] text-white">
                                Kushari
                            </h1>
                            <p className="text-base md:text-lg lg:text-xl text-white/80 font-[var(--font-geist-sans)] leading-relaxed max-w-3xl">
                                Shared wallets, policy-based approvals, and real-time asset tracking designed to bring clarity, speed, and institutional trust to everyday crypto operations.
                            </p>
                        </div>

                        {/* Executive Impact Cards */}
                        <div className="lg:col-span-4 grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                            <div className="p-3 space-y-1">
                                <p className="text-[10px] font-mono uppercase text-white/50">My Role</p>
                                <p className="text-xs font-bold text-blue-400">Sole Contributor</p>
                                <p className="text-[11px] text-white/70 leading-tight">Discovery → Design → Code → Live Demo</p>
                            </div>
                            <div className="p-3 space-y-1 border-l border-white/10">
                                <p className="text-[10px] font-mono uppercase text-white/50">Custody Models</p>
                                <p className="text-xs font-bold text-blue-400">Gnosis Safe + MPC</p>
                                <p className="text-[11px] text-white/70 leading-tight">Unified policy & signature layer</p>
                            </div>
                        </div>
                    </div>

                    {/* Key Strategic Metrics Banner */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">0% Raw Hex</p>
                                <p className="text-[11px] text-white/50">Humanized Intent</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Layers size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">6 Spatial Flows</p>
                                <p className="text-[11px] text-white/50">Interactive Inspector</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Zap size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">Motion v2</p>
                                <p className="text-[11px] text-white/50">Spring Physics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <LayoutGrid size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">100% Custom</p>
                                <p className="text-[11px] text-white/50">Zero UI Kit Lock-in</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Spatial Grid Section */}
            <div className="max-w-7xl mx-auto px-5 py-10 md:px-8 md:py-16">

                {/* Spatial Grid Layout */}
                <m.div
                    layout
                    className={
                        kushariFlowModules.length === 1
                            ? "max-w-4xl mx-auto w-full"
                            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    }
                >
                    <AnimatePresence>
                        {kushariFlowModules.map((module) => (
                            <KushariFlowGridCard
                                key={module.id}
                                module={module}
                                onSelect={(m) => setSelectedModule(m)}
                            />
                        ))}
                    </AnimatePresence>
                </m.div>

            </div>

            {/* Zoomed Detail Inspector Modal */}
            <KushariFlowInspectorModal
                module={selectedModule}
                onClose={() => setSelectedModule(null)}
            />

        </div>
    );
}
