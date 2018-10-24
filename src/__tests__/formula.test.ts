import { Formula } from "../formula";

test("Simple operations", () => {
  expect(Formula.execute("2 + 3")).toEqual(2 + 3);
  expect(Formula.execute("10 - 4")).toEqual(10 - 4);
  expect(Formula.execute("8.5 * 5")).toEqual(8.5 * 5);
  expect(Formula.execute("64 / 8")).toEqual(64 / 8);
  expect(Formula.execute("2^10")).toEqual(Math.pow(2, 10));
});

test("Negative numbers", () => {
  expect(Formula.execute("3 * -1")).toEqual(3 * -1);
});

test("Expressions with parentheses", () => {
  expect(Formula.execute("2 * (3 + 4)")).toEqual(2 * (3 + 4));
  expect(Formula.execute("(2 * 3) + 4")).toEqual((2 * 3) + 4);
  expect(Formula.execute("(3 - 2) * (4 + 5)")).toEqual((3 - 2) * (4 + 5));
  expect(Formula.execute("(2 * (3 + 4) + 8) / 5")).toEqual((2 * (3 + 4) + 8) / 5);
});

test("Expressions without whitespace", () => {
  expect(Formula.execute("3+6")).toEqual(3 + 6);
  expect(Formula.execute("2+(3-1)")).toEqual(2 + (3 - 1));
});
