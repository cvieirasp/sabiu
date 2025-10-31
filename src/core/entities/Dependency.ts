/**
 * Dependency Entity
 *
 * Represents a prerequisite relationship between Learning Items
 * Domain rules:
 * - Source and target must be different items
 * - No circular dependencies allowed (validated at aggregate level)
 * - source depends on target (source requires target to be completed first)
 */
export interface DependencyProps {
  id: string
  sourceItemId: string
  targetItemId: string
  createdAt: Date
}

export class Dependency {
  private constructor(private props: DependencyProps) {
    this.validate()
  }

  static create(props: Omit<DependencyProps, 'createdAt'>): Dependency {
    return new Dependency({
      ...props,
      createdAt: new Date(),
    })
  }

  static reconstitute(props: DependencyProps): Dependency {
    return new Dependency(props)
  }

  private validate(): void {
    if (!this.props.sourceItemId) {
      throw new Error('Source item ID is required')
    }

    if (!this.props.targetItemId) {
      throw new Error('Target item ID is required')
    }

    if (this.props.sourceItemId === this.props.targetItemId) {
      throw new Error('An item cannot depend on itself')
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get sourceItemId(): string {
    return this.props.sourceItemId
  }

  get targetItemId(): string {
    return this.props.targetItemId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  // Domain methods
  isSelfDependency(): boolean {
    return this.props.sourceItemId === this.props.targetItemId
  }

  /**
   * Checks if this dependency would create a circular reference
   * with another dependency
   */
  wouldCreateCircularDependency(other: Dependency): boolean {
    // If this.target = other.source AND this.source = other.target, it's circular
    return (
      this.props.targetItemId === other.props.sourceItemId &&
      this.props.sourceItemId === other.props.targetItemId
    )
  }

  equals(other: Dependency): boolean {
    return this.props.id === other.props.id
  }

  /**
   * Checks if this is the same relationship (ignoring ID)
   */
  isSameRelationship(other: Dependency): boolean {
    return (
      this.props.sourceItemId === other.props.sourceItemId &&
      this.props.targetItemId === other.props.targetItemId
    )
  }

  toObject(): DependencyProps {
    return {
      ...this.props,
    }
  }
}
