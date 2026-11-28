"use client";

import Ticker from './components/Ticker';
import AboutMe from "./components/AboutMe";
import { useEffect, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CaseStudyDetails from "./components/CaseStudyDetails";
import type { Tweet } from 'react-tweet/api';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import BookShelf, { Book } from './components/BookShelf';
import CareerTree from './components/CareerTree';
import ClosingStatement from './components/ClosingStatement';
import { LightsWhileInView } from './components/museumLights';
import { m, AnimatePresence } from 'framer-motion';
import { caseStudies as staticCaseStudies, type CaseStudyData } from './data/caseStudies';

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


interface HomeClientProps {
    tweetData?: Tweet;
}

export const books: Book[] = [
    {
        id: '1',
        title: 'Ruined by design',
        author: 'Mike Monteiro',
        amazonUrl: 'https://www.amazon.in/dp/1090532083?linkCode=ll2&tag=delanoy-21&linkId=fc4033079e44631c10bc842195ef27e6',
        coverSrc: '/media/books/ruined_by_design_front.webp',
        spineSrc: '/media/books/ruined_by_design_spine.webp',
        orientation: 'front',
        binding: 'paperback',
        category: 'Design ethics',
        color: '#e5e7eb',
        pages: 222,
        trim: [152, 229],
        height: 220,
    },
    {
        id: '2',
        title: 'Change by design',
        author: 'Tim Brown',
        amazonUrl: 'https://www.amazon.in/dp/0062967096?linkCode=ll2&tag=delanoy-21&linkId=a1b9bcad84171eac4fe287c7b2d37348',
        coverSrc: '/media/books/change_by_design_front.webp',
        spineSrc: '/media/books/change_by_design_spine.webp',
        orientation: 'vertical',
        binding: 'hardcover',
        category: 'Design impact',
        color: '#111827',
        pages: 304,
        trim: [152, 229],
        height: 240,
    },
    {
        id: '3',
        title: 'Genius makers',
        author: 'Cade Metz',
        amazonUrl: 'https://www.amazon.in/dp/1524742678?linkCode=ll2&tag=delanoy-21&linkId=4adcc1df23258a019183406e35a30f9b',
        coverSrc: '/media/books/genius_makers_front.webp',
        spineSrc: '/media/books/genius_makers_spine.webp',
        orientation: 'vertical',
        binding: 'hardcover',
        category: 'AI and its inception',
        color: '#4f46e5',
        pages: 384,
        trim: [160, 235],
        height: 300,
    },
    {
        id: '4',
        title: 'The brain at rest',
        author: 'Joseph Jebelli',
        amazonUrl: 'https://www.amazon.in/dp/1804996793?linkCode=ll2&tag=delanoy-21&linkId=0b43fb14f2744b74cb8e0a202f433bfd',
        coverSrc: '/media/books/the_brain_at_rest_front.webp',
        spineSrc: '/media/books/the_brain_at_rest_spine.webp',
        orientation: 'vertical',
        binding: 'hardcover',
        category: 'Neuroscience',
        color: '#0f172a',
        pages: 288,
        trim: [158, 238],
        height: 290,
    },
    {
        id: '5',
        title: 'No rules rule',
        author: 'Erin Meyer and Reed Hastings',
        amazonUrl: 'https://www.amazon.in/dp/0753560968?linkCode=ll2&tag=delanoy-21&linkId=da8389ddd60930af37378d1d495bf058',
        coverSrc: '/media/books/no_rules_rules_front.webp',
        spineSrc: '/media/books/no_rules_rules_spine.webp',
        orientation: 'front',
        binding: 'hardcover',
        category: 'Startup culture',
        color: '#e5e7eb',
        pages: 320,
        trim: [163, 241],
        height: 240,
    },
    {
        id: '6',
        title: 'Actionable gamification',
        author: 'Yu-Kai Chou',
        amazonUrl: 'https://www.amazon.in/dp/9395741686?linkCode=ll2&tag=delanoy-21&linkId=e63cf789ba2056356fbe9fe8fdd03e4a',
        coverSrc: '/media/books/actionable_gamification_front.webp',
        spineSrc: '/media/books/actionable_gamification_spine.webp',
        backSrc: '/media/books/actionable_gamification_back.webp',
        orientation: 'horizontal',
        binding: 'paperback',
        category: 'Gamification',
        color: '#e5e7eb',
        pages: 506,
        trim: [152, 229],
        height: 320,
    },
    {
        id: '7',
        title: 'Mental models',
        author: 'Peter Hollins',
        amazonUrl: 'https://www.amazon.in/dp/0143458930?linkCode=ll2&tag=delanoy-21&linkId=862eb88a9258d5f53b9ea7e1cf4f5432',
        coverSrc: '/media/books/mental_models_front.webp',
        spineSrc: '/media/books/mental_models_spine.webp',
        backSrc: '/media/books/mental_models_back.webp',
        orientation: 'horizontal',
        binding: 'paperback',
        category: 'Mental models',
        color: '#e5e7eb',
        pages: 160,
        trim: [129, 198],
        height: 260,
        stock: 'bulky',
    },
    {
        id: '8',
        title: 'Building a second brain',
        author: 'Tiago Forte',
        amazonUrl: 'https://www.amazon.in/dp/1800815492?linkCode=ll2&tag=delanoy-21&linkId=ed1c6b236b56e334ac7413e11279f93b',
        coverSrc: '/media/books/building_a_second_brain_front.webp',
        spineSrc: '/media/books/building_a_second_brain_spine.webp',
        backSrc: '/media/books/building_a_second_brain_back.webp',
        orientation: 'horizontal',
        binding: 'hardcover',
        category: 'Note taking that works',
        color: '#e5e7eb',
        pages: 272,
        trim: [159, 237],
        height: 295,
    },
    {
        id: '9',
        title: 'Burn your portfolio',
        author: 'Michael Janda',
        amazonUrl: 'https://www.amazon.in/dp/0321918681?linkCode=ll2&tag=delanoy-21&linkId=5da5820edc24fef430cf7776f88ee997',
        coverSrc: '/media/books/burn_your_portfolio_front.webp',
        spineSrc: '/media/books/burn_your_portfolio_spine.webp',
        orientation: 'front',
        binding: 'paperback',
        category: 'Dont miss this one',
        color: '#e5e7eb',
        pages: 400,
        trim: [152, 229],
        height: 260,
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
                width: 2000,
                height: 1366,
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

    const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudyData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openCaseStudy = useCallback((cs: CaseStudyData) => {
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

    // Handle initial URL parameter and browser back/forward.
    // Adjusts state during render whenever ?work= changes (no effect needed).
    const workId = searchParams.get('work');
    const [syncedWorkId, setSyncedWorkId] = useState<string | null | undefined>(undefined);
    if (workId !== syncedWorkId) {
        setSyncedWorkId(workId);
        if (workId) {
            const cs = caseStudies.find(c => c.id === workId);
            if (cs && cs.clickable) {
                setSelectedCaseStudy(cs);
                setIsModalOpen(true);
            }
        } else {
            setIsModalOpen(false);
            setSelectedCaseStudy(null);
        }
    }

    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    // The first row lights up from below the fold, right under the story: the cue to scroll
    const glowDelay = 8.4; // s, as the story's ask settles
    const caseStudyGrid = (
        <div
            className="grid grid-cols-1 gap-8 max-w-[1360px] mx-auto mb-24 md:mb-75 min-[1360px]:grid-cols-2 px-[12px] sm:px-6 lg:px-0">
            {caseStudies.filter(cs => !cs.hidden).map((cs, i) => (
                <CaseStudy
                    key={cs.id}
                    glow={
                        i < 2
                            ? {
                                  // The second card only sits in the first row from 1360px
                                  delay: glowDelay + i * 0.25,
                                  className: i === 1 ? 'hidden min-[1360px]:block' : undefined,
                              }
                            : undefined
                    }
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
    );

    const bookshelf = (
        <div className="w-full overflow-visible flex flex-col items-center mb-10 md:mb-20">
            <div className='max-w-6xl w-full px-2 md:px-0'>
                <div className="space-y-4 md:space-y-2 text-center md:text-left mb-4 md:mb-6">
                    <m.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="text-2xl md:text-3xl font-bold text-white tracking-tighter"
                    >
                        My <span className="text-blue-500 italic">library</span>
                    </m.h2>
                    <p className="text-white/50 font-mono text-[10px] md:text-sm uppercase tracking-[0.3em]">
                        Design ✦ UX ✦ Philosophy
                    </p>
                    {/* Required by the Amazon Associates agreement wherever the links appear */}
                    <p className="text-[11px] md:text-xs text-white/40">
                        As an Amazon Associate I earn from qualifying purchases.
                    </p>
                </div>
            </div>
            <BookShelf books={books} />
        </div>
    );

    return (
        <div className="flex flex-col">
            {/* The story fills the first screen; the background lights come on while it's on screen */}
            <LightsWhileInView>
                <ClosingStatement
                    emojiSet="noto"
                    cursor="repel"
                    align="middle"
                    // Each line's emoji travels from its first letter to the end, writing the line
                    intro="write"
                    // Lines land with the side lights (left at 1s, right at 2.5s)
                    delay={0.6}
                    // Fills the first screen, centred. Phone: below the name at the top.
                    // Desktop: centred in the space above the pinned name (bottom-left).
                    fold
                    className="min-h-[100svh] pt-44 pb-24 min-[900px]:items-center min-[900px]:pt-14 min-[900px]:pb-[180px]"
                />
            </LightsWhileInView>
            {/* Fixed overlays (name, contact). Right after the first section, so what
                paints above it doesn't change */}
            <AboutMe storyFirst revealOnFooter />
            {/* The work answers the ask; its light rising from below is the cue to scroll */}
            {caseStudyGrid}
            {bookshelf}
            <div className="pt-16 md:pt-28 pb-24 md:pb-40">
                <CareerTree />
            </div>
            {/* The marquee closes the page as its footer; the links and contact
                buttons come up over it once it's reached (AboutMe revealOnFooter) */}
            <footer data-site-footer>
                <Ticker columns={sampleColumns} enterOnView />
            </footer>

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
