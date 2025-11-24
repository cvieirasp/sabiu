import { describe, it, expect } from 'vitest'
import { IdGenerator } from '@/core/interfaces/IdGenerator'

const idGeneratorMock: IdGenerator = {
  generate: () => 'cmid26tqr000004jodvqt5jzy',
}

describe('CuidGenerator', () => {
  it('should generate a CUID string with 25 characters', () => {
    const cuid = idGeneratorMock.generate()

    expect(typeof cuid).toBe('string')
    expect(cuid.length).toBe(25)
    expect(cuid).toBe('cmid26tqr000004jodvqt5jzy')
  })
})
