import { Func } from "./func";
import { Operator, Associativity } from "./operator";
import { Dict } from "./collections";

export class Context {
  private functions: Dict<Func>;
  private operators: Dict<Operator>;
  private vars: Dict<number>;

  private static _default: Context = new Context();

  public static get default() {
    const context = Context._default;

    if (!context.isOperator("+")) {
      context.setVar("pi", Math.PI);
      context.setVar("e", Math.E);

      context.addOperator(new Operator("+", 2, Associativity.LEFT, 2, ([a, b]) => a + b));
      context.addOperator(new Operator("-", 2, Associativity.LEFT, 2, ([a, b]) => a - b));
      context.addOperator(new Operator("*", 2, Associativity.LEFT, 3, ([a, b]) => a * b));
      context.addOperator(new Operator("/", 2, Associativity.LEFT, 3, ([a, b]) => a / b));
      context.addOperator(new Operator("^", 2, Associativity.RIGHT, 4, ([a, b]) => Math.pow(a, b)));

      context.addFunction(new Func("sin", 1, ([n]) => Math.sin(n)));
      context.addFunction(new Func("cos", 1, ([n]) => Math.cos(n)));
      context.addFunction(new Func("tan", 1, ([n]) => Math.tan(n)));
      context.addFunction(new Func("sqrt", 1, ([n]) => Math.sqrt(n)));
      context.addFunction(new Func("min", 2, ([a, b]) => Math.min(a, b)));
      context.addFunction(new Func("max", 2, ([a, b]) => Math.max(a, b)));
    }

    return context;
  }

  public constructor() {
    this.functions = Object.create(null);
    this.operators = Object.create(null);
    this.vars = Object.create(null);
  }

  public isOperator(symbol: string) {
    return symbol in this.operators;
  }

  public getOperator(symbol: string) {
    if (this.isOperator(symbol)) {
      return this.operators[symbol];
    } else {
      throw new Error();
    }
  }

  public addOperator(operator: Operator) {
    this.operators[operator.symbol] = operator;
  }

  public isFunction(name: string) {
    return name.toLowerCase() in this.functions;
  }

  public getFunction(name: string) {
    if (this.isFunction(name)) {
      return this.functions[name.toLowerCase()];
    } else {
      throw new Error();
    }
  }

  public addFunction(func: Func) {
    this.functions[func.name] = func;
  }

  public isVar(name: string) {
    return name.toLowerCase() in this.vars;
  }

  public getVar(name: string) {
    if (this.isVar(name)) {
      return this.vars[name.toLowerCase()];
    } else {
      throw new Error();
    }
  }

  public setVar(name: string, value: number) {
    this.vars[name.toLowerCase()] = value;
  }
}
