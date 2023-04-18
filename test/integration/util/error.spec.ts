import { RenderError } from '../../../src/util/error'
import { Liquid } from '../../../src/liquid'
import * as path from 'path'

let engine = new Liquid()
const strictEngine = new Liquid({
  strictVariables: true,
  strictFilters: true
})

describe('error', function () {
  describe('TokenizationError', function () {
    it('should throw TokenizationError when tag illegal', async function () {
      await expect(engine.parseAndRenderSync('{% . a %}', {})).rejects.toMatchObject({
        name: 'TokenizationError',
        message: expect.stringContaining('illegal tag syntax')
      })
    })
    it('should contain template content in err.message', async function () {
      const html = ['1st', '2nd', 'X{% . a %} Y', '4th']
      const message = [
        '   1| 1st',
        '   2| 2nd',
        '>> 3| X{% . a %} Y',
        '   4| 4th',
        'TokenizationError'
      ]
      await expect(engine.parseAndRenderSync(html.join('\n'))).rejects.toMatchObject({
        message: 'illegal tag syntax, line:3, col:2',
        stack: expect.stringContaining(message.join('\n')),
        name: 'TokenizationError'
      })
    })
    it('should contain the whole template content in err.token.input', async function () {
      const html = 'bar\nfoo{% . a %}\nfoo'
      await expect(engine.parseAndRenderSync(html)).rejects.toMatchObject({
        token: expect.objectContaining({
          input: html
        })
      })
    })
    it('should contain stack in err.stack', async function () {
      await expect(engine.parseAndRenderSync('{% . a %}')).rejects.toMatchObject({
        message: expect.stringContaining('illegal tag syntax'),
        stack: expect.stringContaining('at Liquid.parse')
      })
    })
    describe('captureStackTrace compatibility', function () {
      it('should be empty when captureStackTrace undefined', async function () {
        await expect(engine.parseAndRenderSync('{% . a %}')).rejects.toMatchObject({
          stack: expect.stringContaining('illegal tag syntax')
        })
        await expect(engine.parseAndRenderSync('{% . a %}')).rejects.toMatchObject({
          stack: expect.not.stringContaining('at Object.parse')
        })
      })
    })
    it('should throw error with [line, col] if tag unmatched', async function () {
      await expect(engine.parseAndRenderSync('1\n2\nfoo{% assign a = 4 }\n4')).rejects.toMatchObject({
        name: 'TokenizationError',
        message: 'tag "{% assign a =..." not closed, line:3, col:4'
      })
    })
  })

  describe('RenderError', function () {
    beforeEach(function () {
      engine = new Liquid({
        root: '/'
      })
      engine.registerTag('throwingTag', {
        render: function () {
          throw new Error('intended render error')
        }
      })
      engine.registerTag('rejectingTag', {
        render: async function () {
          throw new Error('intended render reject')
        }
      })
      engine.registerFilter('throwingFilter', () => {
        throw new Error('throwed by filter')
      })
    })
    it('should throw RenderError when tag throws', async function () {
      const src = '{%throwingTag%}'
      await expect(engine.parseAndRenderSync(src)).rejects.toMatchObject({
        name: 'RenderError',
        message: expect.stringContaining('intended render error')
      })
    })
    it('should throw RenderError when tag rejects', async function () {
      const src = '{%rejectingTag%}'
      await expect(engine.parseAndRenderSync(src)).rejects.toMatchObject({
        name: 'RenderError',
        message: expect.stringContaining('intended render reject')
      })
    })
    it('should throw RenderError when filter throws', async function () {
      const src = '{{1|throwingFilter}}'
      await expect(engine.parseAndRenderSync(src)).rejects.toMatchObject({
        name: 'RenderError',
        message: expect.stringContaining('throwed by filter')
      })
    })
    it('should not throw when variable undefined by default', async function () {
      const html = await engine.parseAndRenderSync('X{{a}}Y')
      return expect(html).toBe('XY')
    })
    it('should throw RenderError when variable not defined', async function () {
      await expect(strictEngine.parseAndRenderSync('{{a}}')).rejects.toMatchObject({
        name: 'RenderError',
        message: expect.stringContaining('undefined variable: a')
      })
    })
    it('should contain template context in err.stack', async function () {
      const html = ['1st', '2nd', '3rd', 'X{%throwingTag%} Y', '5th', '6th', '7th']
      const message = [
        '   2| 2nd',
        '   3| 3rd',
        '>> 4| X{%throwingTag%} Y',
        '   5| 5th',
        '   6| 6th',
        '   7| 7th',
        'RenderError'
      ]
      await expect(engine.parseAndRenderSync(html.join('\n'))).rejects.toMatchObject({
        name: 'RenderError',
        message: 'intended render error, line:4, col:2',
        stack: expect.stringContaining(message.join('\n'))
      })
    })
    it('should contain stack in err.stack', async function () {
      await expect(engine.parseAndRenderSync('{%rejectingTag%}')).rejects.toMatchObject({
        message: expect.stringContaining('intended render reject'),
        stack: expect.stringMatching(/at .*:\d+:\d+/)
      })
    })
  })

  describe('ParseError', function () {
    beforeEach(function () {
      engine = new Liquid()
      engine.registerTag('throwsOnParse', {
        parse: function () {
          throw new Error('intended parse error')
        },
        render: () => ''
      })
    })
    it('should throw ParseError when filter not defined', async function () {
      await expect(strictEngine.parseAndRenderSync('{{1 | a}}')).rejects.toMatchObject({
        name: 'ParseError',
        message: expect.stringContaining('undefined filter: a')
      })
    })
    it('should throw ParseError when tag not closed', async function () {
      await expect(engine.parseAndRenderSync('{% if %}')).rejects.toMatchObject({
        name: 'ParseError',
        message: expect.stringContaining('tag {% if %} not closed')
      })
    })
    it('should throw ParseError when tag parse throws', async function () {
      await expect(engine.parseAndRenderSync('{%throwsOnParse%}')).rejects.toMatchObject({
        name: 'ParseError',
        message: expect.stringContaining('intended parse error')
      })
    })
    it('should throw ParseError when tag not found', async function () {
      const src = '{%if true%}\naaa{%endif%}\n{% -a %}\n3'
      await expect(engine.parseAndRenderSync(src)).rejects.toMatchObject({
        name: 'ParseError',
        message: expect.stringContaining('tag "-a" not found')
      })
    })
    it('should throw ParseError when tag not exist', async function () {
      await expect(engine.parseAndRenderSync('{% a %}')).rejects.toMatchObject({
        name: 'ParseError',
        message: expect.stringContaining('tag "a" not found')
      })
    })

    it('should contain template context in err.stack', async function () {
      const html = ['1st', '2nd', '3rd', 'X{% a %} {% enda %} Y', '5th', '6th', '7th']
      const message = [
        '   2| 2nd',
        '   3| 3rd',
        '>> 4| X{% a %} {% enda %} Y',
        '   5| 5th',
        '   6| 6th',
        '   7| 7th',
        'ParseError: tag "a" not found'
      ]
      await expect(engine.parseAndRenderSync(html.join('\n'))).rejects.toMatchObject({
        name: 'ParseError',
        message: 'tag "a" not found, line:4, col:2',
        stack: expect.stringContaining(message.join('\n'))
      })
    })

    it('should handle err.message when context not enough', async function () {
      const html = ['1st', 'X{% a %} {% enda %} Y', '3rd', '4th']
      const message = [
        '   1| 1st',
        '>> 2| X{% a %} {% enda %} Y',
        '   3| 3rd',
        '   4| 4th',
        'ParseError: tag "a" not found'
      ]
      await expect(engine.parseAndRenderSync(html.join('\n'))).rejects.toMatchObject({
        message: 'tag "a" not found, line:2, col:2',
        stack: expect.stringContaining(message.join('\n'))
      })
    })

    it('should contain stack in err.stack', async function () {
      await expect(engine.parseAndRenderSync('{% -a %}')).rejects.toMatchObject({
        stack: expect.stringContaining('ParseError: tag "-a" not found')
      })
      await expect(engine.parseAndRenderSync('{% -a %}')).rejects.toMatchObject({
        stack: expect.stringMatching(/at .*:\d+:\d+\)/)
      })
    })
  })
  describe('sync support', function () {
    let engine: Liquid
    beforeEach(function () {
      engine = new Liquid({
        root: '/'
      })
      engine.registerTag('throwingTag', {
        render: function () {
          throw new Error('intended render error')
        }
      })
    })
    it('should throw RenderError when tag throws', function () {
      const src = '{%throwingTag%}'
      expect(() => engine.parseAndRenderSync(src)).toThrow(RenderError)
      expect(() => engine.parseAndRenderSync(src)).toThrow(/intended render error/)
    })
  })
})
