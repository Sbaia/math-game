# Wiz Codex Always-On

This file contains Wiz runtime guidance for Codex. It is copied to `.wiz/wiz-codex.md` by SessionStart and referenced from the repository `AGENTS.md`.

## Runtime Contract

Follow these Wiz instructions unless they conflict with higher-priority Codex or repository instructions. Key mappings: use `git commit -F -` for multiline commit messages, always quote heredoc delimiters as `<<'EOF'`, use `$wiz:plan` for Wiz planning, and use `$wiz:stories create` for work-item creation. Treat legacy `/wiz:*` wording as the matching `$wiz:*` Codex skill name.

- Use `wiz.codex/bin/wiz-run` or `wiz-run` for Wiz scripts.
- Prefer Wiz Codex skills for Wiz workflows: `$wiz:plan`, `$wiz:work`, `$wiz:review`, `$wiz:stories`, `$wiz:status`, `$wiz:remember`, and `$wiz:handoff`.
- Project runtime state is stored under `.wiz/`. SessionStart moves any legacy `.claude/wiz/` tree into `.wiz/` and deletes it. Never read or write `.claude/wiz/`.
- HUD uses the shared daemon socket at `~/.wiz/hud/sync/daemon.sock` unless `WIZ_HUD_HOME`, `HUD_SYNC_DIR`, or `HUD_SOCKET_PATH` overrides it.

## Session Start

- Print the Mission Control URL from the system reminder; never open its tab.

## Language

- Reply to the user in the language used by the user.
- Write repository artifacts in English unless explicitly requested otherwise, but only when the target file or artifact is not excluded by the repository's `.gitignore`.
- When not excluded by `.gitignore`, repository artifacts include code, comments, documentation, plans, stories, acceptance criteria, worklogs, reviews, commit messages, and PR content.
- Artifacts excluded by `.gitignore` may use the conversation language unless repository-specific instructions say otherwise.
- Write English artifacts in ASD-STE100 Simplified Technical English. Published/marketing content → `wiz:ls-style-editor` wins.

## Engineering Quality

- Keep project instructions in `AGENTS.md`; maintain `CLAUDE.md` as a relative symlink to its sibling `AGENTS.md`. Edit only the canonical file.
- Before converting existing instruction files, read both, preserve unique rules, and resolve conflicting policies explicitly; do not overwrite unique content or replace the symlink with a copy.

<ground_truth_first>
Verify claims about code behavior, versions, counts, timing, and paths with repository search, file reads, or shell tools before you state them, because a confident guess about a repository causes real defects.
- Before you modify unfamiliar code, read the file, its callers, its callees, and related tests.
- Do not extrapolate beyond tool output. Reference the source.
- If no tool can verify a claim, say that you do not know and name what you would check.

Self-check: the answer is a guess if it contains one of these without a tool call that supports it:
- A number or version that is not in the user's message or in tool output
- "This works by..." or "It should..."
- A file path not already loaded in context
- "There is no...", "doesn't exist", or "not implemented"
</ground_truth_first>

- Apply hexagonal architecture (ports and adapters). Details and exceptions: W-GEN-ARCH in `standards/coding/general.md` under the Wiz plugin root (`wiz-run --root`).
- Before any non-trivial task, state explicit success criteria and loop until they are verified.
- When codebase patterns conflict, choose one based on recency or test coverage, explain the choice, and flag the other for cleanup. Do not blend conflicting patterns.
- Write the minimum code that solves the problem. Do not add speculative features or single-use abstractions.
- Touch only what the task requires. Match the existing style and do not improve adjacent code, comments, or formatting.
- Fix small improvements inherent to the task. Record unrelated observations as `IMPROVEMENT:` notes in the recap or handoff without expanding scope.
- Push back on bad ideas with specific technical reasons. If it is only intuition, say "let me play devil's advocate".
- Do not stop until tracked tasks are complete; check their status after each step.
- Ask the user before you discard or rewrite an existing implementation, unless an approved plan step already authorizes it.
- Do not run broad searches of `~`, `$HOME`, or other paths outside the project. You may read an exact path that an instruction or the task names.
- Never silently skip work. Surface uncertainty and incomplete verification.

## Fix Quality Gates

- When the same code has had 3 or more fixes or reverts (check `git log` for the file), stop patching. Map every state and caller first, then design a fix that removes the cause, because repeated local fixes show that the model of the code is incomplete.
- Prefer a fix that removes code or merges duplicate paths. Two code paths for one state transition can race, so merge them.
- A guard, flag, or exception is correct at a trust boundary or for a named invariant. In other cases, name the root cause that it handles; if you cannot, it is a symptom patch.
- Before you implement a fix, compute its worst case with concrete numbers (timing, boundaries, cardinality). One passing test does not prove the fix.
- For each bug fix, list 3 or more adjacent scenarios (boundary values, sibling callers, the same input class). Write a test only for a scenario with a named plausible bug (W-GEN-BEHAVIOR-TESTS); report the others as checked.
- When deferring work, add an inline `DEFERRED (YYYY-MM-DD)` comment with the rationale.

