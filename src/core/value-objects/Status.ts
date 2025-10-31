/**
 * Status Value Object
 *
 * Represents the status of a Learning Item
 * Ensures type safety and encapsulates status-related logic
 */
export enum Status {
  Backlog = 'Backlog',
  EmAndamento = 'Em_Andamento',
  Pausado = 'Pausado',
  Concluido = 'Concluido',
}

export class StatusVO {
  private constructor(private readonly _value: Status) {}

  static create(value: string): StatusVO {
    if (!Object.values(Status).includes(value as Status)) {
      throw new Error(`Invalid status: ${value}`)
    }
    return new StatusVO(value as Status)
  }

  static fromBacklog(): StatusVO {
    return new StatusVO(Status.Backlog)
  }

  static fromEmAndamento(): StatusVO {
    return new StatusVO(Status.EmAndamento)
  }

  static fromPausado(): StatusVO {
    return new StatusVO(Status.Pausado)
  }

  static fromConcluido(): StatusVO {
    return new StatusVO(Status.Concluido)
  }

  get value(): Status {
    return this._value
  }

  isBacklog(): boolean {
    return this._value === Status.Backlog
  }

  isEmAndamento(): boolean {
    return this._value === Status.EmAndamento
  }

  isPausado(): boolean {
    return this._value === Status.Pausado
  }

  isConcluido(): boolean {
    return this._value === Status.Concluido
  }

  canTransitionTo(newStatus: StatusVO): boolean {
    // Backlog can transition to any status
    if (this.isBacklog()) return true

    // Em Andamento can transition to Pausado or Concluido
    if (this.isEmAndamento()) {
      return newStatus.isPausado() || newStatus.isConcluido()
    }

    // Pausado can transition to Em Andamento or Concluido
    if (this.isPausado()) {
      return newStatus.isEmAndamento() || newStatus.isConcluido()
    }

    // Concluido cannot transition to other statuses
    if (this.isConcluido()) {
      return false
    }

    return false
  }

  equals(other: StatusVO): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
