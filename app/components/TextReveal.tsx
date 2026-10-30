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

    return (
        <Component
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            custom={delay} // Passing delay as a custom prop to variants
            className={className}
        >
            {text.split('').map((char, index) => (
                <m.span
                    key={`${char}-${index}`}
                    variants={childVariants}
                    style={{ display: 'inline-block', whiteSpace: 'pre' }}
                >
                    {char}
                </m.span>
            ))}
        </Component>
    );
};