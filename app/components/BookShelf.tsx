'use client';

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Button from './Button';
import { layoutLeaningRow, layoutPile } from './leanLayout';
export interface Book {
    id: string;
    title: string;
    author: string;
    coverSrc: string;
    spineSrc: string;
    /** Back cover artwork; without it the back is plain board in the cover colour */
    backSrc?: string;
    orientation: 'vertical' | 'front' | 'horizontal';
    /** Hardcover: boards, rounded spine, hinge groove. Paperback: thin card cover, scored and creased. */
    binding?: 'hardcover' | 'paperback';
    /** Hardcovers only: wrapped in a paper dust jacket (default true) */
    jacket?: boolean;
    /** Page colour on the fore-edge; picked from the binding's usual papers when not set */
    paper?: string;
    category?: string;
    color?: string;        // fallback spine color
    /** Page count; with `trim`, sets the thickness (see thicknessOf) */
    pages?: number;
    /** Real trim size in mm, [width, height]: sets the book's proportions (width and thickness for its drawn height) */
    trim?: [number, number];
    /** How bulky the paper is (default: trade for hardcovers, pod for paperbacks) */
    stock?: PaperStock;
    thickness?: number;     // spine width (in px); used when there is no page count
    width?: number;         // book width (in px); used when there is no trim size
    height?: number;        // drawn height (in px): art-directed, so the shelf varies; defaults to the trim at PX_PER_MM
    /** Amazon product page (e.g. https://www.amazon.in/dp/ASIN); without it the button searches Amazon.in for the title */
    amazonUrl?: string;
}

/* ----------------------------------------
   Amazon affiliate links
   Every "Buy on Amazon" link carries the Associates tracking tag.
---------------------------------------- */
export const AMAZON_ASSOCIATE_TAG = 'delanoy-21'; // Amazon.in Associates tracking ID
export function amazonLink(book: Pick<Book, 'title' | 'author' | 'amazonUrl'>) {
    const url = new URL(book.amazonUrl ?? `https://www.amazon.in/s?k=${encodeURIComponent(`${book.title} ${book.author}`)}`);
    if (AMAZON_ASSOCIATE_TAG) url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
    return url.toString();
}

/* ----------------------------------------
   Thickness from page count
   A book is as thick as its page block plus its covers. Pages are printed two
   to a leaf, and paper is sold by bulk: how many pages stack into a millimetre.
   Calibrated on the shelf's own books where retailers list a spine width:
   - trade: the bulky book paper of trade hardcovers (Change by Design, 304
     pages, 26 mm; No Rules Rules, 320 pages, 27 mm)
   - pod: the thinner white paper of print-on-demand paperbacks (Actionable
     Gamification, 506 pages, 29 mm; Ruined by Design, 222 pages, 13 mm)
   - bulky: the soft, thick paper of Indian mass-market paperbacks
   Real books are nearly all the same size (most here are 229–241 mm tall), so
   drawn at one scale the shelf looks uniform. Instead each book's height is
   art-directed, and its trim size and page count give the rest at that
   book's own scale: width from the trim ratio, thickness from the pages. Every
   book keeps its true proportions while the shelf keeps its variety.
---------------------------------------- */
export type PaperStock = 'trade' | 'pod' | 'bulky';
const PAGES_PER_MM: Record<PaperStock, number> = { trade: 14.3, pod: 17.8, bulky: 14 };
/** Both covers together, mm: boards on a hardcover, card on a paperback */
const COVERS_MM: Record<'hardcover' | 'paperback', number> = { hardcover: 5, paperback: 0.6 };

/** Scale for a book with a trim size but no drawn height */
const PX_PER_MM = 1.15;

/** Spine thickness in px at desktop size */
export const thicknessOf = (book: Book): number => {
    if (book.pages && book.trim) {
        const binding = book.binding ?? 'paperback';
        const stock = book.stock ?? (binding === 'hardcover' ? 'trade' : 'pod');
        const mm = book.pages / PAGES_PER_MM[stock] + COVERS_MM[binding];
        return mm * pxPerMm(book);
    }
    return book.thickness || 25;
};
/** Height (the spine's length) in px at desktop size */
export const heightOf = (book: Book): number => book.height ?? (book.trim ? book.trim[1] * PX_PER_MM : 300);
/** This book's own scale: its drawn height over its real height */
const pxPerMm = (book: Book): number => (book.trim ? heightOf(book) / book.trim[1] : PX_PER_MM);
/** Cover width (the book's depth on the shelf) in px at desktop size: the trim's ratio at the drawn height */
export const widthOf = (book: Book): number => (book.trim ? book.trim[0] * pxPerMm(book) : book.width || 210);

// Same stable per-book random numbers as BookItem uses for its angles
const seededRandom = (id: string, offset: number) => {
    const seed = id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
};

// Lean for an upright book, in degrees to the left: stable per book, between 2° and 8°
/** Resting tilt of a lying book, degrees: subtle, and not the same for every book */
const horizontalTilt = (id: string) => 1.5 + seededRandom(id, 700) * 2.5;
/** Resting turn of a lying book about the vertical, degrees, either way */
const horizontalYaw = (id: string) => (seededRandom(id, 710) < 0.5 ? -1 : 1) * (5 + seededRandom(id, 720) * 2);
const leanFor = (id: string) => 2 + seededRandom(id, 200) * 6;

/**
 * How far a front-facing book's visible right edge sits inside its box.
 * The book is turned rotateY(−10…−20°) about its centre, so its cover swings back by
 * w/2·(1 − cos θ), and the cover sits `thickness` in front, which the turn pushes left
 * by t·sin θ. A leaning book should rest on the edge you see, not the box.
 */
const frontInset = (book: Book, isMobile: boolean) => {
    const theta = ((10 + seededRandom(book.id, 0) * 10) * Math.PI) / 180;
    const w = widthOf(book) * SCALE(isMobile);
    const t = thicknessOf(book) * THICKNESS_SCALE(isMobile);
    // ×0.75: perspective pulls the far edge in less than this flat estimate (measured)
    return 0.75 * ((w / 2) * (1 - Math.cos(theta)) + t * Math.sin(theta));
};

/* ----------------------------------------
   Surface finish: what makes a book read as an object, not a picture.
   Layers drawn over the printed spine and cover art.
---------------------------------------- */
type Binding = 'hardcover' | 'paperback';

/**
 * Contact shading on a spine, in the spine's own (unrotated, portrait) frame:
 * a dark band along its left or right edge, between `from` and `to` along its
 * length (0 = top). `fade: 'down'` makes it strongest at the top: used where a
 * leaning book touches its neighbour at the top and the wedge opens below.
 */
export interface EdgeShade {
    side: 'left' | 'right';
    from: number;
    to: number;
    fade?: 'down';
    /** False once the books stop touching (one is lifted out): the shadow fades away */
    on?: boolean;
}

/**
 * Spine. A hardcover spine is rounded, so light falls off towards both edges,
 * with a crisp crease where it meets the boards. A paperback spine is flat card:
 * gentler shading, the fold at each edge worn pale, and a reading crease or two.
 * `grounded` adds the contact shading where an upright book meets the shelf.
 */
