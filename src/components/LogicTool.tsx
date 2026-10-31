import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { solve } from "@/lib/logic";
import type { Verdict } from "@/lib/logic";

const SYMBOLS: { label: string; insert: string; hint: string }[] = [
  { label: "∀x.", insert: "Ax.", hint: "for all" },
  { label: "∃x.", insert: "Ex.", hint: "there exists" },
  { label: "∧", insert: " & ", hint: "and" },
  { label: "∨", insert: " | ", hint: "or" },
  { label: "¬", insert: "~", hint: "not" },
  { label: "⇒", insert: " => ", hint: "implies" },
  { label: "⟷", insert: " <=> ", hint: "iff" },
  { label: "( )", insert: "()", hint: "group" },
];

const EXAMPLES = [
  "(Ax.(p(x) => q(x))) <=> (~Ex.p(x) | Ax.q(x))",
  "Ax.Ey.(p(x) & ~p(y))",
  "Ax.(q(x) | ~p(x))",
  "(Ex.r(x)) => (Ay.(p(y) | q(y)))",
  "Ax.Ey.(p(x,y) => p(y,x))",
  "Ax.p(x) => Ex.p(x)",
  "Ex.Ay.r(x,y) => Ay.Ex.r(x,y)",
  "Ax.(p(x) & ~p(x))",
];

