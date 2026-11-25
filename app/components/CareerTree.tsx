'use client';

import React, { useState } from 'react';
import { m, AnimatePresence, Variants } from 'framer-motion';
import { ArrowUpRight, Briefcase, Check } from 'lucide-react';
import { career, type CareerLink, type CareerStep, type CareerStatus } from '../data/career';

/* ----------------------------------------
   Career tree
   A vertical timeline: finished steps are checked and joined by a pink
   rail; clicking a step branches out its details, links and highlights.
---------------------------------------- */
const PINK = '#f0449a';
const RAIL_GRAY = 'rgba(255,255,255,0.22)';

// Rail geometry (px): main rail at x=18, branch rail at x=36
const RAIL_X = 18;
const BRANCH_X = 36;

const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
};

const rowVariants: Variants = {
    hidden: { opacity: 0, y: 8, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

function linkProps(href: string) {
    return isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function StepIcon({ status }: { status: CareerStatus }) {
    if (status === 'done') {
        return (
            <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: PINK }}>
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
        );
    }
    if (status === 'current') {
        return (
            <span
                className="relative flex h-5 w-5 items-center justify-center rounded-full"
                style={{ boxShadow: `inset 0 0 0 2px ${PINK}55`, background: '#2a1621' }}
            >
                <span className="absolute h-2 w-2 rounded-full animate-ping opacity-40" style={{ background: PINK }} />
                <span className="h-2 w-2 rounded-full" style={{ background: PINK }} />
            </span>
        );
    }
    return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-500 bg-black">
            <Briefcase className="h-2.5 w-2.5 text-blue-500" strokeWidth={2.5} />
        </span>
    );
}

function StepMeta({ step }: { step: CareerStep }) {
    if (step.status === 'current') {
        return <span className="text-[13px] font-medium text-blue-400">{step.period}</span>;
    }
    if (step.status === 'next') {
        return (
            <span className="whitespace-nowrap rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[12px] font-medium text-amber-400">
                {step.period}
            </span>
        );
    }
    return <span className="text-[13px] tabular-nums text-white/60">{step.period}</span>;
}

function TextLink({ link }: { link: CareerLink }) {
    return (
        <a
            href={link.href}
            {...linkProps(link.href)}
            className="inline-flex items-center gap-0.5 text-blue-400 underline decoration-blue-400/30 underline-offset-4 transition-colors hover:text-blue-300 hover:decoration-blue-300"
        >
            {link.label}
            <ArrowUpRight className="h-3 w-3 opacity-70" />
        </a>
    );
}

function Branch({ step, isLast }: { step: CareerStep; isLast: boolean }) {
    const highlights = step.highlights ?? [];
    const links = step.links ?? [];

    return (
        <div className="relative pb-4 pl-14 pr-1">
            {/* Branch rails: curve out to x=36, run down, curve back to the main rail */}
            <svg className="absolute left-0 top-0" width="40" height="20" aria-hidden>
                <path d={`M${RAIL_X} 0 C${RAIL_X} 10, ${BRANCH_X} 10, ${BRANCH_X} 20`} stroke={RAIL_GRAY} strokeWidth="1.5" fill="none" />
            </svg>
            <span
                className="absolute w-[1.5px]"
                style={{ left: BRANCH_X - 0.75, top: 20, bottom: isLast ? 28 : 20, background: RAIL_GRAY }}
                aria-hidden
            />
            {!isLast && (
                <svg className="absolute bottom-0 left-0" width="40" height="20" aria-hidden>
                    <path d={`M${BRANCH_X} 0 C${BRANCH_X} 10, ${RAIL_X} 10, ${RAIL_X} 20`} stroke={RAIL_GRAY} strokeWidth="1.5" fill="none" />
                </svg>
            )}

            <p className="text-[13px] leading-[1.5] text-white/75">{step.description}</p>

            {highlights.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1.5">
                    {highlights.map((h, i) => {
                        const active = step.status === 'current' && i === highlights.length - 1;
                        return (
                            <li key={i} className="relative text-[13px] leading-[1.45] text-white/75">
                                <span
                                    className="absolute top-[6.5px] h-1.5 w-1.5 rounded-full"
                                    style={{ left: BRANCH_X - 3 - 56, background: active ? PINK : 'rgba(255,255,255,0.5)' }}
                                    aria-hidden
                                />
                                {h.text}
                                {h.links?.map((l) => (
                                    <span key={l.href} className="ml-3 whitespace-nowrap text-[12px]">
                                        <TextLink link={l} />
                                    </span>
                                ))}
                            </li>
                        );
                    })}
                </ul>
            )}

            {links.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                    {links.map((l) => (
                        <TextLink key={l.href} link={l} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CareerTree() {
    const [openId, setOpenId] = useState<string | null>(
        career.find((s) => s.status === 'current')?.id ?? null
    );

    // Segment below a step is pink once that step is finished
    const segmentColor = (i: number) => (career[i]?.status === 'done' ? PINK : RAIL_GRAY);

    return (
        <section className="flex w-full flex-col items-center px-4 sm:px-6">
            <div className="w-full max-w-2xl">
                <m.ol
                    variants={listVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    aria-label="Career"
                >
                    {career.map((step, i) => {
                        const isFirst = i === 0;
                        const isLast = i === career.length - 1;
                        const isOpen = openId === step.id;
                        const panelId = `career-${step.id}`;
                        const dim = step.status === 'done' && !isOpen;

                        return (
                            <m.li key={step.id} variants={rowVariants} className="relative">
                                {!isFirst && (
                                    <span
                                        className="absolute h-2.5 w-[1.5px]"
                                        style={{ left: RAIL_X - 0.75, top: 0, background: segmentColor(i - 1) }}
                                        aria-hidden
                                    />
                                )}

                                <button
                                    type="button"
                                    onClick={() => setOpenId(isOpen ? null : step.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    className="group relative grid w-full cursor-pointer grid-cols-[40px_1fr_auto] items-start gap-x-4 py-2.5 text-left"
                                >
                                    {(!isLast || isOpen) && (
                                        <span
                                            className="absolute bottom-0 top-[30px] w-[1.5px]"
                                            style={{ left: RAIL_X - 0.75, background: isOpen ? RAIL_GRAY : segmentColor(i) }}
                                            aria-hidden
                                        />
                                    )}
                                    <span className="relative ml-2">
                                        <StepIcon status={step.status} />
                                    </span>
                                    <span className="min-w-0">
                                        <span
                                            className={`block text-[15px] font-medium leading-5 transition-colors ${
                                                dim ? 'text-white/85 group-hover:text-white' : 'text-white'
                                            }`}
                                        >
                                            {step.title}
                                        </span>
                                        <span className="block truncate text-[12px] leading-[18px] text-white/55">{step.role}</span>
                                        {step.summary && (
                                            <span className="mt-0.5 block text-[13px] leading-[18px] text-white/75">{step.summary}</span>
                                        )}
                                    </span>
                                    <span>
                                        <StepMeta step={step} />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <m.div
                                            id={panelId}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <Branch step={step} isLast={isLast} />
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            </m.li>
                        );
                    })}
                </m.ol>
            </div>
        </section>
    );
}
