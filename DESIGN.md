# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-11-04
- Primary product surfaces: DindbOS desktop, Portfolio app, Projects app, Resume app, six independent experience apps
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
- Content hierarchy: compact identity and profile links → education/languages, self-assessed status, career, research/leadership and detailed tools. Projects remain in their dedicated app/view.

## Design principles

- Make the unconventional interface immediately understandable: preserve OS metaphors, but pair icons with strong color roles, labels, and clear primary actions.
- Lead with evidence of work: projects and resume outrank archive paths, mount status, and implementation trivia.
- Use one layer of framing at a time: the DindbOS window is the main container, so portfolio content should rely on sections and rules instead of nested translucent cards.
- Tradeoffs: desktop windows may cover more of the wallpaper because portfolio readability is more valuable than showcasing empty desktop space.

## Visual language

- Shell: DindbOS 0.2.0 native meadow wallpaper, icons, menus, Dock and window chrome; main #7c9fe5 accent through the public theme API.
- Color: main #7c9fe5, secondary #2563eb, ink #202124, muted #777777, border #e5e5e5 and surface #f5f5f5, per the latest user-provided design board and explicit main/sub assignment. Use white text on color-filled buttons and selected navigation, as explicitly requested by the user.
- Typography: system sans stack with compact OS chrome and editorial but restrained portfolio headings; no viewport-sized text.
- Spacing/layout rhythm: 8px rhythm with 8/16/24/32px steps (12px only for compact control padding); generous icon-and-label navigation and spacious reading areas.
- Shape/radius/elevation: 6–8px content radii, 12px OS icon tiles, restrained two-layer neutral shadows for windows and elevated controls.
- Motion: short state transitions only; all non-essential motion disabled under reduced-motion.
- Imagery/iconography: real project screenshots and a locally hosted profile portrait; outline system icons sit on high-contrast, role-colored tiles.

## Components

- Existing components to reuse: DindbOS menubar, desktop icons, dock, window manager, host app registry, project media, and resume document.
- New/changed components: five profile panels, compact profile links, career-app and research-project launch rows, project search, result count, mobile portfolio tabs, and local portrait.
- Variants and states: default/hover/focus/selected filters and projects, empty search result, mobile stacked detail, reduced motion, and image fallback.
- Token/component ownership: Portfolio initial window bounds use the public window API in `src/main.js`; subsequent bounds belong to DindbOS. Portfolio styling lives in `src/portfolio.css`.

## Accessibility

- Target standard: WCAG 2.2 AA for the primary portfolio flows.
- Keyboard/focus behavior: all navigation, filters, project rows, and actions use native controls with visible focus; project list selection exposes `aria-selected`.
- Contrast/readability: dark ink on white for reading; color is reinforced by icons and labels. White on the main #7c9fe5 fill follows the user’s explicit preference and is not an AA contrast pairing; use the secondary blue for high-contrast focus and links.
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

## Featured work

- Featured order: AI Detail Page Generation & Editing (17), Yomates (19), explicitly selected independently of archive order. Agency remains in company experience only.
- Both also appear under Leviosa AI experience, alongside Agency backend leadership, web/admin feature development and mostly independent maintenance, Naver integrations, and internal Telegram/Notion agent automation.
- Company project covers are real public service landing-page screenshots captured on 2026-11-03. Private PR links and operational metrics stay outside site content.
- Korean and English content share project IDs and featured order.

## Runtime revision

- Source: `Dindb-dong/dindbos@61ee980f80491c14493228c96680282ffa8c72d6` (0.2.0).
- Installed from a checked-in source-built tarball because npm still publishes 0.1.1. See `vendor/README.md`.
- Keep the existing IndexedDB storage name so returning visitors retain their files.
- Retain launcher placement beside the portfolio; use native SDK appearance for the shell.

## Open questions

- [ ] Decide later whether DindbOS should expose a user-selectable dark theme; this redesign keeps one controlled light presentation so portfolio contrast is predictable.
- [ ] Review and refresh older project copy independently from this interface redesign; source descriptions remain authoritative for now.

## Experience apps

- Mode: MODIFY. Reuse the SUIT/system typography, OS chrome, existing surface/ink tokens and spacing. Use the same shared main/sub colors and navigation styles as Portfolio.
- Register six singleton apps: Leviosa-AI, Alus-Healthcare, YAI, NOI-LAB, YCC and SDP. Keep the existing timeline as an app launcher with representative images, role, period and an explicit open action.
- Each app has overview, project case studies, media library and responsibilities. Organization/role/period lead; project selection and real screenshots explain the work. No fabricated metrics or copied marketing claims.
- Desktop: compact persistent sidebar and spacious content; mobile: a compact header and horizontally scrolling navigation with one scrollable content region.
- Images are curated from inspected repository assets and newly captured public pages. Preserve provenance and distinguish product screenshots, presentation results, code and promotional app captures. Exclude identifiable assessment reports and customer-order screenshots from the new galleries.
- Image buttons open a native modal dialog with full-size media, useful captions, previous/next controls, Escape dismissal and focus restoration.
- Each app owns its selected tab/project. Minimize restores it; closing/reopening resets it. Language changes refresh open views without closing apps.
- Verify desktop, tablet and mobile; all six registrations, timeline launch, singleton behavior, independent app state, project selection, image navigation/keyboard dismissal, language refresh and no page overflow.
- Use inspected actual organization logos on the desktop, timeline cards and app sidebar, preserving colors and aspect ratios. Store original sources locally; see `assets/experience-icons/README.md`. Alus uses the red symbol from the user-supplied corporate logo; Leviosa uses the vector favicon from the company frontend source.

