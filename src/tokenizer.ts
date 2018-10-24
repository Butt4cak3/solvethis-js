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
  PRIGHT = "PRight"
}

export interface Token {
  type: TokenType;
  text: string;
}

export class Tokenizer {
  private static parser = new Grammars.W3C.Parser(grammar, null);

  public static parse(str: string) {
    const tree = this.parser.getAST(str);

    if (tree == null) throw new Error();

    const queue: Token[] = [];
    this.filter(tree, queue);

    return queue;
  }

  private static filter(node: IToken, queue: Token[]) {
    if (Object.values(TokenType).indexOf(node.type) !== -1) {
      queue.push({
        type: node.type as TokenType,
        text: node.text
      });
    } else {
      for (const child of node.children) {
        this.filter(child, queue);
      }
    }
  }
}
