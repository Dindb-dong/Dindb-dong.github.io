# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-07-15
- Primary product surfaces: DindbOS desktop, Portfolio app, Projects app, Resume app
- Evidence reviewed: `src/main.js`, `src/portfolio.css`, `src/portfolio-data.js`, the installed `dindbos` runtime styles and APIs, legacy Korean/English portfolio data, and live screenshots at 1440×900 and 390×844

## Brand

- Personality: technically curious, capable, direct, and playful enough to make an operating system the portfolio itself.
- Trust signals: real shipped projects, clear personal ownership and role, working demos/source links, a downloadable resume, and DindbOS as a functioning product rather than a decorative theme.
- Avoid: generic glassmorphism, low-contrast monochrome icons, excessive internal/runtime terminology, card-heavy marketing layouts, decorative gradients, and interactions that require prior knowledge of desktop operating systems.

## Product goals

- Goals: let a recruiter understand who Kim Dong Wook is within seconds; make projects the easiest thing to find and compare; preserve the working DindbOS environment; keep resume and contact actions continuously discoverable.
- Non-goals: hiding the OS runtime, turning the site into a conventional scrolling landing page, or rewriting the underlying portfolio history.
- Success signals: first-time visitors can reach projects and resume without instructions; app icons remain distinguishable at a glance; no clipped navigation or horizontal overflow at supported sizes; primary project information is visible before implementation metadata.

## Personas and jobs

- Primary personas: hiring managers, engineering interviewers, collaborators, and developers evaluating DindbOS.
- User jobs: identify the candidate and specialty; scan representative work; inspect project role, outcome, media, and links; open the resume; contact or visit GitHub.
- Key contexts of use: a short desktop review, a mobile link opened from a message, and a deeper technical exploration of the OS environment.

## Information architecture

- Primary navigation: persistent Portfolio app navigation with Overview, Projects, Experience, Skills, Resume, and Settings; persistent DindbOS dock for broader OS apps.
- Core routes/screens: Overview as the default orientation surface; Projects as a searchable/filterable master-detail view; Experience and Skills as supporting evidence; Resume as a direct document view.
- Content hierarchy: identity and role → primary actions → featured work → capability summary → personal background → runtime/system details.

## Design principles

- Make the unconventional interface immediately understandable: preserve OS metaphors, but pair icons with strong color roles, labels, and clear primary actions.
- Lead with evidence of work: projects and resume outrank archive paths, mount status, and implementation trivia.
- Use one layer of framing at a time: the DindbOS window is the main container, so portfolio content should rely on sections and rules instead of nested translucent cards.
- Tradeoffs: desktop windows may cover more of the wallpaper because portfolio readability is more valuable than showcasing empty desktop space.

## Visual language

- Color: solid cool-gray desktop surfaces, near-black ink, cobalt primary action, amber project/folder role, coral document role, green system/success role; new palette tokens use OKLCH.
- Typography: system sans stack with compact OS chrome and editorial but restrained portfolio headings; no viewport-sized text.
- Spacing/layout rhythm: 4px base with 8/12/16/24/32px steps; dense navigation and spacious reading areas.
- Shape/radius/elevation: 6–8px content radii, 12px OS icon tiles, restrained two-layer neutral shadows for windows and elevated controls.
- Motion: short state transitions only; all non-essential motion disabled under reduced-motion.
- Imagery/iconography: real project screenshots and a locally hosted profile portrait; outline system icons sit on high-contrast, role-colored tiles.

## Components

- Existing components to reuse: DindbOS menubar, desktop icons, dock, window manager, host app registry, project media, and resume document.
- New/changed components: overview action row, project highlights, project search, result count, mobile portfolio tabs, stronger icon palette, and local portrait fallback.
- Variants and states: default/hover/focus/selected filters and projects, empty search result, mobile stacked detail, reduced motion, and image fallback.
- Token/component ownership: OS chrome overrides and portfolio tokens live in `src/portfolio.css`; portfolio markup and behavior live in `src/main.js`.

## Accessibility

- Target standard: WCAG 2.2 AA for the primary portfolio flows.
- Keyboard/focus behavior: all navigation, filters, project rows, and actions use native controls with visible focus; project list selection exposes `aria-selected`.
- Contrast/readability: text and icons meet contrast on solid surfaces; color is reinforced by icon shape and text labels.
- Screen-reader semantics: one main content region per app view, ordered headings, named navigation/groups, useful image alternatives, and live project-result status.
- Reduced motion and sensory considerations: respect `prefers-reduced-motion`; avoid essential hover-only information and decorative animation.

## Responsive behavior

- Supported breakpoints/devices: 1440×900 desktop, 1024×768 tablet, and 390×844 mobile, with resilience from 320px upward.
- Layout adaptations: windows use the available viewport; the overview and project master-detail layout collapse to one column; side navigation becomes a compact horizontally scrollable tab row with visible edge behavior.
- Touch/hover differences: 44px minimum mobile targets; labels remain visible where tooltips cannot be relied on.

## Interaction states

- Loading: DindbOS boot status remains the runtime loading affordance.
- Empty: project search/filter shows a clear reset action and result count.
- Error: broken profile media is replaced by an initial mark; project media keeps meaningful alt text.
- Success: selected project and active navigation are conveyed by contrast, border, and `aria-current`/`aria-selected` semantics.
- Disabled: unavailable actions use native disabled state when introduced.
- Offline/slow network: portfolio identity and portrait are local; core content loads from repository assets.

## Content voice

- Tone: confident, plain, and evidence-led; Korean by default with English data supported by the existing language setting.
- Terminology: use “프로젝트”, “이력서”, and “경험” for visitor-facing navigation; reserve “mounted”, paths, and runtime terms for secondary system context.
- Microcopy rules: action labels start with verbs; avoid explaining internal restoration before explaining user value.

## Implementation constraints

- Framework/styling system: Vite with vanilla JavaScript and CSS, using the installed `dindbos` package.
- Design-token constraints: extend through repo-local semantic tokens and host overrides; do not patch `node_modules`.
- Performance constraints: keep the initial experience static and local; do not add a UI framework or runtime icon dependency.
- Compatibility constraints: current evergreen Chromium/WebKit/Firefox behavior, keyboard and touch input, Korean and English datasets.
- Test/screenshot expectations: Playwright smoke coverage plus desktop, tablet, and mobile screenshots of overview and projects; inspect at least one narrow state and empty search state.

## Open questions

- [ ] Decide later whether DindbOS should expose a user-selectable dark theme; this redesign keeps one controlled light presentation so portfolio contrast is predictable.
- [ ] Review and refresh older project copy independently from this interface redesign; source descriptions remain authoritative for now.
