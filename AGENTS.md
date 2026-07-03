# AGENTS — Lumi Mobile

React Native / Expo frontend. Trước khi sửa code, đọc:

- `CLAUDE.md` — architectural constraints, business rules, high-risk areas.
- `PROJECT_GUIDE.md` — source structure, naming conventions, feature layout.

Tóm tắt cấu trúc (chi tiết trong `PROJECT_GUIDE.md`):

- Kiến trúc route mỏng + feature dày: `src/app/` (Expo Router) chỉ routing; business code trong `src/features/<feature>/` (`screens/`, `components/`, `hooks/`, `service/`, `stores/`, `types/`, `schemas/`, `utils/`, `contexts/`).
- Không dùng `src/modules/`. File/folder kebab-case; component PascalCase; hook `use-*`.
- Route file `export default`; ngoài `src/app/` dùng named export.
- Import xuyên feature dùng alias (`@features/*`, `@components/*`, `@utils/*`...); nội bộ feature dùng relative.
- Style bằng `createStyles(({ colors, textPresets }) => ...)` ở cuối file `.tsx`; không tách file style riêng; không hardcode hex khi có token.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Tiktok-live-mobile** (2278 symbols, 5293 relationships, 180 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Tiktok-live-mobile/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Tiktok-live-mobile/clusters` | All functional areas |
| `gitnexus://repo/Tiktok-live-mobile/processes` | All execution flows |
| `gitnexus://repo/Tiktok-live-mobile/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
