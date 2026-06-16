"use client"

import { motion } from "framer-motion"

/** Pain zones — labels MUST match the recommender's canonical pain labels. */
const ZONES = [
  { id: "Neck", label: "Neck", cx: 110, cy: 60 },
  { id: "Shoulders", label: "Shoulders", cx: 110, cy: 92 },
  { id: "Lower back", label: "Lower back", cx: 110, cy: 150 },
  { id: "Hips", label: "Hips", cx: 110, cy: 196 },
  { id: "Legs & lower body", label: "Legs", cx: 110, cy: 246 },
] as const

const ACCENT = "#f0a830"

export function BodyMap({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <svg
      viewBox="0 0 240 290"
      className="h-[48vh] max-h-[440px] w-auto select-none"
      aria-label="Body map — tap where you feel discomfort"
    >
      {/* minimal anatomical guide lines */}
      <g stroke="#3a352c" strokeWidth="1.5" fill="none" opacity={0.9}>
        <circle cx="110" cy="32" r="16" />
        <line x1="110" y1="48" x2="110" y2="214" />
        <line x1="74" y1="84" x2="146" y2="84" />
        <line x1="110" y1="214" x2="86" y2="276" />
        <line x1="110" y1="214" x2="134" y2="276" />
      </g>

      {ZONES.map((z) => {
        const on = selected.includes(z.id)
        return (
          <g
            key={z.id}
            onClick={() => onToggle(z.id)}
            className="cursor-pointer"
            role="button"
            aria-pressed={on}
          >
            {on && (
              <motion.circle
                cx={z.cx}
                cy={z.cy}
                r={20}
                fill={ACCENT}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.28, 0.12, 0.28] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${z.cx}px ${z.cy}px` }}
              />
            )}
            {/* generous invisible hit area */}
            <circle cx={z.cx} cy={z.cy} r={22} fill="transparent" />
            <motion.circle
              cx={z.cx}
              cy={z.cy}
              r={11}
              animate={{
                fill: on ? ACCENT : "#16130f",
                stroke: on ? ACCENT : "#4a443a",
              }}
              strokeWidth={2}
              whileHover={{ scale: 1.18 }}
            />
            <text
              x={z.cx + 24}
              y={z.cy + 4}
              fontSize="12"
              fontWeight={on ? 600 : 400}
              fill={on ? ACCENT : "#8a847a"}
            >
              {z.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
