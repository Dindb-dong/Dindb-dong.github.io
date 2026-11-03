# Overview panel proposals

Status: awaiting the user's visual selection. These are image-generated design proposals, not implemented UI. Keep remote delivery disabled.

## Confirmed corrections and sources

- NOI-LAB: 2024.07–2024.11, Software Engineer & Researcher. Both locale datasets already contain this correction in commit `459ee67`.
- User's current direction: see the person at a glance; remove the product showcase and large promotional hero from the next overview. Keep the established main #7c9fe5, secondary #2563eb, white surfaces and restrained typography.
- Natural languages, directly confirmed by the user: 한국어 원어민, 영어 상, 일본어 상. These replace the initial mockup placeholder; do not substitute invented exam scores or CEFR levels.
- LinkedIn education, read with Aside u0 on 2026-11-03: Yonsei University, Applied Statistics / Computer Science, 2023.03–2028.02, Grade 4.00/4.3. Do not represent the end date as an already completed graduation or invent a primary/double-major distinction.
- High school: Gwacheon Foreign Language High School, Japanese, 2020.03–2023.01.
- LinkedIn experience: Leviosa AI, AI Engineer & Founding Member, 2026.02–2026.10; ALUS Healthcare, Researcher, 2025.06–2025.09; YAI, Research Member & Vice President, 2025.01–present. These dates differ from some older portfolio rows; review consistently when implementing the selected panels, rather than silently changing unrelated screens now.
- Sources: [Education](https://www.linkedin.com/in/dindb-dong/details/education/), [Languages](https://www.linkedin.com/in/dindb-dong/details/languages/), [Experience](https://www.linkedin.com/in/dindb-dong/details/experience/), [Projects](https://www.linkedin.com/in/dindb-dong/details/projects/).
- Read-only Aside session: `SAHgv2p5v7oEIWk7`. No LinkedIn profile edits, messages or posts were made. Awards/certifications were not sufficiently verified; omit them.

## Panel inventory

| Panel | Content | Purpose |
| --- | --- | --- |
| 01 학력·언어 | Yonsei, majors, GPA, high school/Japanese track, confirmed natural-language levels | Academic background and communication |
| 02 스테이터스 | 잠재력 SS / 백엔드 A+ / 인프라 A / DB A- / AI A / 프론트 B+ | User-defined self-assessment, with visible letter grades rather than invented percentages |
| 03 커리어 | Leviosa, ALUS, NOI-LAB: role and period, brief scope if space permits | Work experience at a glance; company rows can later launch the existing apps |
| 04 연구·리더십 | YAI vice president/research member, Dueling DDQN, CLIP + BLIP2 | Research and leadership, not another product showcase |
| 05 개발 도구 | 언어: JavaScript/TypeScript/Python/R/C++/C#/Java/Dart; 웹·앱: React/React Native/Flutter; 백엔드·DB: Node.js/Supabase/MongoDB; AI: PyTorch/TensorFlow/Qiskit; 인프라: AWS/Docker/Kubernetes | Detailed concrete tools complement the graded domains. Remove all workflow/process filler, as directly requested by the user. |

## Visual options

- A — 정돈된 대시보드: two broad upper panels, three compact lower panels; neutral rounded cards and aligned grade rows.
- B — 캐릭터 스테이터스: prominent rank plaque and attribute rows; academic/career/research panels organized around it, without cartoon or pixel art.
- C — 정보 밀도 높은 프로필: compact three-column dossier, tabular metadata and six grade tiles.
- All options contain the same five numbered panels. The user may mix individual panel treatments between options.
- Images are preview-only. Use the selected design to implement responsive, accessible HTML/CSS later; never use the mockup bitmap as the app UI.

## Verification and pending implementation

- Preserve exact grades (latest potential: SS) and NOI-LAB end year in every final image.
- User rejected panel 05 workflow content. Title must be 개발 도구, with categorized technologies and no process arrows.
- Ensure final language copy uses the user's latest confirmation, not “확인 중”.
- Generated images may have minor typography/raster artifacts; they are for visual selection. The code implementation will use exact real text and retain the functioning OS controls.
- Do not rebuild or redesign the running overview before the user chooses a design. The existing product showcase remains in the current running UI until that selected redesign is implemented.
