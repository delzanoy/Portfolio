'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    m,
    AnimatePresence,
    useMotionValue,
    useSpring,
    type MotionValue,
    type Variants,
} from 'framer-motion';
import EmojiGlyph, { type EmojiSet } from './EmojiGlyph';

/* ----------------------------------------
   Setback lines
   The three struck-out moments of the closing statement. Letters swap
   for emojis under the pointer; `cursor` picks how the pointer behaves:
   - swap:      the letter under the pointer swaps (default)
   - emoji:     the arrow becomes a following emoji that drops into letters
   - lens:      a soft circle; every letter inside it is an emoji
   - repel:     letters lean away from the pointer; the one under it swaps
   - spotlight: the lines dim, with a pool of light around the pointer
   - trail:     swapped letters linger, so a sweep leaves a fading trail
---------------------------------------- */
export type CursorMode = 'swap' | 'emoji' | 'lens' | 'repel' | 'spotlight' | 'trail';

export interface SetbackLine {
    text: string;
    emoji: string;
    pool: string[];
}

const EASE = [0.22, 1, 0.36, 1] as const;
const SETBACK_GAP = 0.4; // seconds between lines
const WORD_GAP = 0.05; // seconds between words within a line

const HOLD: Record<CursorMode, number> = {
    swap: 150,
    emoji: 150,
    lens: 120,
    repel: 150,
    spotlight: 150,
    trail: 700, // long enough that a sweep reads as a trail
};
const LENS_R = 64; // px
const REPEL_R = 110; // px
const REPEL_PUSH = 9; // px at the pointer, easing to 0 at the edge
const SPOT_R = 150; // px

const pick = (pool: string[], not?: string) => {
    const options = pool.filter((e) => e !== not);
    return options[Math.floor(Math.random() * options.length)];
};

/* A letter that can be swapped for an emoji, and nudged (repel) */
type CharEntry = { el: HTMLSpanElement; x: MotionValue<number>; y: MotionValue<number>; line: number };

