import { Context } from "./context";
import { Tokenizer } from "./tokenizer";
import { Associativity } from "./operator";
import { Dict } from "./collections";

function isNumeric(str: string) {
  const re = /^\d+(\.\d+)?$/;
  return re.test(str);
}

function isIdentifier(str: string) {
  const re = /^[a-z][a-z0-9_]*$/i;
  return re.test(str);
}

function peek<T>(arr: T[]) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  } else {
    return;
  }
}

export class Formula {
  public readonly context: Context;
  private queue: string[];

  public constructor(expression?: string, context?: Context) {
    this.context = context || Context.default;

    this.queue = [];

    if (expression != null) {
      this.parse(expression);
    }
  }

  public parse(expression: string) {
    const tokens = Tokenizer.parse(expression);
    const queue: string[] = [];
    const stack: string[] = [];

    let prevToken: string | undefined;

    for (const token of tokens) {
      if (isNumeric(token)) {
        queue.push(token);
      } else if (this.context.isFunction(token)) {
        stack.push(token);
      } else if (isIdentifier(token)) {
        queue.push(token);
      } else if (this.context.isOperator(token)) {
        this.pushOperator(token, queue, stack);
      } else if (token === "(") {
        if (prevToken && !this.context.isOperator(prevToken) && !this.context.isFunction(prevToken)) {
          stack.push("*");
        }

        stack.push(token);
      } else if (token === ")") {
        this.popOperators(queue, stack);
      } else if (token === ",") {
        while (stack.length > 0 && peek(stack) !== "(") {
          queue.push(stack.pop()!);
        }

        if (stack.length === 0) {
          throw new Error("Mismatched parentheses");
        }
      } else {
        throw new Error(`Unknown token "${token}"`);
      }

      prevToken = token;
    }

    while (stack.length > 0) {
      const token = stack.pop()!;

      if (token === "(" || token === ")") {
        throw new Error("Mismatched parentheses");
      }

      queue.push(token);
    }

    this.queue = queue;
  }

  public execute(tempVars: Dict<number> = Object.create(null)) {
    const vars: Dict<number> = Object.create(null);
    const stack: number[] = [];

    for (const name in tempVars) {
      vars[name.toLowerCase()] = tempVars[name];
    }

    for (const origToken of this.queue) {
      const token = origToken.toLowerCase();

      if (isNumeric(token)) {
        stack.push(parseFloat(token));
      } else if (token in vars) {
        stack.push(vars[token]);
      } else if (this.context.isVar(token)) {
        stack.push(this.context.getVar(token));
      } else if (this.context.isFunction(token)) {
        const func = this.context.getFunction(token);
        func.applyToStack(stack);
      } else if (this.context.isOperator(token)) {
        const operator = this.context.getOperator(token);
        operator.applyToStack(stack);
      } else {
        throw new Error(`Unknown token ${origToken}`);
      }
    }

    if (stack.length !== 1) {
      throw new Error("Invalid syntax");
    }

    return stack[0];
  }

  private pushOperator(symbol: string, queue: string[], stack: string[]) {
    const op1 = this.context.getOperator(symbol);

    while (stack.length > 0 && this.context.isOperator(peek(stack)!)) {
      const op2 = this.context.getOperator(peek(stack)!);

      if ((op1.associativity === Associativity.LEFT && op1.precedence <= op2.precedence) ||
          (op1.associativity === Associativity.RIGHT && op1.precedence < op2.precedence)) {
        queue.push(stack.pop()!);
      } else {
        break;
      }
    }

    stack.push(symbol);
  }

  private popOperators(queue: string[], stack: string[]) {
    while (stack.length > 0 && peek(stack) !== "(") {
      queue.push(stack.pop()!);
    }

    if (stack.length === 0) {
      throw new Error("Mismatched parentheses");
    }

    stack.pop();

    if (stack.length > 0 && this.context.isFunction(peek(stack)!)) {
      queue.push(stack.pop()!);
    }
  }
}
