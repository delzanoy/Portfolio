'use client';

import React, { useState, useEffect } from 'react';
import { m, motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { EmbeddedTweet, TweetSkeleton } from 'react-tweet';
import type { Tweet } from 'react-tweet/api';
import ImageGallery from './ImageGallery';
import LinkPreview from './case-study-components/LinkPreview';
import SectionWrapper from './case-study-components/SectionWrapper';
import TableOfContents from './case-study-components/TableOfContents';
import ImageSliderGallery from './ImageSliderGallery';
import FragmentedGallery from './FragmentedGallery';
import HoverZoomImage from './case-study-components/HoverZoomImage';
import Button from './Button';

class TweetErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode}, {hasError: boolean}> {
    constructor(props: {children: React.ReactNode, fallback: React.ReactNode}) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

const sections = [
    { id: 'discovery', label: 'Discovery' },
    { id: 'tldr-challenges', label: 'TL;DR & Challenges' },
    { id: 'gnosis-mpc', label: 'Gnosis Safe & MPC' },
    { id: 'problem-solution', label: 'Problem & Solution' },
    { id: 'terminology-principles', label: 'Terminology & Design principles' },
    { id: 'user-roles', label: 'Users, Roles, and Governance' },
    { id: 'wallets', label: 'Wallets' },
    { id: 'proposals', label: 'Proposals' },
    { id: 'transactions', label: 'Transactions' },
];

interface KushariCaseStudyProps {
    data: {
        id: string;
        title: string;
        chips: string[];
        description: string;
        images: string[];
        actions?: any[];
        note?: string;
    };
    tweet?: Tweet;
}

export default function KushariCaseStudy({ data, tweet: initialTweet }: KushariCaseStudyProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeSection, setActiveSection] = useState<string>('discovery');
    const [viewMode, setViewMode] = useState<'visual' | 'read'>('read');
    const [copied, setCopied] = useState(false);

