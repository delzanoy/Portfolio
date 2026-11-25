'use client';

import React, { useEffect } from 'react';
import { m, useReducedMotion, type Variants } from 'framer-motion';
import { careerStory } from '../data/career';
import { preloadEmojis, type EmojiSet } from './EmojiGlyph';
import SetbackLines, { type CursorMode } from './SetbackLines';

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
}: {
    className?: string;
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
    const afterSetbacks = setbacks.length * SETBACK_GAP + 0.5;

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
            className={`flex w-full justify-center px-5 sm:px-6 ${className}`}
        >
            <div className="w-full max-w-2xl">
                <SetbackLines
                    lines={setbacks.map((s) => ({ text: s.text, ...(emojiSet === 'noto' ? s.noto : { emoji: s.emoji, pool: s.pool }) }))}
                    set={emojiSet}
                    cursor={cursor}
                    enabled={!reduce}
                    reduce={!!reduce}
                    color={lav(0.9)}
                />

                <m.p
                    custom={afterSetbacks}
                    variants={line}
                    className="mt-10 max-w-[42ch] text-[17px] leading-[1.6] text-white/75 sm:mt-14 sm:text-[19px]"
                >
                    {turn}
                </m.p>

                <m.p
                    custom={afterSetbacks + 0.5}
                    variants={line}
                    className="mt-5 max-w-[16ch] text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[52px]"
                    style={{ fontFamily: 'var(--font-tasa)' }}
                >
                    {ask}
                </m.p>
            </div>
        </m.section>
    );
}
