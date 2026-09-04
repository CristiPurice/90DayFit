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
import { useChartColors, type ChartColors } from './useChartColors'

const INITIAL = { width: 340, height: 200 }

function styles(c: ChartColors) {
  return {
    tick: { fill: c.muted, fontSize: 11, fontFamily: 'inherit' },
    tooltip: {
      contentStyle: { borderRadius: 12, border: `1px solid ${c.grid}`, background: 'var(--card)', fontSize: 12, fontFamily: 'inherit', color: c.ink },
      labelStyle: { color: c.muted, fontWeight: 700 },
      itemStyle: { color: c.ink },
    },
  }
}

export interface WeightChartProps {
  points: WeightPoint[]
  targetKg: number
  startKg: number
}

export function WeightChart({ points, targetKg, startKg }: WeightChartProps) {
  const c = useChartColors()
  const s = styles(c)
  if (points.length === 0) return <Empty text="Cântărește-te zilnic ca să apară graficul." />
  const minKg = Math.min(targetKg, ...points.map((p) => p.kg)) - 1
  const maxKg = Math.max(startKg, ...points.map((p) => p.kg)) + 1
  return (
    <ResponsiveContainer width="100%" height={200} initialDimension={INITIAL}>
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="day" tick={s.tick} tickLine={false} axisLine={false} />
        <YAxis domain={[Math.floor(minKg), Math.ceil(maxKg)]} tick={s.tick} tickLine={false} axisLine={false} width={44} />
        <Tooltip {...s.tooltip} labelFormatter={(d) => `Ziua ${d}`} formatter={(v, name) => [`${formatKg(Number(v))} kg`, name === 'kg' ? 'Zilnic' : 'Media 7 zile']} />
        <ReferenceLine y={targetKg} stroke={c.muted} strokeDasharray="4 4" label={{ value: `Țintă ${formatKg(targetKg, 0)}`, position: 'insideTopRight', fill: c.muted, fontSize: 11 }} />
        <Line type="monotone" dataKey="kg" stroke={c.s1} strokeWidth={1.5} strokeOpacity={0.4} dot={{ r: 2.5, fill: c.s1, strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="avg" stroke={c.s1} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BpChart({ points }: { points: BpPoint[] }) {
  const c = useChartColors()
  const s = styles(c)
  if (points.length === 0) return <Empty text="Notează tensiunea dimineața și seara ca să apară graficul." />
  return (
    <ResponsiveContainer width="100%" height={200} initialDimension={INITIAL}>
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="label" tick={s.tick} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis domain={[50, 190]} tick={s.tick} tickLine={false} axisLine={false} width={44} />
        <Tooltip {...s.tooltip} formatter={(v, name) => [`${v} mmHg`, name === 'systolic' ? 'Sistolică' : 'Diastolică']} />
        <ReferenceLine y={140} stroke={c.danger} strokeDasharray="4 4" />
        <ReferenceLine y={90} stroke={c.danger} strokeDasharray="4 4" />
        <Line type="monotone" dataKey="systolic" stroke={c.s1} strokeWidth={2} dot={{ r: 3, fill: c.s1, strokeWidth: 0 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="diastolic" stroke={c.s2} strokeWidth={2} dot={{ r: 3, fill: c.s2, strokeWidth: 0 }} isAnimationActive={false} />
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
  const c = useChartColors()
  const s = styles(c)
  if (bars.length === 0 || bars.every((b) => b.value === null)) return <Empty text="Încă nu sunt date pe săptămâni." />
  const data = bars.map((b) => ({ ...b, value: b.value ?? 0 }))
  const domainMax = max ?? Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0))) * 1.1
  return (
    <ResponsiveContainer width="100%" height={160} initialDimension={{ width: 340, height: 160 }}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }} barCategoryGap="30%">
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="weekNo" tick={s.tick} tickLine={false} axisLine={false} tickFormatter={(w) => `S${w}`} />
        <YAxis domain={[0, Math.ceil(domainMax)]} tick={s.tick} tickLine={false} axisLine={false} width={44} />
        <Tooltip {...s.tooltip} labelFormatter={(w) => `Săptămâna ${w}`} formatter={(v, name) => [`${formatInt(Number(v))} ${unit}`, name === 'value' ? 'Realizat' : (targetLabel ?? 'Țintă')]} />
        <Bar dataKey="value" fill={c.s1} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        {data.some((d) => d.target !== undefined) && <Line type="step" dataKey="target" stroke={c.s2} strokeWidth={2} dot={false} isAnimationActive={false} />}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-card-muted" aria-label="Legendă">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-4 rounded"
            style={i.dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${i.color} 0 4px, transparent 4px 7px)` } : { background: i.color }}
          />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-line/50 px-4 py-6 text-center text-sm text-card-muted">{text}</p>
}
