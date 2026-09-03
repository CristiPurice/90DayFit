import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { PinPad } from './PinPad'

function Harness({ onSubmit = () => {} }: { onSubmit?: () => void }) {
  const [v, setV] = useState('')
  return (
    <>
      <PinPad value={v} onChange={setV} onSubmit={onSubmit} />
      <output data-testid="value">{v}</output>
    </>
  )
}

describe('PinPad', () => {
  it('adaugă cifrele apăsate', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    for (const k of ['1', '2', '3', '4']) await user.click(screen.getByRole('button', { name: k }))
    expect(screen.getByTestId('value')).toHaveTextContent('1234')
  })

  it('șterge ultima cifră', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: '7' }))
    await user.click(screen.getByRole('button', { name: '8' }))
    await user.click(screen.getByRole('button', { name: 'Șterge' }))
    expect(screen.getByTestId('value')).toHaveTextContent('7')
  })

  it('nu permite confirmarea sub 4 cifre și o permite la 4', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)
    const ok = screen.getByRole('button', { name: 'Confirmă' })
    expect(ok).toBeDisabled()
    for (const k of ['1', '2', '3', '4']) await user.click(screen.getByRole('button', { name: k }))
    expect(ok).toBeEnabled()
    await user.click(ok)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('nu depășește 6 cifre', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    for (const k of ['1', '2', '3', '4', '5', '6', '7']) await user.click(screen.getByRole('button', { name: k }))
    expect(screen.getByTestId('value')).toHaveTextContent('123456')
  })
})
