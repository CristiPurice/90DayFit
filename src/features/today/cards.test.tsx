import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '@/data/db'
import { putWeight } from '@/data/repo/weights'
import { getWater } from '@/data/repo/water'
import { getSteps } from '@/data/repo/steps'
import { getBp } from '@/data/repo/bp'
import { WeightCard } from './WeightCard'
import { WaterCard } from './WaterCard'
import { StepsCard } from './StepsCard'
import { BpCard } from './BpCard'

const D = '2026-09-30'

beforeEach(async () => {
  await Promise.all([db.weights.clear(), db.water.clear(), db.steps.clear(), db.bp.clear()])
})

describe('WeightCard', () => {
  it('cere notarea când nu există greutate azi', async () => {
    render(<WeightCard dateKey={D} startKg={130} targetKg={115} />)
    expect(await screen.findByText('Notează greutatea')).toBeInTheDocument()
    expect(screen.getByText(/Media 7 zile: —/)).toBeInTheDocument()
  })

  it('afișează greutatea, media, progresul și ritmul', async () => {
    const series: [string, number][] = [
      ['2026-09-17', 128.4], ['2026-09-18', 128.2], ['2026-09-19', 128.0], ['2026-09-20', 127.9],
      ['2026-09-21', 127.7], ['2026-09-22', 127.5], ['2026-09-23', 127.3],
      ['2026-09-24', 126.4], ['2026-09-25', 126.2], ['2026-09-26', 126.0], ['2026-09-27', 125.9],
      ['2026-09-28', 125.7], ['2026-09-29', 125.5], ['2026-09-30', 124.8],
    ]
    for (const [d, kg] of series) await putWeight(d, kg)
    render(<WeightCard dateKey={D} startKg={130} targetKg={115} />)
    expect(await screen.findByText('124,8')).toBeInTheDocument()
    expect(screen.getByText(/Media 7 zile: 125,8 kg/)).toBeInTheDocument()
    expect(screen.getByText(/Ritm: −2,1 kg\/săpt\./)).toBeInTheDocument()
    expect(screen.getByText(/−4,2 din 15,0 kg/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Progres spre țintă' })).toHaveAttribute('aria-valuenow', '28')
  })

  it('salvează greutatea din sheet', async () => {
    const user = userEvent.setup()
    render(<WeightCard dateKey={D} startKg={130} targetKg={115} />)
    await user.click(await screen.findByRole('button', { name: 'Greutate' }))
    const dialog = screen.getByRole('dialog', { name: 'Greutatea de azi' })
    await user.type(within(dialog).getByLabelText('Greutate'), '129,4')
    await user.click(within(dialog).getByRole('button', { name: 'Salvează' }))
    expect(await screen.findByText('129,4')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('WaterCard', () => {
  it('adună porțiile și anulează ultima', async () => {
    const user = userEvent.setup()
    render(<WaterCard dateKey={D} targetMl={3000} />)
    expect(await screen.findByText('0,0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anulează' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '+250 ml' }))
    await user.click(screen.getByRole('button', { name: '+500 ml' }))
    expect(await screen.findByText('0,8')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Apă băută' })).toHaveAttribute('aria-valuenow', '25')
    await user.click(screen.getByRole('button', { name: 'Anulează' }))
    expect(await screen.findByText('0,3')).toBeInTheDocument()
    expect((await getWater(D))?.totalMl).toBe(250)
  })
})

describe('StepsCard', () => {
  it('salvează pașii și arată procentul din țintă', async () => {
    const user = userEvent.setup()
    render(<StepsCard dateKey={D} startDate="2026-09-07" />)
    await user.click(await screen.findByRole('button', { name: 'Pași' }))
    const dialog = screen.getByRole('dialog', { name: 'Pașii de azi' })
    await user.type(within(dialog).getByLabelText('Pași'), '6240')
    await user.click(within(dialog).getByRole('button', { name: 'Salvează' }))
    expect(await screen.findByText('6.240')).toBeInTheDocument()
    expect(screen.getByText('/ 7.500')).toBeInTheDocument()
    expect(screen.getByText('83%')).toBeInTheDocument()
    expect((await getSteps(D))?.count).toBe(6240)
  })
})

describe('BpCard', () => {
  it('salvează dimineața și seara cu nivelul corespunzător', async () => {
    const user = userEvent.setup()
    render(<BpCard dateKey={D} />)
    await user.click(await screen.findByRole('button', { name: 'Tensiune dimineață' }))
    let dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Sistolică'), '126')
    await user.type(within(dialog).getByLabelText('Diastolică'), '78')
    await user.type(within(dialog).getByLabelText('Puls (opțional)'), '64')
    expect(within(dialog).getByRole('status')).toHaveTextContent('În regulă')
    await user.click(within(dialog).getByRole('button', { name: 'Salvează' }))
    expect(await screen.findByText('126/78')).toBeInTheDocument()
    expect(screen.getByText('64 bpm')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tensiune seară' }))
    dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Sistolică'), '185')
    await user.type(within(dialog).getByLabelText('Diastolică'), '125')
    expect(within(dialog).getByRole('status')).toHaveTextContent('Consult medical')
    await user.click(within(dialog).getByRole('button', { name: 'Salvează' }))
    expect(await screen.findByText('185/125')).toBeInTheDocument()
    expect((await getBp(D, 'pm'))?.diastolic).toBe(125)
    expect((await getBp(D, 'am'))?.pulse).toBe(64)
  })

  it('refuză sistolica sub diastolică', async () => {
    const user = userEvent.setup()
    render(<BpCard dateKey={D} />)
    await user.click(await screen.findByRole('button', { name: 'Tensiune dimineață' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Sistolică'), '100')
    await user.type(within(dialog).getByLabelText('Diastolică'), '110')
    expect(within(dialog).getByRole('alert')).toHaveTextContent('mai mare decât diastolica')
    expect(within(dialog).getByRole('button', { name: 'Salvează' })).toBeDisabled()
  })
})
