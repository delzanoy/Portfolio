export type CareerStatus = 'done' | 'current' | 'next';

export interface CareerLink {
    label: string;
    href: string;
}

export interface CareerHighlight {
    text: string;
    links?: CareerLink[];
}

export interface CareerStep {
    id: string;
    title: string;
    role: string;
    period: string;
    status: CareerStatus;
    /** One line, always visible under the role */
    summary?: string;
    /** Shown when the step is opened */
    description: string;
    highlights?: CareerHighlight[];
    links?: CareerLink[];
}

// Oldest first. Edit copy and links here; the tree renders from this list.
export const career: CareerStep[] = [
    {
        id: 'mca',
        title: 'Master of Computer Applications',
        role: 'Sardar Patel Institute of Technology · Mumbai',
        period: '2016–19',
        status: 'done',
        description: 'Started out on the engineering side of products.',
        links: [{ label: 'SPIT', href: 'https://www.spit.ac.in' }],
    },
    {
        id: 'bnp',
        title: 'BNP Paribas India',
        role: 'Intern → Associate Support Analyst · Mumbai',
        period: '2019–20',
        status: 'done',
        summary: 'Built internal dashboards for operations teams.',
        description: 'Joined as an intern for six months and was converted to full time.',
        highlights: [
            { text: '6-month internship, converted to full time' },
            { text: 'Designed and built monitoring dashboards with Highcharts and Materialize CSS' },
        ],
        links: [{ label: 'BNP Paribas India', href: 'https://www.bnpparibas.bank.in/en/' }],
    },
    {
        id: 'switch',
        title: 'Switched to design',
        role: 'Self-taught',
        period: '2020',
        status: 'done',
        summary: 'Learnt that design can make or break a product.',
        description: 'Building dashboards for operations teams at BNP showed me that design decides whether a product gets used. When Covid hit in 2020, I used the time to teach myself product design.',
    },
    {
        id: 'truemeds',
        title: 'Truemeds',
        role: 'Product Design Intern · Mumbai',
        period: '2021',
        status: 'done',
        summary: 'Onboarding for an online pharmacy.',
        description: 'First design role. Worked on new-user onboarding, improving the journey from sign-up to first order.',
        highlights: [
            { text: 'Flow design and competitor analysis' },
            { text: 'Onboarding from sign-up to first order' },
        ],
        links: [{ label: 'Truemeds', href: 'https://www.truemeds.in' }],
    },
    {
        id: 'capiter',
        title: 'Capiter',
        role: 'Product Designer · Cairo, Egypt (remote)',
        period: '2021–22',
        status: 'done',
        summary: 'B2B e-commerce for merchants, in English and Arabic.',
        description: 'First full-time design role, at a well-funded B2B e-commerce startup in Egypt. It shut down in 2022 after its founders were removed.',
        highlights: [
            { text: 'Bilingual redesign (English + Arabic): +11% conversions, −30% drop-offs' },
            { text: 'Designed buy-now-pay-later for merchant financing' },
            { text: 'Built the mobile design system for iOS and Android' },
        ],
    },
    {
        id: 'md',
        title: 'Market Diggers',
        role: 'MD Solutions · Product Design Consultant · Mumbai',
        period: '2022–26',
        status: 'done',
        summary: 'Agency work across SaaS, data tools and Web3.',
        description: 'A small agency, designing for clients from legacy enterprises to early-stage startups: dashboards, internal tools, onboarding and design systems.',
        highlights: [
            {
                text: 'Koshance, a Web3 treasury platform: wallets, multi-party approvals, transaction visibility',
                links: [{ label: 'Koshance', href: 'https://koshance.com' }],
            },
            { text: 'Koshance didn’t launch after founders and investors split on scope and timeline' },
            { text: 'Left in March 2026; the agency shut down a few months later' },
        ],
        links: [{ label: 'Market Diggers', href: 'https://www.marketdiggers.com' }],
    },
    {
        id: 'today',
        title: 'Relearning design',
        role: 'Independent',
        period: 'Now',
        status: 'current',
        summary: 'Prototyping in code with AI tooling.',
        description: 'Relearning design with AI tooling, prototyping in code, and building end-to-end.',
        highlights: [
            {
                text: 'Rebuilt Koshance from scratch as Kushari',
                links: [
                    { label: 'Case study', href: '/work/kushari' },
                    { label: 'Live demo', href: 'https://kushari-next.onrender.com/' },
                ],
            },
            {
                text: 'Telescope, an orbital conjunction screening prototype',
                links: [
                    { label: 'Live', href: 'https://telescope.delanoy.fyi' },
                ],
            },
        ],
    },
    {
        id: 'next',
        title: 'Next role',
        role: 'Product design · SaaS, fintech, crypto, AI',
        period: 'Open to work',
        status: 'next',
        summary: 'Looking for a team that builds good products, and cares how.',
        description: 'Product design roles in SaaS, fintech, crypto or AI.',
        links: [
            { label: 'Book a call', href: 'https://cal.com/delanoy/30min' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/delanoykunil/' },
        ],
    },
];

// Closing statement below the timeline: what ended, the turn, and the ask.
export const careerStory = {
    setbacks: [
        // emoji ends the line; hovering a letter swaps it for one from `pool`.
        // `noto` is the same idea limited to Google's animated Noto set (881 emoji).
        {
            text: 'A startup shutdown,',
            emoji: '🔌', pool: ['🔌', '💸', '📉', '🪫', '🥀', '🧯', '📦', '🏚️'],
            noto: { emoji: '🔌', pool: ['🔌', '💸', '📉', '🪫', '🥀', '📦', '🏚️', '💥'] },
        },
        {
            text: 'a product that never launched,',
            emoji: '🚀', pool: ['🚀', '🛸', '🧪', '🛠️', '🪐', '🧩', '⏳', '💭'],
            noto: { emoji: '🚀', pool: ['🚀', '🛸', '🛠️', '🪐', '⏳', '🎯', '🤞', '💔'] },
        },
        {
            text: 'an agency that closed.',
            emoji: '🚪', pool: ['🚪', '🔒', '🗝️', '📁', '☕', '💼', '🧾', '👋'],
            noto: { emoji: '👋', pool: ['👋', '🔒', '☕', '🫡', '😮‍💨', '🍂', '🙏', '👻'] },
        },
    ],
    turn: 'I’ve seen a lot of what can go wrong around a product, and I’m still building.',
    ask: 'Now I want to do my best work with a team that values the craft.',
};
