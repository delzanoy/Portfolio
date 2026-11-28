// Kushari case study tiles: one idea per tile, shown as a short looping recording.
//
// Recording spec for each `video`:
//   - 6–10 s seamless loop, no cursor wandering; one interaction per clip
//   - record at 2x (Retina), crop to the part of the screen that tells the idea
//   - export WebM (VP9) around 1 MB, plus a poster frame (.webp) of the first frame
//   - put files in /public/media/kushari/tiles/
// Until a clip exists, a tile shows its `poster` still.

export type KushariTileArea = 'Wallets' | 'Approvals' | 'Transactions' | 'Assets' | 'Address book' | 'System';

export interface KushariTile {
    id: string;
    title: string;
    /** The one idea this tile shows, in a sentence */
    idea: string;
    area: KushariTileArea;
    media: {
        poster: string;
        video?: string;
        /** Defaults to 'cover'; use 'contain' for screens that must show whole */
        fit?: 'cover' | 'contain';
    };
    /** Deep link into the live product, so viewers can try this exact screen */
    liveHref?: string;
    /** Shown in the focus view: the problem and the decision, two or three sentences */
    detail?: string;
}

const LIVE = 'https://kushari-next.onrender.com';

export const kushariTiles: KushariTile[] = [
    {
        id: 'wallets',
        title: 'One view of every vault',
        idea: 'MPC vaults, Gnosis Safes and tracked wallets on one screen, with live balances.',
        area: 'Wallets',
        media: { poster: '/media/hero.webp' },
        liveHref: `${LIVE}/wallets`,
    },
    {
        id: 'custody',
        title: 'Choosing a custody model',
        idea: 'Creating a vault starts with the trade-off between MPC and a Gnosis Safe, explained in plain words.',
        area: 'Wallets',
        media: { poster: '/media/kushari/mpc_lock.webp', fit: 'contain' },
        liveHref: `${LIVE}/wallets`,
    },
    {
        id: 'proposals',
        title: 'Approvals that can’t go wrong',
        idea: 'Every transfer is a proposal; signers see exactly what they approve and who is still to sign.',
        area: 'Approvals',
        media: { poster: '/media/proposals.webp' },
        liveHref: `${LIVE}/transactions/proposals`,
    },
    {
        id: 'executing',
        title: 'Signing, step by step',
        idea: 'Execution shows each signature landing, so a high-value transfer never feels like a black box.',
        area: 'Approvals',
        media: { poster: '/media/proposals.webp', video: '/media/executing.webm' },
        liveHref: `${LIVE}/transactions/proposals`,
    },
    {
        id: 'transactions',
        title: 'No raw hex',
        idea: 'Transactions read as intent, “Pay 4,000 USDC to Acme Payroll”, not contract calls.',
        area: 'Transactions',
        media: { poster: '/media/transactions.webp' },
        liveHref: `${LIVE}/transactions/view-all`,
    },
    {
        id: 'assets',
        title: 'Assets across chains',
        idea: 'Holdings grouped by token, not by chain, with 24-hour movement at a glance.',
        area: 'Assets',
        media: { poster: '/media/assets.webp' },
        liveHref: `${LIVE}/assets`,
    },
    {
        id: 'address-book',
        title: 'Trusted addresses',
        idea: 'An address book and groups, so teams pay names they recognise instead of pasting strings.',
        area: 'Address book',
        media: { poster: '/media/kushari/block_explorer.webp', fit: 'contain' },
        liveHref: `${LIVE}/address-book/addresses`,
    },
    {
        id: 'design-system',
        title: 'The design system',
        idea: 'Tokens and components built alongside the product, documented in the app itself.',
        area: 'System',
        media: { poster: '/media/mpc_explore.webp' },
        liveHref: `${LIVE}/designsystem/tokens`,
    },
];
