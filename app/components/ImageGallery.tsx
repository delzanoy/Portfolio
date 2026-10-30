import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { m, LayoutGroup, AnimatePresence } from 'framer-motion';

interface ImageItem {
    id: string;
    src: string;
    alt: string;
}

interface ImageGalleryProps {
    images: ImageItem[];
    className?: string;
}

export default function ImageGallery({
    images,
    className = ""
}: ImageGalleryProps) {
    const [mainImage, setMainImage] = useState<ImageItem>(images[0]);
    const [thumbnailImages, setThumbnailImages] = useState<ImageItem[]>(images.slice(1));
    const [zoomedImage, setZoomedImage] = useState<ImageItem | null>(null);

    useEffect(() => {
        setMainImage(images[0]);
        setThumbnailImages(images.slice(1));
    }, [images]);

    // Keyboard ESC to close zoom
    useEffect(() => {
        if (!zoomedImage) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setZoomedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedImage]);

    const handleThumbnailClick = (clickedImage: ImageItem, clickedIndex: number) => {
        if (mainImage.id === clickedImage.id) return;

        const oldMainImage = mainImage;
        const newThumbnails = [...thumbnailImages];
        newThumbnails[clickedIndex] = oldMainImage;

        setMainImage(clickedImage);
        setThumbnailImages(newThumbnails);
    };

    return (
        // id ensures this group doesn't interfere with other galleries on the page
        <LayoutGroup id="gallery">
            <div className={`space-y-1 w-full ${className}`}>

                {/* Main Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/10 bg-neutral-900">
                    <m.div
                        key={mainImage.id}
                        layoutId={mainImage.id} // Shared layout ID for seamless zoom
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        }}
                        onClick={() => setZoomedImage(mainImage)}
                        className="absolute inset-0 z-10 cursor-zoom-in group"
                    >
                        <Image
                            src={mainImage.src}
                            alt={mainImage.alt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, 800px"
                            priority
                        />
                    </m.div>
                </div>

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-4 gap-1">
                    {thumbnailImages.map((img, index) => (
                        <m.button
                            key={img.id}
                            layoutId={img.id}
                            onClick={() => handleThumbnailClick(img, index)}
                            className="relative aspect-square w-full overflow-hidden border border-white/10 hover:border-white/40 bg-neutral-800 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 25vw, 150px"
                            />
                        </m.button>
                    ))}
                </div>
            </div>

            {/* Global Zoom Overlay */}
            <AnimatePresence>
                {zoomedImage && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomedImage(null)}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-xl cursor-zoom-out"
                    >
                        <m.div
                            layoutId={zoomedImage.id}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 30
                            }}
                            className="relative w-[min(90vw,calc(90vh*1.6))] aspect-[16/10] overflow-hidden rounded-2xl border border-white/15 shadow-2xl"
                        >
                            <Image
                                src={zoomedImage.src}
                                alt={zoomedImage.alt}
                                fill
                                className="object-cover"
                                sizes="90vw"
                                priority
                            />
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>
        </LayoutGroup>
    );
}