// app/components/TextReveal.tsx
'use client';

import { m, Variants } from 'framer-motion';

interface RevealLineProps {
    text: string;
    delay: number;
    className?: string;
    as?: 'div' | 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

// Defining variants outside the component with the Variants type
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({
        opacity: 1,
        transition: {
            staggerChildren: 0.015,
            delayChildren: delay,
        },
    }),
};

const childVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 15,
        filter: 'blur(8px)',
        textShadow: '0px 0px 0px rgba(0,0,0,0)'
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        textShadow: '0px 12px 14px rgba(0,0,0,0.6)',
        transition: {
            type: 'spring',
            damping: 15,
            stiffness: 100,
            textShadow: { delay: 0.2, duration: 1 } // Delay shadow slightly for better feel
        },
    },
};

export const RevealLine = ({ text, delay, className, as = 'div' }: RevealLineProps) => {
    const Component = m[as];

    // Group characters into words so a line can only wrap between words.
    // Each word is a plain nowrap inline-block; the spaces between words stay
    // as animated (inline, breakable) children so the stagger timing is the
    // same as when every character was a direct child.
    const words = text.split(' ').reduce<{ word: string; start: number }[]>((acc, word) => {
        const prev = acc[acc.length - 1];
        // +1 for the space that follows each word
        return [...acc, { word, start: prev ? prev.start + prev.word.length + 1 : 0 }];
    }, []);

    return (
        <Component
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            custom={delay} // Passing delay as a custom prop to variants
            className={className}
        >
            {words.map(({ word, start }, wordIndex) => (
                <span key={start}>
                    <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {word.split('').map((char, i) => (
                            <m.span
                                key={`${char}-${start + i}`}
                                variants={childVariants}
                                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                            >
                                {char}
                            </m.span>
                        ))}
                    </span>
                    {wordIndex < words.length - 1 && (
                        <m.span variants={childVariants} style={{ display: 'inline' }}>
                            {' '}
                        </m.span>
                    )}
                </span>
            ))}
        </Component>
    );
};