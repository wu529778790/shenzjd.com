# Design Brief: MicroBlog UI/UX Refactoring

## 1. Feature Summary

Full visual upgrade of all MicroBlog pages: home, post detail, tags, links, search, and pagination. The goal is to elevate the existing warm-paper aesthetic into a more refined, typographically precise, and rhythmically consistent reading experience. The sidebar navigation needs better mobile behavior, and component consistency needs to be enforced across all pages.

## 2. Primary User Action

Read and discover Telegram channel posts. Every design decision should serve comfortable, focused reading.

## 3. Design Direction

**Color strategy**: Restrained. Keep the warm paper base (#f4f1ec family) but refine the neutral tinting. The current palette is good; tighten the chroma relationships and ensure consistent contrast ratios.

**Theme scene**: A reader browsing channel posts on a Sunday morning with coffee — warm ambient light, focused attention, no urgency. Light theme with warm undertones.

**Anchor references**:
- **Bear Blog** — minimal, content-first, no decoration
- **Micro.blog** — warm, personal, readable typography
- **Instapaper** — refined reading experience, precise spacing

**Direction**: Warm editorial minimalism. Not cold Swiss, not decorative. Paper-like surfaces with precise typography and generous whitespace.

## 4. Scope

- **Fidelity**: Production-ready
- **Breadth**: All pages (home, post, tags, links, search, pagination)
- **Interactivity**: Shipped-quality components
- **Time intent**: Polish until it ships

## 5. Layout Strategy

**Current problems to fix:**
1. Home page manually renders Header + raw `<ol>` instead of using List component — unify
2. Sidebar is always visible on mobile (sticky top bar) — add hamburger toggle
3. No consistent spacing rhythm — apply 4pt grid system
4. Typography hierarchy is flat — establish clear scale

**Target layout:**
- Desktop: sidebar (220px) + content (flex-1, max-width 680px for optimal reading measure)
- Mobile: hamburger nav toggle, full-width content with comfortable padding
- Consistent vertical rhythm based on 24px line-height unit

## 6. Key States

| State | What user sees |
|-------|---------------|
| Default | Posts listed with clear timestamp, content, reactions, tags |
| Empty | Graceful "no posts yet" message |
| Loading | Skeleton placeholders (not spinners) |
| Error | Friendly error with retry |
| Mobile nav | Hamburger toggle with smooth slide animation |
| Search active | Results with highlighted query |

## 7. Interaction Model

- **Navigation**: Sidebar links on desktop, hamburger menu on mobile
- **Post content**: Clean reading flow, images with lightbox, code blocks with syntax highlighting
- **Tags/Links**: Pill-shaped links with hover accent
- **Back to top**: Smooth scroll with CSS scroll-driven animation
- **Pagination**: Simple before/after buttons at page bottom

## 8. Content Requirements

- Consistent "MicroBlog" branding (already renamed)
- Empty states for: no posts, no search results, no tags configured
- Error messages should be friendly and actionable
- Time formatting: relative for recent, absolute for older

## 9. Recommended References

- `spatial-design.md` — 4pt grid, spacing tokens, visual hierarchy
- `typography.md` — modular scale, vertical rhythm, measure limits
- `responsive-design.md` — mobile-first, breakpoints, touch targets
- `color-and-contrast.md` — refining the warm palette

## 10. Open Questions

- Should we add dark mode support? (not in this pass — keep focused)
- Font loading: keep system fonts or add a web font? (recommend system fonts for performance)
