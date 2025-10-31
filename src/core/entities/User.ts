import { Email } from '../value-objects'

/**
 * User Entity
 *
 * Represents a user in the system
 * Domain rules:
 * - Email must be unique and valid
 * - Name cannot be empty
 * - Password hash is required
 */
export interface UserProps {
  id: string
  name: string
  email: Email
  passwordHash: string
  createdAt: Date
  updatedAt?: Date
}

export class User {
  private constructor(private props: UserProps) {
    this.validate()
  }

  static create(props: Omit<UserProps, 'createdAt'>): User {
    const now = new Date()
    return new User({
      ...props,
      createdAt: now,
      updatedAt: props.updatedAt || now,
    })
  }

  static reconstitute(props: UserProps): User {
    return new User(props)
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('User name cannot be empty')
    }

    if (this.props.name.trim().length < 2) {
      throw new Error('User name must have at least 2 characters')
    }

    if (this.props.name.length > 100) {
      throw new Error('User name cannot exceed 100 characters')
    }

    if (!this.props.passwordHash) {
      throw new Error('Password hash is required')
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get email(): Email {
    return this.props.email
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  // Domain methods
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('User name cannot be empty')
    }

    if (newName.trim().length < 2) {
      throw new Error('User name must have at least 2 characters')
    }

    if (newName.length > 100) {
      throw new Error('User name cannot exceed 100 characters')
    }

    this.props.name = newName.trim()
    this.props.updatedAt = new Date()
  }

  updateEmail(newEmail: Email): void {
    this.props.email = newEmail
    this.props.updatedAt = new Date()
  }

  updatePasswordHash(newPasswordHash: string): void {
    if (!newPasswordHash) {
      throw new Error('Password hash is required')
    }

    this.props.passwordHash = newPasswordHash
    this.props.updatedAt = new Date()
  }

  equals(other: User): boolean {
    return this.props.id === other.props.id
  }

  toObject(): UserProps {
    return {
      ...this.props,
    }
  }
}