function Char({
    id,
    line,
    char,
    emoji,
    set,
    register,
    onEnter,
    onLeave,
}: {
    id: number;
    line: number;
    char: string;
    emoji: string | undefined;
    set: EmojiSet;
    register: (id: number, entry: CharEntry | null) => void;
    onEnter?: () => void;
    onLeave?: () => void;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const x = useSpring(0, { stiffness: 260, damping: 18 });
    const y = useSpring(0, { stiffness: 260, damping: 18 });

    useEffect(() => {
        if (ref.current) register(id, { el: ref.current, x, y, line });
        return () => register(id, null);
    }, [id, line, register, x, y]);

    return (
        <m.span ref={ref} style={{ x, y }} className="relative inline-block" onPointerEnter={onEnter} onPointerLeave={onLeave}>
            <m.span
                className="inline-block"
                animate={emoji ? { opacity: 0, scale: 0.5, filter: 'blur(4px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.25, ease: EASE }}
            >
                {char}
            </m.span>
            <AnimatePresence>
                {emoji && (
                    <m.span
                        key={emoji}
                        initial={{ opacity: 0, scale: 0.3, rotate: -25 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, filter: 'blur(4px)', transition: { duration: 0.25 } }}
                        transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                        className={`pointer-events-none absolute inset-0 flex select-none items-center justify-center leading-none ${set === 'noto' ? 'text-[1em]' : 'text-[0.8em]'}`}
                    >
                        <EmojiGlyph emoji={emoji} set={set} />
                    </m.span>
                )}
            </AnimatePresence>
        </m.span>
    );
}

/** The line's last emoji; Noto plays once as it lands and again on hover */
function EndEmoji({ emoji, set, delay, variants }: { emoji: string; set: EmojiSet; delay: number; variants: Variants }) {
    const [replay, setReplay] = useState(0);
    const again = () => setReplay((n) => n + 1);
    return (
        <m.span
            custom={delay}
            variants={variants}
            onAnimationComplete={(def) => def === 'shown' && again()}
            onPointerEnter={again}
            className="inline-block"
        >
            <EmojiGlyph emoji={emoji} set={set} loop={false} replayKey={replay} />
        </m.span>
    );
}

export default function SetbackLines({
    lines,
    set,
    cursor = 'swap',
    enabled,
    reduce,
    color,
}: {
    lines: SetbackLine[];
    set: EmojiSet;
    cursor?: CursorMode;
    /** false turns off every pointer effect (reduced motion) */
    enabled: boolean;
    reduce: boolean;
    color: string;
}) {
    const boxRef = useRef<HTMLParagraphElement>(null);
    const chars = useRef(new Map<number, CharEntry>());
    const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
    const [swapped, setSwapped] = useState<Record<number, string>>({});
    const swappedRef = useRef(swapped);
    useEffect(() => {
        swappedRef.current = swapped;
    }, [swapped]);

    const [hovering, setHovering] = useState(false);
    const [activeLine, setActiveLine] = useState(0);
    const [cursorEmoji, setCursorEmoji] = useState(() => lines[0]?.emoji ?? '');

    // Follower position (emoji cursor, lens), relative to the box
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const fx = useSpring(px, { stiffness: 500, damping: 35, mass: 0.6 });
    const fy = useSpring(py, { stiffness: 500, damping: 35, mass: 0.6 });

    useEffect(() => {
        const t = timers.current;
        return () => t.forEach(clearTimeout);
    }, []);

    const register = useCallback((id: number, entry: CharEntry | null) => {
        if (entry) chars.current.set(id, entry);
        else chars.current.delete(id);
    }, []);

    const swapOn = useCallback((id: number, emoji: string) => {
        clearTimeout(timers.current.get(id));
        setSwapped((s) => (s[id] === emoji ? s : { ...s, [id]: emoji }));
    }, []);

    const swapOff = useCallback(
        (id: number) => {
            clearTimeout(timers.current.get(id));
            timers.current.set(
                id,
                setTimeout(() => {
                    setSwapped((s) => {
                        if (!(id in s)) return s;
                        const next = { ...s };
                        delete next[id];
                        return next;
                    });
                }, HOLD[cursor])
            );
        },
        [cursor]
    );

    // Letter enter/leave, for every mode except the lens (which works by distance)
    const enterChar = (id: number, line: number) => {
        if (cursor === 'emoji') {
            swapOn(id, cursorEmoji);
            setCursorEmoji(pick(lines[line].pool, cursorEmoji));
        } else {
            swapOn(id, pick(lines[line].pool, swappedRef.current[id]));
        }
    };

    const onMove = (e: React.PointerEvent) => {
        const box = boxRef.current;
        if (!box) return;
        const b = box.getBoundingClientRect();
        const lx = e.clientX - b.left;
        const ly = e.clientY - b.top;
        px.set(lx);
        py.set(ly);

        if (cursor === 'spotlight') {
            box.style.setProperty('--mx', `${lx}px`);
            box.style.setProperty('--my', `${ly}px`);
        }

        if (cursor === 'lens' || cursor === 'repel') {
            chars.current.forEach((c, id) => {
                const r = c.el.getBoundingClientRect();
                const dx = r.left + r.width / 2 - e.clientX;
                const dy = r.top + r.height / 2 - e.clientY;
                const d = Math.hypot(dx, dy);

                if (cursor === 'lens') {
                    if (d < LENS_R) {
                        if (!swappedRef.current[id]) swapOn(id, pick(lines[c.line].pool));
                        else clearTimeout(timers.current.get(id));
                    } else if (swappedRef.current[id]) {
                        swapOff(id);
                    }
                } else {
                    const k = d < REPEL_R ? 1 - d / REPEL_R : 0;
                    const push = k * k * REPEL_PUSH;
                    c.x.set(d ? (dx / d) * push : 0);
                    c.y.set(d ? (dy / d) * push : 0);
                }
            });
        }
    };

    const onLeaveBox = () => {
        setHovering(false);
        if (cursor === 'lens') Object.keys(swappedRef.current).forEach((id) => swapOff(Number(id)));
        if (cursor === 'repel') chars.current.forEach((c) => (c.x.set(0), c.y.set(0)));
    };

    const word: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 14, filter: reduce ? 'none' : 'blur(8px)' },
        shown: (delay: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { delay: reduce ? 0 : delay, duration: 0.8, ease: EASE },
        }),
    };
    const endEmoji: Variants = {
        hidden: { opacity: 0, scale: reduce ? 1 : 0.3, rotate: reduce ? 0 : -20 },
        shown: (delay: number) => ({
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: reduce ? { duration: 0.2 } : { delay, type: 'spring', stiffness: 260, damping: 14 },
        }),
    };

    const spotlight = enabled && cursor === 'spotlight';
    const mask = `radial-gradient(circle ${SPOT_R}px at var(--mx, -999px) var(--my, -999px), #000 35%, rgba(0,0,0,0.3) 100%)`;

    let id = 0;
    return (
        <p
            ref={boxRef}
            className="relative flex flex-col items-start"
            onPointerEnter={enabled ? () => setHovering(true) : undefined}
            onPointerMove={enabled ? onMove : undefined}
            onPointerLeave={enabled ? onLeaveBox : undefined}
            style={{
                cursor: enabled && (cursor === 'emoji' || cursor === 'lens') ? 'none' : undefined,
                // Spotlight: everything dims to 30%, full strength near the pointer
                WebkitMaskImage: spotlight && hovering ? mask : undefined,
                maskImage: spotlight && hovering ? mask : undefined,
            }}
        >
            {lines.map(({ text, emoji }, li) => {
                const lineDelay = li * SETBACK_GAP;
                const words = text.split(' ');
                return (
                    <span
                        key={text}
                        onPointerEnter={enabled && cursor === 'emoji' ? () => {
                            if (li !== activeLine) {
                                setActiveLine(li);
                                setCursorEmoji(lines[li].emoji);
                            }
                        } : undefined}
                        className="text-[30px] font-semibold leading-[1.25] tracking-[-0.03em] sm:text-[42px]"
                        style={{ fontFamily: 'var(--font-tasa)', color }}
                    >
                        <span className="sr-only">{text}</span>
                        <span aria-hidden>
                            {words.map((w, wi) => (
                                <React.Fragment key={wi}>
                                    <m.span custom={lineDelay + wi * WORD_GAP} variants={word} className="inline-block whitespace-nowrap">
                                        {[...w].map((c, ci) => {
                                            const cid = id++;
                                            const byEnter = enabled && cursor !== 'lens';
                                            return (
                                                <Char
                                                    key={ci}
                                                    id={cid}
                                                    line={li}
                                                    char={c}
                                                    emoji={swapped[cid]}
                                                    set={set}
                                                    register={register}
                                                    onEnter={byEnter ? () => enterChar(cid, li) : undefined}
                                                    onLeave={byEnter ? () => swapOff(cid) : undefined}
                                                />
                                            );
                                        })}
                                    </m.span>{' '}
                                </React.Fragment>
                            ))}
                            <EndEmoji emoji={emoji} set={set} delay={lineDelay + words.length * WORD_GAP + 0.25} variants={endEmoji} />
                        </span>
                    </span>
                );
            })}

            {/* Emoji cursor: follows the pointer and drops into the letters it touches */}
            <AnimatePresence>
                {enabled && cursor === 'emoji' && hovering && (
                    <m.span
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-0 z-10 text-[26px]"
                        style={{ x: fx, y: fy, translateX: '-50%', translateY: '-50%' }}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4 }}
                        transition={{ duration: 0.2 }}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            <m.span
                                key={cursorEmoji}
                                className="block"
                                initial={{ scale: 0.3, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0.3, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                            >
                                <EmojiGlyph emoji={cursorEmoji} set={set} />
                            </m.span>
                        </AnimatePresence>
                    </m.span>
                )}
            </AnimatePresence>

            {/* Lens: a soft ring; letters inside it are emojis */}
            <AnimatePresence>
                {enabled && cursor === 'lens' && hovering && (
                    <m.span
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-0 z-10 rounded-full"
                        style={{
                            x: fx,
                            y: fy,
                            width: LENS_R * 2,
                            height: LENS_R * 2,
                            translateX: '-50%',
                            translateY: '-50%',
                            border: `1px solid ${color}`,
                            background: 'radial-gradient(circle, rgba(176,185,232,0.08), rgba(176,185,232,0) 70%)',
                            boxShadow: '0 0 40px rgba(176,185,232,0.12)',
                        }}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 0.5, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.25, ease: EASE }}
                    />
                )}
            </AnimatePresence>
        </p>
    );
}
