'use client';

import React, { useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CaseStudyDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    id?: string;
    fullScreen?: boolean;
    showCloseButton?: boolean;
}

export default function CaseStudyDetails({
    isOpen,
    onClose,
    children,
    id,
    fullScreen = false,
    showCloseButton = true
}: CaseStudyDetailsProps) {
    const handleClose = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        onClose();
    }, [onClose]);

    const contentDelay = id === 'telescope' ? 0 : 0.2;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) handleClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop – unchanged */}
                    <m.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[199] bg-black/40 backdrop-blur-xl cursor-zoom-out"
                    />

                    {/* Modal Container */}
                    <m.div
                        key="modal-container"
                        className={`fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden no-scrollbar flex items-start justify-center pointer-events-none ${fullScreen ? '' : 'pb-20'}`}
                    >
                        <m.div
                            key="modal-inner"
                            layoutId={id ? `card-${id}` : undefined}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                            className={`relative bg-[#0A0A0A] overflow-hidden flex flex-col pointer-events-auto ${fullScreen
                                ? 'w-full min-h-screen'
                                : 'w-[95%] min-h-[95vh] mt-[2.5vh] rounded-[24px] border border-[rgba(255,255,255,0.15)] shadow-[0_4px_32px_rgba(250,250,250,0.2)]'
                                }`}
                            style={fullScreen ? {} : { clipPath: 'inset(0 round 24px)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            {showCloseButton && (
                                <m.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    onClick={handleClose}
                                    className="absolute top-4 left-4 z-[210] p-1 md:p-2 rounded-full bg-black/40 text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                                >
                                    <X size={20} />
                                </m.div>
                            )}

                            {/* Content – unchanged */}
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: contentDelay }}
                                className="flex-1"
                            >
                                {children}
                            </m.div>
                        </m.div>
                    </m.div>
                </>
            )}
        </AnimatePresence>
    );
}
