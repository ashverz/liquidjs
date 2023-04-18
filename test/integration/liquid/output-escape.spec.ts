import { Liquid } from '../../../src/liquid'

describe('LiquidOptions#*outputEscape*', function () {
  it('when outputEscape is not set', async function () {
    const engine = new Liquid()
    const html = engine.parseAndRenderSync('{{"<"}}')
    expect(html).toBe('<')
  })

  it('should escape when outputEscape="escape"', async function () {
    const engine = new Liquid({
      outputEscape: 'escape'
    })
    const html = engine.parseAndRenderSync('{{"<"}}')
    expect(html).toBe('&lt;')
  })

  it('should json stringify when outputEscape="json"', async function () {
    const engine = new Liquid({
      outputEscape: 'json'
    })
    const html = engine.parseAndRenderSync('{{"<"}}')
    expect(html).toBe('"<"')
  })

  it('should support outputEscape=Function', async function () {
    const engine = new Liquid({
      outputEscape: (v: any) => `{${v}}`
    })
    const html = engine.parseAndRenderSync('{{"<"}}')
    expect(html).toBe('{<}')
  })

  it('should skip escape for output with filter "| raw"', async function () {
    const engine = new Liquid({
      outputEscape: 'escape'
    })
    const html = engine.parseAndRenderSync('{{"<" | raw}}')
    expect(html).toBe('<')
  })
})
