import { Dict } from "./collections";
import { Context } from "./context";
import { Associativity } from "./operator";
import { Token, Tokenizer, TokenType } from "./tokenizer";

function peek<T>(arr: T[]) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  } else {
    return;
  }
}

export class Formula {

  public static execute(expression: string, tempVars: Dict<number> = Object.create(null), context = Context.default) {
    const formula = new Formula(expression, context);
    return formula.execute(tempVars);
  }
  public readonly context: Context;
  private queue: Token[];

  public constructor(expression?: string, context?: Context) {
    this.context = context || Context.default;

    this.queue = [];

    if (expression != null) {
      this.parse(expression);
    }
  }

  public parse(expression: string) {
    const tokens = Tokenizer.parse(expression);
    const queue: Token[] = [];
    const stack: Token[] = [];

    let prevToken: Token | undefined;

    for (const token of tokens) {
      if (token.type === TokenType.NUMBER) {
        const num = parseFloat(token.text);

        if (num < 0 && prevToken != null && prevToken.type !== TokenType.OPERATOR) {
          queue.push({ type: token.type, text: token.text.slice(1) });
          this.pushOperator({ type: TokenType.OPERATOR, text: "-" }, queue, stack);
        } else {
          queue.push(token);
        }
      } else if (token.type === TokenType.IDENTIFIER) {
        if (this.context.isFunction(token.text)) {
          stack.push(token);
        } else {
          queue.push(token);
        }
      } else if (token.type === TokenType.OPERATOR && this.context.isOperator(token.text)) {
        this.pushOperator(token, queue, stack);
      } else if (token.type === TokenType.PLEFT) {
        if (prevToken != null && prevToken.type !== TokenType.OPERATOR && !this.context.isFunction(prevToken.text)) {
          stack.push({ type: TokenType.OPERATOR, text: "*" });
        }

        stack.push(token);
      } else if (token.type === TokenType.PRIGHT) {
        this.popOperators(queue, stack);
      } else if (token.type === TokenType.PARAM_SEPARATOR) {
        while (stack.length > 0 && peek(stack)!.type !== TokenType.PLEFT) {
          queue.push(stack.pop()!);
        }

        if (stack.length === 0) {
          throw new Error("Mismatched parentheses");
        }
      } else {
        throw new Error(`Unknown token "${token.text}"`);
      }

      prevToken = token;
    }

    while (stack.length > 0) {
      const token = stack.pop()!;

      if (token.type === TokenType.PLEFT || token.type === TokenType.PRIGHT) {
        throw new Error("Mismatched parentheses");
      }

      queue.push(token);
    }

    this.queue = queue;
  }

  public execute(tempVars: Dict<number> = Object.create(null)) {
    const vars: Dict<number> = Object.create(null);
    const stack: number[] = [];

    for (const name of Object.keys(tempVars)) {
      vars[name.toLowerCase()] = tempVars[name];
    }

    for (const origToken of this.queue) {
      const token = { type: origToken.type, text: origToken.text.toLowerCase() };

      if (token.type === TokenType.NUMBER) {
        stack.push(parseFloat(token.text));
      } else if (token.type === TokenType.IDENTIFIER) {
        if (token.text in vars) {
          stack.push(vars[token.text]);
        } else if (this.context.isVar(token.text)) {
          stack.push(this.context.getVar(token.text));
        } else if (this.context.isFunction(token.text)) {
          const func = this.context.getFunction(token.text);
          func.applyToStack(stack);
        }
      } else if (token.type === TokenType.OPERATOR && this.context.isOperator(token.text)) {
        const operator = this.context.getOperator(token.text);
        operator.applyToStack(stack);
      } else {
        throw new Error(`Unknown token ${origToken.text}`);
      }
    }

    if (stack.length !== 1) {
      throw new Error("Invalid syntax");
    }

    return stack[0];
  }

  private pushOperator(token: Token, queue: Token[], stack: Token[]) {
    const op1 = this.context.getOperator(token.text);

    while (stack.length > 0 && this.context.isOperator(peek(stack)!.text)) {
      const op2 = this.context.getOperator(peek(stack)!.text);

      if ((op1.associativity === Associativity.LEFT && op1.precedence <= op2.precedence) ||
          (op1.associativity === Associativity.RIGHT && op1.precedence < op2.precedence)) {
        queue.push(stack.pop()!);
      } else {
        break;
      }
    }

    stack.push(token);
  }

  private popOperators(queue: Token[], stack: Token[]) {
    while (stack.length > 0 && peek(stack)!.type !== TokenType.PLEFT) {
      queue.push(stack.pop()!);
    }

    if (stack.length === 0) {
      throw new Error("Mismatched parentheses");
    }

    stack.pop();

    if (stack.length > 0 && this.context.isFunction(peek(stack)!.text)) {
      queue.push(stack.pop()!);
    }
  }
}
