'use client';

import { m, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion';
import { useState, useEffect, useSyncExternalStore } from 'react';
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
const DESKTOP_QUERY = '(min-width: 900px)';
const subscribeDesktop = (onChange: () => void) => {
    const media = window.matchMedia(DESKTOP_QUERY);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
};

/**
 * Read before the first paint, so a desktop never draws the phone layout (name
 * top-left) for a frame. null on the server and while hydrating.
 */
function useIsDesktop(): boolean | null {
    return useSyncExternalStore(
        subscribeDesktop,
        () => window.matchMedia(DESKTOP_QUERY).matches,
        () => null
    );
}

/* ----------------------------------------
   End-of-page reveal
   true once the footer's top is in the upper half of the screen (onFooter), else
   past 90% of the page's scroll
---------------------------------------- */
function useAtBottom(scrollYProgress: MotionValue<number>, onFooter: boolean) {
    const [atBottom, setAtBottom] = useState(false);

    useEffect(() => {
        const footer = onFooter ? document.querySelector('[data-site-footer]') : null;
        if (!footer) return scrollYProgress.on('change', (latest) => setAtBottom(latest > 0.9));

        const observer = new IntersectionObserver(
            ([entry]) => setAtBottom(entry.isIntersecting),
            // Only the top half of the screen counts
            { rootMargin: '0px 0px -50% 0px' }
        );
        observer.observe(footer);
        return () => observer.disconnect();
    }, [scrollYProgress, onFooter]);

    return atBottom;
}

interface LayoutProps {
    storyFirst: boolean;
    revealOnFooter: boolean;
}

/* ----------------------------------------
   Main Export
---------------------------------------- */
/**
 * storyFirst: the page opens on the closing statement, so the pinned name
 * and the contact button wait for it (desktop: name after the story;
 * phone: the name is at the top, so only the button waits).
 */
// Follow the story's timing (SetbackLines' write intro, then the turn and the ask)
const STORY_NAME_DELAY = 7.2; // s, desktop name as the ask settles
const STORY_CTA_DELAY = 8.0; // s, Book a call last

/**
 * revealOnFooter: the links and the Email/Telegram buttons come up once the page's
 * footer ([data-site-footer]) is reached, instead of at 90% of the scroll.
 */
export default function AboutMe({ storyFirst = false, revealOnFooter = false }: { storyFirst?: boolean; revealOnFooter?: boolean }) {
    const isDesktop = useIsDesktop();

    // Nothing until the screen size is known (server render and hydration)
    if (isDesktop === null) return null;

    return isDesktop
        ? <DesktopAboutMe storyFirst={storyFirst} revealOnFooter={revealOnFooter} />
        : <MobileAboutMe storyFirst={storyFirst} revealOnFooter={revealOnFooter} />;
}

/* ----------------------------------------
   DESKTOP LAYOUT (UNCHANGED)
---------------------------------------- */
function DesktopAboutMe({ storyFirst, revealOnFooter }: LayoutProps) {
    const nameAt = storyFirst ? STORY_NAME_DELAY : 0;
    const { scrollY, scrollYProgress } = useScroll();
    const atBottom = useAtBottom(scrollYProgress, revealOnFooter);

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
                            delay={nameAt}
                            as="h1"
                            className="text-[38px] leading-[1em] tracking-[-0.04em] font-[var(--font-tasa)] font-bold text-white"
                        />
                        <RevealLine
                            text="Product Designer × Builder"
                            delay={nameAt + 0.25}
                            as="h2"
                            className="text-xl font-medium text-white font-[var(--font-tasa)]"
                        />
                    </div>
                    <m.div style={{ opacity: line3Opacity, filter: line3Blur }}>
                        <RevealLine
                            text="Designing systems that help users win & businesses succeed."
                            delay={nameAt + 0.5}
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
                // Difference blend, like the name: reads over any work behind it
                className="fixed bottom-12 left-1/2 -translate-x-1/2 z-100 flex gap-4 pointer-events-auto mix-blend-difference"
                style={{ pointerEvents: atBottom ? 'auto' : 'none' }}
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
                        delay: storyFirst ? STORY_CTA_DELAY : 1.2,
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
                            <Button variant="secondary">Telegram</Button>
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
function MobileAboutMe({ storyFirst, revealOnFooter }: LayoutProps) {
    const { scrollY, scrollYProgress } = useScroll();
    const atBottom = useAtBottom(scrollYProgress, revealOnFooter);

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
                // Difference blend, like the name: reads over any work behind it
                className="flex flex-col fixed bottom-12 left-5 z-100 gap-4 mix-blend-difference"
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
                        delay: storyFirst ? STORY_CTA_DELAY : 1.2,
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
                            <Button variant="secondary">Telegram</Button>
                        </a>
                    </m.div>
                </m.div>
            </div>
        </>
    );
}
