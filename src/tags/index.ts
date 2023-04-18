import ForTag from './for'
import IfTag from './if'
import type { TagClass } from '../template/tag'

export const tags: Record<string, TagClass> = {
  'for': ForTag,
  'if': IfTag,
}

export { ForTag, IfTag }
