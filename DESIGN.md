# Design

## WELCOME fullscreen entry (2026-11-11)

- Every visit shows the existing WELCOME after the runtime is ready, including revisits, blocked browser storage and reduced motion. Ignore old visit flags and intro query parameters. Reduced motion suppresses log/blink/fade animation while retaining static WELCOME confirmation.
- Remove the separate fullscreen suggestion, timer, dismissal control and reserved row. Preserve the current terminal artwork, hint, keyboard focus, readiness gate and retry/resume recovery paths.
- Call the enabled Fullscreen API only for actual Android visitors, directly within a fresh WELCOME entry gesture with `navigationUI: hide`. Do not wait for the fullscreen result before entering; synchronous failure, rejection, or a stalled request cannot block entry. Exiting fullscreen does not trigger another request.
- Canvas: DindbOS · Portfolio Mobile Navigation, Page 1. Update the existing Hello main `928a8535-fe2e-4b8f-88ac-422ebb2472dc` and linked mobile preview `3c2de8bc-4941-4327-83eb-68410f6c085b`; remove the prior fullscreen main/instance from board `e5f56c7c-ffa7-4276-9071-c91f6803850f` and retain the revised interaction annotation. Saved Canvas revision 61 was read back. Existing colors and pixel WELCOME remain unchanged; reviewed 390px runtime captures `welcome-before-entry.png` and `portfolio-after-entry.png` plus the entry recording against the mobile preview.
- Code: `index.html`, `src/hello.js`, `src/android-fullscreen.js`; delete fullscreen-only CSS. Verify runtime WELCOME and entry screenshots, touch/keyboard entry, storage/motion/revisit behavior, browser refusal, and 320/390/1440px layouts. Native Android system-bar hiding requires physical-device verification.

## Source of truth

- Status: Active
- Last refreshed: 2026-11-04
- Primary product surfaces: DindbOS desktop, Portfolio app, Projects app, Resume app, six independent experience apps
- Evidence reviewed: `src/main.js`, `src/portfolio.css`, `src/portfolio-data.js`, the installed `dindbos` runtime styles and APIs, Korean/English portfolio data in `public/portfolio/data`, and live screenshots at 1440×900 and 390×844

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

- Primary navigation: persistent Portfolio app navigation with Overview, Projects, Experience, Skills, and Resume; persistent DindbOS dock for broader OS apps.
- Core routes/screens: Overview as the default orientation surface; Projects as a searchable/filterable master-detail view; Experience and Skills as supporting evidence; Resume as a direct document view.
- Content hierarchy: compact identity and profile links → education/languages, self-assessed status, career, research/leadership and detailed tools. Projects remain in their dedicated app/view.

## Design principles

- Make the unconventional interface immediately understandable: preserve OS metaphors, but pair icons with strong color roles, labels, and clear primary actions.
- Lead with evidence of work: projects and resume outrank archive paths, mount status, and implementation trivia.
- Use one layer of framing at a time: the DindbOS window is the main container, so portfolio content should rely on sections and rules instead of nested translucent cards.
- Tradeoffs: desktop windows may cover more of the wallpaper because portfolio readability is more valuable than showcasing empty desktop space.

## Visual language

- Shell: DindbOS 0.2.1 native meadow wallpaper, icons, menus, Dock and window chrome; main #7c9fe5 accent through the public theme API.
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

- Source: `Dindb-dong/dindbos@a34c321a230e135aac1ae436919d1a812007c6fd` (0.2.1).
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

