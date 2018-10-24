interface OperatorCallback {
  (args: number[]): number;
}

export enum Associativity {
  LEFT,
  RIGHT
}

export class Operator {
  public readonly symbol: string;
  public readonly params: number;
  public readonly associativity: Associativity;
  public readonly precedence: number;
  public readonly handler: OperatorCallback;

  public constructor(
    symbol: string,
    params: number,
    associativity: Associativity,
    precedence: number,
    handler: OperatorCallback
  ) {
    this.symbol = symbol;
    this.params = params;
    this.associativity = associativity;
    this.precedence = precedence;
    this.handler = handler;
  }

  public execute(args: number[]) {
    return this.handler(args);
  }

  public applyToStack(stack: number[]) {
    const args = this.params > 0 ? stack.splice(-this.params) : [];
    const result = this.execute(args);
    stack.push(result);
  }
}
