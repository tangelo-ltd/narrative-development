# nara adopt

Onboards an existing codebase into Narrative Development by creating a `nara/` narrative layer.

---

## Purpose

`nara adopt` adds Narrative Development to an existing project **without modifying any existing files**. All narrative artifacts are created under a top-level `nara/` directory, parallel to existing source code.

This is the canonical way to introduce Narrative Development to an existing codebase.

---

## Command

```
nara adopt [options]
```

### Flags

| Flag | Description |
|------|-------------|
| `--name <name>` | Project name (default: directory name) |
| `--desc <description>` | Project description |
| `--merge` | Populate missing files when `nara/` already exists (never overwrites) |
| `--force` | Overwrite existing files under `nara/` |
| `--inventory` | Run a read-only inventory pass and populate `specs/inventory/codebase-map.md` |

---

## What Gets Created

All files are created under `nara/` in the repository root:

```
existing-project/
├── src/                    # Existing code (UNTOUCHED)
├── package.json            # Existing config (UNTOUCHED)
├── ...                     # Other existing files (UNTOUCHED)
└── nara/                   # NEW: Narrative layer
    ├── INDEX.md            # Single entry point
    ├── AGENTS.md           # AI entry point
    ├── NARA.md             # Tooling contract
    ├── nara.json           # Project config
    ├── .gitignore          # Ignores .nara/ state
    ├── reports/            # Onboarding findings
    │   ├── onboarding-report.md
    │   └── issues.md
    └── specs/
        ├── manifest.md
        ├── glossary.md
        ├── conventions/
        │   ├── index.md
        │   ├── atomic-stories.md
        │   ├── rfc-keywords.md
        │   └── naming-and-ids.md
        ├── inventory/
        │   └── codebase-map.md
        └── stories/
            └── _template.md
```

Optional (not created by default):

```
nara/generated/
```

---

## Safety Guarantees

`nara adopt` MUST:

1. **Never write outside `nara/`** — existing code is untouched
2. **Never overwrite existing files** unless `--merge` or `--force` is provided
3. **Never overwrite `nara/AGENTS.md`** unless `--force` is provided
4. **Never modify repository root files** (including root `.gitignore`)
5. **Never assume project structure** — works with any codebase

---

## Conflict Handling

Before writing files:

- If `nara/` exists: fail unless `--merge` or `--force` is provided
- If `nara/AGENTS.md` exists: never overwrite unless `--force`
- If filesystem permissions prevent writes: fail with an actionable error

`--merge` adds missing seed files only. `--force` overwrites any existing files under `nara/`.

---

## Inventory Pass (Optional)

When `--inventory` is provided, `nara adopt` performs a **read-only** analysis pass and writes:

```
nara/specs/inventory/codebase-map.md
```

The inventory pass MUST:

- Only read files
- Never execute project code
- Record uncertainty explicitly as assumptions

The codebase map SHOULD include:

- Primary entry points (build/start scripts)
- Main directories and their roles
- Detected frameworks (best-effort)
- Key modules/services
- External integrations (best-effort)
- Data stores (best-effort)

---

## Story Bootstrapping (Optional)

Onboarding MAY create a small number of story placeholders when explicitly requested by the user. Default: **0 stories created**.

If bootstrapping is enabled in a future release, each created story MUST include:

- `## Existing Implementation` with code paths
- `## As Implemented` describing current behavior

---

## Mirroring Rule: Describe Reality First

During onboarding, specs MUST initially reflect reality.

Stories should distinguish:

- **As Implemented** — what the code does today
- **Intended Behavior** — what you want it to do

For existing projects, stories SHOULD begin as “As Implemented” narratives and evolve into “Intended Behavior” over time.

See [files/formats.md](../files/formats.md) for section rules.

---

## Reporting

After mirroring, `nara adopt` SHOULD generate an onboarding report:

```
nara/reports/onboarding-report.md
```

The report may include:

- Missing or inconsistent error handling patterns
- Duplicated logic
- Suspicious mismatches (e.g., function name suggests “read” but writes)
- Inconsistent naming vs behavior
- Unreachable or unused modules (best-effort)
- Spec gaps (areas where intent cannot be inferred)

The report MUST separate:

- Observed behavior
- Inferred behavior
- Uncertain, needs confirmation

Follow-up issues may be tracked in:

```
nara/reports/issues.md
```

---

## Detection

After `nara adopt`, the project is detected as a nara project by the presence of:
- `nara/NARA.md`, or
- `nara/nara.json`

All subsequent commands (`story`, `status`, `detect`, etc.) automatically use `nara/` as the narrative root.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Adoption successful |
| 1 | Unsafe state (existing `nara/` without merge/force, invalid flags) |
| 2 | Write failure |

---

## Difference from `nara init`

| Aspect | `nara init` | `nara adopt` |
|--------|-------------|--------------|
| Use case | Fresh Narrative Development repo | Existing codebase |
| Narrative root | Repository root | `nara/` subdirectory |
| Files at root | AGENTS.md, NARA.md, specs/ | Only creates `nara/` |
| Existing files | Fails if NARA.md exists | Never touches existing files |

---

## Example Usage

```bash
cd ~/projects/my-existing-app
nara adopt --name "My App" --desc "Backend API service"

# Creates nara/ with full narrative structure
# Existing src/, package.json, etc. are untouched

nara status
# Reports: Narrative root: nara/
#          Stories: 0
```

---

## Implementation Notes

- Create `nara/` directory first
- Copy seed files into `nara/` (not repo root)
- Set `narrativeRoot: "nara"` in `nara/nara.json`
- All paths in config are relative to narrative root
