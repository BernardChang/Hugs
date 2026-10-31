export { parse } from "./parser";
export type { Node } from "./parser";
export { expand, pretty, DOMAIN } from "./expander";
export { classify, atoms } from "./classifier";
export type { Verdict } from "./classifier";

import { parse } from "./parser";
import { expand, pretty } from "./expander";
import { classify } from "./classifier";

export function solve(src: string) {
  const ast = parse(src);
  const expanded = expand(ast);
  const result = classify(expanded);
  return {
    original: pretty(ast),
    expanded: pretty(expanded),
    ...result,
  };
}
