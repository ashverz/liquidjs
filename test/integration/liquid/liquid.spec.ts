import { Liquid, Context } from '../../../src'

describe('Liquid', function () {
  describe('#parseAndRender', function () {
    const engine = new Liquid()
    it('should parse and render variable output', async function () {
      const html = engine.parseAndRenderSync('{{"foo"}}')
      expect(html).toBe('foo')
    })
    it('should parse and render complex output', async function () {
      const tpl = '{{ "Welcome|to]Liquid" | split: "|" | join: "("}}'
      const html = engine.parseAndRenderSync(tpl)
      expect(html).toBe('Welcome(to]Liquid')
    })
    it('should support for-in with variable', async function () {
      const src = '{% assign total = 3 | minus: 1 %}' +
        '{% for i in (1..total) %}{{ i }}{% endfor %}'
      const html = engine.parseAndRenderSync(src, {})
      return expect(html).toBe('12')
    })
    it('should support `globals` render option', async function () {
      const src = '{{ foo }}'
      const html = engine.parseAndRenderSync(src, {}, { globals: { foo: 'FOO' } })
      return expect(html).toBe('FOO')
    })
    it('should support `strictVariables` render option', function () {
      const src = '{{ foo }}'
      return expect(engine.parseAndRenderSync(src, {}, { strictVariables: true })).rejects.toThrow(/undefined variable/)
    })
    it('should support async variables in output', async () => {
      const src = '{{ foo }}'
      const html = engine.parseAndRenderSync(src, { foo: Promise.resolve('FOO') })
      expect(html).toBe('FOO')
    })
    it('should parse and render with Context', async function () {
      const html = engine.parseAndRenderSync('{{foo}}', new Context({ foo: 'FOO' }))
      expect(html).toBe('FOO')
    })
  })
  describe('#parseAndRenderSync', function () {
    const engine = new Liquid()
    it('should parse and render variable output', function () {
      const html = engine.parseAndRenderSync('{{"foo"}}')
      expect(html).toBe('foo')
    })
    it('should parse and render complex output', function () {
      const tpl = '{{ "Welcome|to]Liquid" | split: "|" | join: "("}}'
      const html = engine.parseAndRenderSync(tpl)
      expect(html).toBe('Welcome(to]Liquid')
    })
    it('should support for-in with variable', function () {
      const src = '{% assign total = 3 | minus: 1 %}' +
        '{% for i in (1..total) %}{{ i }}{% endfor %}'
      const html = engine.parseAndRenderSync(src, {})
      return expect(html).toBe('12')
    })
    it('should support `globals` render option', function () {
      const src = '{{ foo }}'
      const html = engine.parseAndRenderSync(src, {}, { globals: { foo: 'FOO' } })
      return expect(html).toBe('FOO')
    })
    it('should support `strictVariables` render option', function () {
      const src = '{{ foo }}'
      return expect(() => engine.parseAndRenderSync(src, {}, { strictVariables: true })).toThrow(/undefined variable/)
    })
  })
})
