# Badge Standardization Implementation Guide

## Overview

This document provides implementation instructions for standardizing badge components across the Fortinet Network Visualizer web application. The current application has inconsistent badge styling across different pages, particularly with background colors and usage patterns. This standardization will create a cohesive user experience while maintaining semantic meaning through consistent visual cues.

## Current Inconsistencies

We've identified several inconsistencies in the badge implementations:

1. **Inconsistent Background Colors**:
   - Status badges use full opacity backgrounds in some places (`bg-green-500`) but transparent backgrounds in others (`bg-blue-500/10`)
   - No consistent pattern for when to use solid vs. transparent backgrounds

2. **Inconsistent Badge Types**:
   - VDOM badges use `bg-purple-500/10 text-purple-700 border-purple-200`
   - Route types/protocols use `bg-blue-500/10 text-blue-700 border-blue-200` 
   - Status indicators have different styling across pages (solid vs. transparent)
   - Empty/placeholder values use `bg-gray-100 text-gray-800 border-gray-200`

3. **No Defined Badge System**:
   - Some data types appear with different badge styles across pages
   - No consistent semantic meaning attached to specific colors
   - Direct color references instead of theme variables

## Implementation Plan

### 1. Update Badge Component

Extend the `badge.tsx` component to include semantic variants that align with data types:

```tsx
// fortinet-web/components/ui/badge.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // New semantic variants
        success: "border-transparent bg-green-500/10 text-green-700 border-green-200 [a&]:hover:bg-green-500/20",
        error: "border-transparent bg-red-500/10 text-red-700 border-red-200 [a&]:hover:bg-red-500/20",
        warning: "border-transparent bg-amber-500/10 text-amber-700 border-amber-200 [a&]:hover:bg-amber-500/20",
        info: "border-transparent bg-blue-500/10 text-blue-700 border-blue-200 [a&]:hover:bg-blue-500/20",
        vdom: "border-transparent bg-purple-500/10 text-purple-700 border-purple-200 [a&]:hover:bg-purple-500/20",
        protocol: "border-transparent bg-blue-500/10 text-blue-700 border-blue-200 [a&]:hover:bg-blue-500/20",
        placeholder: "border-transparent bg-gray-100 text-gray-800 border-gray-200 [a&]:hover:bg-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
```

### 2. Badge Type Usage Guidelines

Follow these guidelines for consistent badge usage throughout the application:

| Data Type | Badge Variant | Example Use |
|-----------|--------------|-------------|
| Status (up) | `success` | Network interfaces, service status |
| Status (down) | `error` | Network interfaces, service status |
| Status (unknown) | `warning` | Network interfaces, service status |
| VDOMs | `vdom` | VDOM names, associations |
| Protocols | `protocol` | Network protocols, route types |
| Empty/Placeholders | `placeholder` | Missing or null values |
| Descriptions/Metadata | `info` | Additional information, descriptions |

### 3. Page Updates

Update each page to use the new badge variants. Here are specific changes for each page:

#### interfaces/page.tsx

Update the status badges (lines 154-165):

```tsx
<Badge
  variant={
    iface.status === 'up'
      ? 'success'
      : iface.status === 'down'
      ? 'error'
      : 'warning'
  }
>
  {iface.status || 'unknown'}
</Badge>
```

Update VDOM badges (lines 119-122):

```tsx
<Badge variant="vdom">
  {iface.vdom.vdom_name}
</Badge>
```

Update placeholder badges (lines 113-115, 124-126, 148-150):

```tsx
<Badge variant="placeholder">
  -
</Badge>
```

Update description badges (lines 133-136):

```tsx
<Badge variant="info" className="cursor-help flex items-center space-x-1 hover:bg-blue-500/20">
  <span className="w-2 h-2 bg-blue-700 rounded-full"></span>
  <span>Description</span>
</Badge>
```

#### vips/page.tsx

Update VDOM badges (lines 178-180):

```tsx
<Badge variant="vdom">
  {vip.vdom.vdom_name}
</Badge>
```

Update protocol badges (lines 228-230):

```tsx
<Badge variant="protocol">
  {vip.protocol}
</Badge>
```

Update placeholder badges (lines 182-184, 189-191, 193-195, 206-208, 210-212, 217-219, 221-223, 232-234):

```tsx
<Badge variant="placeholder">
  -
</Badge>
```

#### routes/page.tsx

Update route type badges (lines 109-111):

```tsx
<Badge variant="protocol">
  {route.route_type}
</Badge>
```

Update VDOM badges (lines 132-134):

```tsx
<Badge variant="vdom">
  {route.vdom.vdom_name}
</Badge>
```

Update placeholder badges (lines 120-126, 136-138):

```tsx
<Badge variant="placeholder">
  -
</Badge>
```

#### firewalls/page.tsx

Update placeholder badges (lines 113-115, 117-119, 124-126, 128-130):

```tsx
<Badge variant="placeholder">
  -
</Badge>
```

Update VDoms badge (lines 136-139):

