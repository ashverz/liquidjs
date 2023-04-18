import { assert, isTagToken, isOutputToken, ParseError } from '../util'
import { Tokenizer } from './tokenizer'
import { ParseStream } from './parse-stream'
import { TopLevelToken, OutputToken } from '../tokens'
import { Template, Output, HTML } from '../template'
import type { Liquid } from '../liquid'

export class Parser {
  private liquid: Liquid

  public constructor (liquid: Liquid) {
    this.liquid = liquid
  }
  public parse (html: string, filepath?: string): Template[] {
    const tokenizer = new Tokenizer(html, this.liquid.options.operators, filepath)
    const tokens = tokenizer.readTopLevelTokens(this.liquid.options)
    return this.parseTokens(tokens)
  }
  public parseTokens (tokens: TopLevelToken[]) {
    let token
    const templates: Template[] = []
    while ((token = tokens.shift())) {
      templates.push(this.parseToken(token, tokens))
    }
    return templates
  }
  public parseToken (token: TopLevelToken, remainTokens: TopLevelToken[]) {
    try {
      if (isTagToken(token)) {
        const TagClass = this.liquid.tags[token.name]
        assert(TagClass, `tag "${token.name}" not found`)
        return new TagClass(token, remainTokens, this.liquid)
      }
      if (isOutputToken(token)) {
        return new Output(token as OutputToken, this.liquid)
      }
      return new HTML(token)
    } catch (e) {
      throw new ParseError(e as Error, token)
    }
  }
  public parseStream (tokens: TopLevelToken[]) {
    return new ParseStream(tokens, (token, tokens) => this.parseToken(token, tokens))
  }
}
