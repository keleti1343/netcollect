# Card Border Color Implementation Plan

## Problem Statement
Currently, the card borders use the default border color defined in globals.css, which doesn't match the sidebar background color. The goal is to modify the styling so that card borders match the sidebar background color for better visual coherence.

## Current Implementation
1. Card component in `fortinet-web/components/ui/card.tsx` uses the Tailwind `border` class which gets its color from the CSS `--border` variable
2. Sidebar uses a gradient background from `--sidebar-bg-start` (#1a2035) to `--sidebar-bg-end` (#232a40)
3. The default `--border` color is defined as `oklch(0.929 0.013 255.508)` in light mode and `oklch(1 0 0 / 10%)` in dark mode

## Solution

### Step 1: Add new CSS variable for card border
We'll add a new CSS variable called `--card-border` in globals.css that matches the sidebar background color. Since the sidebar uses a gradient, we'll use the start color (#1a2035) for consistency.

Add to the `:root` section of `fortinet-web/app/globals.css`:
```css
/* Card custom styling */
--card-border: var(--sidebar-bg-start);
```

Add to the `.dark` section as well to ensure it works in dark mode:
```css
/* Card custom styling - dark mode */
--card-border: var(--sidebar-bg-start);
```

### Step 2: Update the Card component

Modify the Card component in `fortinet-web/components/ui/card.tsx` to use the new border color variable:

From:
```tsx
<div
  data-slot="card"
  className={cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
    className
  )}
  {...props}
/>
```

To:
```tsx
<div
  data-slot="card"
  className={cn(
    "rounded-lg border-[var(--card-border)] border bg-card text-card-foreground shadow-sm transition-all duration-200",
    className
  )}
  {...props}
/>
```

### Step 3: Test across all themes
The implementation should work in both light and dark modes due to the variable definitions in both sections of the CSS file.

## Benefits
1. Visual coherence between sidebar and cards
2. Consistent design language throughout the application
3. Easy to maintain - if sidebar colors change, card borders will automatically update

## Alternatives Considered
1. Using the end color of the sidebar gradient (`--sidebar-bg-end`) - Opted for the start color as it's typically the more dominant one
2. Creating a mixed color between start and end - This would add complexity for minimal visual benefit
3. Using the CSS `color-mix()` function - Decided against this for broader browser compatibility