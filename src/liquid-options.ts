import { isArray, isString } from './util'
import { defaultOperators, Operators } from './render'

type OutputEscape = (value: any) => string
type OutputEscapeOption = 'escape' | 'json' | OutputEscape

export interface LiquidOptions {
  /** A directory or an array of directories from where to resolve layout and include templates, and the filename passed to `.renderFile()`. If it's an array, the files are looked up in the order they occur in the array. Defaults to `["."]` */
  root?: string | string[];
  /** A directory or an array of directories from where to resolve included templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to `root` */
  partials?: string | string[];
  /** A directory or an array of directories from where to resolve layout templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to `root` */
  layouts?: string | string[];
  /** Allow refer to layouts/partials by relative pathname. To avoid arbitrary filesystem read, paths been referenced also need to be within corresponding root, partials, layouts. Defaults to `true`. */
  relativeReference?: boolean;
  /** Use jekyll style include, pass parameters to `include` variable of current scope. Defaults to `false`. */
  jekyllInclude?: boolean;
  /** Add a extname (if filepath doesn't include one) before template file lookup. Eg: setting to `".html"` will allow including file by basename. Defaults to `""`. */
  extname?: string;
  /** Use Javascript Truthiness. Defaults to `false`. */
  jsTruthy?: boolean;
  /** If set, treat the `filepath` parameter in `{%include filepath %}` and `{%layout filepath%}` as a variable, otherwise as a literal value. Defaults to `true`. */
  dynamicPartials?: boolean;
  /** Whether or not to assert filter existence. If set to `false`, undefined filters will be skipped. Otherwise, undefined filters will cause an exception. Defaults to `false`. */
  strictFilters?: boolean;
  /** Whether or not to assert variable existence.  If set to `false`, undefined variables will be rendered as empty string.  Otherwise, undefined variables will cause an exception. Defaults to `false`. */
  strictVariables?: boolean;
  /** Hide scope variables from prototypes, useful when you're passing a not sanitized object into LiquidJS or need to hide prototypes from templates. */
  ownPropertyOnly?: boolean;
  /** Modifies the behavior of `strictVariables`. If set, a single undefined variable will *not* cause an exception in the context of the `if`/`elsif`/`unless` tag and the `default` filter. Instead, it will evaluate to `false` and `null`, respectively. Irrelevant if `strictVariables` is not set. Defaults to `false`. **/
  lenientIf?: boolean;
  /** Strip blank characters (including ` `, `\t`, and `\r`) from the right of tags (`{% %}`) until `\n` (inclusive). Defaults to `false`. */
  trimTagRight?: boolean;
  /** Similar to `trimTagRight`, whereas the `\n` is exclusive. Defaults to `false`. See Whitespace Control for details. */
  trimTagLeft?: boolean;
  /** Strip blank characters (including ` `, `\t`, and `\r`) from the right of values (`{{ }}`) until `\n` (inclusive). Defaults to `false`. */
  trimOutputRight?: boolean;
  /** Similar to `trimOutputRight`, whereas the `\n` is exclusive. Defaults to `false`. See Whitespace Control for details. */
  trimOutputLeft?: boolean;
  /** The left delimiter for liquid tags. **/
  tagDelimiterLeft?: string;
  /** The right delimiter for liquid tags. **/
  tagDelimiterRight?: string;
  /** The left delimiter for liquid outputs. **/
  outputDelimiterLeft?: string;
  /** The right delimiter for liquid outputs. **/
  outputDelimiterRight?: string;
  /** Whether input strings to date filter preserve the given timezone **/
  preserveTimezones?: boolean;
  /** Whether `trim*Left`/`trim*Right` is greedy. When set to `true`, all consecutive blank characters including `\n` will be trimed regardless of line breaks. Defaults to `true`. */
  greedy?: boolean;
  /** the global scope passed down to all partial and layout templates, i.e. templates included by `include`, `layout` and `render` tags. */
  globals?: object;
  /** Default escape filter applied to output values, when set, you'll have to add `| raw` for values don't need to be escaped. Defaults to `undefined`. */
  outputEscape?: OutputEscapeOption;
  /** An object of operators for conditional statements. Defaults to the regular Liquid operators. */
  operators?: Operators;
  /** Respect parameter order when using filters like "for ... reversed limit", Defaults to `false`. */
  orderedFilterParameters?: boolean;
}

export interface RenderOptions {
  /**
   * This call is sync or async? It's used by Liquid internal methods, you'll not need this.
   */
  sync?: boolean;
  /**
   * Same as `globals` on LiquidOptions, but only for current render() call
   */
  globals?: object;
  /**
   * Same as `strictVariables` on LiquidOptions, but only for current render() call
   */
  strictVariables?: boolean;
  /**
   * Same as `ownPropertyOnly` on LiquidOptions, but only for current render() call
   */
  ownPropertyOnly?: boolean;
}

interface NormalizedOptions extends LiquidOptions {
  root?: string[];
  partials?: string[];
  layouts?: string[];
  outputEscape?: OutputEscape;
}

export interface NormalizedFullOptions extends NormalizedOptions {
  root: string[];
  partials: string[];
  layouts: string[];
  relativeReference: boolean;
  jekyllInclude: boolean;
  extname: string;
  jsTruthy: boolean;
  dynamicPartials: boolean;
  strictFilters: boolean;
  strictVariables: boolean;
  ownPropertyOnly: boolean;
  lenientIf: boolean;
  trimTagRight: boolean;
  trimTagLeft: boolean;
  trimOutputRight: boolean;
  trimOutputLeft: boolean;
  tagDelimiterLeft: string;
  tagDelimiterRight: string;
  outputDelimiterLeft: string;
  outputDelimiterRight: string;
  preserveTimezones: boolean;
  greedy: boolean;
  globals: object;
  operators: Operators;
}

export const defaultOptions: NormalizedFullOptions = {
  root: ['.'],
  layouts: ['.'],
  partials: ['.'],
  relativeReference: true,
  jekyllInclude: false,
  extname: '',
  dynamicPartials: true,
  jsTruthy: false,
  trimTagRight: false,
  trimTagLeft: false,
  trimOutputRight: false,
  trimOutputLeft: false,
  greedy: true,
  tagDelimiterLeft: '{%',
  tagDelimiterRight: '%}',
  outputDelimiterLeft: '{{',
  outputDelimiterRight: '}}',
  preserveTimezones: false,
  strictFilters: false,
  strictVariables: false,
  ownPropertyOnly: true,
  lenientIf: false,
  globals: {},
  operators: defaultOperators
}

export function normalize (options: LiquidOptions): NormalizedFullOptions {
  if (options.hasOwnProperty('root')) {
    if (!options.hasOwnProperty('partials')) options.partials = options.root
    if (!options.hasOwnProperty('layouts')) options.layouts = options.root
  }
  options = { ...defaultOptions, ...(options.jekyllInclude ? { dynamicPartials: false } : {}), ...options }
  options.root = normalizeDirectoryList(options.root)
  options.partials = normalizeDirectoryList(options.partials)
  options.layouts = normalizeDirectoryList(options.layouts)
  return options as NormalizedFullOptions
}

export function normalizeDirectoryList (value: any): string[] {
  let list: string[] = []
  if (isArray(value)) list = value
  if (isString(value)) list = [value]
  return list
}
