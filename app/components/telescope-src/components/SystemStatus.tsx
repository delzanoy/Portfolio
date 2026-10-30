'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'

import { useStore } from '../store/useStore'

export function SystemStatus() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
    const [isHovered, setIsHovered] = useState(false)
    const triggerRefresh = useStore(s => s.triggerRefresh)
    const simulatedTimeOffset = useStore(s => s.simulatedTimeOffset)

    useEffect(() => {
        const now = new Date()
        setCurrentTime(now)
        setLastRefreshed(now)
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' hrs'
    }

    return (
        <div
            className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-auto group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >


            {/* Current Time */}
            <span className={`text-[10px] font-mono uppercase tracking-widest leading-none ${simulatedTimeOffset !== 0 ? 'text-cyan-400' : 'text-zinc-100'}`}>
                {currentTime ? formatTime(new Date(currentTime.getTime() + simulatedTimeOffset)).toUpperCase() : ''}
                {simulatedTimeOffset !== 0 && ' [SIMULATED]'}
            </span>

            {/* Status / Refresh Action */}
            <div className="h-6 flex items-center justify-end min-w-[140px]">
                {isHovered ? (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center"
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setLastRefreshed(new Date())
                                triggerRefresh()
                                setIsHovered(false)
                            }}
                        >
                            Refresh now
                        </Button>
                    </motion.div>
                ) : (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest"
                    >
                        {lastRefreshed ? `Last refreshed: ${formatTime(lastRefreshed)}` : ''}
                    </motion.span>
                )}
            </div>
        </div>
    )
}