## Git

Minimize tool round-trips by batching related Git operations into a single shell call.

```bash
# You made the changes and the user or the active workflow asked for a commit:
git add <files> && git commit -F - <<'EOF'
type(scope): description
EOF

# You did not make the changes: inspect context before staging or committing.
git status && git diff --staged && git diff && git log --oneline -5
```

**Authorization:**
- Push or create a PR only with explicit user authorization; otherwise stop and ask the user.
- Create or switch a branch only after the user names or approves it, because the user can run parallel sessions in the same checkout. Otherwise ask the user for the branch.
- Commit to `main` only with explicit user authorization; otherwise ask the user for a branch. A workflow request to commit does not authorize commits to `main`.
- Amend a pushed commit only on explicit request; otherwise add a new commit.
- Always quote heredoc delimiters: `<<'EOF'`.

**Branch naming:** Use a valid Jira prefix plus 1-8 digits (`ACME-`, `LAN-`, `ESAP-`, `FING-`, `CDKC-`, `PLAT-`, `ENSE-`, `POC-`). Prefer `ACME-XXXXX/desc` for Jira work and `POC-XXXXX/desc` for plans. Repository instructions may override this.

**Commit hygiene:** Commit when the user or the active Wiz workflow (for example `$wiz:work`) asks for commits, and then commit each completed step. Run `git status` before any `git add -A`. Never skip or evade pre-commit hooks. Never add `Co-Authored-By`. Include `#story-id` for traceability: `feat(scope): desc (#001-ab12)`. Use `closes` for the closing commit after story completion: `feat(scope): desc (closes #001-ab12)`.

When a workflow updates tracked story files, stage those stories with the related changes. Do not treat stories as disposable runtime files.

## Testing

- Write and review tests per W-GEN-BEHAVIOR-TESTS in `standards/coding/behavior-tests.md` under the Wiz plugin root: independent oracle, module boundary, one named plausible bug per test. No named bug means no test. Never mock in E2E tests.
- Test output must contain no unexpected stdout or stderr noise. Capture and validate expected errors.
- For load, batch, or performance runs, run a small size first, then increase only the size.

## Proactiveness

Act immediately on clear tasks: start the first tool call instead of asking whether to proceed. In addition to the Git authorization rules and the stops that a skill defines, pause only when:
- Multiple valid approaches exist and the choice matters.
- The action deletes or restructures existing code, unless an approved plan step already authorizes it.
- The request is not understood.
- The user asks how to approach the work rather than asking for implementation.

## Subagent Delegation

Delegate to isolate context or parallelize independent work. Do not delegate when the parent needs the reasoning directly.

| Model | Use for | Effort |
| --- | --- | --- |
| `gpt-5.6-luna` | Tests, builds, validation, CI, evidence collection, bulk mechanical work | Low unless justified |
| `gpt-5.6-terra` | Bounded contract work, scoped research, code exploration, architecture reading | Low unless justified |
| `gpt-5.6-sol` | Leads, ambiguous implementation, planning, tradeoffs, cross-cutting decisions | xHigh for a critical decision, medium for a lead, low for bounded work |

- Use exact model names. No aliases and no substitutes.
- Use the least expensive model that fits the task.
- Maximum delegation depth is two levels; a subagent does not delegate further.
- If a subagent needs a stronger model, it returns partial results to the parent for re-tasking.
- The parent owns final output and synthesis across delegated work.
- Generated custom agents live under `.codex/agents/` and may provide role-specific instructions or model settings.

**Assignment.** Every delegation states:

| Field | Content |
| --- | --- |
| Objective | The exact result, and the definition of done |
| Ownership | The paths the subagent may write. One owner per path |
| Working directory | The final absolute cwd. Spawn there — a later `cd` does not move the session |
| Exclusions | Paths, files, and operations that stay untouched |
| Authority | Git mutation, expensive gates, and network calls: granted or withheld, explicitly |
| Validation | The exact scope, command, or runbook that proves the result |
| Handoff | The required `RESULT` or `BLOCKED` shape |
| Continuation | The next queued batch, when the subagent owns more than one |

Pass the relevant rules and the current state. Exclude unrelated history.

**Authority.**

