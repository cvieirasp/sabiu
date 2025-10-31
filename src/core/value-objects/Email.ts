/**
 * Email Value Object
 *
 * Ensures email validity and encapsulates email-related logic
 */
export class Email {
  private constructor(private readonly _value: string) {}

  static create(email: string): Email {
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      throw new Error('Email cannot be empty')
    }

    if (!this.isValid(trimmedEmail)) {
      throw new Error(`Invalid email format: ${email}`)
    }

    return new Email(trimmedEmail)
  }

  private static isValid(email: string): boolean {
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  get value(): string {
    return this._value
  }

  getDomain(): string {
    return this._value.split('@')[1]
  }

  getLocalPart(): string {
    return this._value.split('@')[0]
  }

  equals(other: Email): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
