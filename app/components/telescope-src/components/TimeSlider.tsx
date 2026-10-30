'use client'

import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import Button from './Button'

const MAX_HOURS = 24
const MS_PER_HOUR = 60 * 60 * 1000

export function TimeSlider() {
  const { simulatedTimeOffset, setSimulatedTimeOffset } = useStore()

  // Value is in hours [-24, +24]
  const currentHours = simulatedTimeOffset / MS_PER_HOUR
  const isLive = simulatedTimeOffset === 0

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value)
    setSimulatedTimeOffset(hours * MS_PER_HOUR)
  }

  const goLive = () => {
    setSimulatedTimeOffset(0)
  }

  // Format the offset for display e.g. "-2.5 hrs" or "+1.0 hrs"
  const offsetDisplay = currentHours === 0
    ? 'LIVE'
    : `${currentHours > 0 ? '+' : ''}${currentHours.toFixed(1)} hrs`

  return (
    <div className="absolute bottom-[76px] md:bottom-8 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 pointer-events-none">
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
        <AnimatePresence>
          {!isLive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="md:absolute md:left-full md:ml-4 md:top-1/2 md:-translate-y-1/2 pointer-events-auto mb-2 md:mb-0"
            >
              <Button
                variant="primary"
                size="sm"
                onClick={goLive}
                className="whitespace-nowrap shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                Return to Live
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Slider Control */}
        <div className="w-full md:w-auto flex items-center gap-4 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] ring-1 ring-white/5 pointer-events-auto">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400">
            <Clock className="w-3 h-3" />
          </div>

          <input
            type="range"
            min={-MAX_HOURS}
            max={MAX_HOURS}
            step={0.5}
            value={currentHours}
            onChange={handleSliderChange}
            className="flex-1 md:w-48 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(34,211,238,0.6)] [&::-webkit-slider-thumb]:hover:scale-110 transition-all"
          />

          <div className="text-right">
            <span className={`text-xs font-mono tracking-tighter ${isLive ? 'text-cyan-400' : 'text-zinc-500'}`}>
              {offsetDisplay}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
