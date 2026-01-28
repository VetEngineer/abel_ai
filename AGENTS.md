# Repository Guidelines

## Project Structure and Module Organization
- `src/app/` holds the Next.js App Router pages and API routes (e.g., `src/app/api/demo/`).
- `src/components/` contains reusable UI components; `src/lib/` hosts shared utilities, agents, and Supabase clients.
- `src/agents/` contains individual agent implementations; `src/types/` stores TypeScript types.
- `supabase/` includes Edge Functions and database migrations.
- `docs/` and `config/` store documentation and configuration files.

## Build, Test, and Development Commands
- `npm run dev`: start the Next.js dev server on port 3000.
- `npm run build`: create a production build.
- `npm run start`: run the production server after build.
- `npm run lint`: run Next.js ESLint rules.
- `npm run type-check`: run `tsc --noEmit` for type safety.
- `npm run test` / `npm run test:watch`: run Jest tests.
- `npm run supabase:start`: start the local Supabase stack.

## Coding Style and Naming Conventions
- Use 2-space indentation and single quotes, matching existing files in `src/`.
- Prefer TypeScript in `src/` and keep React components in `PascalCase` (e.g., `ContentCreationForm.tsx`).
- Use `camelCase` for functions/variables and `useSomething` for hooks.
- Keep agent class names descriptive (e.g., `TrendKeywordAgent`) and colocate related logic in `src/lib/agents/`.
- Use the `@/` import alias for `src/` paths.

## Testing Guidelines
- Jest with `@testing-library/react` is configured in `jest.config.js`.
- Place tests in `__tests__/` or use `*.test.ts(x)` / `*.spec.ts(x)` naming.
- Coverage is collected from `src/`, excluding type definitions and story files.
- Run focused tests with `npm run test -- path/to/test`.

## Commit and Pull Request Guidelines
- Use short, imperative commit subjects (e.g., `Implement agent workflow`); emojis are optional.
- Keep commits scoped to a single change when possible.
- PRs should include a clear summary, test status, and linked issues.
- Add screenshots or clips for UI changes.

## Configuration and Secrets
- Copy `.env.example` to `.env.local` and keep secrets out of Git.
- Supabase-related settings live under `supabase/`; regenerate types with `npm run supabase:generate-types` after schema changes.
