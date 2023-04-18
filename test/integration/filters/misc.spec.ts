import { Liquid } from '../../../src/liquid'

describe('filters/object', function () {
  const liquid = new Liquid()
  describe('default', function () {
    it('false should use default', async () => expect(liquid.parseAndRenderSync('{{false | default: "a"}}')).toBe('a'))
    it('empty string should use default', async () => expect(liquid.parseAndRenderSync('{{"" | default: "a"}}')).toBe('a'))
    it('empty array should use default', async () => expect(liquid.parseAndRenderSync('{{arr | default: "a"}}', { arr: [] })).toBe('a'))
    it('non-empty string should not use default', async () => expect(liquid.parseAndRenderSync('{{" " | default: "a"}}')).toBe(' '))
    it('nil should use default', async () => expect(liquid.parseAndRenderSync('{{nil | default: "a"}}')).toBe('a'))
    it('undefined should use default', async () => expect(liquid.parseAndRenderSync('{{not_defined | default: "a"}}')).toBe('a'))
    it('true should not use default', async () => expect(liquid.parseAndRenderSync('{{true | default: "a"}}')).toBe('true'))
    it('0 should not use default', async () => expect(liquid.parseAndRenderSync('{{0 | default: "a"}}')).toBe('0'))
    it('should output false when allow_false=true', async () => expect(liquid.parseAndRenderSync('{{false | default: true, allow_false: true}}')).toBe('false'))
    it('should output default without allow_false', async () => expect(liquid.parseAndRenderSync('{{false | default: true}}')).toBe('true'))
    it('should output default when allow_false=false', async () => expect(liquid.parseAndRenderSync('{{false | default: true, allow_false: false}}')).toBe('true'))
    it('should throw for additional args', () => {
      const src = `{{ age | default: 'now'  date: '%d'}}` // missing `|` before `date`
      return expect(liquid.parseAndRenderSync(src)).rejects.toThrow(/unexpected character "date: '%d'"/)
    })
  })
})
