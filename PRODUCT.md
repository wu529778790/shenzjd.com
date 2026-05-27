# Product

## Register

product

## Users

Both the channel operator (managing and curating content) and public readers (browsing Telegram channel posts like an RSS reader). The operator's context is setup and maintenance; the reader's context is casual content consumption, typically on mobile or desktop browser.

## Product Purpose

A microblog that surfaces Telegram channel content on the web. Readers discover and read posts; the operator configures the channel and customizes the site. Success means fast, distraction-free reading with good typography and minimal friction.

## Brand Personality

Clean, warm, focused. The interface should feel like reading a well-formatted paper journal — not cold and clinical, not noisy and social. Quiet confidence.

## Anti-references

- Traditional blog templates (WordPress/Hexo defaults): generic layouts, cluttered sidebars, stock aesthetics
- SaaS landing pages: gradient text, glassmorphism, hero-metric templates, identical card grids
- Social media overload: reaction counts dominating, infinite scroll without structure, engagement bait

## Design Principles

1. **Content first**: Every design decision should make posts easier to read, not decorate the page
2. **Warm restraint**: Use warm tones and soft edges, but never at the cost of clarity
3. **Progressive disclosure**: Show essential info by default, reveal complexity on demand (tags, reactions, search)
4. **Readable rhythm**: Typography and spacing should create a natural reading cadence, not a grid of boxes

## Accessibility & Inclusion

- Respects `prefers-reduced-motion` (already implemented in CSS)
- Skip-to-content link for keyboard navigation
- Focus-visible outlines on interactive elements
- Semantic HTML landmarks (nav, aside, article)
- No color-only information encoding
