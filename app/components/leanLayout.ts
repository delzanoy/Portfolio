/* ----------------------------------------
   Leaning books: contact layout
   Upright books in a row each tip their top a little to the left, pivoting
   on their bottom-left corner. To look real, every book must rest on what
   is to its left: its side or top edge touching the previous book, or the
   wall made by the item before the row.

   Each book is a rectangle (thickness t, height h) rotated by θ about its
   bottom-left corner. We place books left to right, sliding each one left
   until it first touches anything already placed. For convex shapes the
   first contact happens at a corner, so it is enough to compare the
   left edge of the new book with the right edge of everything placed, at
   the heights of all their corners.

   Coordinates: x to the right, y up from the shelf, x = 0 at the wall.
---------------------------------------- */

type Pt = { x: number; y: number };

/** Corners of a book leaning left by `deg`, pivoting on (px, 0) */
function corners(px: number, t: number, h: number, deg: number): Pt[] {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // Rotate counter-clockwise (top goes left) about the pivot
    const rot = (x: number, y: number) => ({ x: px + x * c - y * s, y: x * s + y * c });
    return [rot(0, 0), rot(t, 0), rot(t, h), rot(0, h)];
}

/** Where a horizontal line at height y crosses a convex polygon: [minX, maxX] */
function spanAt(poly: Pt[], y: number): [number, number] | null {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i];
        const q = poly[(i + 1) % poly.length];
        if ((y < Math.min(p.y, q.y)) || (y > Math.max(p.y, q.y))) continue;
        const x = p.y === q.y ? Math.min(p.x, q.x) : p.x + ((y - p.y) / (q.y - p.y)) * (q.x - p.x);
        const x2 = p.y === q.y ? Math.max(p.x, q.x) : x;
        lo = Math.min(lo, x);
        hi = Math.max(hi, x2);
    }
    return lo === Infinity ? null : [lo, hi];
}

export interface LeanInput {
    thickness: number;
    height: number;
    /** Desired lean to the left, degrees (0 = upright) */
    lean: number;
}

export interface LeanPlacement {
    /** x of the pivot (bottom-left corner) from the row's left edge */
    left: number;
    lean: number;
}

/**
 * Place books left to right so each rests against what is on its left.
 * `wallHeight` is the height of the item before the row (Infinity for none).
 * Returns each book's pivot x, and the row's width (to its rightmost point).
 */
export function layoutLeaningRow(books: LeanInput[], wallHeight: number): { placements: LeanPlacement[]; width: number } {
    // The wall: a block filling x ≤ 0 up to wallHeight
    const wallTop = Number.isFinite(wallHeight) ? wallHeight : 1e6;
    const placed: Pt[][] = [[{ x: -1e6, y: 0 }, { x: 0, y: 0 }, { x: 0, y: wallTop }, { x: -1e6, y: wallTop }]];
    const placements: LeanPlacement[] = [];

    for (const b of books) {
        const probe = corners(0, b.thickness, b.height, b.lean);
        let px = -Infinity;

        for (const other of placed) {
            // Heights where both shapes exist: every corner height of either
            const ys = [...probe, ...other].map((p) => p.y);
            for (const y of ys) {
                const mine = spanAt(probe, y);
                const theirs = spanAt(other, y);
                if (!mine || !theirs) continue;
                // Our left edge must sit at or right of their right edge
                px = Math.max(px, theirs[1] - mine[0]);
            }
        }
        // Nothing to touch (can't happen with a wall, but stay safe)
        if (!Number.isFinite(px)) px = 0;

        placements.push({ left: px, lean: b.lean });
        placed.push(corners(px, b.thickness, b.height, b.lean));
    }

    const width = Math.max(0, ...placed.slice(1).flat().map((p) => p.x));
    return { placements, width };
}

/* ----------------------------------------
   Stacked books: a believable pile
   A real pile is never centre-aligned: each book is set down a little off
   the one below. It still has to stand up, so for every book the combined
   centre of mass of everything above it must sit over that book (with a
   margin, so nothing looks about to topple).

   Books are listed bottom first. Offsets are horizontal positions of each
   book's centre, in px, relative to the bottom book's centre.
---------------------------------------- */
export interface PileInput {
    /** Length along the shelf (px) */
    length: number;
    /** Thickness (px); with length, a stand-in for weight */
    thickness: number;
    /** Stable random number in [0, 1) for this book */
    random: number;
}

const PILE_JITTER = 0.14; // up to 14% of the book below's length either way
const PILE_MARGIN = 0.2; // centre of mass must stay within the middle 60% of the support

export function layoutPile(books: PileInput[]): { centers: number[]; left: number[]; width: number } {
    const jitter = books.map((b, i) => (i === 0 ? 0 : (b.random * 2 - 1) * PILE_JITTER * books[i - 1].length));

    const place = () => {
        const c = [0];
        for (let i = 1; i < books.length; i++) c.push(c[i - 1] + jitter[i]);
        return c;
    };

    // Settle: wherever the books above would tip a support, halve the offending offset
    let centers = place();
    for (let pass = 0; pass < 20; pass++) {
        let stable = true;
        for (let j = 0; j < books.length - 1; j++) {
            let mass = 0;
            let moment = 0;
            for (let k = j + 1; k < books.length; k++) {
                const w = books[k].length * books[k].thickness;
                mass += w;
                moment += w * centers[k];
            }
            const com = moment / mass;
            const reach = (books[j].length / 2) * (1 - PILE_MARGIN * 2);
            if (Math.abs(com - centers[j]) > reach) {
                jitter[j + 1] /= 2;
                stable = false;
            }
        }
        centers = place();
        if (stable) break;
    }

    const lefts = centers.map((c, i) => c - books[i].length / 2);
    const minX = Math.min(...lefts);
    const maxX = Math.max(...centers.map((c, i) => c + books[i].length / 2));
    return { centers, left: lefts.map((l) => l - minX), width: maxX - minX };
}