- User reference: single-line bold navigation labels, consistent outline icons, generous white sidebar, broad rounded active row using the shared main blue. Keep five portfolio destinations; omit redundant English subtitles.
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
- User-defined grades: potential SS, backend A+, infrastructure A, DB A-, AI A, frontend A-. Natural languages: 한국어 원어민 · 영어 상 · 일본어 상.
- School facts: Yonsei Applied Statistics/Computer Science, GPA 4.00/4.3, 2023.03–2028.02; Gwacheon Foreign Language High School/Japanese, 2020.03–2023.01. Do not claim an already completed university graduation or invent a primary/double-major distinction.
- Career buttons launch the corresponding existing apps. Synchronize the verified Leviosa period 2026.02–2026.10 across languages; NOI-LAB ends 2024.11. The AI panel starts with YAI 18th-cohort Vice President, then lists CV and RL interests and opens YAI-HUB in the project browser. DDQN and CLIP/BLIP2 remain in the project archive.
- Development tools are plain categorized text, not decorative pills: languages, web/mobile, backend/database, AI/research and infrastructure. No workflow/process filler.
- Reuse main #7c9fe5, secondary #2563eb, neutral ink, real organization logos and the existing compact sidebar. Primary heading is 25px, smaller than the earlier 34px name.

## Tab chrome cleanup (2026-11-04)

- No repeated tab title/overline/instruction stacks in project archive, experience launcher, skills, settings or resume. Keep personal identity and actual company/project names. Remove PROJECT DETAIL overline.
- Project search/selection and the icon filter share one compact responsive control strip. The input retains an accessible localized label; no result-count row is shown.
- Legacy project records lack consistent dates. Default order is newest registration first (descending project ID), shared across locales and retained through filtering/reset; do not fabricate project dates.
- Settings and Contact tabs are removed; saved language preferences remain respected at boot. Profile links and resume stay in the overview.

## Desktop shortcut groups (2026-11-04)

- On desktop, move only Leviosa-AI, Alus-Healthcare, NOI-LAB, SDP, YAI and YCC into a 3×2 lower-right group above the dock. The user's purple rectangle marks placement; do not render a border/container.
- Remaining ten icons flow continuously in the existing left grid. Preserve SDK icons, desktop semantics, launch handlers and window stacking; no SDK patch.
- Narrow desktop keeps a scrollable left column. Mobile keeps all icons in the scrollable desktop grid, ordering career launchers after other apps.

## Mobile glass navigation (2026-11-04)

- Canvas: DindbOS · Portfolio Mobile Navigation, Page 1 (`page-0959dd44-73da-422d-8f68-016cc5dce6a7`). Reviewed component board `5b4132bd-0793-4508-9e4b-93c26ce41b96` and mobile screen board `bfb5aa81-4d2b-44c9-930e-d67bf4869ea1`; component `component-e63836fc-600a-4006-b4fc-d42a9b4d5e4c` and linked instance survived library reopen.
- DindbOS 0.2.1 provides `.dos-mobile-tabbar` in its shared styles: a frosted capsule with selected pill, icons and visible labels, 64×52px minimum targets, native keyboard focus and horizontal scrolling for long menus. Mobile uses the existing glass material's frosted fallback, not the desktop-only optical adapter.
- At app widths ≤760px the same semantic navigation moves into a reserved bottom row. Portfolio removes the duplicate sidebar identity; career apps retain a compact company switcher above the independently scrolling content. No floating overlay may cover content or steal touch input.
- Main/sub colors remain #7c9fe5/#2563eb. Desktop sidebars stay unchanged. Re-selecting a tab reveals the selected destination within the local horizontal bar only.
- Projects collapse based on actual finder content width ≤722px, including narrowed desktop windows. Selecting a project resets detail scroll while retaining list/window scroll and focus.

- Implementation comparison: reviewed actual Chrome screenshots `portfolio-touch-390.png` and `experience-touch-1.png` against the saved Canvas component/screen. The selected capsule, icon/label hierarchy, bottom row and content separation match; the runtime theme supplies the final neutral glass tint.

## Profile and project browser refinement (2026-11-04)

