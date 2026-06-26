"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

/**
 * Subtle scroll-reveal (fade + rise). Content is server-rendered and passed as
 * children, so it stays in the DOM for SEO — this only animates opacity/transform
 * once, the first time it scrolls into view.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
