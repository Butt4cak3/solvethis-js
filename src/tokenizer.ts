export class Tokenizer {
  public static parse(str: string) {
    const matches = str.match(/(-?\d+(\.\d+)?)|([a-z][a-z0-9_]*)|([()])|([^a-z0-9(),\s]+)/ig);

    if (matches != null) {
      return [...matches];
    } else {
      throw new Error();
    }
  }
}