function SpineFinish({ binding, seed, grounded, lifted = false, shades = [], jacket = false, wear = 0.5 }: { binding: Binding; seed: number; grounded: boolean; lifted?: boolean; shades?: EdgeShade[]; jacket?: boolean; wear?: number }) {
    const hard = binding === 'hardcover';
    // Reading creases on paperbacks: 0–2 faint lines along the spine, stable per book
    const creases = hard ? [] : [0.3 + (seed % 7) * 0.05, 0.55 + (seed % 5) * 0.05].slice(0, seed % 3);
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0">
            <div
                className="absolute inset-0"
                style={{
                    background: hard
                        ? 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.06) 16%, rgba(255,255,255,0.13) 38%, rgba(255,255,255,0.04) 58%, rgba(0,0,0,0.07) 80%, rgba(0,0,0,0.32) 100%)'
                        : 'linear-gradient(90deg, rgba(0,0,0,0.26) 0%, rgba(255,255,255,0.07) 10%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.06) 88%, rgba(0,0,0,0.3) 100%)',
                    boxShadow: hard
                        ? jacket
                            // Jacket paper rolls round the spine edges: a pale fold, then shadow
                            ? 'inset 1px 0 0 rgba(255,255,255,0.2), inset 2px 0 0 rgba(0,0,0,0.3), inset -1px 0 0 rgba(255,255,255,0.16), inset -2px 0 0 rgba(0,0,0,0.3)'
                            : 'inset 1px 0 0 rgba(0,0,0,0.5), inset -1px 0 0 rgba(0,0,0,0.5)'
                        // Folded card edges wear pale; how much depends on how read the book is
                        : `inset 1px 0 0 rgba(255,255,255,${(0.08 + wear * 0.24).toFixed(2)}), inset -1px 0 0 rgba(255,255,255,${(0.06 + wear * 0.2).toFixed(2)})`,
                }}
            />
            {creases.map((x, i) => (
                <div
                    key={i}
                    className="absolute bottom-[12%] top-[8%] w-px"
                    style={{
                        left: `${x * 100}%`,
                        background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.22) 20%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.2) 80%, transparent)',
                    }}
                />
            ))}
            {/* Paperback head: rubbed pale from being pulled off the shelf */}
            {!hard && wear > 0.35 && (
                <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(180deg, rgba(255,255,255,${(wear * 0.22).toFixed(2)}), transparent)` }} />
            )}
            {/* Hardcover head and tail: the rounded cap catches light, the tail sits in shadow */}
            {hard && (
                <>
                    <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)' }} />
                    <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.22), transparent)' }} />
                </>
            )}
            {grounded && (
                <div
                    className="absolute inset-x-0 bottom-0 h-[10%]"
                    style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.2), transparent)', opacity: lifted ? 0 : 1, transition: 'opacity 250ms ease-out' }}
                />
            )}
            {/* Where another book touches this one: light can't get in, so the edge goes dark */}
            {shades.map((sh, i) => (
                <div
                    key={`shade-${i}`}
                    className="absolute w-[35%]"
                    style={{
                        [sh.side]: 0,
                        top: `${sh.from * 100}%`,
                        height: `${(sh.to - sh.from) * 100}%`,
                        background: `linear-gradient(${sh.side === 'left' ? '90deg' : '270deg'}, rgba(0,0,0,0.26), rgba(0,0,0,0.08) 40%, transparent)`,
                        opacity: sh.on === false ? 0 : 1,
                        transition: 'opacity 250ms ease-out',
                        WebkitMaskImage: sh.fade === 'down' ? 'linear-gradient(180deg, #000 0%, #000 25%, transparent 100%)' : undefined,
                        maskImage: sh.fade === 'down' ? 'linear-gradient(180deg, #000 0%, #000 25%, transparent 100%)' : undefined,
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Cover, with the spine on its left. Hardcovers have a hinge groove pressed into
 * the board a few millimetres from the spine, and the board edges show. Paperback
 * covers are scored twice along the spine so they open, and have a laminate sheen.
 */
function CoverFinish({ binding, jacket = false, wear = 0.5, corner = 0 }: { binding: Binding; jacket?: boolean; wear?: number; corner?: number }) {
    const hard = binding === 'hardcover';
    // Which outer corner took the knocks: top or bottom of the fore-edge
    const rubbed = corner < 0.5 ? 'top' : 'bottom';
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* Light from above-left, falling off across the cover */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.18) 100%)' }} />
            {hard && jacket ? (
                <>
                    {/* Under a jacket the hinge is only a soft dip */}
                    <div className="absolute inset-y-0 left-0 w-[8%]" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.03) 60%, rgba(0,0,0,0.14) 88%, rgba(255,255,255,0.1) 100%)' }} />
                    {/* Where the jacket wraps round the fore-edge: a pale fold, shadow just inside */}
                    <div className="absolute inset-y-0 right-0 w-px bg-white/30" />
                    <div className="absolute inset-y-0 right-px w-px bg-black/15" />
                    {/* Paper edges at head and tail, a little rubbed */}
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: `rgba(255,255,255,${(0.1 + wear * 0.2).toFixed(2)})` }} />
                    <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `rgba(255,255,255,${(0.06 + wear * 0.14).toFixed(2)})` }} />
                    {/* Jacket paper: a faint sheen, softer than laminated card */}
                    <div className="absolute inset-0 mix-blend-screen" style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.05) 48%, transparent 62%)' }} />
                </>
            ) : hard ? (
                <>
                    {/* Hinge: the board dips into the groove, then rises again */}
                    <div className="absolute inset-y-0 left-0 w-[8%]" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.3) 92%, rgba(255,255,255,0.18) 100%)' }} />
                    <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)' }} />
                </>
            ) : (
                <>
                    {/* Score lines along the spine fold */}
                    <div className="absolute inset-y-0 left-[3.5%] w-px bg-white/15" />
                    <div className="absolute inset-y-0 left-[6.5%] w-px bg-black/20" />
                    {/* Laminate sheen */}
                    <div className="absolute inset-0 mix-blend-screen" style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 45%, transparent 60%)' }} />
                    <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 0 0.5px rgba(255,255,255,${(0.06 + wear * 0.14).toFixed(2)})` }} />
                </>
            )}
            {/* A rubbed corner on the fore-edge, where the card's colour has worn through */}
            {!hard && wear > 0.25 && (
                <div
                    className="absolute right-0 h-[14px] w-[14px]"
                    style={{
                        [rubbed]: 0,
                        background: `radial-gradient(circle at ${rubbed === 'top' ? '100% 0%' : '100% 100%'}, rgba(255,255,255,${(wear * 0.3).toFixed(2)}), transparent 70%)`,
                    }}
                />
            )}
        </div>
    );
}

/**
 * The page block, seen on the fore-edge (the side opposite the spine): cream paper,
 * a hairline every few pages, slightly darker where the edge curves away.
 * On a hardcover the boards sit proud of the pages on both faces and top and bottom.
 */
function PageEdge({ binding, color, paper, shaded = false, jacket = false }: { binding: Binding; color: string; paper: string; shaded?: boolean; jacket?: boolean }) {
    const hard = binding === 'hardcover';
    const board = hard ? 2.5 : 0.75; // cover thickness either side, px
    const square = hard ? 2 : 0; // boards overhang the pages, px
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: color }}>
            <div
                className="absolute"
                style={{
                    top: square,
                    bottom: square,
                    left: board,
                    right: board,
                    background: `
                        repeating-linear-gradient(90deg, rgba(90,70,40,0.16) 0 0.5px, transparent 0.5px 1.6px),
                        linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.12)),
                        linear-gradient(180deg, rgba(255,255,255,0.25), rgba(0,0,0,0.08))
                    `,
                    backgroundColor: paper,
                }}
            />
            {/* Dust jacket: paper on the outside of both boards, and its flap tucked in at the front */}
            {hard && jacket && (
                <>
                    <div className="absolute inset-y-0 left-0 w-[0.6px] bg-[#f1ebdf]/80" />
                    <div className="absolute inset-y-0 right-0 w-[0.6px] bg-[#f1ebdf]/80" />
                    <div className="absolute inset-y-[1px] w-[0.6px] bg-[#f1ebdf]/60" style={{ left: board }} />
                </>
            )}
            {/* A book leaning on this edge darkens it, most where they touch at the top */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.24), rgba(0,0,0,0.08) 60%, rgba(0,0,0,0.02))',
                    opacity: shaded ? 1 : 0,
                    transition: 'opacity 250ms ease-out',
                }}
            />
        </div>
    );
}

