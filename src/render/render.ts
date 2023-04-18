import { RenderError } from '../util'
import { Context } from '../context'
import { Template } from '../template'
import { Emitter, SimpleEmitter } from '../emitters'

export class Render {
  public * renderTemplates (templates: Template[], ctx: Context, emitter?: Emitter): IterableIterator<any> {
    if (!emitter) {
      emitter = new SimpleEmitter()
    }
    for (const tpl of templates) {
      try {
        // if tpl.render supports emitter, it'll return empty `html`
        const html = yield tpl.render(ctx, emitter)
        // if not, it'll return an `html`, write to the emitter for it
        html && emitter.write(html)
        if (emitter['break'] || emitter['continue']) break
      } catch (e) {
        const err = RenderError.is(e) ? e : new RenderError(e as Error, tpl)
        throw err
      }
    }
    return emitter.buffer
  }
}
