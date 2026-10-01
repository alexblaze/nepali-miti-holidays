# Contributing to nepali-miti-holidays

Thanks for helping! Payroll, attendance and deadline systems rely on this data, so accuracy comes first.

## Reporting a wrong holiday

Open a [holiday data issue](https://github.com/alexblaze/nepali-miti-holidays/issues/new?template=calendar_data.md) with:

- the BS year, the holiday and what is wrong (date, name or scope);
- a link to an official source (Nepal Gazette notice, Ministry of Home Affairs notice or announcement).

## Setup

Requires Node.js 22+ for development.

```sh
git clone https://github.com/alexblaze/nepali-miti-holidays.git
cd nepali-miti-holidays
npm install
```

## Development workflow

| Command                 | What it does                                |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Rebuild `dist/` on change                   |
| `npm test`              | Run the test suite (Vitest)                 |
| `npm run coverage`      | Tests with coverage thresholds              |
| `npm run lint`          | ESLint, Prettier check and `tsc` type check |
| `npm run format`        | Apply Prettier                              |
| `npm run build`         | Build ESM, CJS and type declarations        |
| `npm run check:package` | `publint` and `@arethetypeswrong/cli`       |

Run the tests in another timezone to catch timezone bugs: `TZ=Pacific/Kiritimati npm test`.

## Pull requests

- No runtime dependencies besides the `nepali-miti` peer dependency.
- Add tests for every behaviour change. Holiday data changes must cite the official notice and its clause.
- Public API changes need README and CHANGELOG updates (under `## [Unreleased]`).
- Use [Conventional Commits](https://www.conventionalcommits.org/): `fix: …`, `feat: …`, `docs: …`, `data: …`
  (holiday data), `chore: …`.
- CI must pass: lint, tests on Node.js 22/24 in several timezones, build, package checks.

## Release process (maintainers)

1. Update `CHANGELOG.md` and bump the version: `npm version patch|minor|major`.
   - patch: bug fixes; minor: new features or new holiday years; major: breaking API changes.
2. `git push --follow-tags`.
3. Create a GitHub Release from the tag. The `publish` workflow then publishes to npm with provenance using
   npm trusted publishing (OIDC). No npm token is stored in the repository.
