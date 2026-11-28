'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    m,
    animate,
    cubicBezier,
    AnimatePresence,
    useInView,
    useMotionValue,
    useSpring,
    type MotionValue,
    type Variants,
} from 'framer-motion';
import EmojiGlyph, { whenEmojisReady, type EmojiSet, type NotoAnim } from './EmojiGlyph';

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
/* Write intro: each line's end emoji starts at the line's first letter and
   travels to its place at the end; the letters appear behind it as it passes.
   One line after another.

   The timing comes from each emoji's own Noto animation (60fps): every phase
   is a range of the artwork's frames, and the intro steps the artwork frame by
   frame from the same clock as the travel, so the two can't drift apart. */
export type IntroStyle = 'rise' | 'write';
type Bezier = [number, number, number, number];

interface EmojiScript {
    /** Frames that play while it fades in at the line start, or one frame held for APPEAR_HOLD */
    appear: [number, number] | number;
    /** Frames that play while it travels, and the travel's curve */
    travel: { frames: [number, number]; ease: Bezier };
    /** Frames that play once it's in place, before the next line starts */
    land?: [number, number];
    /**
     * Degrees (clockwise) that turn the artwork's own direction of flight onto the
     * line. It leans into this with its speed: its usual tilt at rest, level at speed.
     */
    heading?: number;
    /** Frame it rests on afterwards: the emoji's still pose */
    rest: number;
    /** A looping animation's length in frames: frames past it wrap around (it's seamless) */
    period?: number;
    /** What a hover plays once the intro is done (default: from frame 0 to the end) */
    replay?: [number, number][];
}

const FPS = 60; // Noto animations' frame rate
const APPEAR_HOLD = 0.4; // s, fade-in time when `appear` holds a frame
const WRITE_LINE_GAP = 0.15; // s after a line's emoji settles before the next one appears
const WRITE_REVEAL = 0.45; // s for a passed letter to fade in
const ARRIVE_FADE = 0.35; // s for the emoji to fade in at the line start
const fadeIn = cubicBezier(0.22, 1, 0.36, 1);
const EMOJI_WAIT = 800; // ms to wait for the emoji artwork before starting anyway

const SCRIPTS: Record<string, EmojiScript> = {
    // 🔌 Still until frame 42. Tilts back and slides right as if pulled by its cord (42–76):
    // that's the travel, on the artwork's own curve. Then it plugs into the end of the
    // line (snap at ~86–94), holds, yanks out (130–140) and swings back to rest (~164).
    '🔌': { appear: [18, 42], travel: { frames: [42, 76], ease: [0.333, 0, 0.186, 1] }, land: [76, 164], rest: 0 },
    // 🚀 A 40-frame flight loop: the flame and speed lines run for exactly one loop
    // while it travels, so it lands on the loop's seam, its resting frame. It's drawn
    // flying up-right (its speed lines are at exactly 45°), so it turns 45° to fly
    // along the line: level as it speeds away, nose lifting back up as it slows to land.
    '🚀': { appear: 0, travel: { frames: [0, 40], ease: [0.4, 0, 0.2, 1] }, rest: 0, period: 40, heading: 45 },
    // 👋 A 92-frame loop of two waves. The hand rocks between upright (-20°, still at
    // frames 14 and 60) and leaning back (-43°, still at 38 and 84); frames 0/46/92 are
    // mid-swing, so every phase is cut on a still point:
    // - fades in upright (14), travels 14→60 with its fingers trailing back as it speeds up
    //   (the travel curve is fitted to the hand's own lean: fastest at 38, where it leans
    //   most) and comes to rest upright (60);
    // - then one goodbye wave, through the loop's seam (92 = 0), back upright at 14.
    '👋': {
        appear: 14,
        travel: { frames: [14, 60], ease: [0.586, 0, 0.372, 1] },
        land: [60, 106],
        rest: 14,
        period: 92,
        // A hover plays the whole loop from rest to rest: 14→92 (= 0), then 0→14. Lottie
        // stops a segment one frame short of its end, so each range runs one frame past.
        replay: [
            [14, 93],
            [0, 15],
        ],
    },
};
// Any other emoji (or a non-Noto set): hold, travel for 0.6s, done
const FALLBACK_SCRIPT: EmojiScript = { appear: 0, travel: { frames: [0, 36], ease: [0.4, 0, 0.2, 1] }, rest: 0 };
const scriptFor = (emoji: string) => SCRIPTS[emoji] ?? FALLBACK_SCRIPT;

