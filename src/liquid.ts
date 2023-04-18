import { Context } from './context'
import { toValueSync, isFunction, forOwn } from './util'
import { TagClass, createTagClass, TagImplOptions, FilterImplOptions, Template } from './template'
import { Render } from './render'
import { Parser } from './parser'
import { tags } from './tags'
import { filters } from './filters'
import { LiquidOptions, NormalizedFullOptions, normalize, RenderOptions } from './liquid-options'

export class Liquid {
  public readonly options: NormalizedFullOptions
  public readonly renderer = new Render()
  public readonly parser: Parser
  public readonly filters: Record<string, FilterImplOptions> = {}
  public readonly tags: Record<string, TagClass> = {}

  public constructor (opts: LiquidOptions = {}) {
    this.options = normalize(opts)
    this.parser = new Parser(this)
    forOwn(tags, (conf: TagClass, name: string) => this.registerTag(name, conf))
    forOwn(filters, (handler: FilterImplOptions, name: string) => this.registerFilter(name, handler))
  }
  public parse (html: string, filepath?: string): Template[] {
    return this.parser.parse(html, filepath)
  }

  public _render (tpl: Template[], scope: Context | object | undefined, renderOptions: RenderOptions): IterableIterator<any> {
    const ctx = scope instanceof Context ? scope : new Context(scope, this.options, renderOptions)
    return this.renderer.renderTemplates(tpl, ctx)
  }

  public _parseAndRender (html: string, scope: Context | object | undefined, renderOptions: RenderOptions): IterableIterator<any> {
    const tpl = this.parse(html)
    return this._render(tpl, scope, renderOptions)
  }
  public parseAndRenderSync (html: string, scope?: Context | object, renderOptions?: RenderOptions): any {
    return toValueSync(this._parseAndRender(html, scope, { ...renderOptions, sync: true }))
  }

  public registerFilter (name: string, filter: FilterImplOptions) {
    this.filters[name] = filter
  }
  public registerTag (name: string, tag: TagClass | TagImplOptions) {
    this.tags[name] = isFunction(tag) ? tag : createTagClass(tag)
  }
}
