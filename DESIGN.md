---
version: alpha
name: ShenZJD Sepia
description: "Warm, readable Telegram-channel microblog design for server-rendered timelines."
colors:
  primary: "#333333"
  secondary: "#706862"
  tertiary: "#b23b00"
  neutral: "#f4f1ec"
  paper: "#f4f1ec"
  ink: "#000000"
  heading: "#333333"
  accent: "#b23b00"
  surface: "#ffffff"
  code: "#f9f9f9"
  muted: "#706862"
  link: "#5a6570"
  link-hover: "#3f4850"
  line: "rgba(0, 0, 0, 0.05)"
  footer: "#666666"
  inverse: "#ffffff"
  overlay: "rgba(0, 0, 0, 0.80)"
typography:
  site-title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
  headline-lg:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  headline-md:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.25
  body-md:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
  caption:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  hairline: 1px
  xxs: 2px
  xs: 4px
  sm: 6px
  md: 8px
  panel: 10px
  lg: 16px
  xl: 20px
  xxl: 32px
  content-max: 896px
  sidebar: 208px
rounded:
  panel: 3px
  chip: 4px
  media: 8px
  full: 9999px
components:
  page-shell:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 20px
    width: "{spacing.content-max}"
  skip-link:
    backgroundColor: "{colors.heading}"
    textColor: "{colors.inverse}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.panel}"
    padding: 10px
  nav-link:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.heading}"
    typography: "{typography.body-md}"
    rounded: "{rounded.panel}"
    padding: 10px
  nav-link-current:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.heading}"
    rounded: "{rounded.panel}"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.heading}"
    typography: "{typography.caption}"
    rounded: "{rounded.panel}"
    padding: 8px
  timeline-dot:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
    size: 8px
  timeline-link:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.accent}"
    typography: "{typography.meta}"
  body-link:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.link}"
    typography: "{typography.body-md}"
  body-link-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.link-hover}"
    typography: "{typography.body-md}"
  tag-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.chip}"
    padding: 10px
  reaction-pill:
    backgroundColor: "{colors.code}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 8px
  content-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.panel}"
    padding: 10px
  media-frame:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.media}"
  divider:
    backgroundColor: "{colors.line}"
    height: 1px
  back-to-top:
    backgroundColor: "{colors.code}"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    size: 32px
  footer-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.footer}"
    typography: "{typography.body-sm}"
  modal-overlay:
    backgroundColor: "{colors.overlay}"
    textColor: "{colors.inverse}"
  modal-close:
    backgroundColor: "rgba(0, 0, 0, 0.72)"
    textColor: "{colors.inverse}"
    rounded: "{rounded.full}"
    size: 40px
---

# ShenZJD Design System

## Overview

ShenZJD presents Telegram channels as a quiet, server-rendered microblog. The visual identity is **sepia editorial minimalism**: warm paper, dark ink, a restrained burnt-orange timeline accent, and almost no browser-side ornamentation.

The interface should feel fast, readable, and personal rather than app-like. Favor semantic HTML, low chrome, clear timelines, and content-first composition. The current implementation source for most tokens is `src/styles/app.css`.

## Colors

The palette is intentionally small and warm.

- **Primary / Heading (`#333333`):** stable dark gray for titles, focus rings, and navigation text.
- **Secondary / Muted (`#706862`):** sepia gray for descriptions, reaction counts, placeholders, and secondary copy.
- **Tertiary / Accent (`#b23b00`):** burnt orange for the timeline dot, timestamps, tag hover states, blockquote rails, and active emphasis.
- **Neutral / Paper (`#f4f1ec`):** warm page background; it should remain visible around content instead of being replaced by full white panels.
- **Surface (`#ffffff`) and Code (`#f9f9f9`):** quiet raised surfaces for cards, code blocks, reactions, and inline content modules.
- **Line (`rgba(0, 0, 0, 0.05)`):** very soft separators; avoid strong borders unless they communicate structure.
- **Links (`#5a6570` → `#3f4850`):** subdued slate links; use the accent color only when an item belongs to the timeline or is the primary interaction.

## Typography

Use the system sans stack only. Do not introduce webfonts unless the product direction changes; the current identity depends on native rendering, speed, and low operational complexity.

- **Site title:** 20px, semibold, compact line height.
- **Content body:** 16px with `1.6` line height for mixed Telegram text, media, and rich previews.
- **Metadata:** 14px medium for timestamps and timeline labels.
- **Captions / search / reactions:** 12px–14px with restrained weight.
- **Markdown content:** H1/H2 are bold but modest; avoid oversized editorial display type because posts are usually short and dense.

## Layout

The page uses a narrow fixed maximum width with responsive behavior:

- Outer margin: 20px on small screens and desktop.
- Main grid: maximum width 896px.
- Desktop: content column with a right sticky sidebar, separated by a soft right border on the main column.
- Mobile: sidebar collapses into a sticky top strip above the feed.
- Timeline: posts align on a vertical rail with an 8px accent dot and generous vertical rhythm around post content.
- Content media should stay within the text column and retain a small margin so the paper background remains visible.

Spacing follows Tailwind's 4px-based scale, with 10px (`2.5`) used frequently for panel padding and microblog rhythm.

## Elevation & Depth

Depth is subtle. Use tonal separation, hairline borders, and the existing `shadow-soft` treatment rather than heavy shadows. Elevated elements should feel like paper placed on paper, not floating app cards.

Use shadows for avatars, media frames, code blocks, current navigation items, and small controls. Avoid stacking multiple shadow styles on the same view.

## Shapes

The shape language is slightly softened but not bubbly.

- Panels and inline modules use a 3px radius.
- Chips use a 4px radius.
- Media uses an 8px radius.
- Circular controls and timeline dots use a full radius.

Do not mix large rounded cards with the existing compact sepia style unless the whole visual system is intentionally revised.

## Components

- **Timeline item:** timestamp link in accent, 8px accent dot, and a soft vertical rail. Keep post content aligned to the rail.
- **Header:** avatar, channel title, and social icons should remain compact. Icons use filter-based muted states and should not dominate the title.
- **Navigation:** small text links with subtle white hover/current backgrounds. Current state uses soft shadow plus surface tint, not accent fills.
- **Search:** quiet bordered field in the sidebar; on mobile it opens from a compact icon in the sticky top strip.
- **Tags and links:** chip-like text links with muted default color and accent hover color.
- **Reactions:** small rounded pills on the timeline rail; paid reactions may use a separate gold tint but should stay visually secondary.
- **Telegram content modules:** blockquotes, expandable text, link previews, code, tables, and media should use existing content styles and sanitize external HTML before rendering.
- **Back to top:** small circular affordance in the bottom corner, low opacity, with a slight upward hover movement.
- **Modals:** image preview modals use a dark translucent overlay, strong backdrop blur, and one clear circular close button.

## Do's and Don'ts

- Do keep the page warm, quiet, and content-first.
- Do keep contrast at WCAG AA or better for text and controls.
- Do reuse the tokens in `src/styles/app.css` and update this file when those tokens change.
- Do keep client-side JavaScript near zero; Telegram comments are the deliberate exception.
- Don't introduce new accent colors for routine actions.
- Don't replace the timeline with card-heavy layouts without a product-level redesign.
- Don't overuse shadows, gradients, animations, or large rounded corners.
- Don't feed unsanitized external Telegram HTML into rendered content.
