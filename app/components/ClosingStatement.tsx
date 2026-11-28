'use client';

import React, { useEffect, useState } from 'react';
import { m, useReducedMotion, type Variants } from 'framer-motion';
import { careerStory } from '../data/career';
import { preloadEmojis, type EmojiSet } from './EmojiGlyph';
import SetbackLines, { type CursorMode, type IntroStyle } from './SetbackLines';

/* ----------------------------------------
   Closing statement
   Three beats: what ended (SetbackLines: each line ends on an emoji and
   letters swap for emojis under the pointer), the turn, and the ask, set
   large as the last words on the page.
---------------------------------------- */
const LAVENDER = '176,185,232'; // #b0b9e8, the bio gradient
const lav = (a: number) => `rgba(${LAVENDER},${a})`;

const EASE = [0.22, 1, 0.36, 1] as const;
const SETBACK_GAP = 0.4; // seconds between setback lines
export default function ClosingStatement({
    className = '',
    emojiSet = 'native',
    cursor = 'swap',
    delay = 0,
    align = 'center',
    fold = false,
    intro = 'rise',
}: {
    className?: string;
    /** Seconds before the first line starts */
    delay?: number;
    /**
     * center: a centred column, text aligned left.
     * middle: centred column and centred text.
     * start: on the pinned name's left edge.
     */
    align?: 'center' | 'middle' | 'start';
    /** Used as the first screen: tighter spacing and a smaller ask on short windows */
    fold?: boolean;
    /** How the setback lines enter: words rise, or each line's emoji travels along it, writing it */
    intro?: IntroStyle;
    /** How the pointer behaves over the setback lines (see SetbackLines) */
    cursor?: CursorMode;
    /** Which emoji artwork to use: system font, Fluent 3D or animated Noto */
    emojiSet?: EmojiSet;
}) {
    const reduce = useReducedMotion();
    const { setbacks, turn, ask } = careerStory;

    useEffect(() => {
        const all = setbacks.flatMap((s) => (emojiSet === 'noto' ? s.noto.pool : s.pool));
        preloadEmojis(emojiSet, all);
    }, [emojiSet, setbacks]);
    // The lines as drawn: the Noto set has its own emoji per line
    const lines = setbacks.map((s) => ({ text: s.text, ...(emojiSet === 'noto' ? s.noto : { emoji: s.emoji, pool: s.pool }) }));
    const writing = intro === 'write' && !reduce;
    // Write intro: the turn and the ask follow the lines when they're actually done
    // (the intro may wait for the emoji artwork); otherwise they're timed from the start
    const [written, setWritten] = useState(false);
    const afterSetbacks = writing ? 0 : delay + setbacks.length * SETBACK_GAP + 0.5;
    // (an own `animate` stops them inheriting the section's `initial`, so it's set here too)
    const follow = writing ? { initial: 'hidden', animate: written ? 'shown' : 'hidden' } : {};

    const line: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 12, filter: reduce ? 'none' : 'blur(6px)' },
        shown: (delay: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { delay: reduce ? 0 : delay, duration: 0.9, ease: EASE },
        }),
    };

    return (
        <m.section
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.25 }}
            className={`flex w-full ${
                // start: 20px on phones, 48px from 900px, matching AboutMe's pinned name
                align === 'start' ? 'justify-start px-5 min-[900px]:px-12' : 'justify-center px-5 sm:px-6'
            } ${className}`}
        >
            <div className={`w-full max-w-2xl ${align === 'middle' ? 'flex flex-col items-center text-center' : ''}`}>
                <SetbackLines
                    lines={lines}
                    set={emojiSet}
                    cursor={cursor}
                    enabled={!reduce}
                    reduce={!!reduce}
                    color={lav(0.9)}
                    delay={delay}
                    centered={align === 'middle'}
                    intro={intro}
                    onWritten={() => setWritten(true)}
                />

                <m.p
                    custom={afterSetbacks}
                    variants={line}
                    {...follow}
                    className={`mt-10 max-w-[42ch] text-[17px] leading-[1.6] text-white/75 sm:mt-14 sm:text-[19px] ${
                        fold ? '[@media(max-height:820px)]:sm:mt-8' : ''
                    }`}
                >
                    {turn}
                </m.p>

                <m.p
                    custom={afterSetbacks + 0.5}
                    variants={line}
                    {...follow}
                    className={`mt-5 max-w-[16ch] text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[52px] ${
                        fold ? '[@media(max-height:820px)]:sm:text-[44px]' : ''
                    }`}
                    style={{ fontFamily: 'var(--font-tasa)' }}
                >
                    {ask}
                </m.p>
            </div>
        </m.section>
    );
}