- Five destinations only: Overview, Projects, Experience, Skills and Resume. Portfolio-specific compact tabs fit together at 320px with at least 44px touch widths; career apps retain the SDK component's larger targets.
- Remove only the visible education/language heading and status self-assessment subtitle. Preserve the education section's accessible name, all factual content and other panel headings. Frontend is A-. A 72×90px portrait appears to the right of the name on narrow screens only.
- Canvas library document remains DindbOS · Portfolio Mobile Navigation, Page 1. New project board `02af514e-369d-4263-9268-1c719cad3097`, controls main `3d65ab2d-c03e-4b76-9405-53f31e181fc5`, component `component-6cd7750a-1151-40dc-82c6-bd7962fce267`; profile board `d1032534-0d65-4860-961a-4aadc8c5068b`. Reopened from the library to verify persistence. Reviewed actual mobile screenshots against both boards.
- Projects uses one searchable selection field beside a 44px icon-only filter button on mobile and desktop. The closed field shows the current project; opening it allows immediate title/role/technology search and selection, including keyboard navigation and empty-result recovery. Projects initially shows the All list on every viewport; search/filter states also show a full-width result list through this field; the detail occupies one independently scrolling region below and controls stay visible. Desktop keeps the project list. No project-count row is shown.
- Canvas refinement board `38e37259-87b3-4278-bdaa-b42223b296fe`, main `8e89f635-69b2-48e5-85a5-0be13b87b5ac`, component `component-9230efc8-17d0-4746-b204-aafa4dd60850` maps to the DindbOS public `renderSearchableSelect` / `mountSearchableSelect` exports. Reviewed at 390px with closed/open states; existing colors and 44px touch targets are retained.
- The native auto popover provides oldest/newest registration and title sorting, category OR selection, technology-tag AND selection, reset, outside dismissal and Escape. Tags come from existing languages/technology data, with no fabricated metadata or completion dates. Checkbox changes preserve the popup and its scroll; project changes reset only the detail region.

- Implementation comparison: reviewed actual Chrome mobile captures `mobile-project-selector.png` and `mobile-project-selector-open.png` against the searchable-select board. The one-row field, 44px icon filter, selected blue option and removed count match the revised design.

## Shared selector and return to project lists (2026-11-04)

- Consume DindbOS 0.2.2 via the checked-in package; remove the duplicate host selector implementation and styles. Public functions come from `dindbos`, CSS from `dindbos/styles.css`, with existing brand colors passed through `--dos-select-*` tokens.
- A pinned localized All choice returns to the list while retaining category/tag/sort choices and clearing the search query. Search shows matching rows; selecting a row or dropdown option opens its detail. Opening Filters clears a prior project query and shows results drawn from the entire dataset. Filter/sort/reset changes keep the list visible. Explicit overview project links still open their requested detail.
- Sorting reuses `src/dropdown.js` with 16px trigger / 20px menu / 14px option radii, native nested popovers, keyboard access and cleanup. Canvas board `c84956e2-bae4-4a83-aa34-fbf52556d233`, main `acae9829-f4aa-4e26-8c05-860ec2c3b73b`, component `component-1ec67bc4-8435-4e1d-911c-44f5dc32d959`; searchable board updated in place with the pinned All option.

- Comparison: reviewed Chrome mobile `all-projects-390.png` and `rounded-sort-390.png` against the updated boards. The full-width results, pinned All choice and 20px/14px sort menu/option radii match; nested options retain their border-free shared styling.

- Initial runtime state is All/list on mobile and desktop, including the Projects launcher. A project opens only after an explicit selection or a direct overview project link.

## Experience contributions first (2026-11-05)

