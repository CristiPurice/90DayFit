import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatKg, formatInt } from '@/domain/format'
import type { BpPoint, WeightPoint } from '@/domain/progress'

/** Paleta validată (dataviz): cobalt pentru seria 1, chihlimbar pentru seria 2, gri recesiv pentru grilă. */
export const CHART = {
  s1: '#1b3fd6',
  s2: '#d97706',
  ink: '#0f1a3d',
  muted: '#5a6690',
  grid: '#e3e7f3',
  danger: '#c0392b',
} as const

const axisTick = { fill: CHART.muted, fontSize: 11, fontFamily: 'inherit' }
const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: `1px solid ${CHART.grid}`, fontSize: 12, fontFamily: 'inherit', color: CHART.ink },
  labelStyle: { color: CHART.muted, fontWeight: 700 },
}
const INITIAL = { width: 340, height: 200 }

export interface WeightChartProps {
  points: WeightPoint[]
  targetKg: number
  startKg: number
}

export function WeightChart({ points, targetKg, startKg }: WeightChartProps) {
  if (points.length === 0) return <Empty text="Cântărește-te zilnic ca să apară graficul." />
  const minKg = Math.min(targetKg, ...points.map((p) => p.kg)) - 1
  const maxKg = Math.max(startKg, ...points.map((p) => p.kg)) + 1
  return (
    <ResponsiveContainer width="100%" height={200} initialDimension={INITIAL}>
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} label={undefined} />
        <YAxis domain={[Math.floor(minKg), Math.ceil(maxKg)]} tick={axisTick} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(d) => `Ziua ${d}`}
          formatter={(v, name) => [`${formatKg(Number(v))} kg`, name === 'kg' ? 'Zilnic' : 'Media 7 zile']}
        />
        <ReferenceLine y={targetKg} stroke={CHART.muted} strokeDasharray="4 4" label={{ value: `Țintă ${formatKg(targetKg, 0)}`, position: 'insideTopRight', fill: CHART.muted, fontSize: 11 }} />
        <Line type="monotone" dataKey="kg" stroke={CHART.s1} strokeWidth={1.5} strokeOpacity={0.4} dot={{ r: 2.5, fill: CHART.s1, strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="avg" stroke={CHART.s1} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BpChart({ points }: { points: BpPoint[] }) {
  if (points.length === 0) return <Empty text="Notează tensiunea dimineața și seara ca să apară graficul." />
  return (
    <ResponsiveContainer width="100%" height={200} initialDimension={INITIAL}>
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis domain={[50, 190]} tick={axisTick} tickLine={false} axisLine={false} width={44} />
        <Tooltip {...tooltipStyle} formatter={(v, name) => [`${v} mmHg`, name === 'systolic' ? 'Sistolică' : 'Diastolică']} />
        <ReferenceLine y={140} stroke={CHART.danger} strokeDasharray="4 4" />
        <ReferenceLine y={90} stroke={CHART.danger} strokeDasharray="4 4" />
        <Line type="monotone" dataKey="systolic" stroke={CHART.s1} strokeWidth={2} dot={{ r: 3, fill: CHART.s1, strokeWidth: 0 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="diastolic" stroke={CHART.s2} strokeWidth={2} dot={{ r: 3, fill: CHART.s2, strokeWidth: 0 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export interface WeekBar {
  weekNo: number
  value: number | null
  target?: number
}

export function WeeklyBars({ bars, unit, max, targetLabel }: { bars: WeekBar[]; unit: string; max?: number; targetLabel?: string }) {
  if (bars.length === 0 || bars.every((b) => b.value === null)) return <Empty text="Încă nu sunt date pe săptămâni." />
  const data = bars.map((b) => ({ ...b, value: b.value ?? 0 }))
  const domainMax = max ?? Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0))) * 1.1
  return (
    <ResponsiveContainer width="100%" height={160} initialDimension={{ width: 340, height: 160 }}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }} barCategoryGap="30%">
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="weekNo" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(w) => `S${w}`} />
        <YAxis domain={[0, Math.ceil(domainMax)]} tick={axisTick} tickLine={false} axisLine={false} width={44} />
        <Tooltip {...tooltipStyle} labelFormatter={(w) => `Săptămâna ${w}`} formatter={(v, name) => [`${formatInt(Number(v))} ${unit}`, name === 'value' ? 'Realizat' : (targetLabel ?? 'Țintă')]} />
        <Bar dataKey="value" fill={CHART.s1} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        {data.some((d) => d.target !== undefined) && (
          <Line type="step" dataKey="target" stroke={CHART.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-card-muted" aria-label="Legendă">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded" style={{ background: i.color, ...(i.dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${i.color} 0 4px, transparent 4px 7px)`, background: 'none' } : {}) }} />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-line/50 px-4 py-6 text-center text-sm text-card-muted">{text}</p>
}
