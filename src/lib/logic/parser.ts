// FOL / propositional parser.
// Tokens supported (input):
//   Quantifiers: Ax. Ex. (case-sensitive A/E, single lowercase var, dot)
//                also accepts ∀x. ∃x.
//   Connectives: & ∧ | ∨ ~ ¬ ! => ⇒ -> <=> ⟷ <->
//   Predicates:  lowercase identifier optionally followed by (arg, arg, ...)
//                args are single lowercase letters (variables or constants a,b)
//   Parens:      ( )
//
// Output AST nodes:
//   { kind: 'pred', name, args: string[] }
//   { kind: 'not', e }
//   { kind: 'and'|'or'|'imp'|'iff', l, r }
//   { kind: 'forall'|'exists', v: string, e }

export type Node =
  | { kind: "pred"; name: string; args: string[] }
  | { kind: "not"; e: Node }
  | { kind: "and" | "or" | "imp" | "iff"; l: Node; r: Node }
  | { kind: "forall" | "exists"; v: string; e: Node };

type Tok =
  | { t: "lp" } | { t: "rp" } | { t: "comma" }
  | { t: "not" } | { t: "and" } | { t: "or" } | { t: "imp" } | { t: "iff" }
  | { t: "forall"; v: string } | { t: "exists"; v: string }
  | { t: "ident"; v: string };

function tokenize(src: string): Tok[] {
  const s = src.replace(/\s+/g, "");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    // Quantifiers: Ax. / Ex. / ∀x. / ∃x.
    if ((c === "A" || c === "E" || c === "∀" || c === "∃") && i + 2 < s.length) {
      const v = s[i + 1];
      const dot = s[i + 2];
      if (/[a-z]/.test(v) && dot === ".") {
        const kind = (c === "A" || c === "∀") ? "forall" : "exists";
        out.push({ t: kind, v });
        i += 3;
        continue;
      }
    }
    if (c === "(") { out.push({ t: "lp" }); i++; continue; }
    if (c === ")") { out.push({ t: "rp" }); i++; continue; }
    if (c === ",") { out.push({ t: "comma" }); i++; continue; }
    if (c === "~" || c === "¬" || c === "!") { out.push({ t: "not" }); i++; continue; }
    if (c === "&" || c === "∧") { out.push({ t: "and" }); i++; continue; }
    if (c === "|" || c === "∨") { out.push({ t: "or" }); i++; continue; }
    if (s.startsWith("<=>", i) || s.startsWith("<->", i)) { out.push({ t: "iff" }); i += 3; continue; }
    if (s[i] === "⟷" || s[i] === "↔") { out.push({ t: "iff" }); i++; continue; }
    if (s.startsWith("=>", i) || s.startsWith("->", i)) { out.push({ t: "imp" }); i += 2; continue; }
    if (s[i] === "⇒" || s[i] === "→") { out.push({ t: "imp" }); i++; continue; }
    if (/[a-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j++;
      out.push({ t: "ident", v: s.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character "${c}" at position ${i}`);
  }
  return out;
}

class Parser {
  i = 0;
  constructor(public toks: Tok[]) {}
  peek() { return this.toks[this.i]; }
  eat(t: Tok["t"]) {
    const tk = this.toks[this.i];
    if (!tk || tk.t !== t) throw new Error(`Expected ${t} but got ${tk ? tk.t : "EOF"}`);
    this.i++;
    return tk;
  }
  parseTop(): Node {
    const e = this.parseIff();
    if (this.i !== this.toks.length) throw new Error("Unexpected trailing input");
    return e;
  }
  // Precedence (lowest to highest): iff, imp (right-assoc), or, and, not, atom
  parseIff(): Node {
    let l = this.parseImp();
    while (this.peek()?.t === "iff") { this.i++; const r = this.parseImp(); l = { kind: "iff", l, r }; }
    return l;
  }
  parseImp(): Node {
    const l = this.parseOr();
    if (this.peek()?.t === "imp") { this.i++; const r = this.parseImp(); return { kind: "imp", l, r }; }
    return l;
  }
  parseOr(): Node {
    let l = this.parseAnd();
    while (this.peek()?.t === "or") { this.i++; const r = this.parseAnd(); l = { kind: "or", l, r }; }
    return l;
  }
  parseAnd(): Node {
    let l = this.parseNot();
    while (this.peek()?.t === "and") { this.i++; const r = this.parseNot(); l = { kind: "and", l, r }; }
    return l;
  }
  parseNot(): Node {
    if (this.peek()?.t === "not") { this.i++; return { kind: "not", e: this.parseNot() }; }
    return this.parseAtom();
  }
  parseAtom(): Node {
    const tk = this.peek();
    if (!tk) throw new Error("Unexpected end of input");
    if (tk.t === "forall" || tk.t === "exists") {
      this.i++;
      const body = this.parseNot();
      return { kind: tk.t, v: tk.v, e: body };
    }
    if (tk.t === "lp") {
      this.i++;
      const e = this.parseIff();
      this.eat("rp");
      return e;
    }
    if (tk.t === "ident") {
      this.i++;
      const args: string[] = [];
      if (this.peek()?.t === "lp") {
        this.i++;
        if (this.peek()?.t !== "rp") {
          while (true) {
            const a = this.eat("ident") as { t: "ident"; v: string };
            args.push(a.v);
            if (this.peek()?.t === "comma") { this.i++; continue; }
            break;
          }
        }
        this.eat("rp");
      }
      return { kind: "pred", name: tk.v, args };
    }
    throw new Error(`Unexpected token: ${tk.t}`);
  }
}

export function parse(src: string): Node {
  const toks = tokenize(src);
  if (toks.length === 0) throw new Error("Empty formula");
  return new Parser(toks).parseTop();
}