- Experience apps open on the existing `role` destination, labeled 기여와 성과 / Impact, followed by Showcase, Projects and Media. Preserve app IDs, independent state, company switching, and image viewing.
- The owner explicitly rejected the standalone metric strip. Use concise noun-phrase bullets under four descriptive headings: AI product engineering, frontend and user experience, backend and system architecture, infrastructure and developer productivity. Keep figures within the relevant explanation; no metric cards, oversized number rows, or decorative paragraph numbering.
- Leviosa copy connects scope, implementation and outcomes. Use owner-supplied work and existing project evidence for the canvas engine, AI generation workflow, job queues/workers, deployment interruptions and concurrent-save conflicts. Do not invent measurement periods, contribution denominators or additional results.
- Canvas library document: DindbOS · Portfolio Mobile Navigation, Page 1 (`page-0959dd44-73da-422d-8f68-016cc5dce6a7`). Desktop board `b0865416-e838-46c6-86ef-1f8b3b139ec0`, mobile board `3c4f8385-7612-406e-9a93-68eaa6742fe8`. Removed the metrics main and mobile instance; retain the existing navigation components. Both boards use the revised Korean bullet copy; native semantic list markers are provided by the implementation.
- Map to `src/experience-app.js` and `src/portfolio.css`; localized content stays in the active experience JSON files. Reuse the shared sidebar and mobile glass navigation. Neutral text, 14px body, 16px section headings and plain separators.
- Review desktop and 390px Canvas boards against actual production-preview screenshots. Check 320px, 390px and 1024px layouts and English content with the existing browser suite.

## Visitor language (2026-11-05)

- Language selection order: supported `ln` URL parameter (`en` or `ko`), existing saved preference, then primary browser language. Korean browser locales select Korean; all other browser languages default to English. Invalid URL/storage values fall through.
- URL overrides are visit-specific and do not rewrite the saved preference. Denied browser-storage access still permits automatic selection. Set the document language to the selected locale at boot.
- Keep both localized datasets and the same experience-app structure. Test explicit links in both directions, Korean/English/other browser locales, stored preferences and denied storage.

## Compact experience content on mobile (2026-11-05)

- At app widths up to 760px, use 13px contribution body text with 1.65 line height (21.45px) and 15px section headings in both locales. Apply the same body sizing to the supporting work list. Desktop typography and the company title stay unchanged.
- English experience navigation uses Impact, Showcase, Projects and Media. Keep existing destination IDs, icons, ordering and selection behavior.
- Updated the existing mobile contribution Canvas board to match the smaller body and headings. Verify actual Korean and English 390×844 screenshots, 320px layout, and unchanged desktop text sizes.

## Editorial emphasis and first-visit greeting (2026-11-05)

- Reuse the existing body sizes and brand tokens. Apply dark bold to selected subjects and personal responsibilities; reserve a pale blue lower-third marker for qualified outcomes and meaningful figures. Keep dates, versions, navigation labels and technology inventories unmarked. Preserve the complete original Korean/English copy, including role qualifiers, in canonical data and search.
- Emphasis is presentation-only, curated by locale and stable project/experience ID, with escaped plain-text segments. Project details and experience case studies share the same selections. Markers wrap with the text rather than introducing unbreakable spans.
- Editable design: existing library document `DindbOS · Portfolio Mobile Navigation`, Page 1 (`page-0959dd44-73da-422d-8f68-016cc5dce6a7`). Component board `4e7e7ebe-f74d-4de7-90fd-0d146601c0f2`, mobile board `3c2de8bc-4941-4327-83eb-68410f6c085b`; main `928a8535-fe2e-4b8f-88ac-422ebb2472dc`, linked mobile instance `component-3dfec767-54b9-4964-9aa3-993fcbf11d0b`. Existing emphasis components are preserved.

## Boot terminal introduction (2026-11-05)