```tsx
<Badge variant="info" className="cursor-help flex items-center space-x-1 hover:bg-blue-500/20">
  <span className="w-2 h-2 bg-blue-700 rounded-full"></span>
  <span>VDoms ({firewall.total_vdoms || 0})</span>
</Badge>
```

## Visual Reference

Here is a visual reference for the new badge styles:

```
Success Badge:   [  up  ]   - Green transparent background with dark green text
Error Badge:     [ down ]   - Red transparent background with dark red text
Warning Badge:   [ wait ]   - Amber transparent background with dark amber text
Info Badge:      [ info ]   - Blue transparent background with dark blue text
VDOM Badge:      [ root ]   - Purple transparent background with dark purple text
Protocol Badge:  [ TCP  ]   - Blue transparent background with dark blue text
Placeholder:     [  -   ]   - Light gray background with dark gray text
```

## Theme Integration

To better support theming and dark mode, consider updating the badge variants to use theme variables from `globals.css`. Add these variables to the theme:

```css
/* Add to globals.css in both :root and .dark sections */
:root {
  /* ... existing variables ... */
  
  /* Badge colors */
  --badge-success-bg: oklch(0.9 0.1 140 / 10%);
  --badge-success-text: oklch(0.5 0.15 140);
  --badge-success-border: oklch(0.8 0.1 140 / 30%);
  
  --badge-error-bg: oklch(0.9 0.1 25 / 10%);
  --badge-error-text: oklch(0.5 0.15 25);
  --badge-error-border: oklch(0.8 0.1 25 / 30%);
  
  --badge-warning-bg: oklch(0.9 0.1 85 / 10%);
  --badge-warning-text: oklch(0.5 0.15 85);
  --badge-warning-border: oklch(0.8 0.1 85 / 30%);
  
  --badge-info-bg: oklch(0.9 0.1 245 / 10%);
  --badge-info-text: oklch(0.5 0.15 245);
  --badge-info-border: oklch(0.8 0.1 245 / 30%);
  
  --badge-vdom-bg: oklch(0.9 0.1 300 / 10%);
  --badge-vdom-text: oklch(0.5 0.15 300);
  --badge-vdom-border: oklch(0.8 0.1 300 / 30%);
  
  --badge-protocol-bg: oklch(0.9 0.1 245 / 10%);
  --badge-protocol-text: oklch(0.5 0.15 245);
  --badge-protocol-border: oklch(0.8 0.1 245 / 30%);
  
  --badge-placeholder-bg: oklch(0.95 0.01 0);
  --badge-placeholder-text: oklch(0.3 0.01 0);
  --badge-placeholder-border: oklch(0.8 0.01 0 / 30%);
}

.dark {
  /* ... existing variables ... */
  
  /* Badge colors for dark mode - adjust lightness and opacity as needed */
  --badge-success-bg: oklch(0.3 0.15 140 / 20%);
  --badge-success-text: oklch(0.8 0.1 140);
  --badge-success-border: oklch(0.5 0.15 140 / 30%);
  
  /* Continue with other badge variables for dark mode */
}
```

Then update the badge variants to use these theme variables:

```tsx
// Updated badge variants using theme variables
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // ... existing variants ...
        
        // Theme-based variants
        success: "border-[var(--badge-success-border)] bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] [a&]:hover:bg-[var(--badge-success-bg)/80]",
        error: "border-[var(--badge-error-border)] bg-[var(--badge-error-bg)] text-[var(--badge-error-text)] [a&]:hover:bg-[var(--badge-error-bg)/80]",
        warning: "border-[var(--badge-warning-border)] bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] [a&]:hover:bg-[var(--badge-warning-bg)/80]",
        info: "border-[var(--badge-info-border)] bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] [a&]:hover:bg-[var(--badge-info-bg)/80]",
        vdom: "border-[var(--badge-vdom-border)] bg-[var(--badge-vdom-bg)] text-[var(--badge-vdom-text)] [a&]:hover:bg-[var(--badge-vdom-bg)/80]",
        protocol: "border-[var(--badge-protocol-border)] bg-[var(--badge-protocol-bg)] text-[var(--badge-protocol-text)] [a&]:hover:bg-[var(--badge-protocol-bg)/80]",
        placeholder: "border-[var(--badge-placeholder-border)] bg-[var(--badge-placeholder-bg)] text-[var(--badge-placeholder-text)] [a&]:hover:bg-[var(--badge-placeholder-bg)/80]",
      },
    },
    // ... defaultVariants ...
  }
)
```

## Testing

After implementing these changes, test the application in both light and dark modes to ensure:

1. All badges have consistent appearance within their semantic type
2. Badges are clearly visible and maintain good contrast in both themes
3. Hover states work correctly
4. Any custom className overrides still function as expected

## Future Considerations

1. Consider creating a UI component showcase page that displays all badge variants
2. Document this badge system in a shared design system guide
3. Consider using these semantic variants as a pattern for other components like buttons, alerts, etc.