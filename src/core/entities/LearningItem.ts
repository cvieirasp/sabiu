import { Progress } from '@/core/value-objects/Progress'
import { StatusVO } from '@/core/value-objects/Status'
import { Module } from '@/core/entities/Module'

/**
 * Learning Item Entity (Aggregate Root)
 *
 * Represents a course, book, video, certification, etc.
 * Domain rules:
 * - Title cannot be empty
 * - Progress is calculated from modules
 * - Status transitions must be valid
 * - Due date must be in the future (when set)
 */
export interface LearningItemProps {
  id: string
  title: string
  descriptionMD: string
  dueDate: Date | null
  status: StatusVO
  progress: Progress
  userId: string
  categoryId: string
  createdAt: Date
  updatedAt?: Date
}

export class LearningItem {
  private _modules: Module[] = []

  private constructor(private props: LearningItemProps) {
    this.validate()
  }

  static create(
    props: Omit<LearningItemProps, 'createdAt' | 'status' | 'progress'> & {
      status?: StatusVO
      progress?: Progress
    }
  ): LearningItem {
    const now = new Date()
    return new LearningItem({
      ...props,
      status: StatusVO.fromBacklog(),
      progress: Progress.fromZero(),
      createdAt: now,
      updatedAt: props.updatedAt || now,
    })
  }

  static reconstitute(props: LearningItemProps): LearningItem {
    return new LearningItem(props)
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Learning item title cannot be empty')
    }

    if (this.props.title.length > 200) {
      throw new Error('Learning item title cannot exceed 200 characters')
    }

    if (!this.props.userId) {
      throw new Error('Learning item must belong to a user')
    }

    if (this.props.dueDate) {
      const now = new Date()
      now.setHours(0, 0, 0, 0) // Start of today

      const dueDate = new Date(this.props.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate < now) {
        // Allow if status is Concluido
        if (!this.props.status.isConcluido()) {
          throw new Error('Due date cannot be in the past for active items')
        }
      }
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get title(): string {
    return this.props.title
  }

  get descriptionMD(): string {
    return this.props.descriptionMD
  }

  get dueDate(): Date | null {
    return this.props.dueDate
  }

  get status(): StatusVO {
    return this.props.status
  }

  get progress(): Progress {
    return this.props.progress
  }

  get userId(): string {
    return this.props.userId
  }

  get categoryId(): string {
    return this.props.categoryId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  get modules(): Module[] {
    return [...this._modules]
  }

  // Domain methods
  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error('Learning item title cannot be empty')
    }

    if (newTitle.length > 200) {
      throw new Error('Learning item title cannot exceed 200 characters')
    }

    this.props.title = newTitle.trim()
    this.props.updatedAt = new Date()
  }

  updateDescription(newDescription: string): void {
    this.props.descriptionMD = newDescription
    this.props.updatedAt = new Date()
  }

  updateDueDate(newDueDate: Date | null): void {
    if (newDueDate) {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      const dueDate = new Date(newDueDate)
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate < now && !this.props.status.isConcluido()) {
        throw new Error('Due date cannot be in the past for active items')
      }
    }

    this.props.dueDate = newDueDate
    this.props.updatedAt = new Date()
  }

  updateStatus(newStatus: StatusVO): void {
    if (!this.props.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.props.status.value} to ${newStatus.value}`
      )
    }

    this.props.status = newStatus
    this.props.updatedAt = new Date()
  }

  updateCategory(categoryId: string): void {
    this.props.categoryId = categoryId
    this.props.updatedAt = new Date()
  }

  setModules(modules: Module[]): void {
    this._modules = modules
    this.recalculateProgress()
  }

  addModule(module: Module): void {
    if (module.learningItemId !== this.props.id) {
      throw new Error('Module does not belong to this learning item')
    }

    this._modules.push(module)
    this.recalculateProgress()
  }

  removeModule(moduleId: string): void {
    this._modules = this._modules.filter(m => m.id !== moduleId)
    this.recalculateProgress()
  }

  updateModule(updatedModule: Module): void {
    const index = this._modules.findIndex(m => m.id === updatedModule.id)
    if (index === -1) {
      throw new Error('Module not found in this learning item')
    }

    this._modules[index] = updatedModule
    this.recalculateProgress()
  }

  /**
   * Recalculates progress based on completed modules
   * This is a critical domain method
   */
  recalculateProgress(): void {
    if (this._modules.length === 0) {
      this.props.progress = Progress.fromZero()
      this.props.updatedAt = new Date()
      return
    }

    const completedModules = this._modules.filter(m =>
      m.status.isConcluido()
    ).length

    this.props.progress = Progress.fromModules(
      completedModules,
      this._modules.length
    )
    this.props.updatedAt = new Date()
  }

  isOverdue(): boolean {
    if (!this.props.dueDate) return false

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const dueDate = new Date(this.props.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    return dueDate < now && !this.props.status.isConcluido()
  }

  isDueSoon(daysThreshold: number = 7): boolean {
    if (!this.props.dueDate || this.props.status.isConcluido()) return false

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const dueDate = new Date(this.props.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays <= daysThreshold && diffDays >= 0
  }

  equals(other: LearningItem): boolean {
    return this.props.id === other.props.id
  }

  toObject(): LearningItemProps {
    return {
      ...this.props,
    }
  }
}
