import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

export default function TableOfContents({ activeSection, sections }: { activeSection: string; sections: { id: string; label: string }[] }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const containerVariants = {
        collapsed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
        expanded: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
    };

    const itemVariants = {
        initial: { opacity: 0, x: 10, filter: 'blur(4px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, x: 10, filter: 'blur(4px)' }
    };

    return (
        <m.div
            className="fixed right-5 xl:right-5 top-1/2 -translate-y-1/2 z-[250] hidden xl:flex flex-col gap-4 items-end pointer-events-auto px-6 py-10"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            variants={containerVariants}
        >
            {sections.map((section) => (
                <div
                    key={section.id}
                    className="relative flex items-center gap-4 group cursor-pointer py-1.5"
                    onMouseEnter={() => setHoveredId(section.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => scrollToSection(section.id)}
                >
                    <AnimatePresence mode="wait">
                        {(isExpanded || hoveredId === section.id || activeSection === section.id) && (
                            <m.span
                                variants={itemVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{
                                    duration: 0.5,
                                    ease: [0.16, 1, 0.3, 1] // easeOutExpo
                                }}
                                className="text-[11px] font-bold uppercase tracking-wider font-[var(--font-tasa)] whitespace-nowrap overflow-visible"
                                style={{
                                    textShadow: activeSection === section.id ? '0 0 12px rgba(255,255,255,0.4)' : 'none',
                                    color: activeSection === section.id ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                                    opacity: (hoveredId === section.id || activeSection === section.id) ? 1 : 0.6
                                }}
                            >
                                {section.label}
                            </m.span>
                        )}
                    </AnimatePresence>

                    <m.div
                        className="h-[1.5px] bg-white/20"
                        animate={{
                            width: activeSection === section.id ? 32 : (hoveredId === section.id ? 24 : 12),
                            backgroundColor: activeSection === section.id || hoveredId === section.id ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.2)',
                            boxShadow: activeSection === section.id ? '0 0 12px rgba(255,255,255,0.8)' : 'none'
                        }}
                        transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                    />
                </div>
            ))}
        </m.div>
    );
}