export function LogicTool() {
  const [mode, setMode] = useState<"solve" | "practice">("solve");

  return (
    <div className="min-h-screen text-foreground">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold tracking-tight">
              Quantifier
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              FOL · domain {`{a, b}`}
            </span>
          </div>
          <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm">
            <TabBtn active={mode === "solve"} onClick={() => setMode("solve")}>
              Solve
            </TabBtn>
            <TabBtn active={mode === "practice"} onClick={() => setMode("practice")}>
              Practice
            </TabBtn>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <AnimatePresence mode="wait">
          {mode === "solve" ? (
            <motion.div
              key="solve"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <SolveMode />
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <PracticeMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        ∀x.∃y. you · learn · logic
      </footer>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full px-4 py-1.5 font-medium transition-colors ${
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-pill"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

// ---------- SOLVE MODE ----------

function SolveMode() {
  const [src, setSrc] = useState(EXAMPLES[0]);

  const result = useMemo(() => {
    const trimmed = src.trim();
    if (!trimmed) return null;
    try {
      return { ok: true as const, ...solve(trimmed) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [src]);

  const insert = (s: string) => setSrc((v) => v + s);

  return (
    <div className="space-y-8">
      <section>
        <SectionLabel>01 · Formula</SectionLabel>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Write a first-order formula. Use{" "}
          <code className="font-mono text-foreground">Ax.</code> for ∀,{" "}
          <code className="font-mono text-foreground">Ex.</code> for ∃, and any single
          lowercase letter as a variable. Predicates look like{" "}
          <code className="font-mono text-foreground">p(x)</code> or{" "}
          <code className="font-mono text-foreground">r(x,y)</code>.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-card shadow-sm">
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            spellCheck={false}
            rows={3}
            className="w-full resize-none rounded-lg bg-transparent p-4 font-mono text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
            placeholder="Ax.(p(x) => q(x))"
          />
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 p-2">
            {SYMBOLS.map((s) => (
              <button
                key={s.label}
                onClick={() => insert(s.insert)}
                title={s.hint}
                className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-sm text-foreground transition hover:border-accent hover:text-accent"
              >
                {s.label}
              </button>
            ))}
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={() => setSrc("")}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="self-center pr-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            try
          </span>
          {EXAMPLES.slice(0, 5).map((ex) => (
            <button
              key={ex}
              onClick={() => setSrc(ex)}
              className="truncate rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground transition hover:border-accent hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {result && !result.ok && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
          {result.error}
        </div>
      )}

      {result && result.ok && (
        <>
          <section>
            <SectionLabel>02 · Expansion over {`{a, b}`}</SectionLabel>
            <div className="mt-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Original
              </div>
              <div className="mt-1.5 break-words font-mono text-lg leading-relaxed">
                {result.original}
              </div>
              <div className="my-4 flex items-center gap-3 text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span className="font-mono text-xs">expand ∀ → ∧, ∃ → ∨</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Propositional form
              </div>
              <div className="mt-1.5 break-words font-mono text-lg leading-relaxed text-accent">
                {result.expanded}
              </div>
            </div>
          </section>

          <section>
            <SectionLabel>03 · Verdict</SectionLabel>
            <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
              <VerdictBadge verdict={result.verdict} />
              <TruthTable atoms={result.atoms} rows={result.rows} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </h2>
  );
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const styles: Record<Verdict, { bg: string; ring: string; label: string; sub: string }> = {
    Valid: {
      bg: "bg-[color:var(--success)]/10",
      ring: "ring-[color:var(--success)]/40",
      label: "text-[color:var(--success)]",
      sub: "true in every interpretation",
    },
    Contingent: {
      bg: "bg-accent/10",
      ring: "ring-accent/40",
      label: "text-accent",
      sub: "true in some, false in others",
    },
    Unsatisfiable: {
      bg: "bg-destructive/10",
      ring: "ring-destructive/40",
      label: "text-destructive",
      sub: "false in every interpretation",
    },
  };
  const s = styles[verdict];
  return (
    <div
      className={`flex flex-col justify-center rounded-lg p-5 ring-1 ${s.bg} ${s.ring} min-w-[180px]`}
    >
      <div className={`font-display text-2xl font-semibold ${s.label}`}>{verdict}</div>
      <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
    </div>
  );
}

function TruthTable({
  atoms,
  rows,
}: {
  atoms: string[];
  rows: { env: Record<string, boolean>; value: boolean }[];
}) {
  if (atoms.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        No atoms — formula is a tautology of structure.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full font-mono text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            {atoms.map((a) => (
              <th key={a} className="px-3 py-2 text-left font-medium">
                {a}
              </th>
            ))}
            <th className="px-3 py-2 text-left font-medium">⊨</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
              {atoms.map((a) => (
                <td
                  key={a}
                  className={`px-3 py-1.5 ${
                    r.env[a] ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {r.env[a] ? "T" : "F"}
                </td>
              ))}
              <td
                className={`px-3 py-1.5 font-semibold ${
                  r.value ? "text-[color:var(--success)]" : "text-destructive"
                }`}
              >
                {r.value ? "T" : "F"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- PRACTICE MODE ----------

const PRACTICE_BANK = [
  "Ax.(p(x) => q(x))",
  "(Ax.(p(x) => q(x))) <=> (~Ex.p(x) | Ax.q(x))",
  "Ax.Ey.(p(x) & ~p(y))",
  "Ax.(q(x) | ~p(x))",
  "(Ex.r(x)) => (Ay.(p(y) | q(y)))",
  "Ax.Ey.(p(x,y) => p(y,x))",
  "Ax.p(x) => Ex.p(x)",
  "Ex.p(x) => Ax.p(x)",
  "Ax.(p(x) & ~p(x))",
  "Ex.p(x) | Ex.~p(x)",
  "Ax.(p(x) | q(x)) => (Ax.p(x) | Ax.q(x))",
  "(Ax.p(x) & Ax.q(x)) <=> Ax.(p(x) & q(x))",
  "Ax.Ay.(r(x,y) => r(y,x))",
  "~Ax.p(x) <=> Ex.~p(x)",
  "Ax.p(x) & Ex.~p(x)",
];

function pickRandom<T>(arr: T[], not?: T): T {
  if (arr.length <= 1) return arr[0];
  let pick = arr[Math.floor(Math.random() * arr.length)];
  while (pick === not) pick = arr[Math.floor(Math.random() * arr.length)];
  return pick;
}

function PracticeMode() {
  const [problem, setProblem] = useState(() => pickRandom(PRACTICE_BANK));
  const [pick, setPick] = useState<Verdict | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const solved = useMemo(() => {
    try { return { ok: true as const, ...solve(problem) }; }
    catch (e) { return { ok: false as const, error: (e as Error).message }; }
  }, [problem]);

  const next = () => {
    setProblem(pickRandom(PRACTICE_BANK, problem));
    setPick(null);
    setRevealed(false);
  };

  const submit = (v: Verdict) => {
    if (revealed || !solved.ok) return;
    setPick(v);
    setRevealed(true);
    setScore((s) => ({
      right: s.right + (v === solved.verdict ? 1 : 0),
      total: s.total + 1,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <SectionLabel>Practice</SectionLabel>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Classify the formula. After you answer, the expansion and truth table reveal so you
            can check your reasoning.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2 text-right">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            score
          </div>
          <div className="font-display text-xl font-semibold">
            {score.right} <span className="text-muted-foreground">/ {score.total}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Formula
        </div>
        <div className="mt-2 break-words font-mono text-2xl leading-relaxed">
          {solved.ok ? solved.original : problem}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(["Valid", "Contingent", "Unsatisfiable"] as Verdict[]).map((v) => {
          const isPick = pick === v;
          const isCorrect = solved.ok && solved.verdict === v;
          const state =
            !revealed
              ? "idle"
              : isCorrect
                ? "correct"
                : isPick
                  ? "wrong"
                  : "dim";
          return (
            <button
              key={v}
              onClick={() => submit(v)}
              disabled={revealed}
              className={`group relative rounded-lg border p-5 text-left transition ${
                state === "idle"
                  ? "border-border bg-card hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                  : state === "correct"
                    ? "border-[color:var(--success)]/50 bg-[color:var(--success)]/10"
                    : state === "wrong"
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-border bg-card opacity-50"
              }`}
            >
              <div className="font-display text-lg font-semibold">{v}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {v === "Valid" && "always true"}
                {v === "Contingent" && "sometimes true"}
                {v === "Unsatisfiable" && "never true"}
              </div>
              {state === "correct" && (
                <div className="mt-3 font-mono text-xs uppercase tracking-widest text-[color:var(--success)]">
                  ✓ answer
                </div>
              )}
              {state === "wrong" && (
                <div className="mt-3 font-mono text-xs uppercase tracking-widest text-destructive">
                  ✗ your pick
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && solved.ok && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <SectionLabel>Worked expansion</SectionLabel>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="break-words font-mono text-base leading-relaxed text-accent">
                {solved.expanded}
              </div>
            </div>
            <TruthTable atoms={solved.atoms} rows={solved.rows} />
          </motion.section>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <button
          onClick={next}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {revealed ? "Next problem →" : "Skip →"}
        </button>
      </div>
    </div>
  );
}
