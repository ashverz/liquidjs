import { isFalsy } from '../render/boolean'
import { isArray, isString, toValue } from '../util/underscore'
import { FilterImpl } from '../template'
import { FilterImplOptions } from '../template'

function Default<T1 extends boolean, T2> (this: FilterImpl, value: T1, defaultValue: T2, ...args: Array<[string, any]>): T1 | T2 {
  value = toValue(value)
  if (isArray(value) || isString(value)) return value.length ? value : defaultValue
  if (value === false && (new Map(args)).get('allow_false')) return false as T1
  return isFalsy(value, this.context) ? defaultValue : value
}

export const filters: Record<string, FilterImplOptions> = {
  default: Default
}
