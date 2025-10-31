/**
 * Progress Value Object
 *
 * Represents progress as a percentage (0-100)
 * Ensures progress is always valid
 */
export class Progress {
  private constructor(private readonly _value: number) {}

  static create(value: number): Progress {
    if (value < 0 || value > 100) {
      throw new Error(`Progress must be between 0 and 100, got: ${value}`)
    }

    // Round to 2 decimal places
    const rounded = Math.round(value * 100) / 100

    return new Progress(rounded)
  }

  static fromZero(): Progress {
    return new Progress(0)
  }

  static fromComplete(): Progress {
    return new Progress(100)
  }

  static fromModules(completed: number, total: number): Progress {
    if (total === 0) {
      return Progress.fromZero()
    }

    if (completed > total) {
      throw new Error(
        `Completed modules (${completed}) cannot exceed total (${total})`
      )
    }

    const percentage = (completed / total) * 100
    return Progress.create(percentage)
  }

  get value(): number {
    return this._value
  }

  isZero(): boolean {
    return this._value === 0
  }

  isComplete(): boolean {
    return this._value === 100
  }

  isInProgress(): boolean {
    return this._value > 0 && this._value < 100
  }

  toPercentageString(): string {
    return `${this._value}%`
  }

  equals(other: Progress): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value.toString()
  }
}
