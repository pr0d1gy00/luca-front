# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| when implementing a change, preparing commits, splitting PRs | work-unit-commits | C:\Users\mendo\.config\opencode\skills\work-unit-commits\SKILL.md |
| when drafting or posting feedback, review comments, maintainer replies | comment-writer | C:\Users\mendo\.config\opencode\skills\comment-writer\SKILL.md |
| when creating a GitHub issue, reporting a bug, requesting a feature | issue-creation | C:\Users\mendo\.config\opencode\skills\issue-creation\SKILL.md |
| when creating a pull request, opening a PR | branch-pr | C:\Users\mendo\.config\opencode\skills\branch-pr\SKILL.md |
| When writing Go tests, using teatest, or adding test coverage | go-testing | C:\Users\mendo\.config\opencode\skills\go-testing\SKILL.md |
| when requesting a judgment day, adversarial review | judgment-day | C:\Users\mendo\.config\opencode\skills\judgment-day\SKILL.md |
| when creating new AI skills, adding agent instructions | skill-creator | C:\Users\mendo\.config\opencode\skills\skill-creator\SKILL.md |

## Project Skills (luca-front)

| Trigger | Skill | Path |
|---------|-------|------|
| Next.js best practices, file conventions, RSC, data patterns | next-best-practices | C:\Users\mendo\Downloads\luca-front\.agents\skills\next-best-practices\SKILL.md |
| shadcn/ui components, adding, fixing, debugging, styling | shadcn | C:\Users\mendo\Downloads\luca-front\.agents\skills\shadcn\SKILL.md |
| Tailwind CSS styling, responsive design, layout utilities | tailwind-css-patterns | C:\Users\mendo\Downloads\luca-front\.agents\skills\tailwind-css-patterns\SKILL.md |
| Zod schema validation, type inference, error handling | zod | C:\Users\mendo\Downloads\luca-front\.agents\skills\zod\SKILL.md |
| React Hook Form optimization, useForm, useWatch, useController | react-hook-form | C:\Users\mendo\Downloads\luca-front\.agents\skills\react-hook-form\SKILL.md |
| building web components, pages, React interfaces, styling | frontend-design | C:\Users\mendo\Downloads\luca-front\.agents\skills\frontend-design\SKILL.md |
| improving accessibility, a11y audit, WCAG compliance | accessibility | C:\Users\mendo\Downloads\luca-front\.agents\skills\accessibility\SKILL.md |
| SEO optimization, meta tags, structured data | seo | C:\Users\mendo\Downloads\luca-front\.agents\skills\seo\SKILL.md |
| Next.js upgrade, migration guides, codemods | next-upgrade | C:\Users\mendo\Downloads\luca-front\.agents\skills\next-upgrade\SKILL.md |
| Next.js 16 Cache Components, PPR, use cache, cacheLife | next-cache-components | C:\Users\mendo\Downloads\luca-front\.agents\skills\next-cache-components\SKILL.md |
| Node.js backend, Express, middleware, auth, API design | nodejs-backend-patterns | C:\Users\mendo\Downloads\luca-front\.agents\skills\nodejs-backend-patterns\SKILL.md |
| Node.js development principles, framework selection | nodejs-best-practices | C:\Users\mendo\Downloads\luca-front\.agents\skills\nodejs-best-practices\SKILL.md |
| React composition patterns, compound components, render props | composition-patterns | C:\Users\mendo\Downloads\luca-front\.agents\skills\composition-patterns\SKILL.md |
| TypeScript advanced types, generics, conditional types | typescript-advanced-types | C:\Users\mendo\Downloads\luca-front\.agents\skills\typescript-advanced-types\SKILL.md |
| Tailwind v4 with shadcn/ui, dark mode, theming | tailwind-v4-shadcn | C:\Users\mendo\Downloads\luca-front\.agents\skills\tailwind-v4-shadcn\SKILL.md |
| React/Next.js performance optimization, bundle analysis | react-best-practices | C:\Users\mendo\Downloads\luca-front\.agents\skills\react-best-practices\SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### work-unit-commits
- Commit by work unit, not by file type
- Keep tests with the code they verify
- Tell a story reviewer can follow
- If change exceeds 400 lines, split into chained PR slices
- Use Conventional Commits: `type(scope): description`

### comment-writer
- Start with the actionable point
- Be warm and direct, sound like a teammate
- Keep it short: 1-3 paragraphs or tight bullet list
- Give technical reason when asking for changes
- Write in thread's language (Spanish uses voseo)

### issue-creation
- Use bug report or feature request template
- Every issue gets status:needs-review automatically
- Maintainer must add status:approved before PR
- Questions go to Discussions, not issues

### branch-pr
- Every PR must link an approved issue
- Branch naming: `type/description` (lowercase, no spaces)
- Add exactly one `type:*` label
- Use Conventional Commits

### go-testing
- Use table-driven tests for multiple cases
- Test Model state transitions directly
- Use teatest.NewTestModel() for TUI flows
- Use golden file testing for visual output
- Mock system dependencies for deterministic tests

### next-best-practices
- Server Components by default, add 'use client' only for interactivity
- Use next/image over <img>
- Use next/font for Google Fonts
- Async params/searchParams in Next.js 15+
- Avoid data waterfalls with Promise.all or preload

### shadcn
- Use existing components before custom UI
- Use FieldGroup + Field for forms, never raw divs
- No space-y-*, use gap-* with flex
- Use cn() for conditional classes
- Icons in Buttons use data-icon prop
- Run npx shadcn@latest docs before working with components

### tailwind-css-patterns
- Mobile-first: base styles for mobile, sm:/md:/lg: for larger
- Use design tokens (spacing, color, typography scales)
- Extract repeated patterns into components
- Compose utilities, avoid @apply
- Dark mode with dark: prefix

### zod
- Use safeParse() for user input, never parse()
- Define string validations at schema level
- Use z.infer for type inference
- Provide custom error messages
- Use strict() vs strip() deliberately
- Export both schemas and inferred types

### react-hook-form
- Always provide defaultValues
- Use onSubmit mode for optimal performance
- Use useWatch instead of watch for isolated re-renders
- Watch specific fields, not entire form
- Use useController for controlled UI components
- Define schema outside component for resolver caching

### frontend-design
- Commit to a bold aesthetic direction
- Choose distinctive typography
- Use CSS variables for consistency
- Prioritize CSS animations over JS libraries
- Create unexpected layouts, asymmetry
- Never use Inter, Roboto, or purple gradients

### accessibility
- Follow WCAG 2.2 guidelines
- Proper heading hierarchy (h1-h6)
- Focus indicators visible
- ARIA labels for interactive elements
- Keyboard navigation for all features

### seo
- Use semantic HTML
- Proper meta tags and og:image
- Structured data (JSON-LD)
- Sitemap and robots.txt
- Semantic heading hierarchy

### composition-patterns
- Avoid boolean prop proliferation
- Use compound components pattern
- Use render props for flexibility
- Context Provider for shared state
- React.memo for expensive children

### typescript-advanced-types
- Use generics for reusable utilities
- Conditional types for branching logic
- Branded types for domain safety
- mapped types for transformations
- Template literal types for string manipulation

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | C:\Users\mendo\Downloads\luca-front\AGENTS.md | Main project guidelines |

Read these convention files for project-specific patterns and rules. All referenced paths have been extracted - no need to read index files to discover more.