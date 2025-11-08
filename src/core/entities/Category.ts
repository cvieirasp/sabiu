/**
 * Category Entity
 *
 * Represents a category for organizing learning items
 * Domain rules:
 * - Name must be unique and not empty
 * - Color must be a valid hex color
 */
export interface CategoryProps {
  id: string
  name: string
  color: string
}

export class Category {
  private constructor(private props: CategoryProps) {
    this.validate()
  }

  static create(props: CategoryProps): Category {
    return new Category(props)
  }

  static reconstitute(props: CategoryProps): Category {
    return new Category(props)
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Category name cannot be empty')
    }

    if (this.props.name.length > 50) {
      throw new Error('Category name cannot exceed 50 characters')
    }

    if (!this.isValidHexColor(this.props.color)) {
      throw new Error(`Invalid hex color: ${this.props.color}`)
    }
  }

  private isValidHexColor(color: string): boolean {
    // Accepts #RGB, #RRGGBB, #RRGGBBAA
    const hexColorRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
    return hexColorRegex.test(color)
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get color(): string {
    return this.props.color
  }

  // Domain methods
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Category name cannot be empty')
    }

    if (newName.length > 50) {
      throw new Error('Category name cannot exceed 50 characters')
    }

    this.props.name = newName.trim()
  }

  updateColor(newColor: string): void {
    if (!this.isValidHexColor(newColor)) {
      throw new Error(`Invalid hex color: ${newColor}`)
    }

    this.props.color = newColor
  }

  equals(other: Category): boolean {
    return this.props.id === other.props.id
  }

  toObject(): CategoryProps {
    return {
      ...this.props,
    }
  }
}
