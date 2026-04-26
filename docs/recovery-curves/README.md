# Recovery Curves — Methodology and Sources

This directory documents the physiological recovery model used by Soma.
Every numeric value in the seed data (`apps/api/prisma/seed.ts`) is traceable
to one of these documents, and every document traces each value back to
peer-reviewed literature or established clinical guidelines.

## Scope

Soma models the recovery of specific organs and brain structures following
cessation of chronic substance use. The model covers four substances in v1:

- Alcohol (`alcohol.md`)
- Nicotine (`nicotine.md`)
- Cannabis (`cannabis.md`)
- Cocaine (`cocaine.md`)

## Document format

Each substance document contains:

1. **Summary** — pharmacological category, primary organ systems affected.
2. **Damage profiles** — one row per affected organ, with:
   - `maxSeverity` (0-100): severity under chronic typical use.
   - `confidenceLevel` (high / medium / low): strength of supporting evidence.
   - Reference source.
3. **Recovery curves** — one row per affected organ, with:
   - `shape` (logarithmic / sigmoidal / linear / stepwise).
   - `daysTo95Recovery`: days to reach 95% of asymptotic recovery.
   - `recoveryCeiling` (0-1): maximum achievable recovery relative to
     pre-use baseline. Values below 1.0 indicate partially irreversible damage.
   - `confidenceLevel`.
   - Reference source.
4. **Achievements** — physiological milestones surfaced to the user as
   in-app achievements, each tied to a specific organ+substance+threshold.
5. **Validation status** — list of references pending external verification.

## Confidence levels

- **high**: broad clinical consensus, multiple longitudinal studies, established
  clinical guidelines. Example: hepatic regeneration timeline in alcohol
  abstinence.
- **medium**: solid literature but notable interindividual variability or
  limited sample sizes. Example: dopaminergic receptor renormalization
  post-cocaine.
- **low**: emerging evidence, preliminary studies, or values extrapolated
  from animal models. The UI surfaces uncertainty visually for these.

## Limitations of the model

This model is a **simplification** of human physiology for visualization
purposes. It is not a diagnostic tool and does not substitute medical advice.
Key limitations:

- **Interindividual variability is not modeled per-user.** Values represent
  population averages under standard conditions (no comorbidity, no
  polysubstance use).
- **Polysubstance use is additive in the current model.** Real synergies
  (e.g., alcohol + cocaine producing cocaethylene, which is hepatotoxic
  beyond either substance alone) are not captured in v1.
- **Severity scales are normalized for visualization.** `maxSeverity = 80`
  does not mean "80% of maximum possible organ damage in medical terms."
  It means "80 on a 0-100 scale internal to Soma, calibrated so the visual
  color gradient is informative."
- **Curves assume clean abstinence.** Relapse events are not currently
  modeled; the curve resets on the `lastUseDate` of the most recent use.

## Reference format

References follow APA 7th edition with DOI where available. Two markers
are used:

- `[VERIFIED]` — reference confirmed against external sources.
- `[NEEDS-VERIFICATION]` — citation proposed based on domain knowledge
  but not yet confirmed against a live database (PubMed, DOI.org).
  DOIs marked `TBD` in these cases.

No value in the seed data should ship to production with
`[NEEDS-VERIFICATION]` references unresolved.

## Versioning

When a new study updates a recovery curve:

1. Update the numeric value in the document.
2. Update the reference.
3. Bump the `updatedAt` in seed data (migration if needed).
4. Note the change in a `CHANGELOG.md` entry (to be added when the first
   update happens).