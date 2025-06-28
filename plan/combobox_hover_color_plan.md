# Combobox Hover Color Implementation Plan

## Problem Statement
The current hover color for the combobox items is a solid blue, which is not consistent with the sidebar's color scheme. The goal is to change the hover color to a very light, almost transparent version of the sidebar's background color to create a more cohesive user interface.

## Current Implementation
- The `CommandItem` component in `fortinet-web/components/ui/command.tsx` uses the `data-[selected=true]:bg-accent` class to set the background color of the selected (hovered) item.
- The `--color-accent` variable is set to `#4895ef` in both light and dark themes in `fortinet-web/app/globals.css`.
- The sidebar background color is defined by `--sidebar-bg-start` which is `#1a2035`.

## Proposed Solution

### Step 1: Create a New CSS Variable

We will introduce a new CSS variable named `--combobox-item-hover-bg` in `fortinet-web/app/globals.css`. This variable will define the new hover color. We will use the `color-mix` function to blend the sidebar's background color with transparency. This will be done for both the light and dark themes to ensure consistency.

In `:root` (light theme) in `fortinet-web/app/globals.css`, add:
```css
  /* Combobox */
  --combobox-item-hover-bg: color-mix(in srgb, var(--sidebar-bg-start) 15%, transparent);
```

In `.dark` (dark theme) in `fortinet-web/app/globals.css`, add:
```css
  /* Combobox */
  --combobox-item-hover-bg: color-mix(in srgb, var(--sidebar-bg-start) 15%, transparent);
```

### Step 2: Update the `CommandItem` Component

Next, we will modify the `CommandItem` component in `fortinet-web/components/ui/command.tsx` to use our new CSS variable for the hover effect.

- **From:**
  ```tsx
  className={cn(
    "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground ...",
    className
  )}
  ```
- **To:**
  ```tsx
  className={cn(
    "data-[selected=true]:bg-[var(--combobox-item-hover-bg)] data-[selected=true]:text-accent-foreground ...",
    className
  )}
  ```
This change will replace the solid `accent` color with our new, lighter, semi-transparent color on hover.

## Benefits
- **Visual Consistency:** The new hover color will align with the application's overall color palette, specifically the sidebar.
- **Improved User Experience:** The subtle hover effect will be less jarring than the current solid color, providing a smoother user experience.
- **Maintainability:** Using a CSS variable makes it easy to update the hover color in the future if the design changes.