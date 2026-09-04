import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sheet } from './Sheet'

describe('Sheet', () => {
  it('nu randează nimic când e închis', () => {
    render(
      <Sheet open={false} onClose={() => {}} title="Test">
        <p>conținut</p>
      </Sheet>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('afișează titlul și conținutul când e deschis', () => {
    render(
      <Sheet open onClose={() => {}} title="Greutatea de azi">
        <p>conținut</p>
      </Sheet>,
    )
    expect(screen.getByRole('dialog', { name: 'Greutatea de azi' })).toBeInTheDocument()
    expect(screen.getByText('conținut')).toBeInTheDocument()
  })

  it('se închide cu butonul și cu Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Sheet open onClose={onClose} title="Test">
        <p>x</p>
      </Sheet>,
    )
    await user.click(screen.getByRole('button', { name: 'Închide' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
