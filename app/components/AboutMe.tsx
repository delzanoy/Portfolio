'use client';

import { m, useScroll, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { RevealLine } from './TextReveal';
import Button from './Button';

function EmailCopyButton() {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText('delanoykunil@gmail.com');
            setCopied(true);

            // Reset label after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy email', err);
        }
    };

    return (
        <Button
            variant="secondary"
            onClick={handleCopy}
        >
            {copied ? 'Email copied' : 'Email'}
        </Button>
    );
}
/* ----------------------------------------
   Media Query Hook
---------------------------------------- */
function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 900px)');
        const update = () => setIsDesktop(media.matches);

        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    return isDesktop;
}

/* ----------------------------------------
   Main Export
---------------------------------------- */
export default function AboutMe() {
    const isDesktop = useIsDesktop();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return isDesktop ? <DesktopAboutMe /> : <MobileAboutMe />;
}

/* ----------------------------------------
   DESKTOP LAYOUT (UNCHANGED)
---------------------------------------- */
function DesktopAboutMe() {
    const { scrollY, scrollYProgress } = useScroll();
    const [atBottom, setAtBottom] = useState(false);

    useEffect(() => {
        return scrollYProgress.on('change', (latest) => {
            setAtBottom(latest > 0.9);
        });
    }, [scrollYProgress]);

    // Left Parallax
    const yTransform = useTransform(scrollY, [0, 500], ['0%', '50%']);
    const yLeft = useSpring(yTransform, { stiffness: 100, damping: 30 });
    const line3Opacity = useTransform(scrollY, [0, 150], [1, 0]);
    const line3Blur = useTransform(scrollY, [0, 150], ['blur(0px)', 'blur(10px)']);

    // Right Variants
    const containerVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: {
            height: 'auto',
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 15 },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
        }
    };

    return (
        <>
            {/* LEFT */}
            <m.div
                style={{ y: yLeft }}
                className="fixed bottom-16 left-12 z-100 pointer-events-none select-none mix-blend-difference"
            >
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <RevealLine
                            text="Delanoy"
                            delay={0.2}
                            as="h1"
                            className="text-[38px] leading-[1em] tracking-[-0.04em] font-[var(--font-tasa)] font-bold text-white"
                        />
                        <RevealLine
                            text="Product Designer × Builder"
                            delay={0.6}
                            as="h2"
                            className="text-xl font-medium text-white font-[var(--font-tasa)]"
                        />
                    </div>
                    <m.div style={{ opacity: line3Opacity, filter: line3Blur }}>
                        <RevealLine
                            text="Designing systems that help users win & businesses succeed."
                            delay={1.2}
                            className="text-md text-white font-[var(--font-instrument)] italic"
                        />
                    </m.div>
                </div>
            </m.div>

            {/* CENTER */}
            <m.div
                initial="hidden"
                animate={atBottom ? 'visible' : 'hidden'}
                variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="fixed bottom-12 left-1/2 -translate-x-1/2 z-100 flex gap-4 pointer-events-auto"
                style={{
                    pointerEvents: atBottom ? 'auto' : 'none',
                    filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.5))'
                }}
            >
                <a className="font-[var(--font-instrument)] text-white hover:opacity-70" href="https://www.linkedin.com/in/delanoykunil/" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                </a>
                <a className="font-[var(--font-instrument)] text-white hover:opacity-70" href="https://x.com/delan0y" target="_blank" rel="noopener noreferrer">
                    X
                </a>
            </m.div>

            {/* RIGHT */}
            <div className="fixed bottom-12 right-12 z-100 flex flex-col gap-2 items-end select-none">
                <m.div
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    layout
                    transition={{
                        delay: 1.6,
                        duration: 0.8,
                        layout: { type: 'spring', stiffness: 200, damping: 25 }
                    }}
                >
                    <a
                        href="https://cal.com/delanoy/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="primary" fullWidth className="shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                            Book a call
                        </Button>
                    </a>
                </m.div>

                <m.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={atBottom ? 'visible' : 'hidden'}
                    className="flex flex-col gap-2 items-end"
                    style={{ pointerEvents: atBottom ? 'auto' : 'none' }}
                >
                    <m.div variants={itemVariants}>
                        <EmailCopyButton />
                    </m.div>
                    <m.div variants={itemVariants}>
                        <a
                            href="https://t.me/delan0y"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline">Telegram</Button>
                        </a>
                    </m.div>
                </m.div>
            </div>
        </>
    );
}

