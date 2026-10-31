// Classify a quantifier-free formula by brute-force over all truth assignments
// to its atomic predicates.

import type { Node } from "./parser";

export type Verdict = "Valid" | "Contingent" | "Unsatisfiable";

function atomKey(n: Extract<Node, { kind: "pred" }>): string {
  return n.args.length ? `${n.name}(${n.args.join(",")})` : n.name;
}

export function atoms(n: Node): string[] {
  const set = new Set<string>();
  const walk = (x: Node): void => {
    switch (x.kind) {
      case "pred": set.add(atomKey(x)); return;
      case "not": walk(x.e); return;
      case "and": case "or": case "imp": case "iff": walk(x.l); walk(x.r); return;
      case "forall": case "exists": walk(x.e); return;
    }
  };
  walk(n);
  return [...set].sort();
}

function evalNode(n: Node, env: Record<string, boolean>): boolean {
  switch (n.kind) {
    case "pred": return env[atomKey(n)];
    case "not": return !evalNode(n.e, env);
    case "and": return evalNode(n.l, env) && evalNode(n.r, env);
    case "or": return evalNode(n.l, env) || evalNode(n.r, env);
    case "imp": return !evalNode(n.l, env) || evalNode(n.r, env);
    case "iff": return evalNode(n.l, env) === evalNode(n.r, env);
    case "forall": case "exists":
      throw new Error("Formula must be expanded before classification");
  }
}

export function classify(n: Node): {
  verdict: Verdict;
  atoms: string[];
  rows: { env: Record<string, boolean>; value: boolean }[];
} {
  const a = atoms(n);
  if (a.length > 12) throw new Error(`Too many atoms (${a.length}); limit is 12`);
  const rows: { env: Record<string, boolean>; value: boolean }[] = [];
  let anyTrue = false;
  let anyFalse = false;
  for (let mask = 0; mask < 1 << a.length; mask++) {
    const env: Record<string, boolean> = {};
    a.forEach((k, i) => { env[k] = Boolean(mask & (1 << (a.length - 1 - i))); });
    const v = evalNode(n, env);
    rows.push({ env, value: v });
    if (v) anyTrue = true; else anyFalse = true;
  }
  const verdict: Verdict =
    anyTrue && !anyFalse ? "Valid" :
    !anyTrue && anyFalse ? "Unsatisfiable" : "Contingent";
  return { verdict, atoms: a, rows };
}
