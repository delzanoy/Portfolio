export interface CaseStudyData {
    id: string;
    title: string;
    chips: string[];
    description: string;
    images: string[];
    actions?: Array<{
        label: string;
        href?: string;
        variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'metal';
        size?: 'sm' | 'md' | 'lg';
        className?: string;
        id?: string;
    }>;
    note?: string;
    priority?: boolean;
    clickable?: boolean;
    hidden?: boolean;
    tooltip?: string;
}

export const caseStudies: CaseStudyData[] = [
    {
        id: "telescope",
        title: "Telescope",
        chips: ["Aerospace", "SaaS", "Data Viz"],
        description: "Orbital conjunction screening and maneuver design prototype for space situational awareness.",
        images: ["/media/hero.webp"],
        clickable: true,
        hidden: false,
        tooltip: "Product demo"
    },
    {
        id: "kushari",
        title: "Kushari",
        chips: ["Crypto", "Treasury", "SaaS"],
        description: "Shared wallets, approval flows, and real-time tracking designed to bring clarity, speed, and trust to everyday crypto operations.",
        note: "Try the Product demo - done in NextJS.",
        priority: true,
        images: [
            "/media/hero.webp",
            "/media/mpc_explore.webp",
            "/media/transactions.webp",
            "/media/assets.webp"
        ],
        tooltip: "Case study",
        actions: [
            {
                label: "View case study",
                variant: "primary",
                size: "sm",
                className: "min-[1360px]:hidden",
                id: "view-case-study"
            },
            {
                label: "Product demo",
                href: "https://kushari-next.onrender.com/",
                variant: "metal",
                size: "sm"
            },
            {
                label: "Design system",
                href: "https://kushari-next.onrender.com/designsystem/tokens",
                variant: "outline",
                size: "sm"
            },
            {
                label: "Website",
                href: "https://www.figma.com/proto/Nfz1oTeKS553bZuNAIi3zN/Kushari-2.0?page-id=5%3A35478&node-id=516-5964&viewport=309%2C-657%2C0.11&t=XQe9OJ9u9TGap2y9-1&scaling=scale-down-width&content-scaling=fixed",
                variant: "outline",
                size: "sm"
            },
        ],
        clickable: true
    },
    {
        id: "shopio",
        title: "Shop.io",
        chips: ["Product Design", "AI UX"],
        description: "An AI product which analyses e-commerce PDP, PLP and provides insights to optimize the workflow.",
        note: "Case study coming soon",
        images: ["/media/ShopIO.webp"],
        tooltip: "Coming Soon",
        clickable: false
    }
];
