"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { buildRadarBySource } from "./review-utils"
import type { Review } from "@/types/review"

interface ChairScoreRadarProps {
  reviews: Review[]
}

export function ChairScoreRadar({ reviews }: ChairScoreRadarProps) {
  const series = buildRadarBySource(reviews)

  if (series.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Not enough review data to show the radar chart.
      </p>
    )
  }

  const merged = series[0].data.map((point, i) => {
    const row: Record<string, string | number> = { subject: point.subject }
    for (const s of series) {
      row[s.source] = s.data[i]?.value ?? 0
    }
    return row
  })

  const chartConfig = series.reduce((acc, s) => {
    acc[s.source] = { label: s.label, color: s.color }
    return acc
  }, {} as ChartConfig)

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[360px] w-full">
      <RadarChart data={merged} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} />
        {series.map((s) => (
          <Radar
            key={s.source}
            name={s.label}
            dataKey={s.source}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend />
      </RadarChart>
    </ChartContainer>
  )
}
