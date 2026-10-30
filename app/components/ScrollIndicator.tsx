'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollIndicator() {
    const { scrollY } = useScroll();
    const [isReady, setIsReady] = useState(false);

    // ⏱ Delay appearance to let ticker settle
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsReady(true);
        }, 2000); // ~ ticker settle time

        return () => clearTimeout(timeout);
    }, []);

    // Fade & lift away near top of page
    const containerOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const containerY = useTransform(scrollY, [0, 100], [0, -20]);

    if (!isReady) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ opacity: containerOpacity, y: containerY }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
            <motion.div
                className="w-32 h-1.5 rounded-full bg-white/75 backdrop-blur-md shadow-[0_6px_14px_rgba(0,0,0,0.35)] mix-blend-difference"
                animate={{
                    /**
                     * Timeline:
                     * rest → move up + blur + fade → hidden return
                     */
                    y: [0, 0, -14, 0],
                    opacity: [1, 1, 0, 0],
                    filter: ['blur(0px)', 'blur(0px)', 'blur(6px)', 'blur(0px)'],
                }}
                transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    times: [0, 0.25, 0.55, 1],
                    ease: 'linear',
                }}
            />
        </motion.div>
    );
}
