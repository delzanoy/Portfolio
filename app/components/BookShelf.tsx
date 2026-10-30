'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface Book {
    id: string;
    title: string;
    author: string;
    coverSrc: string;
    spineSrc: string;
    orientation: 'vertical' | 'front' | 'horizontal';
    category?: string;
    color?: string;        // fallback spine color
    thickness?: number;     // spine width (in px)
    width?: number;         // book width (in px)
    height?: number;        // book height (in px)
}

const BookItem = ({ book, isMobile }: { book: Book; isMobile: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Dynamic dimensions with fallbacks
    const desktopHeight = book.height || 300;
    const desktopWidth = book.width || 210;
    const desktopThickness = book.thickness || 25;

    // Scaling factors for mobile
    const scale = isMobile ? 0.73 : 1;
    const thicknessScale = isMobile ? 0.8 : 1;

    const height = desktopHeight * scale;
    const width = desktopWidth * scale;
    const thickness = desktopThickness * thicknessScale;

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
            return { rotateY: 0, rotateX: 0, rotateZ: 0 };
        }
        // Vertical books: slight random tilt (rotateZ)
        // Range: [-3, -1] degrees (always leaning left to avoid overlap conflicts)
        const rZ = getRandomAngle(-3, -1, 200);
        return { rotateY: 0, rotateX: 0, rotateZ: rZ };
    }, [book.orientation, getRandomAngle]); // getRandomAngle is stable due to seed

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

    const getContainerStyles = () => {
        return {
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
        };
    };

    const containerStyle = getContainerStyles();

    // Calculate dynamic margin for vertical books to prevent overlap when tilting left
    const tiltAngleRad = Math.abs(initialRotation.rotateZ) * (Math.PI / 180);
    const leanOffset = book.orientation === 'vertical' ? Math.sin(tiltAngleRad) * height : 0;

    // Tooltip offset: adjusted for scaled height
    const tooltipTopOffset = book.orientation === 'front'
        ? (isMobile ? 'top-[-120px]' : 'top-[-120px]')
        : book.orientation === 'horizontal'
            ? (isMobile ? 'top-[-440px]' : 'top-[-300px]')
            : (isMobile ? '-top-24' : '-top-32');

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
                        boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.4), inset 3px 0 4px rgba(255,255,255,0.1)',
                    }}
                >
                    {book.spineSrc ? (
                        <Image
                            src={book.spineSrc}
                            alt={`${book.title} spine`}
                            fill
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
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10 pointer-events-none" />
                </div>

                {/* COVER */}
                <div
                    className="absolute shadow-2xl overflow-hidden pointer-events-none"
                    style={{
                        width: `${width}px`, // cover width (book depth)
                        height: '100%',
                        backgroundColor: book.color || '#333',
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
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-white/10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent pointer-events-none" />
                </div>
            </m.div>
        </div>
    );

    return (
        <m.div
            className="relative group perspective-3000 transition-all duration-300 overflow-visible flex-shrink-0"
            style={{
                ...containerStyle,
                zIndex: isHovered ? 100 : 1,
            }}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            onTap={() => isMobile && setIsHovered(!isHovered)}
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
                    className="perspective-3000 preserve-3d"
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
                        {/* SPINE */}
                        <div
                            className="absolute inset-0 backface-hidden"
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: book.color || '#4a4a4a',
                                transform: 'translateZ(0px)',
                                boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.4), inset 3px 0 4px rgba(255,255,255,0.1)',
                            }}
                        >
                            {book.spineSrc ? (
                                <Image
                                    src={book.spineSrc}
                                    alt={`${book.title} spine`}
                                    fill
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
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10 pointer-events-none" />
                        </div>

                        {/* COVER */}
                        <div
                            className="absolute shadow-2xl overflow-hidden pointer-events-none"
                            style={{
                                width: `${width}px`,
                                height: '100%',
                                backgroundColor: book.color || '#333',
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
                            <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-white/10" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent pointer-events-none" />
                        </div>
                    </m.div>
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
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10 pointer-events-none" />
                    </div>

                    {/* COVER */}
                    <div
                        className="absolute shadow-2xl overflow-hidden"
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: book.color || '#333',
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
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-white/10" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent pointer-events-none" />
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

            {/* Hover tooltip */}
            <AnimatePresence mode="wait">
                {isHovered && (
                    <m.div
                        key="tooltip"
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            y: -20,
                            scale: 1
                        }}
                        exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        className={`absolute ${tooltipHorizontalPosition} ${tooltipTopOffset} px-4 md:px-6 py-3 md:py-4 bg-black/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/20 z-[2000] whitespace-nowrap pointer-events-none shadow-2xl flex flex-col items-center`}
                        style={{ transform: 'translateX(-50%)' }}
                    >
                        <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 mb-1 md:mb-1.5">
                            {book.category}
                        </span>
                        <p className="text-base md:text-lg font-bold text-white mb-0.5">{book.title}</p>
                        <p className="text-xs md:text-sm text-white/60">{book.author}</p>

                        {/* Arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-white/20 rotate-45 backdrop-blur-xl" />
                    </m.div>
                )}
            </AnimatePresence>
        </m.div>
    );
};

export default function BookShelf({ books: booksProp }: { books?: Book[] }) {
    const [isMobile, setIsMobile] = useState(false);

    // Use passed books or default to empty array
    const booksData = booksProp || [];

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // Tablet and below
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper to group books for horizontal stacking
    const groupedBooks = useMemo(() => {
        const result: (Book | Book[])[] = [];
        let currentStack: Book[] = [];

        booksData.forEach((book) => {
            if (book.orientation === 'horizontal') {
                currentStack.push(book);
                if (currentStack.length >= 6) { // Max stack size
                    result.push([...currentStack]);
                    currentStack = [];
                }
            } else {
                if (currentStack.length > 0) {
                    result.push([...currentStack]);
                    currentStack = [];
                }
                result.push(book);
            }
        });
        if (currentStack.length > 0) {
            result.push([...currentStack]);
        }
        return result;
    }, [booksData]);

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

                    <div className="flex flex-nowrap md:flex-wrap items-end justify-start gap-0 min-h-[300px] md:min-h-[400px] z-10 overflow-x-auto overflow-y-visible md:overflow-visible w-full">
                        {groupedBooks.map((item, index) => {
                            if (Array.isArray(item)) {
                                return (
                                    <div key={`stack-${index}`} className="flex flex-col-reverse items-center justify-end flex-shrink-0">
                                        {item.map((book) => (
                                            <BookItem key={book.id} book={book} isMobile={isMobile} />
                                        ))}
                                    </div>
                                );
                            }
                            return <BookItem key={item.id} book={item} isMobile={isMobile} />;
                        })}
                    </div>

                    {/* Realistic shelf base - solid slab with front edge */}
                    <div className="w-full h-12 md:h-20 relative z-0 overflow-visible">
                        {/* Top surface (horizontal) */}
                        <div
                            className="absolute inset-x-0 h-8 md:h-12 bg-white-100 shadow-2xl"
                            style={{
                                transform: 'perspective(1500px) rotateX(85deg) translateZ(0px)',
                                transformOrigin: 'top',
                                backgroundImage: `
                                    linear-gradient(90deg, #1e1e1e 0%, #2c2c2c 50%, #858585ff 100%),
                                    repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 8px)
                                `,
                                backgroundBlendMode: 'overlay',
                                boxShadow: 'inset 0 100px 0 rgba(255, 255, 255, 0.9), 0 20px 30px -10px white',
                            }}
                        />
                        {/* Subtle shadow beneath shelf */}
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
                .backface-hidden {
                    -webkit-backface-visibility: hidden;
                    -moz-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
            `}</style>
        </section>
    );
}