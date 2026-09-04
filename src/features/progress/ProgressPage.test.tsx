import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { putWeight } from '@/data/repo/weights'
import { putBp } from '@/data/repo/bp'
import { putSteps } from '@/data/repo/steps'
import { setMealFollowed } from '@/data/repo/meals'
import { getReview } from '@/data/repo/reviews'
import { listWaist } from '@/data/repo/waist'
import { clearAllData } from '@/data/backup'
import { ProgressPage } from './ProgressPage'

const D = '2026-10-04' // duminică, sfârșitul săptămânii 4

beforeEach(async () => {
  await clearAllData()
})

describe('ProgressPage', () => {
  it('fără date arată stările goale și decizia „nimic încă”', async () => {
    render(<ProgressPage dateKey={D} />)
    expect(await screen.findByText('Fără cântăriri')).toBeInTheDocument()
    expect(screen.getByText('Cântărește-te zilnic ca să apară graficul.')).toBeInTheDocument()
    expect(screen.getByTestId('decision')).toHaveTextContent('Nimic încă')
  })

  it('calculează media, pierderea și decizia din date', async () => {
    const days: [string, number][] = [
      ['2026-09-21', 127.6], ['2026-09-23', 127.3], ['2026-09-25', 127.1], ['2026-09-27', 126.9],
      ['2026-09-28', 126.4], ['2026-09-30', 126.0], ['2026-10-02', 125.7], ['2026-10-04', 125.5],
    ]
    for (const [d, kg] of days) await putWeight(d, kg)
    await putBp({ date: '2026-10-03', slot: 'am', systolic: 126, diastolic: 78, time: '07:00' })
    await putSteps('2026-10-01', 8000)
    for (const s of ['breakfast', 'lunch', 'dinner'] as const) await setMealFollowed('2026-10-01', s, true)

    render(<ProgressPage dateKey={D} />)
    expect(await screen.findByText('125,9')).toBeInTheDocument()
    expect(screen.getByText('−4,1')).toBeInTheDocument()
    expect(screen.getByText('27% din drum')).toBeInTheDocument()
    // S3 media 127,225 → S4 media 125,9 → −1,3 → în interval
    expect(screen.getByTestId('decision')).toHaveTextContent('Nimic')
    expect(screen.getByText(/exact în interval/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Tensiune' })).getByText('0')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Antrenamente' })).getByText('S4')).toBeInTheDocument()
  })

  it('salvează talia și evaluarea cu răspunsurile precompletate', async () => {
    const user = userEvent.setup()
    render(<ProgressPage dateKey={D} />)
    await user.click(await screen.findByRole('button', { name: 'Talie' }))
    const dialog = screen.getByRole('dialog', { name: 'Talia de azi' })
    await user.clear(within(dialog).getByLabelText('Talie'))
    await user.type(within(dialog).getByLabelText('Talie'), '111')
    await user.click(within(dialog).getByRole('button', { name: 'Salvează' }))
    expect(await screen.findByText('111,0')).toBeInTheDocument()
    expect(screen.getByText(/−4,0 cm față de start/)).toBeInTheDocument()
    expect((await listWaist())[0]?.cm).toBe(111)

    await user.click(screen.getByRole('button', { name: 'Fă evaluarea de duminică' }))
    const sheet = screen.getByRole('dialog', { name: 'Evaluare · săptămâna 4' })
    expect(within(sheet).getByLabelText(/3\. Câte din cele 21/)).toHaveValue('0 din 21.')
    expect(within(sheet).getByLabelText(/2\. Cât a scăzut/)).toHaveValue('Talie 111,0 cm.')
    await user.type(within(sheet).getByLabelText(/10\. Ce anume/), 'Prânzurile de la catering.')
    await user.click(within(sheet).getByRole('button', { name: 'Salvează evaluarea' }))
    await vi.waitFor(async () => expect((await getReview(4))?.answers[9]).toBe('Prânzurile de la catering.'))
    expect(await screen.findByText(/Evaluare salvată pe 04\.10\.2026/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vezi sau modifică evaluarea' })).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Evaluări anterioare' })).getByText('Săptămâna 4')).toBeInTheDocument()
  })
})
