import { createId } from '@paralleldrive/cuid2'
import { IdGenerator } from '@/core/interfaces/IdGenerator'

export class CuidGenerator implements IdGenerator {
  generate(): string {
    return createId()
  }
}
