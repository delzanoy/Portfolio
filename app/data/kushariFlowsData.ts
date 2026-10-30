export interface FlowStep {
    id: string;
    title: string;
    description: string;
    timestamp?: number;
    mediaUrl?: string;
    hotspots?: Array<{
        x: number; // percentage
        y: number; // percentage
        label: string;
        description: string;
    }>;
}

export interface KushariFlowModule {
    id: string;
    title: string;
    tagline: string;
    category: 'governance' | 'security' | 'tracking' | 'system';
    chips: string[];
    previewMedia: {
        type: 'video' | 'image' | 'iframe';
        src: string;
        poster?: string;
        fit?: 'cover' | 'contain';
        iframeUrl?: string;
        browserHeader?: boolean;
    };
    problemStatement: string;
    designRationale: string;
    tradeoffs: string[];
    architectureNotes: string;
    metrics: string;
    steps: FlowStep[];
}

export const kushariFlowModules: KushariFlowModule[] = [
    {
        id: 'flow-wallets-screen',
        title: 'Wallets Management Hub',
        tagline: 'Live screen from https://kushari-next.onrender.com/wallets presenting multi-vault treasury management.',
        category: 'governance',
        chips: ['Wallets Screen', 'MPC & Gnosis', 'Full UI'],
        previewMedia: {
            type: 'iframe',
            src: '/media/assets.webp',
            iframeUrl: 'https://kushari-next.onrender.com/wallets',
            fit: 'contain',
        },
        problemStatement: 'Managing fragmented multi-chain treasury assets requires real-time aggregate visibility over MPC vaults, Gnosis Safe multisigs, and monitored personal wallets.',
        designRationale: 'Kushari unifies all custody models into a single screen with real-time price enrichment, 24h performance metrics, and instant transaction triggers.',
        tradeoffs: [
            'Combining workspace vaults with personal tracked wallets vs strict institutional separation.',
            'Real-time price feed polling vs battery & network efficiency.'
        ],
        architectureNotes: 'Fetches live wallet state from Kushari API layer and enriches balances with CoinGecko crypto price feeds in real time.',
        metrics: '100% unified view across MPC, Gnosis Safe, and tracked EVM addresses.',
        steps: [
            {
                id: 'w1',
                title: 'Wallets Screen Overview',
                description: 'Full uncropped view of https://kushari-next.onrender.com/wallets showing MPC vaults, Gnosis Safes, and tracked addresses.',
                mediaUrl: '/media/assets.webp',
                hotspots: [
                    { x: 30, y: 30, label: 'MPC Vaults', description: 'Threshold signing for team treasury.' },
                    { x: 70, y: 30, label: 'Gnosis Safe', description: 'On-chain smart contract multisig.' }
                ]
            }
        ]
    }
];
