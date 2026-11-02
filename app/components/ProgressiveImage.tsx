'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image, { type ImageProps } from 'next/image';

/* ----------------------------------------
   Progressive image
   Shows the lightweight `name.sm.webp` preview first, then fades in the
   full-resolution file once the page has loaded and the image is on screen.
   Must be rendered inside a positioned parent (it uses `fill`).
---------------------------------------- */
type ProgressiveImageProps = Omit<ImageProps, 'src' | 'fill'> & { src: string };

const previewSrc = (src: string) => src.replace(/\.webp$/, '.sm.webp');

function whenPageIdle(cb: () => void) {
    const run = () => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(cb, { timeout: 2000 });
        else setTimeout(cb, 200);
    };
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
}

export default function ProgressiveImage({ src, alt, priority, ...rest }: ProgressiveImageProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const preview = previewSrc(src);
    // Fall back to the full file if there is no preview for this image
    const [usePreview, setUsePreview] = useState(preview !== src);
    const [crispReady, setCrispReady] = useState(false);

    useEffect(() => {
        if (!usePreview || !wrapperRef.current) return;
        // Respect data-saver: keep the preview only
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (connection?.saveData) return;

        let cancelled = false;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            whenPageIdle(() => {
                const img = new window.Image();
                img.src = src;
                img.decode()
                    .then(() => { if (!cancelled) setCrispReady(true); })
                    .catch(() => { });
            });
        }, { rootMargin: '200px' });

        observer.observe(wrapperRef.current);
        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [src, usePreview]);

    return (
        <div ref={wrapperRef} style={{ position: 'absolute', inset: 0 }}>
            <Image
                {...rest}
                src={usePreview ? preview : src}
                alt={alt}
                fill
                priority={priority}
                onError={() => setUsePreview(false)}
            />
            {usePreview && crispReady && (
                <Image
                    {...rest}
                    src={src}
                    alt=""
                    aria-hidden
                    fill
                    style={{ ...rest.style, animation: 'progressive-fade-in 300ms ease-out' }}
                />
            )}
        </div>
    );
}