- Withhold Git mutation by default. Commit, merge, rebase, push, and publication need explicit grant.
- The parent owns expensive gates (full builds, container runs, cross-target work). Serialize them.
- Read-only unless the assignment grants ownership.
- Shared contracts (schema, API, wire format) stay unchanged unless the assignment names them.
- Preserve unrelated and pre-existing changes. Never copy changes between worktrees without proving source equivalence.

**Spawn and liveness.**

- Give each subagent a stable descriptive name.
- Verify the running model from process arguments or the settled session, not from the spawn request.
- Prefer one event-driven wait. No polling loops and no chained short waits.
- Idle with no output movement: resend the complete assignment once, then record the anomaly. A ready prompt is not proof of delivery.
- Never re-task after a `RESULT` or `BLOCKED`. Re-task on the completion event instead.
- Close consumed subagents. Keep only sessions with active or recoverable uncommitted state.

**Handoff.** The subagent returns `RESULT` or `BLOCKED`:

- `RESULT`: what changed, the files, the validation output that proves it, the Git scope and commit SHA when it committed, and the authority it used.
- `BLOCKED`: the exact missing authority, dependency, or evidence. No partial claim presented as done.

## Issue Ownership

- The parent owns every failure it observes, until the failure is fixed or recorded as a concrete blocker.
- Never ignore, defer, or reclassify a failure because it is pre-existing, unrelated to the current change, or owned by another worker.
- Stop dependent steps while an observed failure has no explanation.

## Stories

- Create stories with `$wiz:stories create '{"priority":"P2","type":"feature","title":"...","problem":"...","criteria":["..."]}'`; do not use generic task creation for story creation.
- Use `$wiz:stories` or `wiz-run stories-cli.js` for story lifecycle work. Task status, query, and dependency operations intercepted by Wiz are safe for their intended use.
- Write the worklog before a status transition. Completion is blocked while any acceptance criterion is unmet. Verify every criterion as `- [x]`. Only criteria tagged `[MANUAL]`, `[VISUAL]`, or `[HUMAN]` by the creator may be skipped as `- [~]`.
- Pre-existing implementation is not proof of completion. Verify every criterion, edge case, and requirement against the code.
- Stories created from plans must include both `plan` and `plan_step` fields.
- Story files may be staged and committed with their related work when they are tracked by Git.

## Sub-Tasks

Bind a story to the session first with `wiz-run stories-cli.js status <id> in_progress`; the Wiz hook binds it through `$SESSION_ID`.
Once bound, intercepted task creation and updates register story sub-tasks as `- [ ] [T1]` and complete them as `- [x] [T1]`.
When all sub-tasks are checked, verify the acceptance criteria before completing the story.

## TDD

- Bug fix: write the test that reproduces the bug first. It must fail on the pre-fix code.
- Feature: write the contract first, then the code and tests, then run the tests once at the end.
- Every `RED:` story criterion names its bug: `RED: <test> — catches: <plausible bug>`.
- Before you write code, answer the reality contract in W-GEN-BEHAVIOR-TESTS (effect, true state, outside world, blast radius):
  - Assert the observable effect, not an internal label.
  - A hand-set state or an assumption about an external system needs evidence or a live check.
  - Record a fixture of an external system from that system.
- The final test run covers every touched module or package.
- Before the commit, run the `tdd-reviewer` agent once on the whole diff. For each fix story in the diff, it runs the new regression test on the pre-fix code, which must fail.

## Planning

Use `$wiz:plan` instead of native plan mode. Wiz plans supersede `SPEC.md`; when both exist, `$wiz:plan` is the source of truth for task planning.

## Team Extensions

Teams create `ls-wiz-{team}` plugins. Repositories may define local extensions in `.claude/extensions/manifest.json`; these are auto-discovered and merged with installed team extensions. `$wiz:review`, `$wiz:plan`, `$wiz:work`, `$wiz:deepen-plan`, `$wiz:workflow`, and `$wiz:stories` auto-load extensions through `extensions.js`. Use `$wiz:team` to install, update, list, validate, or check team plugins.

## Memory

After solving non-trivial problems or receiving user corrections, suggest `$wiz:remember`. Consult memory before complex work.

Canonical entry types are `topic`, `problem`, `decision`, `reminder`, `prior`, and `handoff`. Use `source_type: user_statement` for user-stated knowledge and `source_type: auto_extracted` for synthesized knowledge. When MCP is unavailable, write with `wiz-run mdkb-bridge.js memory-write <id> --title "T" --entry-type <type> --content "C" [--tags a,b]`. The mdkb CLI takes the ID positionally; never use an `--id` flag.

## Session Handoff

Before clearing or ending a session, run `$wiz:handoff` to write the journal handoff and synthesize session memory to mdkb.

## Scripts

Run Wiz scripts as `wiz-run <script.js> [args]`. Use `--root` when the script needs the plugin root.
