"use client"

// Tabs component — kept for potential future use but no longer used by main page
import { motion } from "framer-motion"

export type TabItem = {
  label: string
  value: string
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (value: string) => void
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="inline-flex items-center gap-1 px-1 py-1 rounded-full border border-zinc-700 w-fit">
      {tabs.map((tab) => {
        const isActive = tab.value === active

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className="relative px-5 py-1.5 text-xs rounded-full cursor-pointer focus:outline-none select-none"
          >
            {isActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundImage: "linear-gradient(to bottom, oklch(62.3% 0.214 259.815), oklch(54.6% 0.245 262.881))",
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}

            <span
              className="relative z-10 transition-colors duration-200"
              style={{
                color: isActive ? "#ffffff" : "#71717a",
                fontWeight: 700,
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
