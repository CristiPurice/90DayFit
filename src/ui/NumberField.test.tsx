import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberField } from './NumberField'

describe('NumberField', () => {
  it('acceptă virgula ca separator zecimal', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberField label="Greutate" value={null} onChange={onChange} suffix="kg" />)
    await user.type(screen.getByLabelText('Greutate'), '124,8')
    expect(onChange).toHaveBeenLastCalledWith(124.8)
  })

  it('afișează eroare pentru text și în afara intervalului', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberField label="Greutate" value={null} onChange={onChange} min={40} max={300} />)
    const input = screen.getByLabelText('Greutate')
    await user.type(input, 'abc')
    expect(screen.getByRole('alert')).toHaveTextContent('Introdu un număr')
    await user.clear(input)
    await user.type(input, '350')
    expect(screen.getByRole('alert')).toHaveTextContent('Maxim 300,0')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('pornește cu valoarea formatată', () => {
    render(<NumberField label="Țintă" value={115} onChange={() => {}} />)
    expect(screen.getByLabelText('Țintă')).toHaveValue('115,0')
  })
})
