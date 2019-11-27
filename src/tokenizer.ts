import { Grammars, IToken } from "ebnf";

const grammar = `
  Expression     ::= (WS? Token WS?)+
  Token          ::= Number | Identifier | Operator | ParamSeparator | PLeft | PRight
  Number         ::= "-"? [0-9]+ ("." [0-9]+)?
  Identifier     ::= ALPHA ALNUM*
  Operator       ::= [^A-Za-z0-9_()\\s]+
  ParamSeparator ::= ","
  PLeft          ::= "("
  PRight         ::= ")"
  ALPHA          ::= [A-Za-z]
  ALNUM          ::= [A-Za-z0-9]
  WS             ::= [\\s]+
`;

export enum TokenType {
  NUMBER = "Number",
  IDENTIFIER = "Identifier",
  OPERATOR = "Operator",
  PARAM_SEPARATOR = "ParamSeparator",
  PLEFT = "PLeft",
  PRIGHT = "PRight",
}

export interface Token {
  type: TokenType;
  text: string;
}

export class Tokenizer {
  public static parse(str: string) {
    const tree = this.parser.getAST(str);

    if (tree == null) throw new Error();

    const queue: Token[] = [];
    this.filter(tree, queue);
    this.normalize(queue);

    return queue;
  }

  private static parser = new Grammars.W3C.Parser(grammar, null);

  private static filter(node: IToken, queue: Token[]) {
    if ((Object.values(TokenType) as string[]).indexOf(node.type) !== -1) {
      queue.push({
        text: node.text,
        type: node.type as TokenType,
      });
    } else {
      for (const child of node.children) {
        this.filter(child, queue);
      }
    }
  }

  private static normalize(tokens: Token[]) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === TokenType.NUMBER && token.text[0] === "-") {
        if (i > 0 && tokens[i - 1].type === TokenType.NUMBER) {
          tokens.splice(
            i, 1,
            { text: "-", type: TokenType.OPERATOR },
            { text: token.text.substr(1), type: TokenType.NUMBER },
          );
        }
      }
    }
  }
}
