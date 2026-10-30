"use client";

import Ticker from './components/Ticker';
import AboutMe from "./components/AboutMe";
import ScrollIndicator from "./components/ScrollIndicator";
import { useEffect, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CaseStudyDetails from "./components/CaseStudyDetails";
import type { Tweet } from 'react-tweet/api';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import BookShelf, { Book } from './components/BookShelf';
import { m, AnimatePresence } from 'framer-motion';
import { caseStudies as staticCaseStudies } from './data/caseStudies';

const KushariCaseStudy = dynamic(() => import("./components/KushariCaseStudyV2"), {
    loading: () => null,
    ssr: false
});

const TelescopeCaseStudy = dynamic(() => import("./components/telescope-src/page"), {
    loading: () => null,
    ssr: false
});

const CaseStudy = dynamic(() => import("./components/CaseStudy"), {
    loading: () => <div className="w-full aspect-[4/3] bg-white/5 animate-pulse rounded-2xl" />,
    ssr: false
});

const Description = dynamic(() => import("./components/Description").then(mod => mod.Description), {
    ssr: false
});

interface HomeClientProps {
    tweetData?: Tweet;
}

export const books: Book[] = [
    {
        id: '1',
        title: 'Ruined by design',
        author: 'Mike Monteiro',
        coverSrc: '/media/books/ruined_by_design_front.webp',
        spineSrc: '/media/books/ruined_by_design_spine.webp',
        orientation: 'front',
        category: 'Design ethics',
        color: '#e5e7eb',
        thickness: 25,
        height: 220,
        width: 160,
    },
    {
        id: '2',
        title: 'Change by design',
        author: 'Tim Brown',
        coverSrc: '/media/books/change_by_design_front.webp',
        spineSrc: '/media/books/change_by_design_spine.webp',
        orientation: 'vertical',
        category: 'Design impact',
        color: '#111827',
        thickness: 20,
        height: 240,
        width: 170,
    },
    {
        id: '3',
        title: 'Genius makers',
        author: 'Cade Metz',
        coverSrc: '/media/books/genius_makers_front.webp',
        spineSrc: '/media/books/genius_makers_spine.webp',
        orientation: 'vertical',
        category: 'AI and its inception',
        color: '#4f46e5',
        thickness: 30,
        height: 300,
        width: 210,
    },
    {
        id: '4',
        title: 'The brain at rest',
        author: 'Joseph Jebelli',
        coverSrc: '/media/books/the_brain_at_rest_front.webp',
        spineSrc: '/media/books/the_brain_at_rest_spine.webp',
        orientation: 'vertical',
        category: 'Neuroscience',
        color: '#0f172a',
        thickness: 28,
        height: 290,
        width: 200,
    },
    {
        id: '5',
        title: 'No rules rule',
        author: 'Erin Meyer and Reed Hastings',
        coverSrc: '/media/books/no_rules_rules_front.webp',
        spineSrc: '/media/books/no_rules_rules_spine.webp',
        orientation: 'front',
        category: 'Startup culture',
        color: '#e5e7eb',
        thickness: 25,
        height: 240,
        width: 170,
    },
    {
        id: '6',
        title: 'Actionable gamification',
        author: 'Yu-Kai Chou',
        coverSrc: '/media/books/actionable_gamification_front.webp',
        spineSrc: '/media/books/actionable_gamification_spine.webp',
        orientation: 'horizontal',
        category: 'Gamification',
        color: '#e5e7eb',
        thickness: 35,
        height: 320,
        width: 225,
    },
    {
        id: '7',
        title: 'Mental models',
        author: 'Peter Hollins',
        coverSrc: '/media/books/mental_models_front.webp',
        spineSrc: '/media/books/mental_models_spine.webp',
        orientation: 'horizontal',
        category: 'Mental models',
        color: '#e5e7eb',
        thickness: 20,
        height: 260,
        width: 180,
    },
    {
        id: '8',
        title: 'Building a second brain',
        author: 'Tiago Forte',
        coverSrc: '/media/books/building_a_second_brain_front.webp',
        spineSrc: '/media/books/building_a_second_brain_spine.webp',
        orientation: 'horizontal',
        category: 'Note taking that works',
        color: '#e5e7eb',
        thickness: 25,
        height: 295,
        width: 205,
    },
    {
        id: '9',
        title: 'Burn your portfolio',
        author: 'Michael Janda',
        coverSrc: '/media/books/burn_your_portfolio_front.webp',
        spineSrc: '/media/books/burn_your_portfolio_spine.webp',
        orientation: 'front',
        category: 'Dont miss this one',
        color: '#e5e7eb',
        thickness: 25,
        height: 260,
        width: 180,
    },
];

const caseStudies = staticCaseStudies;

const sampleColumns = [
    {
        id: '1',
        type: 'A' as const,
        media: [
            {
                id: 'img1',
                type: 'image' as const,
                src: '/media/assets.webp',
                alt: 'Product Design - E-commerce Platform',
                width: 800,
                height: 800,
            },
        ],
    },
    {
        id: '2',
        type: 'B' as const,
        media: [
            {
                id: 'img2a',
                type: 'image' as const,
                src: '/media/gray_agent.webp',
                alt: 'Gray Agent',
                width: 485,
                height: 363,
            },
            {
                id: 'img2b',
                type: 'image' as const,
                src: '/media/kash.webp',
                alt: 'Kash app',
                width: 485,
                height: 433,
            },
        ],
    },
    {
        id: '6',
        type: 'A' as const,
        media: [
            {
                id: 'img6b',
                type: 'image' as const,
                src: '/media/workspace_settings.webp',
                alt: 'Workspace Settings',
                width: 1004.05,
                height: 800,
            },
        ],
    },
    {
        id: '3',
        type: 'C' as const,
        media: [
            {
                id: 'vid1',
                type: 'video' as const,
                src: '/media/vertical_form.webm',
                alt: 'Vertical Form',
                width: 498,
                height: 800,
            },
        ],
    },
    {
        id: '4',
        type: 'D' as const,
        media: [
            {
                id: 'img4',
                type: 'image' as const,
                src: '/media/hero.webp',
                alt: 'Design Process Documentation',
                width: 484,
                height: 484,
            },
            {
                id: 'vid2',
                type: 'video' as const,
                src: '/media/executing.webm',
                alt: 'Micro-interactions Demo',
                width: 484,
                height: 313,
            },
        ],
    },
    {
        id: '5',
        type: 'C' as const,
        media: [
            {
                id: 'vid1',
                type: 'video' as const,
                src: '/media/truemeds_onboarding.webm',
                alt: 'Vertical Form',
                width: 1057,
                height: 800,
            },
        ],
    },
    {
        id: '7',
        type: 'B' as const,
        media: [
            {
                id: 'img7a',
                type: 'image' as const,
                src: '/media/ai_form.webp',
                alt: 'AI Form',
                width: 620,
                height: 423,
            },
            {
                id: 'img7b',
                type: 'image' as const,
                src: '/media/ShopIO.webp',
                alt: 'AI powered e-commerce platform',
                width: 620,
                height: 372,
            },
        ],
    },
    {
        id: '8',
        type: 'B' as const,
        media: [
            {
                id: 'img6a',
                type: 'image' as const,
                src: '/media/proposals.webp',
                alt: 'MPC Proposals',
                width: 484,
                height: 363,
            },
            {
                id: 'img6b',
                type: 'image' as const,
                src: '/media/gray_dashboard.webp',
                alt: 'Gray Dashboard',
                width: 485,
                height: 433,
            },
        ],
    },
];

function HomeContent({ tweetData }: HomeClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [selectedCaseStudy, setSelectedCaseStudy] = useState<{
        id: string;
        title: string;
        chips: string[];
        description: string;
        images: string[];
        actions?: any[];
        note?: string;
        priority?: boolean;
        clickable?: boolean;
        hidden?: boolean;
    } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openCaseStudy = useCallback((cs: any) => {
        setSelectedCaseStudy(cs);
        setIsModalOpen(true);
        // Update URL
        const params = new URLSearchParams(searchParams);
        params.set('work', cs.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    const closeCaseStudy = useCallback(() => {
        setIsModalOpen(false);
        // Clear URL parameter
        const params = new URLSearchParams(searchParams);
        params.delete('work');
        router.push(pathname, { scroll: false });
    }, [pathname, router, searchParams]);

    // Handle initial URL parameter and browser back/forward
    useEffect(() => {
        const workId = searchParams.get('work');
        if (workId) {
            const cs = caseStudies.find(c => c.id === workId);
            if (cs && cs.clickable) {
                setSelectedCaseStudy(cs);
                setIsModalOpen(true);
            }
        } else {
            setIsModalOpen(false);
            // If we are already closed, clear the selected study
            if (!isModalOpen) {
                setSelectedCaseStudy(null);
            }
        }
    }, [searchParams, caseStudies, isModalOpen]); // Added isModalOpen to dependencies

    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex flex-col">
            <Ticker columns={sampleColumns} className="mb-75" />
            <AboutMe />
            <div
                className="grid grid-cols-1 gap-8 max-w-[1360px] mx-auto mb-75 min-[1360px]:grid-cols-2 px-[12px] sm:px-6 lg:px-0">
                {caseStudies.filter(cs => !cs.hidden).map((cs) => (
                    <CaseStudy
                        key={cs.id}
                        title={cs.title}
                        chips={cs.chips}
                        description={cs.description}
                        note={cs.note}
                        images={cs.images}
                        tooltip={cs.tooltip}
                        priority={cs.priority}
                        className="max-w-full min-[1360px]:max-w-[664px]"
                        id={cs.id}
                        isOpen={isModalOpen && selectedCaseStudy?.id === cs.id}
                        onClick={
                            cs.clickable
                                ? () => openCaseStudy(cs)
                                : undefined
                        }
                        actions={cs.actions?.map(action =>
                            action.id === 'view-case-study'
                                ? { ...action, href: `/work/${cs.id}`, onClick: () => openCaseStudy(cs) }
                                : action
                        )}
                    />
                ))}
            </div>
            <div className="w-full overflow-visible flex flex-col items-center mb-10 md:mb-20">
                <div className='max-w-6xl w-full px-2 md:px-0'>
                    <div className="space-y-4 md:space-y-2 text-center md:text-left mb-4 md:mb-6">
                        <m.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-2xl md:text-3xl font-bold text-white tracking-tighter"
                        >
                            Curated <span className="text-blue-500 italic">Knowledge</span>
                        </m.h2>
                        <p className="text-white/50 font-mono text-[10px] md:text-sm uppercase tracking-[0.3em]">
                            Digital Library • Design • UX • Philosophy
                        </p>
                    </div>
                </div>
                <BookShelf books={books} />
            </div>

            <Description className="pb-65" />
            <ScrollIndicator />

            <CaseStudyDetails
                isOpen={isModalOpen}
                onClose={closeCaseStudy}
                id={selectedCaseStudy?.id}
            >
                {selectedCaseStudy?.id === "kushari" && (
                    <KushariCaseStudy
                        data={selectedCaseStudy}
                        tweet={tweetData}
                    />
                )}
                {selectedCaseStudy?.id === "telescope" && (
                    <TelescopeCaseStudy />
                )}

            </CaseStudyDetails>
        </div>
    );
}

export default function HomeClient(props: HomeClientProps) {
    return (
        <Suspense fallback={null}>
            <HomeContent {...props} />
        </Suspense>
    );
}