/* ----------------------------------------
   MOBILE LAYOUT
---------------------------------------- */
function MobileAboutMe() {
    const { scrollY, scrollYProgress } = useScroll();
    const [atBottom, setAtBottom] = useState(false);

    useEffect(() => {
        return scrollYProgress.on('change', (latest) => {
            setAtBottom(latest > 0.9);
        });
    }, [scrollYProgress]);

    const line3Opacity = useTransform(scrollY, [0, 150], [1, 0]);
    const line3Blur = useTransform(scrollY, [0, 150], ['blur(0px)', 'blur(10px)']);

    const containerVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: {
            height: 'auto',
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 15 },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
        }
    };

    return (
        <>
            {/* TOP LEFT TEXT */}
            <div className="fixed top-6 left-5 z-100 pointer-events-none select-none mix-blend-difference">
                <div className="flex flex-col gap-1">
                    <RevealLine
                        text="Delanoy"
                        delay={0.1}
                        as="h1"
                        className="text-[22px] leading-[1em] tracking-[-0.03em] font-[var(--font-tasa)] font-bold text-white"
                    />

                    <RevealLine
                        text="Product Designer × Builder"
                        delay={0.3}
                        as="h2"
                        className="text-sm font-medium text-white font-[var(--font-tasa)]"
                    />

                    <m.div style={{ opacity: line3Opacity, filter: line3Blur }}>
                        <RevealLine
                            text="Designing systems that help users win & businesses succeed."
                            delay={0.5}
                            className="text-xs text-white/80 font-[var(--font-instrument)] italic max-w-[85vw]"
                        />
                    </m.div>
                </div>
            </div>

            {/* CENTER LINKS — appear at bottom */}
            <m.div
                initial="hidden"
                animate={atBottom ? 'visible' : 'hidden'}
                variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col fixed bottom-12 left-5 z-100 gap-4"
                style={{ pointerEvents: atBottom ? 'auto' : 'none' }}
            >
                <a className="font-[var(--font-instrument)] text-white hover:opacity-70" href="https://www.linkedin.com/in/delanoykunil/" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                </a>
                <a className="font-[var(--font-instrument)] text-white hover:opacity-70" href="https://x.com/delan0y" target="_blank" rel="noopener noreferrer">
                    X
                </a>
            </m.div>

            {/* RIGHT BUTTON STACK — appear at bottom */}
            <div className="fixed bottom-12 right-5 z-100 flex flex-col gap-2 items-end select-none">
                <m.div
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    layout
                    transition={{
                        delay: 1.6,
                        duration: 0.8,
                        layout: { type: 'spring', stiffness: 200, damping: 25 }
                    }}
                >
                    <a
                        href="https://cal.com/delanoy/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="primary" fullWidth className="shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                            Book a call
                        </Button>
                    </a>
                </m.div>

                <m.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={atBottom ? 'visible' : 'hidden'}
                    className="flex flex-col gap-2 items-end"
                    style={{ pointerEvents: atBottom ? 'auto' : 'none' }}
                >
                    <m.div variants={itemVariants}>
                        <EmailCopyButton />
                    </m.div>
                    <m.div variants={itemVariants}>

                        <a
                            href="https://t.me/delan0y"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline">Telegram</Button>
                        </a>
                    </m.div>
                </m.div>
            </div>
        </>
    );
}
