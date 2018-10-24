interface FunctionCallback {
  (args: number[]): number;
}

export class Func {
  public readonly name: string;
  public readonly params: number;
  public readonly handler: FunctionCallback;

  public constructor(name: string, params: number, handler: FunctionCallback) {
    this.name = name.toLowerCase();
    this.handler = handler;
    this.params = params;
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
