/**
 * Module Status Value Object
 *
 * Represents the status of a Module within a Learning Item
 */
export enum ModuleStatus {
  Pendente = 'Pendente',
  EmAndamento = 'Em_Andamento',
  Concluido = 'Concluido',
}

export class ModuleStatusVO {
  private constructor(private readonly _value: ModuleStatus) {}

  static create(value: string): ModuleStatusVO {
    if (!Object.values(ModuleStatus).includes(value as ModuleStatus)) {
      throw new Error(`Invalid module status: ${value}`)
    }
    return new ModuleStatusVO(value as ModuleStatus)
  }

  static fromPendente(): ModuleStatusVO {
    return new ModuleStatusVO(ModuleStatus.Pendente)
  }

  static fromEmAndamento(): ModuleStatusVO {
    return new ModuleStatusVO(ModuleStatus.EmAndamento)
  }

  static fromConcluido(): ModuleStatusVO {
    return new ModuleStatusVO(ModuleStatus.Concluido)
  }

  get value(): ModuleStatus {
    return this._value
  }

  isPendente(): boolean {
    return this._value === ModuleStatus.Pendente
  }

  isEmAndamento(): boolean {
    return this._value === ModuleStatus.EmAndamento
  }

  isConcluido(): boolean {
    return this._value === ModuleStatus.Concluido
  }

  canTransitionTo(newStatus: ModuleStatusVO): boolean {
    // Pendente can transition to any status
    if (this.isPendente()) return true

    // Em Andamento can only transition to Concluido
    if (this.isEmAndamento()) {
      return newStatus.isConcluido()
    }

    // Concluido cannot transition back
    if (this.isConcluido()) {
      return false
    }

    return false
  }

  equals(other: ModuleStatusVO): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
