/**
 * Tag Entity
 *
 * Represents a tag for classifying learning items
 * Domain rules:
 * - Name must be unique and not empty
 * - Name should be lowercase and trimmed
 */
export interface TagProps {
  id: string
  name: string
}

export class Tag {
  private constructor(private props: TagProps) {
    this.validate()
  }

  static create(props: TagProps): Tag {
    return new Tag({
      ...props,
      name: props.name.toLowerCase().trim(),
    })
  }

  static reconstitute(props: TagProps): Tag {
    return new Tag(props)
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Tag name cannot be empty')
    }

    if (this.props.name.length > 30) {
      throw new Error('Tag name cannot exceed 30 characters')
    }

    // Tag names should not contain spaces (use hyphens instead)
    if (this.props.name.includes(' ')) {
      throw new Error('Tag name cannot contain spaces. Use hyphens instead.')
    }

    // Tag names should only contain alphanumeric characters and hyphens
    const validPattern = /^[a-z0-9-]+$/
    if (!validPattern.test(this.props.name)) {
      throw new Error(
        'Tag name can only contain lowercase letters, numbers, and hyphens'
      )
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  // Domain methods
  updateName(newName: string): void {
    const normalized = newName.toLowerCase().trim()

    if (!normalized || normalized.length === 0) {
      throw new Error('Tag name cannot be empty')
    }

    if (normalized.length > 30) {
      throw new Error('Tag name cannot exceed 30 characters')
    }

    if (normalized.includes(' ')) {
      throw new Error('Tag name cannot contain spaces. Use hyphens instead.')
    }

    const validPattern = /^[a-z0-9-]+$/
    if (!validPattern.test(normalized)) {
      throw new Error(
        'Tag name can only contain lowercase letters, numbers, and hyphens'
      )
    }

    this.props.name = normalized
  }

  equals(other: Tag): boolean {
    return this.props.id === other.props.id
  }

  toObject(): TagProps {
    return {
      ...this.props,
    }
  }
}