/**
 * Paper stock. Newer hardcovers use bright, white-ish paper; trade paperbacks use
 * cheaper, warmer stock that yellows a little with age.
 */
/* ----------------------------------------
   Head of a book: the top edge, seen when the eye is above the shelf.
   Boards either side, the page block between them (sheets run from the
   spine to the fore-edge), the spine across one end, and on a hardcover a
   striped headband where the pages meet the spine.
   `spine` is which edge of this face the spine is on.
---------------------------------------- */
function HeadFace({ binding, color, paper, jacket = false, spine, shade = 0 }: { binding: Binding; color: string; paper: string; jacket?: boolean; spine: 'top' | 'bottom' | 'left'; shade?: number }) {
    const hard = binding === 'hardcover';
    const board = hard ? 2.5 : 0.75; // cover thickness, px
    const square = hard ? 2 : 0; // boards overhang the pages at the fore-edge, px
    const back = hard ? 3 : 1; // spine thickness, px
    const across = spine === 'left'; // boards run along the top and bottom of this face
    const fore = spine === 'left' ? 'right' : spine === 'top' ? 'bottom' : 'top';
    const pages: React.CSSProperties = across
        ? { top: board, bottom: board, left: back, right: square }
        : { left: board, right: board, [spine]: back, [fore]: square };
    const lines = across ? '180deg' : '90deg';
    const toFore = spine === 'left' ? '90deg' : spine === 'bottom' ? '0deg' : '180deg';
    const band: React.CSSProperties = across
        ? { top: board, bottom: board, left: back, width: 1.5 }
        : { left: board, right: board, [spine]: back, height: 1.5 };
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: color }}>
            <div
                className="absolute"
                style={{
                    ...pages,
                    background: `
                        repeating-linear-gradient(${lines}, rgba(90,70,40,0.14) 0 0.5px, transparent 0.5px 1.6px),
                        linear-gradient(${toFore}, rgba(0,0,0,0.16), rgba(0,0,0,0) 30%, rgba(255,255,255,0.12))
                    `,
                    backgroundColor: paper,
                }}
            />
            {hard && (
                <div
                    className="absolute"
                    style={{ ...band, background: `repeating-linear-gradient(${lines}, #8a2a2a 0 0.8px, #efe7d6 0.8px 1.6px)`, opacity: 0.85 }}
                />
            )}
            {/* Dust jacket: a thin paper line on the outside of each board */}
            {hard && jacket && (
                across ? (
                    <>
                        <div className="absolute inset-x-0 top-0 h-[0.6px] bg-[#f1ebdf]/80" />
                        <div className="absolute inset-x-0 bottom-0 h-[0.6px] bg-[#f1ebdf]/80" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-y-0 left-0 w-[0.6px] bg-[#f1ebdf]/80" />
                        <div className="absolute inset-y-0 right-0 w-[0.6px] bg-[#f1ebdf]/80" />
                    </>
                )
            )}
            {shade > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: shade }} />}
        </div>
    );
}

/** The back cover's outside: the cover colour, turned from the light, with a hinge line by the spine */
function BackBoard({ binding, color, wear, hinge, src }: { binding: Binding; color: string; wear: number; hinge: 'left' | 'right'; src?: string }) {
    const r = binding === 'hardcover' ? 2 : 0.5 + wear * 1.5;
    const toHinge = hinge === 'right' ? '90deg' : '270deg';
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ backgroundColor: color, borderRadius: hinge === 'right' ? `${r}px 0 0 ${r}px` : `0 ${r}px ${r}px 0` }}
        >
            {src && <Image src={src} alt="" fill sizes="220px" className="object-cover" />}
            {/* Turned from the light: printed backs keep more of their colour than bare board */}
            <div className="absolute inset-0" style={{ background: src
                ? `linear-gradient(${toHinge}, rgba(0,0,0,0.18), rgba(0,0,0,0.22) 88%, rgba(0,0,0,0.4))`
                : `linear-gradient(${toHinge}, rgba(0,0,0,0.3), rgba(0,0,0,0.35) 88%, rgba(0,0,0,0.5))` }} />
            {binding === 'hardcover' && <div className="absolute inset-y-0 w-px bg-black/30" style={{ [hinge]: 6 }} />}
        </div>
    );
}

const PAPERS: Record<Binding, string[]> = {
    hardcover: ['#f4f1ea', '#f1ede3', '#eee8dc'],
    paperback: ['#ece2cc', '#e8dcc2', '#efe6d2'],
};

/**
 * Light that follows the turn. Light comes from the viewer's upper left, so a face
 * turned towards you brightens and a face turned away darkens. Driven by the same
 * hover state and spring as the book's own motion, so it moves with the book.
 */
const POV_GAIN = 1.8;
const TILT_RANGE = 150;
const PERSPECTIVE = 3000; // .perspective-3000
/** Shelf board: front edge height, and how deep it runs back (px) */
const SHELF_EDGE = (isMobile: boolean) => (isMobile ? 10 : 14);
const SHELF_DEPTH = (isMobile: boolean) => (isMobile ? 190 : 250);
const TURN_SPRING = { type: 'spring', stiffness: 120, damping: 18 } as const;
function TurnLight({ rest, turned, isTurned }: { rest: number; turned: number; isTurned: boolean }) {
    return (
        <m.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-black"
            initial={false}
            animate={{ opacity: isTurned ? turned : rest }}
            transition={TURN_SPRING}
        />
    );
}

// Mobile scaling, shared by the books and the leaning-row layout
const SCALE = (isMobile: boolean) => (isMobile ? 0.73 : 1);
const THICKNESS_SCALE = (isMobile: boolean) => (isMobile ? 0.8 : 1);

