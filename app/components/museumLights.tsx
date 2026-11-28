'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useInView } from 'framer-motion';

/* ----------------------------------------
   Museum lights
   MuseumBackground (in the layout) lights up near the bottom of the page.
   Anything can also switch it on: wrap a section in <LightsWhileInView>
   and the lights come on while that section is on screen.
---------------------------------------- */
let on = false;
const subscribers = new Set<() => void>();

export function setMuseumLights(next: boolean) {
    if (on === next) return;
    on = next;
    subscribers.forEach((notify) => notify());
}

const subscribe = (notify: () => void) => {
    subscribers.add(notify);
    return () => {
        subscribers.delete(notify);
    };
};

export function useMuseumLights() {
    return useSyncExternalStore(subscribe, () => on, () => false);
}

export function LightsWhileInView({ children, amount = 0.4 }: { children: ReactNode; amount?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount });

    useEffect(() => {
        setMuseumLights(inView);
    }, [inView]);

    // Leaving the page turns them off
    useEffect(() => () => setMuseumLights(false), []);

    return <div ref={ref}>{children}</div>;
}
