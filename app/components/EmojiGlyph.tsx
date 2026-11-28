'use client';

import React, { useEffect, useRef } from 'react';

/* ----------------------------------------
   Emoji glyph
   Renders one emoji in a chosen set, sized to the surrounding text (1em):
   - native: the system emoji font
   - fluent: Microsoft Fluent Emoji, 3D style (static webp from a CDN)
   - noto:   Google's animated Noto Emoji (Lottie), played when shown
---------------------------------------- */
export type EmojiSet = 'native' | 'fluent' | 'noto';

const codepoints = (emoji: string, keepVS: boolean) =>
    [...emoji]
        .map((c) => c.codePointAt(0)!.toString(16))
        .filter((h) => keepVS || h !== 'fe0f');

const fluentUrl = (emoji: string) =>
    `https://registry.npmmirror.com/@lobehub/fluent-emoji-3d/latest/files/assets/${codepoints(emoji, true).join('-')}.webp`;

const notoUrl = (emoji: string) =>
    `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoints(emoji, false).join('_')}/lottie.json`;

const NOTO_SCALE = 1.5; // drawn size relative to the text

// Each Lottie file is fetched once per page and shared
const notoCache = new Map<string, Promise<unknown>>();
const loadNoto = (emoji: string) => {
    if (!notoCache.has(emoji)) {
        notoCache.set(emoji, fetch(notoUrl(emoji)).then((r) => r.json()));
    }
    return notoCache.get(emoji)!;
};

/** Warm the cache so hovered emojis appear instantly instead of popping in late */
export function preloadEmojis(set: EmojiSet, emojis: string[]) {
    if (set === 'fluent') {
        emojis.forEach((e) => {
            const img = new Image();
            img.src = fluentUrl(e);
        });
    } else if (set === 'noto') {
        import('lottie-web/build/player/lottie_light');
        emojis.forEach((e) => loadNoto(e).catch(() => notoCache.delete(e)));
    }
}

/**
 * Resolves once the given emojis can be drawn without a late pop-in
 * (Noto: Lottie player and files loaded), or after `timeoutMs`, whichever is first.
 */
export function whenEmojisReady(set: EmojiSet, emojis: string[], timeoutMs: number): Promise<void> {
    if (set !== 'noto') return Promise.resolve();
    const ready = Promise.all([import('lottie-web/build/player/lottie_light'), ...emojis.map(loadNoto)]).then(
        () => undefined,
        () => undefined
    );
    return Promise.race([ready, new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}

/** The parts of a Lottie animation callers can drive (e.g. to step it frame by frame) */
export interface NotoAnim {
    goToAndStop: (value: number, isFrame?: boolean) => void;
    totalFrames: number;
}
type Segments = [number, number][];

function NotoEmoji({
    emoji,
    loop,
    replayKey,
    autoplay = true,
    onAnim,
    replaySegments,
}: {
    emoji: string;
    loop: boolean;
    replayKey?: number;
    autoplay?: boolean;
    onAnim?: (anim: NotoAnim | null) => void;
    replaySegments?: Segments;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const anim = useRef<
        | (NotoAnim & {
              goToAndPlay: (v: number, f: boolean) => void;
              playSegments: (segments: Segments, force: boolean) => void;
              destroy: () => void;
          })
        | null
    >(null);
    const onAnimRef = useRef(onAnim);
    useEffect(() => {
        onAnimRef.current = onAnim;
    });

    useEffect(() => {
        let cancelled = false;
        Promise.all([import('lottie-web/build/player/lottie_light'), loadNoto(emoji)]).then(([lottie, data]) => {
            if (cancelled || !ref.current) return;
            anim.current = lottie.default.loadAnimation({
                container: ref.current,
                renderer: 'svg',
                loop,
                autoplay,
                animationData: structuredClone(data), // lottie mutates its input; keep the cached copy clean
            });
            onAnimRef.current?.(anim.current);
        });
        return () => {
            cancelled = true;
            onAnimRef.current?.(null);
            anim.current?.destroy();
            anim.current = null;
        };
    }, [emoji, loop, autoplay]);

    // Replay when asked (e.g. on hover): from the start, or the given frame ranges
    const segmentsRef = useRef(replaySegments);
    useEffect(() => {
        segmentsRef.current = replaySegments;
    });
    useEffect(() => {
        if (!replayKey || !anim.current) return;
        if (segmentsRef.current) anim.current.playSegments(segmentsRef.current, true);
        else anim.current.goToAndPlay(0, true);
    }, [replayKey]);

    // Noto's artwork has padding built in, so it's drawn larger than the text
    // (NOTO_SCALE) while negative top/bottom margins keep the line height
    // unchanged; the font size is untouched.
    const overhang = `${-(NOTO_SCALE - 1) / 2}em`;
    return (
        <span
            ref={ref}
            aria-hidden
            className="inline-block shrink-0 align-[-0.12em]"
            style={{ width: `${NOTO_SCALE}em`, height: `${NOTO_SCALE}em`, marginBlock: overhang, marginInline: '-0.1em' }}
        />
    );
}

export default function EmojiGlyph({
    emoji,
    set,
    loop = true,
    replayKey,
    autoplay = true,
    onAnim,
    replaySegments,
}: {
    emoji: string;
    set: EmojiSet;
    /** Noto only: loop while shown, or play once */
    loop?: boolean;
    /** Noto only: change this number to replay the animation */
    replayKey?: number;
    /** Noto only: false holds the first frame until replayKey changes */
    autoplay?: boolean;
    /** Noto only: receives the Lottie animation once loaded (null when it goes), to drive it directly */
    onAnim?: (anim: NotoAnim | null) => void;
    /** Noto only: the frame ranges a replay plays, instead of the whole animation */
    replaySegments?: Segments;
}) {
    if (set === 'fluent') {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={fluentUrl(emoji)}
                alt=""
                aria-hidden
                draggable={false}
                className="inline-block h-[1em] w-[1em] align-[-0.12em]"
            />
        );
    }
    if (set === 'noto')
        return (
            <NotoEmoji
                emoji={emoji}
                loop={loop}
                replayKey={replayKey}
                autoplay={autoplay}
                onAnim={onAnim}
                replaySegments={replaySegments}
            />
        );
    return <>{emoji}</>;
}
