'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { kushariTiles, type KushariTile } from '../../data/kushariTiles';

/* ----------------------------------------
   Kushari tile grid
   One idea per tile: a short looping recording of one part of the
   product. Clips play only while on screen; clicking a tile opens a
   focus view with a larger clip, a short note and a link to try it live.
---------------------------------------- */
const isDev = process.env.NODE_ENV !== 'production';

/** Plays the clip while it is on screen; shows the poster otherwise */
function TileMedia({ tile, large = false }: { tile: KushariTile; large?: boolean }) {
    const ref = useRef<HTMLVideoElement>(null);
    const reduceMotion = useReducedMotion();
    const { poster, video, fit = 'cover' } = tile.media;
    const objectFit = fit === 'contain' ? 'object-contain' : 'object-cover object-left-top';

    useEffect(() => {
        const el = ref.current;
        if (!el || reduceMotion) return;
        const observer = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? el.play().catch(() => { }) : el.pause()),
            { threshold: 0.4 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [reduceMotion]);

    if (video) {
        return (
            <video
                ref={ref}
                src={video}
                poster={poster}
                muted
                loop
                playsInline
                preload="none"
                aria-label={tile.title}
                className={`h-full w-full ${objectFit}`}
            />
        );
    }
    return (
        <Image
            src={poster}
            alt={tile.title}
            fill
            sizes={large ? '(max-width: 768px) 100vw, 960px' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px'}
            className={objectFit}
        />
    );
}

function Tile({ tile, onOpen }: { tile: KushariTile; onOpen: () => void }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20">
            <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
                <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-5 text-white" style={{ fontFamily: 'var(--font-tasa)' }}>
                        {tile.title}
                    </h3>
                    <p className="mt-0.5 text-[12px] leading-4 text-white/50">{tile.area}</p>
                </div>
                {isDev && !tile.media.video && (
                    <span className="shrink-0 rounded-full border border-amber-400/30 px-2 py-0.5 text-[10px] text-amber-300/80">
                        Needs recording
                    </span>
                )}
            </header>

            {/* Stage: the recording sits on a quiet backdrop with a little breathing room */}
            <button
                type="button"
                onClick={onOpen}
                aria-label={`Open ${tile.title}`}
                className="relative mx-2 aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl bg-[#0d0d10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
                <div className="absolute inset-4 overflow-hidden rounded-lg border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.015]">
                    <TileMedia tile={tile} />
                </div>
            </button>

            <footer className="flex items-start justify-between gap-4 px-4 pb-4 pt-3">
                <p className="text-[13px] leading-[1.45] text-white/70">{tile.idea}</p>
                {tile.liveHref && (
                    <a
                        href={tile.liveHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-0.5 text-[12px] text-blue-400 underline decoration-blue-400/30 underline-offset-4 hover:text-blue-300"
                    >
                        Try it
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </a>
                )}
            </footer>
        </article>
    );
}

function FocusView({ tile, onClose }: { tile: KushariTile; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <m.div
            role="dialog"
            aria-modal="true"
            aria-label={tile.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md md:p-10"
        >
            <m.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10]"
            >
                <div className="relative aspect-[16/10] w-full">
                    <TileMedia tile={tile} large />
                </div>
                <div className="flex flex-col gap-3 p-5 md:flex-row md:items-end md:justify-between md:p-6">
                    <div className="max-w-2xl">
                        <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-tasa)' }}>
                            {tile.title}
                        </h3>
                        <p className="mt-1.5 text-[14px] leading-[1.55] text-white/75">{tile.detail ?? tile.idea}</p>
                    </div>
                    {tile.liveHref && (
                        <a
                            href={tile.liveHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 text-[14px] text-blue-400 underline decoration-blue-400/30 underline-offset-4 hover:text-blue-300"
                        >
                            Try this in the live product
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </a>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>
            </m.div>
        </m.div>
    );
}

export default function KushariTileGrid() {
    const [openId, setOpenId] = useState<string | null>(null);
    const open = kushariTiles.find((t) => t.id === openId) ?? null;

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {kushariTiles.map((tile) => (
                    <Tile key={tile.id} tile={tile} onOpen={() => setOpenId(tile.id)} />
                ))}
            </div>
            <AnimatePresence>
                {open && <FocusView key={open.id} tile={open} onClose={() => setOpenId(null)} />}
            </AnimatePresence>
        </>
    );
}
