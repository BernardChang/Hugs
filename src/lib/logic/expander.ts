// Expand quantifiers over the fixed domain {a, b}.
// Ax.P(x) -> P(a) & P(b)
// Ex.P(x) -> P(a) | P(b)
// Substitution: replace bound variable in predicate args with the constant.

import type { Node } from "./parser";

export const DOMAIN = ["a", "b"] as const;

function subst(n: Node, v: string, c: string): Node {
  switch (n.kind) {
    case "pred":
      return { kind: "pred", name: n.name, args: n.args.map((a) => (a === v ? c : a)) };
    case "not":
      return { kind: "not", e: subst(n.e, v, c) };
    case "and": case "or": case "imp": case "iff":
      return { kind: n.kind, l: subst(n.l, v, c), r: subst(n.r, v, c) };
    case "forall": case "exists":
      // Shadowing: if inner binder reuses v, don't substitute inside.
      if (n.v === v) return n;
      return { kind: n.kind, v: n.v, e: subst(n.e, v, c) };
  }
}

export function expand(n: Node): Node {
  switch (n.kind) {
    case "pred":
      return n;
    case "not":
      return { kind: "not", e: expand(n.e) };
    case "and": case "or": case "imp": case "iff":
      return { kind: n.kind, l: expand(n.l), r: expand(n.r) };
    case "forall": {
      const parts = DOMAIN.map((c) => expand(subst(n.e, n.v, c)));
      return parts.reduce((l, r) => ({ kind: "and", l, r }));
    }
    case "exists": {
      const parts = DOMAIN.map((c) => expand(subst(n.e, n.v, c)));
      return parts.reduce((l, r) => ({ kind: "or", l, r }));
    }
  }
}

// Pretty print using nice symbols.
export function pretty(n: Node, parentPrec = 0): string {
  const prec = (k: Node["kind"]) =>
    k === "iff" ? 1 : k === "imp" ? 2 : k === "or" ? 3 : k === "and" ? 4 : k === "not" ? 5 : 6;
  const wrap = (s: string, p: number) => (p < parentPrec ? `(${s})` : s);
  switch (n.kind) {
    case "pred":
      return n.args.length ? `${n.name}(${n.args.join(",")})` : n.name;
    case "not":
      return `¬${pretty(n.e, prec("not"))}`;
    case "and":
      return wrap(`${pretty(n.l, prec("and"))} ∧ ${pretty(n.r, prec("and"))}`, prec("and"));
    case "or":
      return wrap(`${pretty(n.l, prec("or"))} ∨ ${pretty(n.r, prec("or"))}`, prec("or"));
    case "imp":
      return wrap(`${pretty(n.l, prec("imp") + 1)} ⇒ ${pretty(n.r, prec("imp"))}`, prec("imp"));
    case "iff":
      return wrap(`${pretty(n.l, prec("iff") + 1)} ⟷ ${pretty(n.r, prec("iff"))}`, prec("iff"));
    case "forall":
      return `∀${n.v}.${pretty(n.e, prec("not"))}`;
    case "exists":
      return `∃${n.v}.${pretty(n.e, prec("not"))}`;
  }
}
