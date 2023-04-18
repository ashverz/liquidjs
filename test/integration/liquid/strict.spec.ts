import { Liquid } from '../../../src/liquid'

describe('LiquidOptions#strict*', function () {
  let engine: Liquid
  const ctx = {}
  beforeEach(function () {
    engine = new Liquid({
      root: '/root/',
      extname: '.html'
    })
  })
  it('should not throw when strictVariables false (default)', async function () {
    const html = engine.parseAndRenderSync('before{{notdefined}}after', ctx)
    return expect(html).toBe('beforeafter')
  })
  it('should pass strictVariables to render by parseAndRender', function () {
    const html = 'before{{notdefined}}after'
    engine = new Liquid({
      root: '/root/',
      extname: '.html',
      strictVariables: true
    })
    return expect(engine.parseAndRenderSync(html, ctx)).rejects.toThrow(/undefined variable: notdefined/)
  })
})