- Replace handwriting with a black (`#080b0b`) full-screen terminal. Inline critical CSS and the first real document-received message paint before external JavaScript or CSS. Use system monospace for logs and an original 5×7 pixel SVG WELCOME with a blue, violet and rose gradient and offset dark shadow. No external font or terminal dependency.
- The entry imports the OS immediately. Report actual completed JSON loads, assembled filesystem/application definitions, SDK boot, verified Portfolio DOM, wallpaper decode/fallback/defer, and two rendering frames. Each line records its actual event time; a 45ms presentation queue produces upward-flowing logs without delaying boot. Keep only ten rows; long paths wrap on narrow screens. No fabricated commands, percentages, resource measurements, or successful wallpaper claims after failure.
- Once boot and the log queue finish, replace the log region with WELCOME and a focusable “Press any key or tap to enter” button. The hint uses responsive 15–18px type and a 1.4-second stepped blink, disabled by reduced motion; the keyboard focus outline stays steady. Wait indefinitely for a new key press, click or mobile tap anywhere on the cover. Input before readiness cannot dismiss or confirm entry. The app renders concurrently but stays inert and busy until confirmation. Ignore held-key repeats and pointer gestures begun before readiness. Consume the confirming event, move focus to the app, then fade the cover for 300ms with a 400ms cleanup fallback.
- WELCOME now appears on every visit, regardless of storage, previous visits or intro parameters. Reduced motion disables the log queue and animations but never skips confirmation. See the current WELCOME fullscreen entry contract above.
- Errors override the terminal with current-URL retry and static resume links. The parser-installed 15-second watchdog covers a stalled entry and permits late recovery, but does not time out a ready screen waiting for input. JavaScript-disabled visitors keep the static resume path.
- Code mapping: `index.html` owns first paint, pixel artwork, recovery and styling; `src/hello.js` owns progress presentation and input gating; `src/main.js` reports verified boot stages; `src/portfolio-data.js` reports completed JSON reads. The existing Canvas main and linked mobile instance include loading and ready previews, mapped to the same tokens and artwork. Original board/component IDs remain stable; the library autosaves changes.
- Verify real withheld-script first paint, delayed required data with no premature completion log, profile rendering behind a pending wallpaper, indefinite ready hold, keyboard and mobile touch entry, focus handoff, 320/390/1440px bounds, replay/storage/motion preferences, recovery, and ordinary navigation.


## Traditional resume (2026-11-06)

- Standalone `resume.html` and its matching A4 PDF use white paper, black Times New Roman, a regular 34px name, 16px uppercase ruled headings, 14px body text, italic roles, and native bullets. The OS portfolio retains its existing identity.
- Print layout: 210 × 297mm, 10mm vertical and 14mm horizontal padding, 1.12 body line height, 10px header margin, 9px section gaps, and 7px entry gaps. Narrow screens reflow contact information and dates without horizontal overflow.
- Embedded `?view=portfolio` mode adds bold to topic/ownership phrases and #dce8fb underline highlights to selected numeric outcomes. Standalone HTML and print have plain body text; headings retain their hierarchy. The sole resume action downloads the PDF.
- Resume content includes GPA 4.0/4.3, Japanese-major high-school education (Mar 2020–Jan 2023), updated Leviosa impact and role, YAI-HUB operations, and global NotchNote feedback. SDP and the EfficientFace/AdaIN resume bullet are omitted.
- Leviosa position is “AI·SW Engineer & Founding Member” in resume and both experience locales. Its cost/time outcomes use the existing experience highlight renderer.
- YAI contributions reuse the existing experience renderer with four bilingual sections: platform/product, infrastructure/load testing, deployment/operations, and AI research/projects. Load-test counts describe test conditions; the p95 detail is omitted.
- Editable canvas: “Kim Dong Wook · Traditional Resume”, Page 1; A4 board `314f5bb9-ab10-4ad2-9d4c-6af47c342cf1`, organization/date component `component-c37e2559-8313-43fe-b1b7-dae125a5ede7`, and preview/download state board `f1f5459a-8099-4527-80ad-41b4fc9cf724`. Header and date rows map to `.resume-header` and `.entry-header`.
- Canvas rows use explicit positions because its importer did not retain flex rows; production uses responsive flex. The state board documents separate emphasis and grouped YAI contributions. The document was reopened from its library to verify persistence.
- Validation: rendered one-page A4 PDF, Chromium screen/print/download and bilingual YAI checks, content-emphasis checks, and 320/390/794px overflow assertions. Browser checks use reduced motion and explicitly enter through WELCOME before exercising resume behavior. No new dependency is required.
