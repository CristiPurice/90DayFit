import { isValidPin, hashPin, verifyPin, failureDelayMs } from './pin'

describe('isValidPin', () => {
  it('acceptă 4–6 cifre', () => {
    expect(isValidPin('1234')).toBe(true)
    expect(isValidPin('123456')).toBe(true)
  })
  it('respinge altceva', () => {
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('1234567')).toBe(false)
    expect(isValidPin('12a4')).toBe(false)
    expect(isValidPin('')).toBe(false)
  })
})

describe('hashPin / verifyPin', () => {
  it('produce hash-uri diferite cu salt diferit și identice cu același salt', async () => {
    const a = await hashPin('1234')
    const b = await hashPin('1234')
    expect(a.hash).not.toBe(b.hash)
    const c = await hashPin('1234', a.salt)
    expect(c.hash).toBe(a.hash)
  })

  it('verifică PIN-ul corect și îl respinge pe cel greșit', async () => {
    const { hash, salt } = await hashPin('4321')
    expect(await verifyPin('4321', hash, salt)).toBe(true)
    expect(await verifyPin('4322', hash, salt)).toBe(false)
    expect(await verifyPin('abcd', hash, salt)).toBe(false)
  })

  it('refuză să deriveze un PIN invalid', async () => {
    await expect(hashPin('12')).rejects.toThrow()
  })
})

describe('failureDelayMs', () => {
  it('nu întârzie primele 3 încercări, apoi dublează cu plafon 30 s', () => {
    expect(failureDelayMs(0)).toBe(0)
    expect(failureDelayMs(2)).toBe(0)
    expect(failureDelayMs(3)).toBe(2000)
    expect(failureDelayMs(4)).toBe(4000)
    expect(failureDelayMs(5)).toBe(8000)
    expect(failureDelayMs(10)).toBe(30000)
  })
})