const span = ([a, b]: [number, number]) => (b - a) / FPS;

/**
 * How far into its heading the emoji leans at travel progress p (0–1): follows the
 * travel's speed, fully turned from half its top speed up, back to 0 as it stops.
 */
function leanBySpeed(ease: (p: number) => number) {
    const h = 0.002;
    const speed = (p: number) => {
        const a = Math.max(p - h, 0);
        const b = Math.min(p + h, 1);
        return (ease(b) - ease(a)) / (b - a);
    };
    let top = 0;
    for (let p = 0; p <= 1; p += 0.005) top = Math.max(top, speed(p));
    return (p: number) => {
        const t = Math.min(Math.max(speed(p) / (0.5 * top), 0), 1);
        return t * t * (3 - 2 * t); // smoothstep
    };
}
/** Seconds of each phase of a line */
function phases(emoji: string) {
    const sc = scriptFor(emoji);
    return {
        appear: typeof sc.appear === 'number' ? APPEAR_HOLD : span(sc.appear),
        travel: span(sc.travel.frames),
        land: sc.land ? span(sc.land) : 0,
    };
}

const letterCount = (text: string) => text.replace(/ /g, '').length;


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
    concealed = false,
}: {
    id: number;
    line: number;
    char: string;
    emoji: string | undefined;
    /** Write intro: not written yet */
    concealed?: boolean;
    set: EmojiSet;
    register: (id: number, entry: CharEntry | null) => void;
    onEnter?: () => void;
    onLeave?: () => void;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    // Write intro: the first reveal is a slow fade; hover swaps keep their quick timing
    const [wasConcealed, setWasConcealed] = useState(concealed);
    const [slowReveal, setSlowReveal] = useState(false);
    if (wasConcealed !== concealed) {
        setWasConcealed(concealed);
        if (!concealed) setSlowReveal(true);
    }
    if (emoji && slowReveal) setSlowReveal(false);
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
                // Concealed letters start hidden in the server HTML too, so there's no flash of text
                initial={concealed ? { opacity: 0, scale: 1, filter: 'blur(3px)' } : undefined}
                animate={
                    concealed
                        ? { opacity: 0, scale: 1, filter: 'blur(3px)' }
                        : emoji
                          ? { opacity: 0, scale: 0.5, filter: 'blur(4px)' }
                          : { opacity: 1, scale: 1, filter: 'blur(0px)' }
                }
                transition={concealed ? { duration: 0 } : { duration: slowReveal ? WRITE_REVEAL : 0.25, ease: EASE }}
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
type EndEntry = {
    el: HTMLSpanElement;
    x: MotionValue<number>;
    y: MotionValue<number>;
    opacity: MotionValue<number>;
    scale: MotionValue<number>;
    rotate: MotionValue<number>;
    /** Shows one frame of the emoji's animation (Noto only; otherwise does nothing) */
    seek: (frame: number) => void;
    /** The intro is done with it: hover replays may run */
    release: () => void;
};

function EndEmoji({
    emoji,
    set,
    delay,
    variants,
    driven = false,
    replaySegments,
    line,
    register,
}: {
    emoji: string;
    set: EmojiSet;
    delay: number;
    variants: Variants;
    /** Write intro: position, fade and the artwork's frames are all set by its clock */
    driven?: boolean;
    /** Frame ranges a hover plays (default: the whole animation from frame 0) */
    replaySegments?: [number, number][];
    line: number;
    /** Hands the write intro this emoji's element and position, so it can travel */
    register: (line: number, entry: EndEntry | null) => void;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    // Driven: hidden until the intro fades it in (also in the server HTML)
    const opacity = useMotionValue(driven ? 0 : 1);
    const scale = useMotionValue(1);
    const rotate = useMotionValue(0);
    const [replay, setReplay] = useState(0);
    // While the intro drives it, a hover mustn't start the animation underneath it
    const [live, setLive] = useState(!driven);
    const release = useCallback(() => setLive(true), []);
    const again = useCallback(() => setReplay((n) => n + 1), []);
    const anim = useRef<NotoAnim | null>(null);
    const onAnim = useCallback((a: NotoAnim | null) => {
        anim.current = a;
    }, []);
    // Never past the last frame: the frame at the out point is empty
    const seek = useCallback((frame: number) => {
        const a = anim.current;
        if (a) a.goToAndStop(Math.max(0, Math.min(frame, a.totalFrames - 0.01)), true);
    }, []);

    useEffect(() => {
        if (ref.current) register(line, { el: ref.current, x, y, opacity, scale, rotate, seek, release });
        return () => register(line, null);
    }, [line, register, x, y, opacity, scale, rotate, seek, release]);

    return (
        <m.span
            ref={ref}
            {...(driven
                ? { style: { x, y, opacity, scale, rotate } }
                : {
                      style: { x, y },
                      custom: delay,
                      variants,
                      // Plays as it lands
                      onAnimationComplete: (def: unknown) => def === 'shown' && again(),
                  })}
            onPointerEnter={live ? again : undefined}
            className="inline-block"
        >
            {/* Write intro: no autoplay; the intro steps it frame by frame */}
            <EmojiGlyph
                emoji={emoji}
                set={set}
                loop={false}
                replayKey={replay}
                autoplay={!driven}
                onAnim={onAnim}
                replaySegments={replaySegments}
            />
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
    delay = 0,
    centered = false,
    intro = 'rise',
    onWritten,
}: {
    lines: SetbackLine[];
    set: EmojiSet;
    cursor?: CursorMode;
    /** false turns off every pointer effect (reduced motion) */
    enabled: boolean;
    reduce: boolean;
    color: string;
    /** Seconds before the first line starts */
    delay?: number;
    /** Centre each line instead of aligning left */
    centered?: boolean;
    /** rise: words rise into place. write: the end emoji travels along the line, writing it */
    intro?: IntroStyle;
    /** Write intro: called once the last line's emoji has finished */
    onWritten?: () => void;
}) {
    const boxRef = useRef<HTMLParagraphElement>(null);
    const chars = useRef(new Map<number, CharEntry>());
    const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
    const [swapped, setSwapped] = useState<Record<number, string>>({});
    const swappedRef = useRef(swapped);
    useEffect(() => {
        swappedRef.current = swapped;
    }, [swapped]);

    /* ---- Write intro ---- */
    const writeIntro = intro === 'write' && !reduce;
    // Letter ids are numbered in render order; each line's first id
    const offsets: number[] = [];
    let total = 0;
    lines.forEach((l) => {
        offsets.push(total);
        total += letterCount(l.text);
    });
    const [concealed, setConcealed] = useState<Set<number>>(() => new Set(Array.from({ length: total }, (_, i) => i)));
    const ends = useRef(new Map<number, EndEntry>());
    const registerEnd = useCallback((line: number, entry: EndEntry | null) => {
        if (entry) ends.current.set(line, entry);
        else ends.current.delete(line);
    }, []);
    const inView = useInView(boxRef, { once: true, amount: 0.25 });
    const introRef = useRef({ lines, set, delay, offsets, onWritten });
    useEffect(() => {
        introRef.current = { lines, set, delay, offsets, onWritten };
    });

    useEffect(() => {
        if (!writeIntro || !inView) return;
        const { lines: ls, set: es, delay: d, offsets: off } = introRef.current;
        const t0 = performance.now();
        let cancelled = false;
        let travel: { stop: () => void } | null = null;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const wait = (sec: number) => new Promise<void>((r) => (timer = setTimeout(r, sec * 1000)));
        const reveal = (ids: number[]) =>
            setConcealed((c) => {
                const next = new Set(c);
                ids.forEach((i) => next.delete(i));
                return next;
            });

        (async () => {
            await whenEmojisReady(es, ls.map((l) => l.emoji), EMOJI_WAIT);
            if (cancelled) return;
            // Keep to the planned start unless the artwork took longer
            await wait(Math.max(d - (performance.now() - t0) / 1000, 0));

            for (let li = 0; li < ls.length; li++) {
                if (cancelled) return;
                const n = letterCount(ls[li].text);
                const ids = Array.from({ length: n }, (_, k) => off[li] + k);
                const end = ends.current.get(li);
                const rects = ids.map((id) => chars.current.get(id)?.el.getBoundingClientRect());
                if (!end || rects.some((r) => !r)) {
                    reveal(ids);
                    continue;
                }

                // Where the emoji rests (centre-based: it's mid pop-in scale/rotate)
                const er = end.el.getBoundingClientRect();
                const restLeft = er.left + er.width / 2 - end.el.offsetWidth / 2;
                const restY = er.top + er.height / 2;
                // Stops for the emoji's left edge: each letter's left, then its resting spot.
                // Rows come from the letters, so on wrapped lines it follows onto the next row.
                const stopX = [...rects.map((r) => r!.left), restLeft];
                const stopY = [...rects.map((r) => r!.top + r!.height / 2), restY];
                const place = (k: number) => {
                    const j = Math.min(Math.floor(k), n);
                    const f = k - j;
                    const sameRow = j < n && Math.abs(stopY[j + 1] - stopY[j]) < 2;
                    end.x.set(stopX[j] + (sameRow ? (stopX[j + 1] - stopX[j]) * f : 0) - restLeft);
                    end.y.set(stopY[j] - restY);
                };

                // One clock for the whole line: fade in, travel, then whatever the artwork
                // does once it's in place. Position, letters and the artwork's frame all
                // follow it.
                const sc = scriptFor(ls[li].emoji);
                const ph = phases(ls[li].emoji);
                const ease = cubicBezier(...sc.travel.ease);
                const lean = sc.heading ? leanBySpeed(ease) : null;
                const [t0] = sc.travel.frames;
                // A looping animation wraps (its seam is seamless; the frame at the seam itself is empty)
                const wrap = (f: number) => (sc.period ? f % sc.period : f);
                const travelFrame = (sec: number) => wrap(t0 + Math.min(sec, ph.travel) * FPS);
                const appearFrame = (sec: number) =>
                    wrap(typeof sc.appear === 'number' ? sc.appear : sc.appear[0] + sec * FPS);

                place(0);
                end.seek(appearFrame(0));

                let written = 0;
                let landed = false;
                await new Promise<void>((done) => {
                    travel = animate(0, ph.appear + ph.travel + ph.land, {
                        duration: ph.appear + ph.travel + ph.land,
                        ease: 'linear',
                        onUpdate: (t) => {
                            // Fades in over the start of the appear phase
                            const fade = fadeIn(Math.min(t / ARRIVE_FADE, 1));
                            end.opacity.set(fade);
                            end.scale.set(0.85 + 0.15 * fade);
                            if (t < ph.appear) {
                                place(0);
                                end.rotate.set(0);
                                end.seek(appearFrame(t));
                                return;
                            }
                            const into = t - ph.appear;
                            if (into < ph.travel) {
                                const p = into / ph.travel;
                                const k = ease(p) * n;
                                place(k);
                                if (lean) end.rotate.set(sc.heading! * lean(p));
                                end.seek(travelFrame(into));
                                // Letters appear once the emoji has passed them
                                const upTo = Math.floor(k);
                                if (upTo > written) {
                                    reveal(ids.slice(written, upTo));
                                    written = upTo;
                                }
                                return;
                            }
                            // In place (re-applied each frame, so the clock can also be scrubbed back)
                            place(n);
                            end.rotate.set(0);
                            if (!landed) {
                                landed = true;
                                reveal(ids);
                            }
                            end.seek(
                                sc.land
                                    ? wrap(Math.min(sc.land[0] + (into - ph.travel) * FPS, sc.land[1]))
                                    : travelFrame(ph.travel)
                            );
                        },
                        onComplete: done,
                    });
                });
                if (cancelled) return;
                reveal(ids);
                end.x.set(0);
                end.y.set(0);
                end.opacity.set(1);
                end.scale.set(1);
                end.rotate.set(0);
                end.seek(sc.rest);
                end.release();
                if (li < ls.length - 1) await wait(WRITE_LINE_GAP);
            }
            if (!cancelled) introRef.current.onWritten?.();
        })();

        return () => {
            cancelled = true;
            travel?.stop();
            clearTimeout(timer);
        };
    }, [writeIntro, inView]);

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
    // Write intro: words don't rise, the travelling emoji does the work
    const still: Variants = { hidden: { opacity: 1 }, shown: { opacity: 1 } };
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
            className={`relative flex flex-col ${centered ? 'items-center text-center' : 'items-start'}`}
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
                const lineDelay = delay + li * SETBACK_GAP;
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
                                    <m.span custom={lineDelay + wi * WORD_GAP} variants={writeIntro ? still : word} className="inline-block whitespace-nowrap">
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
                                                    concealed={writeIntro && concealed.has(cid)}
                                                />
                                            );
                                        })}
                                    </m.span>{' '}
                                </React.Fragment>
                            ))}
                            <EndEmoji
                                emoji={emoji}
                                set={set}
                                delay={lineDelay + words.length * WORD_GAP + 0.25}
                                variants={endEmoji}
                                driven={writeIntro}
                                replaySegments={writeIntro ? scriptFor(emoji).replay : undefined}
                                line={li}
                                register={registerEnd}
                            />
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