const BookItem = ({
    book,
    isMobile,
    placement,
    shades,
    shadedEdge = false,
    underside = false,
    onHoverChange,
    pinned = false,
    onTogglePin,
}: {
    book: Book;
    isMobile: boolean;
    /** Upright books in a leaning row: pivot x within the row, and lean in degrees */
    placement?: { left: number; lean: number };
    /** Contact shading on the spine, where neighbours touch it */
    shades?: EdgeShade[];
    /** Front-facing books: a book leans on its page edge */
    shadedEdge?: boolean;
    /** Lying books: draw the back cover, seen from below */
    underside?: boolean;
    /** Tells the shelf this book was lifted or put back, so neighbours' contact shadows follow */
    onHoverChange?: (hovered: boolean) => void;
    /** Clicked: stays lifted, with its tooltip, until clicked again or the click lands elsewhere */
    pinned?: boolean;
    onTogglePin?: () => void;
}) => {
    const [pointerOver, setPointerOver] = useState(false);
    // Lifted out while hovered or pinned
    const isHovered = pointerOver || pinned;
    const hoverChange = useRef(onHoverChange);
    useEffect(() => {
        hoverChange.current = onHoverChange;
    });
    useEffect(() => {
        hoverChange.current?.(isHovered);
    }, [isHovered]);

    // The tooltip is drawn in a portal: on phones the shelf row scrolls sideways, which
    // clips anything rising above it. It follows an anchor left where it used to sit,
    // every frame (page and row scroll), kept 8px inside the screen; the arrow stays put.
    const tipAnchorRef = useRef<HTMLDivElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (!isHovered) return;
        let frame = 0;
        const place = () => {
            const anchor = tipAnchorRef.current?.getBoundingClientRect();
            const tip = tipRef.current;
            if (anchor && tip) {
                const margin = 8;
                const w = tip.offsetWidth;
                const left = Math.max(margin, Math.min(anchor.left, window.innerWidth - margin - w));
                tip.style.left = `${left}px`;
                tip.style.top = `${anchor.top}px`;
                const shift = Math.max(-(w / 2 - 16), Math.min(anchor.left - left, w / 2 - 16));
                tip.style.setProperty('--tip-shift', `${shift}px`);
            }
            frame = requestAnimationFrame(place);
        };
        place();
        return () => cancelAnimationFrame(frame);
    }, [isHovered]);

    // Dynamic dimensions with fallbacks
    const desktopHeight = heightOf(book);
    const desktopWidth = widthOf(book);
    const desktopThickness = thicknessOf(book);

    // Scaling factors for mobile
    const scale = SCALE(isMobile);
    const thicknessScale = THICKNESS_SCALE(isMobile);

    const height = desktopHeight * scale;
    const width = desktopWidth * scale;
    const thickness = desktopThickness * thicknessScale;

    const binding: Binding = book.binding ?? 'paperback';
    const jacket = binding === 'hardcover' && book.jacket !== false;
    // How handled this copy is (creases, rubbed edges and corners), and its paper
    const wear = seededRandom(book.id, 500);
    const corner = seededRandom(book.id, 510);
    const paperOptions = PAPERS[binding];
    const paper = book.paper ?? paperOptions[Math.floor(seededRandom(book.id, 600) * paperOptions.length)];
    // Spines face the room and fade in the light; covers stay vivid. A little different per book.
    const sunFade = seededRandom(book.id, 400);
    const spineFilter = `saturate(${(0.88 - sunFade * 0.2).toFixed(2)}) sepia(${(0.04 + sunFade * 0.08).toFixed(2)}) brightness(${(1.02 + sunFade * 0.05).toFixed(2)})`;
    // Board edges are the cover colour
    const boardColor = book.color || '#333';

    // Stable random seed from book ID
    const seed = useMemo(() => {
        return book.id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    }, [book.id]);

    const randomFloat = (seedOffset: number) => {
        const x = Math.sin(seed + seedOffset) * 10000;
        return x - Math.floor(x);
    };

    const getRandomAngle = (min: number, max: number, seedOffset: number) => {
        return min + randomFloat(seedOffset) * (max - min);
    };

    // Compute initial rotation deterministically and memoize
    const initialRotation = useMemo(() => {
        if (book.orientation === 'front') {
            // Range: RotateY [-20, -10], RotateX [0, 5]
            const rY = getRandomAngle(-20, -10, 0);
            const rX = getRandomAngle(0, 5, 100);
            return { rotateY: rY, rotateX: rX, rotateZ: 0 };
        }
        if (book.orientation === 'horizontal') {
            // Horizontal books are rendered with swapped dimensions (width=height, height=thickness)
            // so the spine naturally fills the container. No 3D rotation needed at rest.
            // (Their resting tilt follows the viewpoint: see the TILT wrapper below.)
            return { rotateY: 0, rotateX: 0, rotateZ: 0 };
        }
        // Vertical books lean left; in a leaning row the angle comes from the row layout,
        // which makes each book rest against its neighbour
        if (placement) return { rotateY: 0, rotateX: 0, rotateZ: -placement.lean };
        const rZ = getRandomAngle(-3, -1, 200);
        return { rotateY: 0, rotateX: 0, rotateZ: rZ };
    }, [book.orientation, getRandomAngle, placement]); // getRandomAngle is stable due to seed

    // For vertical books, compute the actual horizontal space they occupy after tilt (bounding box width)
    const containerWidth = useMemo(() => {
        if (book.orientation === 'vertical') {
            const rad = (initialRotation.rotateZ * Math.PI) / 180;
            const cos = Math.abs(Math.cos(rad));
            const sin = Math.abs(Math.sin(rad));
            // Bounding box width = thickness * cos(|θ|) + height * sin(|θ|)
            return thickness * cos + height * sin;
        }
        if (book.orientation === 'horizontal') {
            // Width is the length of the book (height prop) because it's lying sideways
            return height;
        }
        // Front-facing books: width is just the cover width
        return width;
    }, [book.orientation, thickness, height, width, initialRotation]);

    const containerHeight = book.orientation === 'horizontal' ? thickness : height;

    const getContainerStyles = (): React.CSSProperties => {
        // In a leaning row the book is placed by the row at its pivot point
        if (placement) {
            return { position: 'absolute', left: `${placement.left}px`, bottom: 0, width: `${thickness}px`, height: `${height}px` };
        }
        return {
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
        };
    };

    const containerStyle = getContainerStyles();

    // Calculate dynamic margin for vertical books to prevent overlap when tilting left
    const tiltAngleRad = Math.abs(initialRotation.rotateZ) * (Math.PI / 180);
    const leanOffset = book.orientation === 'vertical' ? Math.sin(tiltAngleRad) * height : 0;

    // Tooltip offset: adjusted for scaled height, plus 44px for the Buy on Amazon row
    const tooltipTopOffset = book.orientation === 'front'
        ? 'top-[-164px]'
        : book.orientation === 'horizontal'
            ? (isMobile ? 'top-[-244px]' : 'top-[-344px]')
            : (isMobile ? 'top-[-140px]' : 'top-[-172px]');

    // Tooltip horizontal position
    const tooltipHorizontalPosition = book.orientation === 'front' ? '' : 'left-1/2';

    // For horizontal books: the 3D model is rendered portrait (like vertical),
    // then a wrapper rotates -90deg to lay it flat.
    const isHorizontal = book.orientation === 'horizontal';
    const isVerticalLike = book.orientation === 'vertical' || isHorizontal;

    // ---------- FIX FOR VERTICAL BOOKS ----------
    // Render vertical books with an absolutely positioned inner wrapper
    // that has the correct dimensions (thickness x height).
    const renderVerticalBook = () => (
        <div
            className="absolute preserve-3d"
            style={{
                width: thickness,
                height: height,
                left: 0,
                bottom: 0,
            }}
        >
            <m.div
                className="w-full h-full relative preserve-3d"
                initial={initialRotation}
                style={{
                    transformOrigin: '0% 100%', // bottom-left pivot
                }}
                animate={{
                    rotateY: isHovered ? -45 : 0,
                    rotateZ: isHovered ? 0 : initialRotation.rotateZ,
                    z: isHovered ? (isMobile ? 100 : 150) : 0,
                    x: isHovered ? (isMobile ? 15 : 20) : 0,
                    y: isHovered ? (isMobile ? -15 : -20) : 0,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
                {/* SPINE – now fills the wrapper correctly */}
                <div
                    className="absolute inset-0 backface-hidden"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: book.color || '#4a4a4a',
                        transform: 'translateZ(0px)',
                    }}
                >
                    {book.spineSrc ? (
                        <Image
                            src={book.spineSrc}
                            alt={`${book.title} spine`}
                            fill
                            style={{ filter: spineFilter }}
                            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-1 bg-black/20">
                            <span
                                className="text-[10px] font-bold text-white/90 uppercase tracking-wider"
                                style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                    textOrientation: 'mixed',
                                }}
                            >
                                {book.title}
                            </span>
                        </div>
                    )}
                    <SpineFinish binding={binding} jacket={jacket} wear={wear} seed={Math.abs(seed)} grounded={true} lifted={isHovered} shades={shades} />
                    <TurnLight rest={0} turned={0.22} isTurned={isHovered} />
                </div>

                {/* COVER */}
                <div
                    className="absolute shadow-2xl overflow-hidden pointer-events-none"
                    style={{
                        width: `${width}px`, // cover width (book depth)
                        height: '100%',
                        backgroundColor: book.color || '#333',
                        borderRadius: binding === 'hardcover' ? '0 2px 2px 0' : `0 ${(0.5 + wear * 1.5).toFixed(1)}px ${(0.5 + wear * 1.5).toFixed(1)}px 0`,
                        top: 0,
                        left: 0,
                        transformOrigin: 'left',
                        transform: `rotateY(90deg) translateZ(${thickness}px)`,
                        boxShadow: '0 15px 45px -15px rgba(0,0,0,0.6)',
                    }}
                >
                    <Image
                        src={book.coverSrc}
                        alt={`${book.title} cover`}
                        fill
                        className="object-cover"
                    />
                    <CoverFinish binding={binding} jacket={jacket} wear={wear} corner={corner} />
                    <TurnLight rest={0.28} turned={0.03} isTurned={isHovered} />
                </div>

                {/* HEAD: the top edge, seen when the shelf is below eye level */}
                <div
                    className="absolute backface-hidden pointer-events-none"
                    style={{
                        width: '100%',
                        height: `${width}px`,
                        top: -width,
                        left: 0,
                        transformOrigin: 'bottom',
                        transform: 'rotateX(90deg)',
                    }}
                >
                    <HeadFace binding={binding} color={boardColor} paper={paper} jacket={jacket} spine="bottom" />
                </div>

                {/* TAIL: the bottom edge (on the shelf it is hidden by the board; it shows
                    from below once the book is lifted) */}
                <div
                    className="absolute backface-hidden pointer-events-none"
                    style={{ width: '100%', height: `${width}px`, top: '100%', left: 0, transformOrigin: 'top', transform: 'rotateX(-90deg)' }}
                >
                    <HeadFace binding={binding} color={boardColor} paper={paper} jacket={jacket} spine="top" shade={0.15} />
                </div>

                {/* FORE-EDGE: the pages at the back, opposite the spine */}
                <div
                    className="absolute inset-0 backface-hidden pointer-events-none"
                    style={{ transform: `translateZ(${-width}px) rotateY(180deg)` }}
                >
                    <PageEdge binding={binding} color={boardColor} paper={paper} jacket={jacket} />
                </div>

                {/* BACK COVER: the left side */}
                <div
                    className="absolute backface-hidden pointer-events-none"
                    style={{ width: `${width}px`, height: '100%', top: 0, left: -width, transformOrigin: 'right', transform: 'rotateY(-90deg)' }}
                >
                    <BackBoard binding={binding} color={boardColor} wear={wear} hinge="right" src={book.backSrc} />
                </div>
            </m.div>
        </div>
    );

    return (
        <m.div
            data-pov={book.orientation}
            className="relative group perspective-3000 transition-all duration-300 overflow-visible flex-shrink-0"
            style={{
                ...containerStyle,
                // In a pile the paint order flips with the viewpoint (--pile-z, set on scroll)
                zIndex: isHovered ? 100 : 'var(--pile-z, 1)',
            }}
            data-book-id={book.id}
            onMouseEnter={() => { if (!isMobile) setPointerOver(true); }}
            onMouseLeave={() => { if (!isMobile) setPointerOver(false); }}
            // Click (or tap) pins it; the shelf lets go on a click elsewhere. Not from
            // the tooltip: using its button mustn't put the book back
            onTap={(e) => {
                if ((e.target as Element | null)?.closest?.('[data-book-tooltip]')) return;
                onTogglePin?.();
            }}
            initial={false}
        >
            {/* Render based on orientation */}
            {book.orientation === 'vertical' && renderVerticalBook()}

            {book.orientation === 'horizontal' && (
                <div
                    style={{
                        width: `${thickness}px`,
                        height: `${height}px`,
                        transform: 'rotate(-90deg) translateX(-100%)',
                        transformOrigin: '0 0',
                    }}
                    data-pov-inner
                    className="perspective-3000 preserve-3d"
                >
                    {/* TILT: a subtle tilt about the screen's x axis (the model is turned −90°,
                        so that is its own y axis) toward the eye: from above the cover shows,
                        from below the back cover, the same amount either way. --pov-s (−1…1,
                        set on scroll) says where the eye is; --lie is this book's tilt,
                        eased to 0 while the book is lifted so hover is unchanged. */}
                    <div
                        className="w-full h-full preserve-3d"
                        style={{
                            '--lie': isHovered ? 0 : horizontalTilt(book.id),
                            '--yaw': isHovered ? 0 : horizontalYaw(book.id),
                            // then a small turn about the screen's vertical axis (its own x axis):
                            // a pile is never square, and it shows the pages at one end
                            transform: 'rotateY(calc(var(--pov-s, 0) * var(--lie) * -1deg)) rotateX(calc(var(--yaw) * 1deg))',
                            transition: '--lie 450ms cubic-bezier(0.22, 1, 0.36, 1), --yaw 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                        } as React.CSSProperties}
                    >
                    <m.div
                        className="w-full h-full relative preserve-3d"
                        initial={initialRotation}
                        style={{
                            transformOrigin: 'center',
                        }}
                        animate={{
                            rotateY: isHovered ? 0 : 0,
                            rotateZ: isHovered ? 90 : 0,
                            rotateX: isHovered ? 60 : 0,
                            z: isHovered ? (isMobile ? 100 : 150) : 0,
                            x: isHovered ? (isMobile ? 15 : 60) : 0,
                            y: isHovered ? (isMobile ? 15 : 20) : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    >
                        {/* SPINE: stays square to the viewer while the book tilts (turned back by
                            the same amount); the tilt only shows in the sliver of cover above or
                            back cover below it */}
                        <div
                            className="absolute inset-0 backface-hidden"
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: book.color || '#4a4a4a',
                                transformOrigin: '0% 50%', // its bottom edge on screen, where it rests
                                transform: 'rotateY(calc(var(--pov-s, 0) * var(--lie, 0) * 1deg))',
                            }}
                        >
                            {book.spineSrc ? (
                                <Image
                                    src={book.spineSrc}
                                    alt={`${book.title} spine`}
                                    fill
                                    style={{ filter: spineFilter }}
                                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center p-1 bg-black/20">
                                    <span
                                        className="text-[10px] font-bold text-white/90 uppercase tracking-wider"
                                        style={{
                                            writingMode: 'vertical-rl',
                                            transform: 'rotate(180deg)',
                                            textOrientation: 'mixed',
                                        }}
                                    >
                                        {book.title}
                                    </span>
                                </div>
                            )}
                            <SpineFinish binding={binding} jacket={jacket} wear={wear} seed={Math.abs(seed)} grounded={false} shades={shades} />
                            <TurnLight rest={0} turned={0.2} isTurned={isHovered} />
                        </div>

                        {/* COVER: the top of the lying book. Its back must never show: seen from
                            below, the book is resting on the one beneath it (or on the shelf) */}
                        <div
                            className="absolute shadow-2xl overflow-hidden pointer-events-none backface-hidden"
                            style={{
                                width: `${width}px`,
                                height: '100%',
                                backgroundColor: book.color || '#333',
                                borderRadius: binding === 'hardcover' ? '0 2px 2px 0' : `0 ${(0.5 + wear * 1.5).toFixed(1)}px ${(0.5 + wear * 1.5).toFixed(1)}px 0`,
                                top: 0,
                                left: 0,
                                transformOrigin: 'left',
                                transform: `rotateY(90deg) translateZ(${thickness}px)`,
                                boxShadow: '0 15px 45px -15px rgba(0,0,0,0.6)',
                            }}
                        >
                            <Image
                                src={book.coverSrc}
                                alt={`${book.title} cover`}
                                fill
                                className="object-cover"
                            />
                            <CoverFinish binding={binding} jacket={jacket} wear={wear} corner={corner} />
                            <TurnLight rest={0.28} turned={0.05} isTurned={isHovered} />
                        </div>

                        {/* PAGES: the fore-edge at the back, and the head and tail at the two
                            ends, so the book is solid when it turns out on hover */}
                        <div
                            className="absolute inset-0 backface-hidden pointer-events-none"
                            style={{ transform: `translateZ(${-width}px) rotateY(180deg)` }}
                        >
                            <PageEdge binding={binding} color={boardColor} paper={paper} jacket={jacket} />
                        </div>
                        <div
                            className="absolute backface-hidden pointer-events-none"
                            style={{ width: '100%', height: `${width}px`, top: -width, left: 0, transformOrigin: 'bottom', transform: 'rotateX(90deg)' }}
                        >
                            <HeadFace binding={binding} color={boardColor} paper={paper} jacket={jacket} spine="bottom" />
                        </div>
                        <div
                            className="absolute backface-hidden pointer-events-none"
                            style={{ width: '100%', height: `${width}px`, top: '100%', left: 0, transformOrigin: 'top', transform: 'rotateX(-90deg)' }}
                        >
                            <HeadFace binding={binding} color={boardColor} paper={paper} jacket={jacket} spine="top" shade={0.12} />
                        </div>

                        {/* BACK COVER: the underside, seen from below (trimmed on scroll so it
                            never hangs past the pile; the bottom book's is hidden by the shelf) */}
                        {underside && (
                            <div
                                data-back-cover
                                className="absolute backface-hidden pointer-events-none overflow-hidden"
                                style={{
                                    width: `${width}px`,
                                    height: '100%',
                                    top: 0,
                                    left: -width,
                                    transformOrigin: 'right',
                                    transform: 'rotateY(-90deg)',
                                }}
                            >
                                <BackBoard binding={binding} color={boardColor} wear={wear} hinge="right" src={book.backSrc} />
                            </div>
                        )}
                    </m.div>
                    </div>
                </div>
            )}

            {book.orientation === 'front' && (
                <m.div
                    className="w-full h-full relative preserve-3d"
                    initial={initialRotation}
                    style={{
                        transformOrigin: 'center',
                    }}
                    animate={{
                        rotateY: isHovered ? 0 : initialRotation.rotateY,
                        rotateX: isHovered ? 0 : initialRotation.rotateX,
                        z: isHovered ? (isMobile ? 100 : 150) : 0,
                        y: isHovered ? (isMobile ? -15 : -20) : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                >
                    {/* SIDE DEPTH (spine edge) */}
                    <div
                        className="absolute inset-0 backface-hidden"
                        style={{
                            width: `${thickness}px`,
                            height: '100%',
                            backgroundColor: book.color || '#4a4a4a',
                            transformOrigin: 'left',
                            transform: 'rotateY(-90deg)',
                        }}
                    >
                        {book.spineSrc && (
                            <Image
                                src={book.spineSrc}
                                alt={`${book.title} spine`}
                                fill
                                style={{ filter: spineFilter }}
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                        <SpineFinish binding={binding} jacket={jacket} wear={wear} seed={Math.abs(seed)} grounded={false} />
                    </div>

                    {/* COVER */}
                    <div
                        className="absolute shadow-2xl overflow-hidden"
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: book.color || '#333',
                            borderRadius: binding === 'hardcover' ? '0 2px 2px 0' : `0 ${(0.5 + wear * 1.5).toFixed(1)}px ${(0.5 + wear * 1.5).toFixed(1)}px 0`,
                            top: 0,
                            left: 0,
                            transform: `translateZ(${thickness}px)`,
                            boxShadow: '0 15px 45px -15px rgba(0,0,0,0.6)',
                        }}
                    >
                        <Image
                            src={book.coverSrc}
                            alt={`${book.title} cover`}
                            fill
                            className="object-cover"
                        />
                        <CoverFinish binding={binding} jacket={jacket} wear={wear} corner={corner} />
                        <TurnLight rest={0.06} turned={0} isTurned={isHovered} />
                    </div>

                    {/* PAGES: the fore-edge, which the resting turn shows */}
                    <div
                        className="absolute backface-hidden"
                        style={{
                            width: `${thickness}px`,
                            height: '100%',
                            top: 0,
                            right: 0,
                            transformOrigin: 'right',
                            transform: 'rotateY(90deg)',
                        }}
                    >
                        <PageEdge binding={binding} color={boardColor} paper={paper} shaded={shadedEdge} jacket={jacket} />
                        <TurnLight rest={0} turned={0.3} isTurned={isHovered} />
                    </div>

                    {/* HEAD: the top edge, seen when the shelf is below eye level */}
                    <div
                        className="absolute backface-hidden pointer-events-none"
                        style={{
                            width: '100%',
                            height: `${thickness}px`,
                            top: 0,
                            left: 0,
                            transformOrigin: 'top',
                            transform: 'rotateX(90deg)',
                        }}
                    >
                        <HeadFace binding={binding} color={boardColor} paper={paper} jacket={jacket} spine="left" />
                    </div>

                    {/* TAIL: the bottom edge */}
                    <div
                        className="absolute backface-hidden pointer-events-none"
                        style={{ width: '100%', height: `${thickness}px`, top: `calc(100% - ${thickness}px)`, left: 0, transformOrigin: 'bottom', transform: 'rotateX(-90deg)' }}
                    >
                        <HeadFace binding={binding} color={boardColor} paper={paper} jacket={jacket} spine="left" shade={0.15} />
                    </div>

                    {/* BACK COVER: facing the wall */}
                    <div
                        className="absolute inset-0 backface-hidden pointer-events-none"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <BackBoard binding={binding} color={boardColor} wear={wear} hinge="right" src={book.backSrc} />
                    </div>
                </m.div>
            )}

            {/* Shadow beneath book */}
            <AnimatePresence>
                {isHovered && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.6, scale: 1.1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-0 left-0 right-0 h-4 bg-black/40 blur-xl rounded-full pointer-events-none"
                        style={{
                            transform: 'translateY(120%) rotateX(60deg)',
                            filter: 'blur(12px)',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Hover tooltip: where it sits, then the tooltip itself (in a portal, see tipRef) */}
            <div ref={tipAnchorRef} aria-hidden className={`pointer-events-none absolute ${tooltipHorizontalPosition} ${tooltipTopOffset} h-0 w-0`} />
            {typeof document !== 'undefined' && createPortal(
            <AnimatePresence mode="wait">
                {isHovered && (
                    <m.div
                        ref={tipRef}
                        key="tooltip"
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            y: -20,
                            scale: 1
                        }}
                        exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        className="fixed left-0 top-0 px-4 md:px-6 py-3 md:py-4 bg-black/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/20 z-[2000] whitespace-nowrap shadow-2xl flex flex-col items-center"
                        data-book-tooltip
                    >
                        {/* Keeps the hover while the pointer crosses the gap down to the book */}
                        <div aria-hidden className="absolute inset-x-0 top-full h-12" />
                        <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 mb-1 md:mb-1.5">
                            {book.category}
                        </span>
                        <p className="text-base md:text-lg font-bold text-white mb-0.5">{book.title}</p>
                        <p className="text-xs md:text-sm text-white/60">{book.author}</p>
                        <a
                            href={amazonLink(book)}
                            target="_blank"
                            // An affiliate link: marked sponsored for search engines
                            rel="sponsored noopener noreferrer"
                            className="mt-3 md:mt-4 rounded-full"
                        >
                            <Button variant="outline" size="sm" IconTrailing={ArrowUpRight} tabIndex={-1}>
                                Buy on Amazon
                            </Button>
                        </a>

                        {/* Arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-white/20 rotate-45 backdrop-blur-xl" style={{ marginLeft: 'var(--tip-shift, 0px)' }} />
                    </m.div>
                )}
            </AnimatePresence>,
            document.body
            )}
        </m.div>
    );
};

export default function BookShelf({ books: booksProp }: { books?: Book[] }) {
    const [isMobile, setIsMobile] = useState(false);

    // The book currently lifted out (hovered), so contact shadows only show between books that touch
    const [liftedId, setLiftedId] = useState<string | null>(null);
    const hoverFor = (id: string) => (hovered: boolean) =>
        setLiftedId((prev) => (hovered ? id : prev === id ? null : prev));

    // The clicked book: stays lifted until it's clicked again, or a click lands anywhere else
    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const pinFor = (id: string) => () => setPinnedId((prev) => (prev === id ? null : id));
    useEffect(() => {
        if (!pinnedId) return;
        const onDown = (e: PointerEvent) => {
            // The tooltip (in a portal, outside the book) keeps the pin: its button is used
            if ((e.target as Element | null)?.closest?.('[data-book-tooltip]')) return;
            const book = (e.target as Element | null)?.closest?.('[data-book-id]');
            if (book?.getAttribute('data-book-id') !== pinnedId) setPinnedId(null);
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPinnedId(null);
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [pinnedId]);
    /** Contact between two books holds only while neither is lifted out */
    const touching = (a: string, b?: string) => liftedId !== a && (!b || liftedId !== b);

    // Use passed books or default to empty array
    const booksData = booksProp || [];

    // Viewpoint follows scroll: the eye is at the middle of the screen, so a shelf
    // that has just come up from below is seen from above (tops of the books show),
    // level when centred, and from below as it leaves at the top. Each book's
    // perspective origin is moved to where the eye is, written straight to the
    // DOM on scroll (no re-render), and limited so the effect stays gentle.
    const rowRef = useRef<HTMLDivElement>(null);
    const shelfRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const row = rowRef.current;
        if (!row) return;
        const still = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        const update = () => {
            frame = 0;
            const vh = window.innerHeight;
            // Exaggerated a little (GAIN) so the change reads at a 3000px perspective
            const limit = window.innerWidth < 1024 ? 420 : 700;
            row.querySelectorAll<HTMLElement>('[data-pov]').forEach((el) => {
                const r = el.getBoundingClientRect();
                const w = el.offsetWidth;
                const h = el.offsetHeight;
                // Eye height relative to the book's centre, in px (negative = above)
                const dy = still.matches ? 0 : Math.max(-limit, Math.min(limit, POV_GAIN * (vh / 2 - (r.top + r.height / 2))));
                el.style.perspectiveOrigin = `${w / 2}px ${h / 2 + dy}px`;
                // Lying books are drawn portrait and turned −90°: in the wrapper's own
                // frame x points up the screen and y to the right
                const inner = el.querySelector<HTMLElement>('[data-pov-inner]');
                if (inner) {
                    inner.style.perspectiveOrigin = `${inner.offsetWidth / 2 - dy}px ${w / 2}px`;
                    // Which way lying books tilt: toward the eye, full by TILT_RANGE px off level
                    inner.style.setProperty('--pov-s', String(Math.max(-1, Math.min(1, -dy / TILT_RANGE))));
                }
            });
            // A pile seen from above: each book hides the one below's cover, so upper books
            // paint last. From below, each hides the back cover of the one above.
            row.querySelectorAll<HTMLElement>('[data-pile]').forEach((el) => {
                // Decided for the whole pile from its centre, for the tilt as well as the
                // order: if one book tipped its back cover toward the eye while the pile
                // still painted top-last, that back cover would cover the books below it
                const r = (el.parentElement ?? el).getBoundingClientRect();
                const dy = still.matches ? 0 : POV_GAIN * (vh / 2 - (r.top + r.height / 2));
                const i = Number(el.dataset.pile);
                const n = Number(el.dataset.pileN);
                el.style.setProperty('--pile-z', String(dy < 0 ? i + 1 : n - i));
                el.querySelector<HTMLElement>('[data-pov-inner]')?.style.setProperty('--pov-s', String(Math.max(-1, Math.min(1, -dy / TILT_RANGE))));

                // Back cover, seen from below: it reaches back over the book beneath, so in
                // perspective it hangs down toward the eye. The books below hide it, but only
                // as far down as the pile goes: past the pile's bottom it would show through
                // the shelf. Keep only the depth whose drop stays within the pile.
                const back = el.querySelector<HTMLElement>('[data-back-cover]');
                const book = el.querySelector<HTMLElement>('[data-pov]');
                if (back && book) {
                    const bookBottom = book.getBoundingClientRect().bottom;
                    const below = Math.max(0, r.bottom - bookBottom - 1); // pile height under this book
                    // Measured drop of the whole underside (the box ignores the clip)
                    const drop = back.getBoundingClientRect().bottom - bookBottom;
                    const depth = back.offsetWidth;
                    let keep = depth;
                    if (drop > below && drop > 0) {
                        // Drop at depth d goes as d/(P+d): find the d that drops exactly `below`
                        const q = (below / drop) * (depth / (PERSPECTIVE + depth));
                        keep = (q * PERSPECTIVE) / (1 - q);
                    }
                    back.style.clipPath = `inset(0 0 0 ${Math.max(0, depth - keep)}px)`;
                }
            });

            // The shelf board: a surface D deep shows dy·D/(P+D) of itself on screen,
            // its top from above and its underside from below
            const shelf = shelfRef.current;
            if (shelf) {
                const top = shelf.getBoundingClientRect().top;
                const dy = still.matches ? 0 : Math.max(-limit, Math.min(limit, POV_GAIN * (vh / 2 - top)));
                const depth = SHELF_DEPTH(window.innerWidth < 1024);
                const seen = (Math.abs(dy) * depth) / (PERSPECTIVE + depth);
                const topFace = shelf.querySelector<HTMLElement>('[data-shelf-top]');
                const under = shelf.querySelector<HTMLElement>('[data-shelf-under]');
                if (topFace) topFace.style.height = `${dy < 0 ? seen : 0}px`;
                if (under) under.style.height = `${dy > 0 ? seen : 0}px`;
            }
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        still.addEventListener('change', schedule);
        // The lying books' tilt eases when it flips or after a hover: measure again once settled
        row.addEventListener('transitionend', schedule);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            still.removeEventListener('change', schedule);
            row.removeEventListener('transitionend', schedule);
        };
    }, [isMobile, booksProp]);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // Tablet and below
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Group books: horizontal ones into stacks, consecutive upright ones into a leaning row
    const groupedBooks = useMemo(() => {
        const result: (Book | Book[] | { lean: Book[] })[] = [];
        let currentStack: Book[] = [];
        let currentRow: Book[] = [];

        const flush = () => {
            if (currentStack.length > 0) result.push([...currentStack]);
            if (currentRow.length > 0) result.push({ lean: [...currentRow] });
            currentStack = [];
            currentRow = [];
        };

        booksData.forEach((book) => {
            if (book.orientation === 'horizontal') {
                if (currentRow.length > 0) flush();
                currentStack.push(book);
                if (currentStack.length >= 6) { // Max stack size
                    result.push([...currentStack]);
                    currentStack = [];
                }
            } else if (book.orientation === 'vertical') {
                if (currentStack.length > 0) flush();
                currentRow.push(book);
            } else {
                flush();
                result.push(book);
            }
        });
        flush();
        return result;
    }, [booksData]);

    // Height of the item to the left of a leaning row: the wall its first book leans on
    const itemHeight = (item: Book | Book[] | { lean: Book[] }): number => {
        if (Array.isArray(item)) return item.reduce((sum, b) => sum + thicknessOf(b) * THICKNESS_SCALE(isMobile), 0);
        if ('lean' in item) return Math.max(...item.lean.map((b) => heightOf(b) * SCALE(isMobile)));
        return heightOf(item) * SCALE(isMobile);
    };

    return (
        <section className="w-full overflow-visible flex flex-col items-center mb-10 md:mb-20">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-6xl w-full px-2 md:px-0"
            >
                {/* <div className="space-y-4 md:space-y-2 text-center md:text-left mb-4 md:mb-6">
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
                </div> */}

                {/* The Shelf */}
                <div className="relative flex flex-col items-start pt-0 md:pt-0">
                    {/* Back wall */}
                    <div className="absolute inset-x-0 bottom-0 z-[-1] overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a1aff 0%, transparent 70%)' }} />
                    </div>

                    {/* Books Container */}
                    {/* <div className="flex flex-wrap items-end justify-center md:justify-start gap-0 min-h-[300px] md:min-h-[400px] z-10 overflow-visible w-full">
                        {groupedBooks.map((item, index) => {
                            if (Array.isArray(item)) {
                                // Render stack
                                return (
                                    <div key={`stack-${index}`} className="flex flex-col-reverse items-center justify-end">
                                        {item.map((book) => (
                                            <BookItem key={book.id} book={book} isMobile={isMobile} />
                                        ))}
                                    </div>
                                );
                            }
                            // Render single book
                            return <BookItem key={item.id} book={item} isMobile={isMobile} />;
                        })}
                    </div> */}

                    <div ref={rowRef} className="flex flex-nowrap md:flex-wrap items-end justify-start gap-0 min-h-[300px] md:min-h-[400px] overflow-x-auto overflow-y-visible md:overflow-visible w-full">
                        {/* No z-index here on purpose: books then layer with the shelf directly,
                            resting books (z 1–3) behind its edge, a lifted one (z 100) in front */}
                        {groupedBooks.map((item, index) => {
                                if (!Array.isArray(item) && 'lean' in item) {
                                    // Upright books resting on each other: placed by the contact layout
                                    const prev = groupedBooks[index - 1];
                                    const wall = prev ? itemHeight(prev) : Infinity;
                                    const dims = item.lean.map((b) => ({
                                        thickness: thicknessOf(b) * THICKNESS_SCALE(isMobile),
                                        height: heightOf(b) * SCALE(isMobile),
                                        lean: leanFor(b.id),
                                    }));
                                    const { placements, width } = layoutLeaningRow(dims, wall);
                                    // Lean on the front book's visible edge, which sits inside its box
                                    const inset = prev && !Array.isArray(prev) && !('lean' in prev) && prev.orientation === 'front'
                                        ? frontInset(prev, isMobile)
                                        : 0;
                                    return (
                                        <div
                                            key={`lean-${index}`}
                                            className="relative flex-shrink-0 overflow-visible"
                                            style={{ width, marginLeft: -inset, height: Math.max(...dims.map((d) => d.height)) }}
                                        >
                                            {item.lean.map((book, bi) => (
                                                <BookItem
                                                    key={book.id}
                                                    book={book}
                                                    isMobile={isMobile}
                                                    placement={placements[bi]}
                                                    onHoverChange={hoverFor(book.id)}
                                                    pinned={pinnedId === book.id}
                                                    onTogglePin={pinFor(book.id)}
                                                    shades={[
                                                        // It leans left: its top-left touches what's before it
                                                        {
                                                            side: 'left', from: 0, to: 0.75, fade: 'down',
                                                            on: touching(book.id, bi > 0 ? item.lean[bi - 1].id : prev && !Array.isArray(prev) && !('lean' in prev) ? prev.id : undefined),
                                                        },
                                                        // and the next book leans on its top-right
                                                        ...(bi < item.lean.length - 1
                                                            ? [{ side: 'right' as const, from: 0, to: 0.6, fade: 'down' as const, on: touching(book.id, item.lean[bi + 1].id) }]
                                                            : []),
                                                    ]}
                                                />
                                            ))}
                                        </div>
                                    );
                                }
                                if (Array.isArray(item)) {
                                    // A pile, not a centred column: each book set down a little off the
                                    // one below, kept where the books above can't tip it (first item is the bottom)
                                    const pile = layoutPile(item.map((b) => ({
                                        length: heightOf(b) * SCALE(isMobile),
                                        thickness: thicknessOf(b) * THICKNESS_SCALE(isMobile),
                                        random: seededRandom(b.id, 300),
                                    })));
                                    return (
                                        <div
                                            key={`stack-${index}`}
                                            className="flex flex-col-reverse items-start justify-end flex-shrink-0"
                                            style={{ width: pile.width }}
                                        >
                                            {item.map((book, bi) => {
                                                // Overlap with a neighbour in the pile, as 0–1 along this book (left to right)
                                                const lengths = item.map((b) => heightOf(b) * SCALE(isMobile));
                                                const span = (other: number): [number, number] => {
                                                    const a = Math.max(pile.left[bi], pile.left[other]);
                                                    const b = Math.min(pile.left[bi] + lengths[bi], pile.left[other] + lengths[other]);
                                                    return [(a - pile.left[bi]) / lengths[bi], (b - pile.left[bi]) / lengths[bi]];
                                                };
                                                // The spine is drawn portrait and turned −90°: its right edge is the top
                                                // on screen, its left edge the bottom, and its length runs left to right.
                                                const shades: EdgeShade[] = [];
                                                if (bi < item.length - 1) {
                                                    const [from, to] = span(bi + 1);
                                                    shades.push({ side: 'right', from, to, on: touching(book.id, item[bi + 1].id) });
                                                }
                                                const [from, to] = bi > 0 ? span(bi - 1) : [0, 1];
                                                shades.push({ side: 'left', from, to, on: touching(book.id, bi > 0 ? item[bi - 1].id : undefined) });
                                                return (
                                                    <div key={book.id} data-pile={bi} data-pile-n={item.length} style={{ marginLeft: pile.left[bi] }}>
                                                        <BookItem book={book} isMobile={isMobile} shades={shades} underside onHoverChange={hoverFor(book.id)} pinned={pinnedId === book.id} onTogglePin={pinFor(book.id)} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                {
                                    const next = groupedBooks[index + 1];
                                    const leanedOn = !!next && !Array.isArray(next) && 'lean' in next && touching(item.id, next.lean[0].id);
                                    return (
                                        <BookItem
                                            key={item.id}
                                            book={item}
                                            isMobile={isMobile}
                                            shadedEdge={leanedOn}
                                            onHoverChange={hoverFor(item.id)}
                                            pinned={pinnedId === item.id}
                                            onTogglePin={pinFor(item.id)}
                                        />
                                    );
                                }
                        })}
                    </div>

                    {/* The shelf: a solid board the books stand on. It follows the same scroll
                        viewpoint as the books: from above its top surface shows behind them, from
                        below its underside, which also hides any book depth hanging past the
                        shelf line. Heights are set on scroll (see the viewpoint effect). */}
                    <div ref={shelfRef} className="relative w-full h-12 md:h-20 pointer-events-none">
                        {/* Top surface: behind the books */}
                        <div
                            data-shelf-top
                            className="absolute inset-x-0 bottom-full z-0"
                            style={{
                                height: 0,
                                background: 'linear-gradient(0deg, #e4e4e4, #b9b9b9 70%, #9d9d9d)',
                            }}
                        />
                        {/* Front edge and underside: in front of the books */}
                        <div className="absolute inset-x-0 top-0 z-20">
                            <div
                                style={{
                                    height: SHELF_EDGE(isMobile),
                                    background: 'linear-gradient(180deg, #ffffff 0, #f1f1f1 1.5px, #dcdcdc 60%, #c4c4c4)',
                                    boxShadow: '0 1px 0 rgba(0,0,0,0.35)',
                                }}
                            />
                            <div
                                data-shelf-under
                                style={{
                                    height: 0,
                                    background: 'linear-gradient(180deg, #555, #2e2e2e 55%, #1c1c1c)',
                                }}
                            />
                        </div>
                        {/* Soft glow and shadow under the shelf */}
                        <div className="absolute inset-x-0 top-0 h-6 -z-10" style={{ boxShadow: '0 18px 30px -12px rgba(255,255,255,0.55)' }} />
                        <div className="absolute -bottom-6 left-0 right-0 h-10 md:h-12 bg-black/40 blur-2xl rounded-full" />
                    </div>
                </div>
            </m.div>

            <style jsx global>{`
                .perspective-3000 {
                    -webkit-perspective: 3000px;
                    -moz-perspective: 3000px;
                    perspective: 3000px;
                }
                .preserve-3d {
                    -webkit-transform-style: preserve-3d;
                    -moz-transform-style: preserve-3d;
                    transform-style: preserve-3d;
                }
                @property --lie {
                    syntax: '<number>';
                    inherits: true;
                    initial-value: 0;
                }
                @property --yaw {
                    syntax: '<number>';
                    inherits: true;
                    initial-value: 0;
                }
                .backface-hidden {
                    -webkit-backface-visibility: hidden;
                    -moz-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
            `}</style>
        </section>
    );
}