import { ModuleStatusVO } from '../value-objects'

/**
 * Module Entity
 *
 * Represents a module/chapter within a Learning Item
 * Domain rules:
 * - Title cannot be empty
 * - Order must be non-negative
 * - Status transitions must be valid
 */
export interface ModuleProps {
  id: string
  learningItemId: string
  title: string
  status: ModuleStatusVO
  order: number
  createdAt: Date
  updatedAt?: Date
}

export class Module {
  private constructor(private props: ModuleProps) {
    this.validate()
  }

  static create(
    props: Omit<ModuleProps, 'createdAt' | 'status'> & {
      status?: ModuleStatusVO
    }
  ): Module {
    const now = new Date()
    return new Module({
      ...props,
      status: props.status || ModuleStatusVO.fromPendente(),
      createdAt: now,
      updatedAt: props.updatedAt || now,
    })
  }

  static reconstitute(props: ModuleProps): Module {
    return new Module(props)
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Module title cannot be empty')
    }

    if (this.props.title.length > 200) {
      throw new Error('Module title cannot exceed 200 characters')
    }

    if (this.props.order < 0) {
      throw new Error('Module order must be non-negative')
    }

    if (!this.props.learningItemId) {
      throw new Error('Module must belong to a Learning Item')
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get learningItemId(): string {
    return this.props.learningItemId
  }

  get title(): string {
    return this.props.title
  }

  get status(): ModuleStatusVO {
    return this.props.status
  }

  get order(): number {
    return this.props.order
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  // Domain methods
  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error('Module title cannot be empty')
    }

    if (newTitle.length > 200) {
      throw new Error('Module title cannot exceed 200 characters')
    }

    this.props.title = newTitle.trim()
    this.props.updatedAt = new Date()
  }

  updateStatus(newStatus: ModuleStatusVO): void {
    if (!this.props.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.props.status.value} to ${newStatus.value}`
      )
    }

    this.props.status = newStatus
    this.props.updatedAt = new Date()
  }

  updateOrder(newOrder: number): void {
    if (newOrder < 0) {
      throw new Error('Module order must be non-negative')
    }

    this.props.order = newOrder
    this.props.updatedAt = new Date()
  }

  markAsPendente(): void {
    this.updateStatus(ModuleStatusVO.fromPendente())
  }

  markAsEmAndamento(): void {
    this.updateStatus(ModuleStatusVO.fromEmAndamento())
  }

  markAsConcluido(): void {
    this.updateStatus(ModuleStatusVO.fromConcluido())
  }

  isPendente(): boolean {
    return this.props.status.isPendente()
  }

  isEmAndamento(): boolean {
    return this.props.status.isEmAndamento()
  }

  isConcluido(): boolean {
    return this.props.status.isConcluido()
  }

  equals(other: Module): boolean {
    return this.props.id === other.props.id
  }

  toObject(): ModuleProps {
    return {
      ...this.props,
    }
  }
}