## Portfolio opening screen refresh

- User reference: single-line bold navigation labels, consistent outline icons, generous white sidebar, broad rounded active row using the shared main blue. Keep the seven portfolio destinations; omit redundant English subtitles.
- Astra review: combine identity, introduction and actions; lead with real project screenshots; move numeric summary after featured work. Preserve SUIT; colors now follow the latest shared blue palette.
- Adapt navigation to app content width with container queries, including resized desktop windows. Narrow apps use horizontally scrolling labeled tabs with keyboard access.
- Window position/size belong to the SDK window manager. Host sets initial bounds once via the window API; never pin window geometry with CSS !important. Verify real pointer dragging and resizing on host apps and SDK builtins.

## Shared design board and tokens

- Current visual board: `/design-board.html` (source: `public/design-board.html`), following the user-supplied Oh My Canvas design-system reference. This is a local review surface, not a new desktop app.
- Color source of truth: `assets/design-tokens.css`, imported by app CSS and linked by the board. Main #7c9fe5; sub #2563eb. Sky #7dd3fc and lavender #c4b5fd are supporting swatches, not competing primary UI colors. Brand logos retain their original colors.
- Shared desktop navigation: 14px labels (down from 18px), 22px outline icons, 44px row targets, 12px row radius, white sidebar, main-color selected row. Narrow windows use 13px labels and 44px targets.
- Portfolio and all six experience apps reuse `portfolio-sidebar-nav` and `src/navigation-icons.js`. Experience navigation retains project/media counts and omits empty project/media destinations (YCC).
- Main-colored actions and selected navigation use white text; secondary-colored hover actions also use white. Links and focus use the secondary blue.

- Experience app names and overview headlines use ink #202124, not accent blue. Reserve blue for interactive controls and links.
- Shared navigation styles target both `portfolio-sidebar-nav` and the stable `.experience-sidebar > nav` structure. Previously opened app markup must retain its menu layout while local CSS updates load.

## Dropdown and focus feedback

- Replace the native experience-app select with shared `src/dropdown.js`: 16px trigger radius, 20px popup radius, 14px option radius, 44px targets, organization logos and selected checkmark.
- Use the native popover top layer so menus escape window/sidebar clipping; place above or below according to available space. Arrow/Home/End navigation, Enter selection, Escape/Tab dismissal and native outside dismissal remain available. Dispose listeners/popovers when apps rerender or close.
- User explicitly requests no focus border/ring on portfolio controls. Suppress SDK focus shadows and app outlines within host apps; keep keyboard focus visible via background fill. Do not patch the SDK package for a host-specific presentation preference.

## Profile overview (2026-11-04)

- Implement the final C direction from the image-generated proposals. The user explicitly removed panel numbers and requested less AI-generated scaffolding. [Panel brief](docs/design/overview-panel-concepts/brief.md) records verified sources and decisions.
- Five semantic panels: academic/language, self-assessed status, career, research/leadership and detailed development tools. Desktop uses three independent columns with content-height panels: education/tools, status, career/AI. Panels never stretch to a sibling’s height. Tablet pairs education/status and tools/career, with AI below; mobile restores education, status, career, AI, tools reading order.
- Remove the promotional hero, product showcase, generic numeric summary and long opening biography from this view. Keep the underlying project archive and biography data.
- No panel numbering, eyebrow headings, gradients, decorative badges, fake progress bars, repeated explanatory paragraphs or card shadows. The user revised the status treatment on 2026-11-04: compact icon rows, letter-grade badges and five decorative segments matching the supplied reference, with potential SS on a filled main-blue row. Segments are hidden from assistive technology; they do not assert measured scores or percentages.
- User-defined grades: potential SS, backend A+, infrastructure A, DB A-, AI A, frontend B+. Natural languages: 한국어 원어민 · 영어 상 · 일본어 상.
- School facts: Yonsei Applied Statistics/Computer Science, GPA 4.00/4.3, 2023.03–2028.02; Gwacheon Foreign Language High School/Japanese, 2020.03–2023.01. Do not claim an already completed university graduation or invent a primary/double-major distinction.
- Career buttons launch the corresponding existing apps. Synchronize the verified Leviosa period 2026.02–2026.10 across languages; NOI-LAB ends 2024.11. The AI panel starts with YAI 18th-cohort Vice President, then lists CV and RL interests and opens YAI-HUB in the project browser. DDQN and CLIP/BLIP2 remain in the project archive.
- Development tools are plain categorized text, not decorative pills: languages, web/mobile, backend/database, AI/research and infrastructure. No workflow/process filler.
- Reuse main #7c9fe5, secondary #2563eb, neutral ink, real organization logos and the existing compact sidebar. Primary heading is 25px, smaller than the earlier 34px name.
