# Lowkey Progress

## Completed
- [x] Fix video player poster/black screen flash issue
- [x] Redesign hero subscribe input
- [x] Add card-to-modal morph animation
- [x] Add title bar above video player in modal
- [x] Release streamline - removed auth, gating, filters, directories
- [x] Add branding assets (logomark, favicon, OG image)
  - Eye/lens logomark added to header (icon + wordmark)
  - Theme-adaptive SVG favicon (white/black based on browser theme)
  - PNG fallback for Safari
  - Animated GIF OG image for social sharing
- [x] Add emoji confetti animation on subscribe success
- [x] Fix video player play/pause button not working (pointer-events on blur overlays)
- [x] Add hero copy update with subscribe CTA
- [x] Add subscribe input reset after 4 seconds
- [x] Add animated logo on hover (eye looks around + blinks, 12s loop)
- [x] Replace Lucide icons with custom player icons
  - Custom SVG icons for play, pause, skip, volume, expand, minimize
  - Standardized all player control buttons to 32x32px containers
  - Updated video modal center play/pause overlay
- [x] Create /components design system page
  - Hero section with page title
  - Logo section with hero display (large background trace animation) + 3-column variants row
  - Typography section showing eyebrow, heading, body, caption styles
  - Colors section with CSS variable swatches
  - Buttons section (primary, loading, secondary, icon)
  - Subscribe input section (default + success states)
  - Confetti animation trigger demo
  - Morph text animation demo
  - Video cards section (active, ghost, skeleton states)
  - Player icons grid (9 custom icons)
  - Company link example
  - Footer section
- [x] Add IntroLogo loop prop for continuous trace animation (5s cycle)

## In Progress
- [ ] Fix intro logo handoff animation (logo jumps during settling phase)

## Recently Completed
- [x] Mobile view improvements (comprehensive)
  - Hero section:
    - Subscribe input full-width on mobile (w-full md:w-[288px])
    - Text sizes scaled (text-[10px] md:text-[12px], text-base md:text-lg)
    - Spacing adjusted (pt-11 pb-12 md:pt-[116px] md:pb-32)
  - Video card:
    - Hover overlay hidden on mobile (hidden md:flex) - touch devices don't have hover
    - Text/padding scales when visible (text-lg md:text-2xl, p-3 md:p-5)
  - Video modal:
    - Title bar stacks vertically + centered on mobile (flex-col sm:flex-row, items-center sm:items-start)
    - Visit button: full-width below video on mobile (sm:hidden mt-6 w-full), in title bar on desktop (hidden sm:inline-flex)
    - Increased spacing: mb-7 sm:mb-6 between title and video, gap-1.5 sm:gap-2 between company label and title
    - Play/pause icon scales (w-16 h-16 sm:w-20 sm:h-20)
  - Header: reduced top padding (pt-6 sm:pt-9)
  - Footer: links stack vertically on mobile (flex-col md:flex-row)
  - Video grid: tighter gap on mobile (gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4)

## Backlog
(none)