    const copyEmail = () => {
        navigator.clipboard.writeText('delanoykunil@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % data.images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + data.images.length) % data.images.length);
    };

    return (
        <>
            {/* Carousel Section */}
            <div className="relative w-full aspect-[16/9] bg-white/5 overflow-hidden group rounded-t-[24px]">
                <m.div
                    layoutId={`image-${data.id}`}
                    className="absolute inset-0"
                >
                    <AnimatePresence mode="wait">
                        <m.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={data.images[currentIndex]}
                                alt={data.title}
                                fill
                                className="object-cover rounded-t-[24px]" // ← added object-left-top
                                priority
                                sizes="100vw"
                            />
                        </m.div>
                    </AnimatePresence>
                </m.div>

                {/* Navigation */}
                {data.images.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center p-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-40 transition-all duration-500">
                        <button
                            onClick={prevImage}
                            className="w-0 group-hover:w-8 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-500 overflow-hidden active:scale-90 cursor-pointer"
                        >
                            <ChevronLeft size={18} className="shrink-0" />
                        </button>

                        <div className="flex gap-2 items-center px-2">
                            {data.images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-[0.23,1,0.32,1] cursor-pointer ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextImage}
                            className="w-0 group-hover:w-8 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-500 overflow-hidden active:scale-90 cursor-pointer"
                        >
                            <ChevronRight size={18} className="shrink-0" />
                        </button>
                    </div>
                )}
            </div>

            <div className="max-w-[1240px] mx-auto px-5 py-10 md:px-8 md:py-12 lg:px-12 lg:py-16 space-y-10 md:space-y-16">

                <div className="relative space-y-10 md:space-y-16">
                    {/* <div className="block fixed bottom-4 left-4 lg:absolute lg:-left-24 lg:top-0 lg:bottom-auto lg:h-full z-[100]">
                        <Button
                            variant={viewMode === 'visual' ? 'metal' : 'primary'}
                            onClick={() => setViewMode(viewMode === 'visual' ? 'read' : 'visual')}
                            size="md"
                            className="!px-4 !py-2 shadow-lg backdrop-blur-sm lg:sticky lg:top-32"
                        >
                            {viewMode === 'visual' ? 'Product' : 'Design'}
                        </Button>
                    </div> */}
                    <div className="space-y-4">
                        <m.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="text-[28px] md:text-[32px] lg:text-[40px] leading-[1.1em] tracking-[-0.04em] font-[var(--font-tasa)] font-bold text-white"
                        >
                            {data.title}
                        </m.h2>

                        <div className="flex flex-wrap gap-2">
                            {data.chips.map((chip, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-full bg-white/10 text-[10px] uppercase tracking-[0.01em] text-[#f5f5f5b3] font-[var(--font-geist-sans)] font-medium"
                                >
                                    {chip}
                                </span>
                            ))}
                        </div>

                        <m.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            className="text-[15px] md:text-[16px] leading-[1.5em] text-white/90 font-[var(--font-geist-sans)] whitespace-pre-line max-w-md"
                        >
                            {data.description}
                        </m.p>
                    </div>

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-10 md:space-y-16"
                    >
                        {/* All sections below will automatically sit under the toggle on desktop and after the mobile toggle on mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pt-4 md:pt-8">
                            <SectionWrapper id="role" onInView={(id) => setActiveSection(id)} className="space-y-4 ">
                                <h3 id="role" className="text-lg md:text-xl lg:text-2xl font-[var(--font-tasa)] font-semibold text-white">My role</h3>
                                <p className="text-white/70 font-[var(--font-geist-sans)]">
                                    Discovery → Research → UI design → Prototyping → Product demo → Website
                                </p>
                            </SectionWrapper>
                            <SectionWrapper id="team" onInView={(id) => setActiveSection(id)} className="space-y-4 ">
                                <h3 id="team" className="text-lg md:text-xl lg:text-2xl font-[var(--font-tasa)] font-semibold text-white">Team</h3>
                                <p className="text-white/70 font-[var(--font-geist-sans)]">
                                    Sole contributor
                                    <br />
                                    This is an end-to-end product design project solely executed by me.
                                </p>
                            </SectionWrapper>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                            <SectionWrapper id="discovery" onInView={(id) => setActiveSection(id)} className="space-y-4 md:col-span-2">
                                <h3 id="discovery" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Discovery</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start">
                                    <div className="not-prose w-full flex justify-center md:justify-start" data-theme="dark">
                                        <div className="w-full max-w-[550px] -mt-2 overflow-hidden">
                                            <TweetErrorBoundary fallback={<div className="p-4"><TweetSkeleton /></div>}>
                                                {initialTweet ? <EmbeddedTweet tweet={initialTweet} /> : <div className="p-4"><TweetSkeleton /></div>}
                                            </TweetErrorBoundary>
                                        </div>
                                    </div>
                                    <div className="not-prose w-full flex justify-center md:justify-start mt-3.5" data-theme="dark">
                                        <div className="flex flex-col gap-4 w-full max-w-[550px]">
                                            <LinkPreview
                                                url="https://cryptorank.io/news/feed/82610-198804-bank-of-italy-legal-framework-stablecoins"
                                                title="Bank of Italy: Legal Framework for Stablecoins"
                                                description="The Bank of Italy has aligned with MiCA to establish a stablecoin framework, enabling institutions to securely manage assets using Multi-Party Computation (MPC) and self-custodial solutions like Gnosis Safe."
                                                domain="cryptorank.io"
                                            />
                                            <LinkPreview
                                                url="https://www.reddit.com/r/CryptoCurrency/comments/11tks1t/no_moons_vitalik_shares_his_thoughts_on_how_to/"
                                                title="Vitalik shares his thoughts on how to self-custody"
                                                description="Vitalik emphasizes the importance of social recovery wallets and multisig setups (like Gnosis Safe) for secure self-custody, advising against single points of failure."
                                                domain="reddit.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SectionWrapper>

                            <SectionWrapper id="tldr-challenges" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="tldr" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">TL;DR</h3>
                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                    <li>Crypto‑active enterprises and DAOs seeking multi‑sig governance, approvals, and recovery safeguards.</li>
                                    <li>Finance/ops teams needing real‑time visibility of reserves, counterparties, and settlement status.</li>
                                </ul>
                            </SectionWrapper>

                            <SectionWrapper id="tldr-challenges" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="challenges" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Challenges</h3>
                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                    <li>Traditional crypto treasury management lacks transparency, requires manual approvals, and makes real-time tracking difficult for teams.</li>
                                    <li>Treasury operations are fragmented across wallets, spreadsheets, and chats.</li>
                                    <li>Approvals are slow and error‑prone; visibility into reserves, counterparties, and settlement status is limited.</li>
                                    <li>Non‑crypto stakeholders struggle to trust processes without auditable workflows.</li>
                                </ul>
                            </SectionWrapper>

                            <SectionWrapper id="gnosis-mpc" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="gnosis" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Gnosis Safe</h3>
                                <AnimatePresence mode="wait">
                                    {viewMode === 'visual' ? (
                                        <motion.div
                                            key="gnosis-visual"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col gap-1"
                                        >
                                            <Image
                                                src="/media/kushari/gnosis_lock.svg"
                                                alt="Gnosis Safe"
                                                width={500}
                                                height={200}
                                                className="w-[500] h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                                // sizes="(max-width: 768px) 100vw, 800px"
                                                priority
                                            />
                                            <p className='text-white/70 font-[var(--font-geist-sans)] max-w-md'>
                                                A shared treasury where multiple keys must turn together before funds can move.
                                            </p>
                                            <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                <li>Threshold multisig on‑chain prevents single‑point failures and makes unauthorized transfers extremely difficult.</li>
                                                <li>Mature, audited contracts and broad ecosystem support reduce implementation risk.</li>
                                                <li>Hardware wallet + role separation patterns align with institutional controls.</li>
                                                <li>Full on‑chain transparency (events, signatures, nonces) enables auditability and clear incident forensics.</li>
                                            </ul>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="gnosis-text"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <ImageGallery
                                                images={[
                                                    { src: "/media/Gnosis_1.webp", alt: "Review details", id: "review_details" },
                                                    { src: "/media/Gnosis_2.webp", alt: "New transaction", id: "new_transaction" },
                                                    { src: "/media/Gnosis_3.webp", alt: "Review transaction", id: "review_transaction" },
                                                    { src: "/media/Gnosis_4.webp", alt: "Address book", id: "address_book" },
                                                    { src: "/media/Gnosis_5.webp", alt: "Transactions", id: "transactions" }
                                                ]}
                                            />
                                            <div className='flex flex-col gap-1'>
                                                <h4 id="gnosis" className="text-lg font-[var(--font-tasa)] font-regular text-white">Pros</h4>
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                    <li>Threshold multisig on‑chain prevents single‑point failures and makes unauthorized transfers extremely difficult.</li>
                                                    <li>Mature, audited contracts and broad ecosystem support reduce implementation risk.</li>
                                                    <li>Hardware wallet + role separation patterns align with institutional controls.</li>
                                                    <li>Full on‑chain transparency (events, signatures, nonces) enables auditability and clear incident forensics.</li>
                                                </ul>
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <h4 id="gnosis" className="text-lg font-[var(--font-tasa)] font-regular text-white">Cons</h4>
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                    <li>Stakeholder friction: non‑crypto approvers struggle with concepts like nonces, gas, and signature collection; coordination across wallets is slow.</li>
                                                    <li>Context fragmentation: approvals, policies, and transaction state are split across screens and chains; real‑time status is hard to track for finance/ops.</li>
                                                    <li>Operational overhead: gas sponsorship, signer availability, and sequencing (failed nonces) create delays and confusion.</li>
                                                    <li>Limited workflow language: Safe speaks in raw transactions, not “Propose → Review → Approve → Execute” with business‑grade audit trails.</li>
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </SectionWrapper>

                            <SectionWrapper id="gnosis-mpc" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="mpc" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">MPC wallets</h3>
                                <AnimatePresence mode="wait">
                                    {viewMode === 'visual' ? (
                                        <motion.div
                                            key="mpc-visual"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col gap-1"
                                        >
                                            <Image
                                                src="/media/kushari/mpc_vault.svg"
                                                alt="MPC Vault"
                                                width={800}
                                                height={600}
                                                className="w-[500] h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                                sizes="(max-width: 768px) 100vw, 800px"
                                                priority
                                            />
                                            <p className='text-white/70 font-[var(--font-geist-sans)] max-w-md'>
                                                A single key mathematically split into shards so no one party ever holds it whole.
                                            </p>
                                            <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md pb-24">
                                                <li>Threshold multisig on‑chain prevents single‑point failures and makes unauthorized transfers extremely difficult.</li>
                                                <li>Mature, audited contracts and broad ecosystem support reduce implementation risk.</li>
                                                <li>Hardware wallet + role separation patterns align with institutional controls.</li>
                                                <li>Full on‑chain transparency (events, signatures, nonces) enables auditability and clear incident forensics.</li>
                                            </ul>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="mpc-text"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <p className='text-white/70 font-[var(--font-geist-sans)] max-w-md'>
                                                MPC (Multi‑Party Computation) wallets remove the single private‑key model. Instead, a key is split into cryptographic shares held by multiple parties or devices; a threshold of those shares collaboratively signs without any single party ever reconstructing the full key. This delivers strong security with flexible custody, recovery, and policy control, often with smoother end‑user experiences than raw multisig.
                                            </p>
                                            <div className='flex flex-col gap-1'>
                                                <h4 id="mpc" className="text-lg font-[var(--font-tasa)] font-regular text-white">Pros</h4>
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                    <li>No single point of failure: compromise of one share doesn’t expose the whole key.</li>
                                                    <li>Flexible custody setups: combine people, devices, services; rotate shares without chain migrations.</li>
                                                    <li>Recovery options: social/organizational recovery via replacing lost shares; resilient to device loss.</li>
                                                    <li>UX potential: can abstract crypto primitives (gas, nonces) into cleaner workflows with policy engines.</li>
                                                    <li>Performance and privacy: off‑chain signing can be fast and avoids exposing signer details on‑chain.</li>
                                                </ul>
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <h4 id="mpc" className="text-lg font-[var(--font-tasa)] font-regular text-white">Cons</h4>
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                    <li>Vendor trust and lock‑in: proprietary MPC implementations vary; portability and transparency can be limited.</li>
                                                    <li>Operational complexity: recovery ceremonies, threshold coordination, and policy updates require careful process design.</li>
                                                    <li>Auditing visibility: less on‑chain signature transparency than multisig; relies on provider logs and attestations.</li>
                                                    <li>Compliance considerations: institutions must evaluate provider controls, certifications, and data handling.</li>
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </SectionWrapper>

                            {/* Exhibit Block: MPC UX Unlock */}
                            <SectionWrapper id="mpc-exhibit" onInView={(id) => setActiveSection(id)} className="md:col-span-2 py-20 md:py-32 relative overflow-hidden flex flex-col items-center text-center">
                                {/* Background Spotlight beam */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl pointer-events-none opacity-30">
                                    <div className="absolute inset-0 blur-3xl"
                                        style={{ backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
                                    />
                                </div>

                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="relative z-10 space-y-8 px-5"
                                >
                                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-[var(--font-tasa)] font-bold text-white leading-none tracking-tight max-w-5xl mx-auto">
                                        MPC is <span className="text-blue-400">UX unlock</span>, not just security model.
                                    </h2>
                                </m.div>
                            </SectionWrapper>

                            <SectionWrapper id="problem-solution" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="problem" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Problem</h3>
                                {viewMode === 'visual' ? (
                                    <>
                                        <FragmentedGallery
                                            images={[
                                                "/media/kushari/block_explorer.webp",
                                                "/media/kushari/gnosis_preview.webp",
                                                "/media/kushari/excel_spreadsheet.webp",
                                                "/media/kushari/gnosis_lock.webp",
                                                "/media/kushari/mpc_lock.webp"
                                            ]}
                                        />
                                        <p className="text-white/70 font-[var(--font-geist-sans)]">
                                            Fragmented operations, hard for non‑technical stakeholders. Lack of single workspace to manage wallets, approvals, and transaction tracking across wallets.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-white/70 font-[var(--font-geist-sans)]">
                                        <strong>Crypto treasury operations are fragmented, slow, and hard to audit for non‑technical stakeholders.</strong> Finance and ops teams at crypto‑active organizations lack a single workspace to manage shared wallets, policy‑based approvals, and real‑time transaction tracking across Gnosis Safe and MPC setups leading to friction, delays, and limited transparency.
                                    </p>
                                )}

                            </SectionWrapper>

                            <SectionWrapper id="problem-solution" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="solution" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Solution Approach</h3>
                                <p className="text-white/70 font-[var(--font-geist-sans)]">
                                    A comprehensive treasury platform offering:
                                </p>
                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                    <li><strong>Shared Wallets:</strong> Native support for Gnosis Safe multisig and MPC wallets with role‑based access.</li>
                                    <ul className="list-disc pl-4">
                                        <li>
                                            <strong>Why Gnosis Safe?:</strong> A well established ecosystem, audited by multiple security firms, and a large user base.
                                        </li>
                                        <li>
                                            <strong>Why MPC?:</strong> A flexible and secure alternative to Gnosis Safe, with the ability to rotate shares without chain migrations.
                                        </li>
                                    </ul>
                                    <li><strong>Policy & Approval Workflows:</strong> Threshold approvals (e.g., 3‑of‑5), spend limits, blockchain allowlists/denylists, and audit trails.</li>
                                    <li><strong>Real‑Time Tracking:</strong> Reserves, counterparties, transaction status, and reconciliation views.</li>
                                    <li><strong>Controls & Logging:</strong> Policy checks at request and execution, immutable activity logs, exportable reports.</li>
                                    <li><strong>Integrations:</strong> Gnosis Safe and MPC providers; data exports for finance and compliance.</li>
                                </ul>
                            </SectionWrapper>

                            <SectionWrapper id="terminology-principles" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="terminology" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Terminology and scope</h3>
                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                    <li>Multisig (Gnosis Safe): Threshold approvals on‑chain (e.g., 3‑of‑5).</li>
                                    <li>MPC wallets: Distributed signing without a single private key holder.</li>
                                    <li>Social recovery is not part of the current platform scope.</li>
                                </ul>
                            </SectionWrapper>

                            <SectionWrapper id="terminology-principles" onInView={(id) => setActiveSection(id)} className="space-y-4">
                                <h3 id="principles" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Design Principles</h3>
                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                    <li><strong>Reduce friction:</strong> One workspace for actions, approvals, and status.</li>
                                    <li><strong>Speak in workflows:</strong> Propose → Review → Approve → Execute” over raw transactions.</li>
                                    <li><strong>Make risk visible:</strong> Clear thresholds, policy checks, and execution states.</li>
                                    <li><strong>Ship to learn:</strong> Functional prototypes to validate flows before polish.</li>
                                </ul>
                            </SectionWrapper>

                            {/* Mission Statement with full‑width video */}
                            <SectionWrapper
                                id="mission-statement"
                                onInView={(id) => setActiveSection(id)}
                                className="md:col-span-2 py-48 md:py-72 relative overflow-hidden flex flex-col items-center justify-center text-center w-screen left-1/2 -translate-x-1/2 pointer-events-none"
                            // style={{ marginLeft: 'calc(-50vw + 50%)' }}
                            >
                                {/* Background Video Layer */}
                                <div className="absolute inset-0 z-0 py-20">
                                    <video
                                        src={'/media/kushari-whale-upscaled.webm'}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                </div>

                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="relative z-10 space-y-8 px-5"
                                >
                                    <span className="text-xs font-mono tracking-[0.4em] text-white/40 uppercase">Kushari</span>
                                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-[var(--font-tasa)] font-bold text-white leading-none tracking-tight max-w-5xl mx-auto mix-blend-difference">
                                        “Not a wallet, not a custody provider but the <span className="bg-gradient-to-r from-white via-blue-100 to-white/60 bg-clip-text text-transparent">operating system</span> for crypto finance teams.”
                                    </h2>
                                    <span className="text-xs font-mono tracking-[0.4em] text-white/40 uppercase">Web3 for teams</span>
                                </m.div>
                            </SectionWrapper>

                            <SectionWrapper id="user-roles" onInView={(id) => setActiveSection(id)} className="space-y-4 md:col-span-2">
                                <h3 id="user-roles" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Users, Roles, and Governance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start">
                                    <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-white/1">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 font-[var(--font-tasa)]">Role</th>
                                                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 font-[var(--font-tasa)]">Description</th>
                                                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 font-[var(--font-tasa)]">Governance Power</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[14px] leading-relaxed text-white/70 font-[var(--font-geist-sans)]">
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2 font-semibold text-white">Treasury Manager</td>
                                                    <td className="px-3 py-2">Operates treasury and allocates funds; can propose transactions and policy changes subject to approval.</td>
                                                    <td className="px-3 py-2">Propose transactions, categorize payments.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2 font-semibold text-white">Approver/Signer</td>
                                                    <td className="px-3 py-2">Reviews and approves transactions; performs cryptographic signing per custody model; cannot change policies.</td>
                                                    <td className="px-3 py-2">Approve/reject proposals, cryptographic signing.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2 font-semibold text-white">Admin</td>
                                                    <td className="px-3 py-2">Owns configuration and security; manages users/roles, thresholds, networks/tokens, and policy templates.</td>
                                                    <td className="px-3 py-2">Manage users, adjust thresholds, whitelist networks & tokens.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2 font-semibold text-white">Compliance/Finance</td>
                                                    <td className="px-3 py-2">Audits, reconciles, and exports reports; read access to policies, transactions, and logs; cannot approve or sign.</td>
                                                    <td className="px-3 py-2">View & export data, audit transactions.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                        <li><strong>Permissions:</strong>
                                            <ul className="list-disc pl-4">
                                                <li>Every member in workspace gets view & export permission.</li>
                                                <li>Admins can invite members as approvers(MPC vault), signers(Gnosis Safe).</li>
                                                <li>Apprvers(MPC vault) can approve transactions. Once threshold is reached, transaction is executed. MPC vaults have gasless transactions.</li>
                                                <li>Signers(Gnosis Safe) can sign transactions. Once threshold is reached, transaction can be executed. Gnosis Safe transactions require gas fee.</li>
                                            </ul>
                                        </li>
                                        <li>Admins and approvers can be the same person, but the platform enforces role-based access control (RBAC) to ensure that only authorized users can perform specific actions.</li>
                                        <li>Any member can propose transactions.</li>
                                        <li>Any member can propose policy change:</li>
                                        <ul className="list-disc pl-4">
                                            <li>
                                                <strong>MPC Wallets:</strong> Only administrators can approve policy changes.
                                            </li>
                                            <li>
                                                <strong>Gnosis Safe:</strong> Approved per the Safe’s current signature threshold.
                                            </li>
                                        </ul>
                                        <li><strong>Separation of duties:</strong> The original proposer cannot be the sole approver.</li>
                                    </ul>
                                </div>
                            </SectionWrapper>

                            <SectionWrapper
                                id="wallets"
                                onInView={(id) => setActiveSection(id)}
                                className="md:col-span-2"
                            >
                                {/* Main grid container - 2 columns, 3 rows */}
                                <div className="md:grid md:grid-cols-2 md:gap-4 space-y-8 md:space-y-0">
                                    {/* Row 1, Col 1 - Title */}
                                    <div className="flex flex-col gap-2 md:row-start-1 md:col-start-1">
                                        <h3 id="wallets" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Wallets</h3>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Kushari supports three wallet types, each mapped to clear permissions and workflows:
                                        </p>
                                    </div>

                                    {/* Optional: Empty cell for Row 1, Col 2 */}
                                    <div className="hidden md:block md:row-start-1 md:col-start-2"></div>

                                    {/* Row 2, Col 1 - MPC Wallet */}
                                    <div className='space-y-1 md:row-start-2 md:col-start-1'>
                                        <h4 id="mpc-wallet" className="text-lg font-[var(--font-tasa)] font-regular text-white">MPC Vaults (MPC wallets)</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Kushari's flagship offering. MPC replaces the single private key with cryptographic shares held by people/devices/services. A threshold of shares collaboratively signs without reconstructing the key.
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Custody model: Distributed shares; threshold signing.</li>
                                            <li>Capabilities: Propose → Review → Approve → Execute with policy checks; gasless signing (Kushari‑sponsored).</li>
                                            <li>Typical roles: Admin configures vault, Approvers approve transactions, Compliance/Finance observes and exports.</li>
                                            <li>Policies: Thresholds (e.g., 3‑of‑5 an optimal threshold is suggested by Kushari based on number of approvers), transaction limits, token allow/deny lists, network allow/deny lists.</li>
                                            <li>Recovery: Replace lost shares via ceremony; rotate participants without chain migrations.</li>
                                            <li>Auditability: Immutable activity logs; provider attestations for signing events.</li>
                                            <li>Setup: Created and managed in Kushari.</li>
                                            <li>Network support: Ethereum, Polygon, & BNB Chain.</li>
                                        </ul>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/50 font-[var(--font-geist-sans)] max-w-2xl">
                                            <strong>Example flow:</strong> Transfer proposed → Policy engine validates limits and counterparties → Approvers reach threshold → Execution is recorded → Logs and exports update in real time.
                                        </p>
                                    </div>

                                    {/* Row 2, Col 2 - Gnosis Safe */}
                                    <div className='space-y-1 md:row-start-2 md:col-start-2'>
                                        <h4 id="gnosis" className="text-lg font-[var(--font-tasa)] font-regular text-white">Gnosis Safe</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Safe enforces on‑chain threshold signatures to prevent single‑point failures, with mature audits and ecosystem support.
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Custody model: Multisig on‑chain; hardware wallets recommended.</li>
                                            <li>Capabilities: Propose → Review → Sign → Execute with gas and nonce management.</li>
                                            <li>Policies: On‑chain threshold (e.g., 3‑of‑5); Kushari mirrors constraints with transaction limits, token/network allow/deny lists.</li>
                                            <li>Operational notes: Requires gas; signature collection and nonce sequencing by Kushari, enabling transaction that is ready to execute to be actioned.</li>
                                            <li>Auditability: On‑chain events and signatures plus Kushari's immutable logs.</li>
                                            <li>Setup: Created in Gnosis Safe; imported into Kushari.</li>
                                            <li>Network support: Inherent from Gnosis Safe.</li>
                                        </ul>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/50 font-[var(--font-geist-sans)] max-w-2xl">
                                            <strong>Example flow:</strong> Transfer proposed → Policy engine validates limits and counterparties → Signers add on‑chain signatures until threshold is met → Transaction executes on‑chain; status, events, and reports update.
                                        </p>
                                    </div>

                                    {/* Row 3, Col 1 - Tracked Wallet (spans 1 column) */}
                                    <div className='space-y-1 md:row-start-3 md:col-start-1'>
                                        <h4 id="tracked-wallet" className="text-lg font-[var(--font-tasa)] font-regular text-white">Tracked Wallets (Read‑only)</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Track any Ethereum address for balances, inflows/outflows, counterparties, and reconciliation. Kushari never has send authority.
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Capabilities: View balances, historical transactions, tags, alerts, and exports.</li>
                                            <li>Permissions: Member‑specific tracked lists.</li>
                                            <li>Use cases: Monitoring reserves, vendor activity, exchange accounts, and cold storage visibility without operational risk.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-8 md:pt-12">
                                    <div className="pl-6 md:pl-8 border-l-2 border-blue-500/30">
                                        <p className="text-xl md:text-2xl leading-relaxed font-[var(--font-tasa)] text-white/80">
                                            Teams can start with imported Safes, gain operational clarity, and adopt MPC vaults where velocity and abstraction matter — without rewriting governance or retraining the organization.
                                        </p>
                                    </div>
                                </div>

                                <div className='pt-8 md:pt-12'>
                                    <ImageSliderGallery images={[
                                        {
                                            id: "1",
                                            src: "/media/wallets/mpc-vault.webp",
                                            alt: "MPC Vault wallet card",
                                            title: "MPC Vault",
                                            description: "Compact, premium-looking card showing vault icon and name, total balance, and 24h change. Deposit and Send actions appear on hover."
                                        },
                                        {
                                            id: "2",
                                            src: "/media/wallets/gnosis-safe.webp",
                                            alt: "Gnosis Safe wallet card",
                                            title: "Gnosis Safe",
                                            description: "Wide list-style card showing Safe icon, supported chain icons, name, total balance, and 24h change, matching MPC Vault data. Deposit and Send actions appear on hover."
                                        },
                                        {
                                            id: "3",
                                            src: "/media/wallets/tracked-wallet.webp",
                                            alt: "Tracked Wallet card",
                                            title: "Tracked Wallet",
                                            description: "Wide list-style card showing tracked wallet icon and name, total balance, and 24h change for read-only addresses. Disconnect action appears on hover."
                                        }

                                    ]} />
                                </div>

                                <div className="space-y-8 md:space-y-12">
                                    <div className="space-y-2">
                                        <h4 id="mpc-wallet" className="text-lg font-[var(--font-tasa)] font-regular text-white">Wallet details</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Wallet details give finance and ops teams a complete view of a specific wallet, without overwhelming the main Wallets page
                                        </p>
                                    </div>

                                    <div className="space-y-8 md:space-y-12 group/wallet-details">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start group transition-opacity duration-500 group-hover/wallet-details:opacity-40 hover:!opacity-100">
                                            <div className="order-1 md:order-1 space-y-6">
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md group-hover:text-white">
                                                    <li><strong>Header & networks</strong></li>
                                                    <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                        Surface the wallet address alongside supported networks, with one-click copy. Network badges make it immediately clear where this wallet is active and can safely operate.
                                                    </ul>
                                                </ul>
                                            </div>
                                            <div className="order-2 md:order-2">
                                                <Image
                                                    src="/media/wallet-details/header-network.webp"
                                                    alt="Header and Network"
                                                    width={2931}
                                                    height={822}
                                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-120"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start group transition-opacity duration-500 group-hover/wallet-details:opacity-40 hover:!opacity-100">
                                            <div className="order-1 md:order-1 space-y-6">
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md group-hover:text-white">
                                                    <li><strong>Primary actions</strong></li>
                                                    <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                        <li>Deposit: Becomes the primary call-to-action when a wallet is new or holds no assets; in this state, only Deposit is available.</li>
                                                        <li>Send: Shown only for wallets with send authorization (hidden for Tracked Wallets).</li>
                                                        <li>Action locking: Both Deposit and Send are temporarily disabled while any wallet policy is being edited, and are re‑enabled once changes are saved or discarded.</li>
                                                    </ul>
                                                </ul>
                                            </div>
                                            <div className="order-2 md:order-2">
                                                <Image
                                                    src="/media/wallet-details/primary-actions.webp"
                                                    alt="Primary Actions"
                                                    width={2931}
                                                    height={1167}
                                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-120"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start group transition-opacity duration-500 group-hover/wallet-details:opacity-40 hover:!opacity-100">
                                            <div className="order-1 md:order-1 space-y-6">
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md group-hover:text-white">
                                                    <li><strong>Balances</strong></li>
                                                    <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                        <li>Proposed: USD value currently tied up in proposals that are not yet approved, signed, or executed.</li>
                                                        <li>Available: USD value that can be sent.</li>
                                                        <li>Total: Combined USD value held in the wallet across proposed and available funds.</li>
                                                    </ul>
                                                </ul>
                                            </div>
                                            <div className="order-2 md:order-2">
                                                <Image
                                                    src="/media/wallet-details/balances.webp"
                                                    alt="Balances"
                                                    width={2931}
                                                    height={878}
                                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-120"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start group transition-opacity duration-500 group-hover/wallet-details:opacity-40 hover:!opacity-100">
                                            <div className="order-1 md:order-1 space-y-6">
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md group-hover:text-white">
                                                    <li><strong>Tabs and sub-tabs</strong></li>
                                                    <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                        <li>Central place for all open and historical proposals on this wallet (flows are unpacked later in the case study).</li>
                                                        <li>Assets: Snapshot of assets held in the wallet.</li>
                                                        <li>Transactions: Snapshot of historical transaction list for this wallet.</li>
                                                        <li>Policy: Configuration surface for wallet‑level controls such as thresholds, limits, and allow/deny lists.</li>
                                                    </ul>
                                                </ul>
                                            </div>
                                            <div className="order-2 md:order-2">
                                                <Image
                                                    src="/media/wallet-details/tabs-subtabs.webp"
                                                    alt="Tabs and Sub-tabs"
                                                    width={2931}
                                                    height={917}
                                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-120"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start group transition-opacity duration-500 group-hover/wallet-details:opacity-40 hover:!opacity-100">
                                            <div className="order-1 md:order-1 space-y-6">
                                                <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                    <li><strong>Policies</strong></li>
                                                    <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md group-hover:text-white">
                                                        <li>Approval / signer threshold: Admins mark members as approvers/signers per wallet or Safe, and set the signature threshold. Kushari suggests a default threshold based on the number of members.</li>
                                                        <li>Limit per transaction: Caps the maximum amount per transaction for this wallet/Safe. Kushari blocks transactions above this limit.</li>
                                                        <li>Network limits: Allowlist or blocklist blockchain networks per wallet or Safe so teams can either restrict activity to trusted networks or explicitly block risky ones.</li>
                                                        <li>Asset limits: Apply the same allowlist/blocklist model to assets, controlling which tokens can move through each wallet.</li>
                                                    </ul>
                                                    <li>Non-admins can propose policy changes with a note; admins are notified and can review and apply them.</li>
                                                </ul>
                                            </div>
                                            <div className="order-2 md:order-2">
                                                <Image
                                                    src="/media/wallet-details/policies.webp"
                                                    alt="Policies"
                                                    width={2931}
                                                    height={2382}
                                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-120"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 md:row-start-2 space-y-4 mt-8 md:mt-12">
                                    <h4 className="text-lg font-[var(--font-tasa)] font-regular text-white">Smart tabs</h4>

                                    <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-white/1">
                                        <table className="w-full text-left border-collapse group/scenario-table">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 font-[var(--font-tasa)]">Scenario</th>
                                                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 font-[var(--font-tasa)]">Access level</th>
                                                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 font-[var(--font-tasa)]">Default tab → sub-tab</th>
                                                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 font-[var(--font-tasa)]">Rationale</th>
                                                </tr>
                                            </thead>

                                            <tbody className="text-[14px] leading-relaxed text-white/70 font-[var(--font-geist-sans)] transition-all duration-300 group-hover/scenario-table:opacity-40 hover:!opacity-100 hover:bg-white/[0.02]">
                                                <tr className="border-t border-white/5">
                                                    <td rowSpan={3} className="px-3 py-2 font-semibold text-white">Wallet has proposals that need a decision</td>
                                                    <td className="px-3 py-2">Approver/Signer</td>
                                                    <td className="px-3 py-2">Proposals → Needs approval</td>
                                                    <td className="px-3 py-2">Bring pending approvals to the front so approvers see actionable items first.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2">Viewer (no approval rights)</td>
                                                    <td className="px-3 py-2">Assets/Transactions </td>
                                                    <td className="px-3 py-2">Prioritize read‑only insight into balances and history over proposals they cannot act on.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2">Admin</td>
                                                    <td className="px-3 py-2">Policy </td>
                                                    <td className="px-3 py-2">Default to configuration for admins, who are typically in a setup or governance mindset.</td>
                                                </tr>
                                            </tbody>

                                            <tbody className="text-[14px] leading-relaxed text-white/70 font-[var(--font-geist-sans)] transition-all duration-300 group-hover/scenario-table:opacity-40 hover:!opacity-100 hover:bg-white/[0.02]">
                                                <tr className="border-t border-white/5">
                                                    <td rowSpan={3} className="px-3 py-2 font-semibold text-white">Wallet has proposals ready to execute</td>
                                                    <td className="px-3 py-2">Approver/Signer</td>
                                                    <td className="px-3 py-2">Proposals → Ready to execute</td>
                                                    <td className="px-3 py-2">If nothing needs approval, highlight items that are fully approved and ready to be sent.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2">Viewer (can execute)</td>
                                                    <td className="px-3 py-2">Proposals → Ready to execute</td>
                                                    <td className="px-3 py-2">Focus execution‑capable roles on what can be dispatched immediately.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2">Admin</td>
                                                    <td className="px-3 py-2">Policy </td>
                                                    <td className="px-3 py-2">Default to configuration for admins, who are typically in a setup or governance mindset.</td>
                                                </tr>
                                            </tbody>

                                            <tbody className="text-[14px] leading-relaxed text-white/70 font-[var(--font-geist-sans)] transition-all duration-300 group-hover/scenario-table:opacity-40 hover:!opacity-100 hover:bg-white/[0.02]">
                                                <tr className="border-t border-white/5">
                                                    <td rowSpan={2} className="px-3 py-2 font-semibold text-white">Some proposals have failed</td>
                                                    <td className="px-3 py-2">Proposer (you created them)</td>
                                                    <td className="px-3 py-2">Proposals → Discarded</td>
                                                    <td className="px-3 py-2">Help proposers quickly find failed proposals to review, fix, and resubmit.</td>
                                                </tr>
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2">No pending proposals or executions</td>
                                                    <td className="px-3 py-2">Proposals → Discarded</td>
                                                    <td className="px-3 py-2">Make it easy to see past failures and nudge follow‑up with relevant stakeholders.</td>
                                                </tr>
                                            </tbody>

                                            <tbody className="text-[14px] leading-relaxed text-white/70 font-[var(--font-geist-sans)] transition-all duration-300 group-hover/scenario-table:opacity-40 hover:!opacity-100 hover:bg-white/[0.02]">
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2 font-semibold text-white">Brand‑new wallet with no assets</td>
                                                    <td className="px-3 py-2">Any</td>
                                                    <td className="px-3 py-2">Assets tab empty screen</td>
                                                    <td className="px-3 py-2">Use the empty state to guide first actions (e.g., deposit) and explain how to start using the wallet.</td>
                                                </tr>
                                            </tbody>
                                            <tbody className="text-[14px] leading-relaxed text-white/70 font-[var(--font-geist-sans)] transition-all duration-300 group-hover/scenario-table:opacity-40 hover:!opacity-100 hover:bg-white/[0.02]">
                                                <tr className="border-t border-white/5">
                                                    <td className="px-3 py-2 font-semibold text-white">Wallet has assets but no proposals yet</td>
                                                    <td className="px-3 py-2">Any</td>
                                                    <td className="px-3 py-2">Needs approval subtab empty state</td>
                                                    <td className="px-3 py-2">Encourage the first proposed transfer once funds exist, framing “Needs approval” as the core workflow.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <SectionWrapper id="insight" onInView={(id) => setActiveSection(id)} className="md:col-span-2 pt-8 md:pt-12">
                                        <div className="pl-6 md:pl-8 border-l-2 border-blue-500/30">
                                            <p className="text-xl md:text-2xl leading-relaxed font-[var(--font-tasa)] text-white/80">
                                                Smart tabs apply whenever wallet details are opened from the Wallets list. When switching between wallets from the details view, the current tab and sub‑tab are preserved so operators stay in context.
                                            </p>
                                        </div>
                                    </SectionWrapper>
                                </div>

                                <div className="md:col-span-2 py-20 md:py-32 relative overflow-hidden flex flex-col items-center text-center">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl pointer-events-none opacity-30">
                                        <div className="absolute inset-0 blur-3xl"
                                            style={{ backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
                                        />
                                    </div>
                                    <m.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="relative z-10 space-y-8 px-5"
                                    >
                                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-[var(--font-tasa)] font-bold text-white leading-none tracking-tight max-w-5xl mx-auto">
                                            Three wallet types, <span className="bg-gradient-to-r from-blue-400 via-blue-100 to-blue-500 bg-clip-text text-transparent">one operating model:</span> propose, review, approve, execute. So finance sees clearly and signers stay in control.
                                        </h2>
                                    </m.div>
                                </div>
                            </SectionWrapper>

                            <SectionWrapper
                                id="proposals"
                                onInView={(id) => setActiveSection(id)}
                                className="md:col-span-2"
                            >
                                <div className="md:grid md:grid-cols-2 md:gap-4 space-y-8 md:space-y-0">
                                    <div className="flex flex-col gap-2 md:row-start-1 md:col-start-1">
                                        <h3 id="proposals-intro" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Proposals</h3>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            In Kushari, Proposals is where intent turns into controlled asset movement. If wallet details tell you where treasury stands today, this section is about <strong>how it changes tomorrow, who’s asking to move assets, why, under which policies, and what actually executed on-chain.</strong>
                                        </p>
                                    </div>

                                    <div className="hidden md:block md:row-start-1 md:col-start-2"></div>

                                    <div className='space-y-1 md:row-start-2 md:col-start-1'>
                                        <h4 id="request" className="text-lg font-[var(--font-tasa)] font-regular text-white">Request</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Raw intent from the team: “Pay this invoice”, “Fund this strategy wallet”, “Swap 50k USDC to ETH”. These often start in tools like Slack, email, or Notion, but Kushari gives them a structured home.
                                        </p>
                                    </div>

                                    <div className='space-y-1 md:row-start-3 md:col-start-1'>
                                        <h4 id="proposal" className="text-lg font-[var(--font-tasa)] font-regular text-white">Proposal</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Structured, policy-aware objects in Kushari. A proposal encodes:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Who: requester, required approvers.</li>
                                            <li>What: assets, amounts (in token and fiat).</li>
                                            <li>Why: category (payroll, vendor, treasury rebalance, bridge), free-text context.</li>
                                            <li>How: source wallet, target wallet/address, network.</li>
                                        </ul>
                                    </div>

                                    <div className='space-y-1 md:row-start-3 md:col-start-2'>
                                        <h4 id="proposal" className="text-lg font-[var(--font-tasa)] font-regular text-white">Proposals: the decision queue</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            The Proposals view is the single place where finance and ops decide what should move next. Instead of digging through chats, spreadsheets, and raw Safe transactions, approvers see a clean queue of structured intent. At the top of the screen, three tabs map directly to the lifecycle of a proposal:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Needs approval – items where a human decision is required (approve, reject, with a note which is optional).</li>
                                            <li>Ready to execute – proposals that have collected the required approvals and passed policy checks, waiting to be sent on‑chain. If execution hits a temporary technical failure (for example, gas issues or a transient RPC error), the same proposal can be re‑attempted from here without creating a new proposal.</li>
                                            <li>Discarded – proposals that were explicitly rejected, or that failed execution in a way that cannot be recovered and therefore require a new proposal.</li>
                                            <li>A “Show my actions” filter lets each member focus on proposals that specifically involve them.</li>
                                        </ul>
                                    </div>

                                    <div className='space-y-1 md:row-start-4 md:col-start-1'>
                                        <h4 id="proposal" className="text-lg font-[var(--font-tasa)] font-regular text-white">Needs approval: what should move?</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Needs approval is the default view for approvers. It shows only proposals that have not yet reached the required threshold. Each row uses a simple three‑state system:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Action required – proposals that have not met threshold and needs my approval to reach threshold.</li>
                                            <li>Actioned – proposals that I have already approved/signed.</li>
                                            <li>No Action – proposals that have met threshold and I can still approve, but threshold already met.</li>
                                        </ul>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Clicking into a row opens the full proposal detail, where approvers can review context, notes, and approval pendency. Approving moves the proposal towards Ready to execute; rejecting or discarding removes it from the decision queue.
                                        </p>
                                    </div>

                                    <div className='space-y-1 md:row-start-4 md:col-start-2'>
                                        <h4 id="proposal" className="text-lg font-[var(--font-tasa)] font-regular text-white">Ready to execute: what can move now?</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Once a proposal has cleared all policy and approval requirements, it appears under Ready to execute. This view is optimized for the people who actually push assets on‑chain:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Execution happens here.</li>
                                            <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                                <li>MPC vaults enabled with gasless execution can be executed immediately.</li>
                                                <li>Gnosis Safe reqiures a wallet with sufficient gas to execute the transaction.</li>
                                            </ul>
                                            <li>If execution fails for technical reasons within a defined reattempt window, executors can retry from the same proposal without going back through approvals.</li>
                                            <li>Clicking into a row opens the full proposal detail, where executors can review context, notes, and the approval timeline before sending funds.</li>
                                        </ul>
                                    </div>

                                    <div className='space-y-1 md:row-start-5 md:col-start-1'>
                                        <h4 id="proposal" className="text-lg font-[var(--font-tasa)] font-regular text-white">Discarded: what didn’t move (and why)?</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Discarded captures proposals that will not be executed and cannot be recovered via a simple retry:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Rejected by approvers. Initiator will be notified with an option to edit & resubmit.</li>
                                            <li>Failed after multiple or unrecoverable execution attempts – the initiator is notified and must create a new proposal if the payment is still needed.</li>
                                        </ul>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Keeping these visible, but out of the main decision queue, helps teams:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Review past intent without cluttering active work.</li>
                                            <li>Understand why certain payments never went out.</li>
                                            <li>Improve policies over time based on real usage patterns.</li>
                                            <li>For proposers, it’s also a place to find their own failed attempts, adjust them, and resubmit in a compliant form.</li>
                                        </ul>
                                    </div>

                                    {/* Proposals video - full width breakout */}
                                    <div className='md:row-start-6 md:col-span-2 mt-12 md:mt-16 w-screen left-1/2 -translate-x-1/2 relative'>
                                        <video
                                            src={'/media/proposals.webm'}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                            className="w-full h-auto"
                                        />
                                    </div>

                                    <SectionWrapper id="wallet-exhibit" onInView={(id) => setActiveSection(id)} className="md:col-span-2 py-20 md:py-32 relative overflow-hidden flex flex-col items-center text-center">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl pointer-events-none opacity-30">
                                            <div className="absolute inset-0 blur-3xl"
                                                style={{ backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
                                            />
                                        </div>
                                        <m.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="relative z-10 space-y-8 px-5"
                                        >
                                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-[var(--font-tasa)] font-bold text-white leading-none tracking-tight max-w-5xl mx-auto">
                                                Proposals make the treasury’s future state <span className="bg-gradient-to-r from-blue-400 via-blue-100 to-blue-500 bg-clip-text text-transparent">reviewable before it becomes irreversible.</span>
                                            </h2>
                                        </m.div>
                                    </SectionWrapper>
                                </div>
                            </SectionWrapper>

                            <SectionWrapper
                                id="transactions"
                                onInView={(id) => setActiveSection(id)}
                                className="md:col-span-2"
                            >
                                <div className="md:grid md:grid-cols-2 md:gap-4 space-y-8 md:space-y-0">
                                    <div className="flex flex-col gap-2 md:row-start-1 md:col-start-1">
                                        <h3 id="transactions-intro" className="text-lg md:text-xl font-[var(--font-tasa)] font-semibold text-white">Transactions</h3>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Transactions are the executed record of treasury decisions—every on‑chain movement tied back to its proposal and policy.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 md:row-start-2 md:col-start-1">
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            If Proposals make the treasury’s future state reviewable, Transactions show what actually happened on‑chain. Instead of a raw blockchain explorer, Kushari gives finance and ops a transaction history they can read in their own language.
                                        </p>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Each transaction entry carries:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li><strong>Type & time:</strong> whether the movement was Received, Sent, or Interacted (swaps/bridges), with precise timestamps.</li>
                                            <li><strong>Wallet & network:</strong> which treasury wallet it affected (Fundraiser, Advertising, Growth fund, Funding), tying each entry back to its operational bucket.</li>
                                            <li><strong>To/From:</strong> the counterparty on the other side—named entities, raw addresses, or “n recipients” for batched payouts.</li>
                                            <li><strong>In / Out:</strong> the asset and USD value flowing into and out of the wallet, so teams can see simple receives, pure sends, and two‑sided interactions (e.g., BNB → DAI) without decoding raw logs.</li>
                                            <li><strong>Classification:</strong> why this exists in business terms—Research grant, Charity, Weekly payout, Travel, Equipment, 2023 Investment, and more.</li>
                                        </ul>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            When a transaction is expanded, Kushari adds execution detail that explorers scatter:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>A lifecycle timeline (Initiated → Approved → Executed) with who acted and when.</li>
                                            <li>Gas fees in asset and fiat.</li>
                                            <li>The full transaction hash for deep dives or external audits.</li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col gap-2 md:row-start-2 md:col-start-2">
                                        <h4 id="transactions-filter" className="text-lg font-[var(--font-tasa)] font-regular text-white">Filters: from explorer noise to finance questions</h4>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Above the table, Transactions adds filters for Type, Wallet, Network, Address, and Classification, so teams can slice activity the way they actually think:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-2 text-white/70 font-[var(--font-geist-sans)] max-w-md">
                                            <li>Filter by Type to isolate just incoming, outgoing, or on‑chain interactions like swaps and bridges.</li>
                                            <li>Filter by Wallet to follow the story of a specific bucket without losing cross‑chain context.</li>
                                            <li>Filter by Network or Address when investigations get more technical and require narrowing down counterparties or chains.</li>
                                            <li>Filter by Classification to answer finance questions quickly: “Show all Charity transactions this quarter”, “Only Weekly payouts from Fundraiser”, or “All 2023 Investment activity.”</li>
                                        </ul>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            Instead of paging through a flat explorer feed, finance and ops can turn the same raw events into targeted views that match reconciliation, reporting, or audit workflows.
                                        </p>
                                        <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                            For deeper analysis and reporting, finance teams can use <strong>Export CSV</strong> to pull the same enriched transaction data into their existing tools and workflows—without losing the classifications and context they rely on inside Kushari.
                                        </p>
                                    </div>

                                    <div className='md:row-start-3 md:col-span-2 pt-20 w-screen left-1/2 -translate-x-1/2 relative'>
                                        <HoverZoomImage
                                            src="/media/wallet-details/transactions-section.webp"
                                            alt="Transaction"
                                            aspectRatio="aspect-[3680/2392]"
                                            className="!rounded-none !border-none"
                                        />
                                    </div>

                                    <SectionWrapper id="insight" onInView={(id) => setActiveSection(id)} className="md:col-span-2 pt-8 md:pt-12">
                                        <div className="pl-6 md:pl-8 border-l-2 border-blue-500/30">
                                            <p className="text-xl md:text-2xl leading-relaxed font-[var(--font-tasa)] text-white/80">
                                                Together, Transactions answer three questions for every line: what moved, between whom, and under what story. For finance and compliance, that means closing the loop from “this was proposed and approved” to “this is exactly how it landed on‑chain”—without leaving Kushari or reconciling a separate block explorer.
                                            </p>
                                        </div>
                                    </SectionWrapper>

                                    <SectionWrapper id="transactions-exhibit" onInView={(id) => setActiveSection(id)} className="md:col-span-2 py-20 md:py-32 relative overflow-hidden flex flex-col items-center text-center">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl pointer-events-none opacity-30">
                                            <div className="absolute inset-0 blur-3xl"
                                                style={{ backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
                                            />
                                        </div>
                                        <m.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="relative z-10 space-y-8 px-5"
                                        >
                                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-[var(--font-tasa)] font-bold text-white leading-none tracking-tight max-w-5xl mx-auto">
                                                Transactions make the <span className="bg-gradient-to-r from-blue-400 via-blue-100 to-blue-500 bg-clip-text text-transparent">treasury’s past legible</span><span className="bg-gradient-to-r from-white/50 to-white/30 bg-clip-text text-transparent">—every on-chain move tied back to its proposal, policy, and purpose.</span>
                                            </h2>
                                        </m.div>
                                    </SectionWrapper>
                                </div>
                            </SectionWrapper>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pt-12">
                            <SectionWrapper id="get-in-touch" onInView={(id) => setActiveSection(id)} className="space-y-4 md:col-span-2">
                                <div className="pt-6 md:pt-10 border-t border-white/5">
                                    <p className="text-[14px] md:text-[15px] leading-[1.6em] text-white/70 font-[var(--font-geist-sans)] max-w-2xl">
                                        The rest of this story is still in the inkwell. Got thoughts, feedback, or just want to talk shop?
                                        <br className="hidden md:block" />
                                        I'm all ears at{' '}
                                        <span
                                            onClick={copyEmail}
                                            className="relative inline-block text-blue-400 font-semibold cursor-pointer hover:text-blue-300 transition-colors border-b border-blue-400/30 hover:border-blue-300 group/email"
                                        >
                                            delanoykunil@gmail.com
                                            <AnimatePresence>
                                                {copied && (
                                                    <m.span
                                                        initial={{ opacity: 0, y: 10, x: '-50%' }}
                                                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                                                        exit={{ opacity: 0, y: 10, x: '-50%' }}
                                                        className="absolute bottom-full left-1/2 mb-3 px-2 py-1 bg-white text-black text-[10px] font-bold rounded uppercase tracking-wider whitespace-nowrap shadow-xl"
                                                    >
                                                        Email Copied!
                                                    </m.span>
                                                )}
                                            </AnimatePresence>
                                        </span>
                                        <m.span
                                            animate={{ opacity: [1, 1, 0, 0, 1] }}
                                            transition={{ repeat: Infinity, duration: 1, times: [0, 0.49, 0.5, 0.99, 1] }}
                                            className="inline-block w-[2px] h-[1.1em] bg-blue-400 ml-1.5 translate-y-[0.2em]"
                                        />
                                    </p>
                                </div>
                            </SectionWrapper>
                        </div>
                    </m.div>
                </div>
            </div>

            {/* Table of Contents – unchanged */}
            <TableOfContents activeSection={activeSection} sections={sections} />
        </>
    );
}