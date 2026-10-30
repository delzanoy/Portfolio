import React, { useEffect } from 'react';
import { useInView } from 'framer-motion';

export default function SectionWrapper({ id, children, onInView, className }: { id: string; children: React.ReactNode; onInView: (id: string) => void; className?: string }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { margin: "-30% 0px -69% 0px" });

    useEffect(() => {
        if (isInView) {
            onInView(id);
        }
    }, [isInView, id, onInView]);

    return (
        <div ref={ref} id={id} className={`scroll-mt-[30vh] ${className}`}>
            {children}
        </div>
    );
}