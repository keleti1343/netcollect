# Combobox Focus Color Implementation Plan

## Problem Statement
Currently, the combobox hover color has been updated to match the sidebar background with a light, almost transparent effect. However, the focus state color doesn't match this new hover color. The goal is to ensure consistency between hover and focus states in the combobox component.

## Current Implementation
- We have already implemented a new CSS variable `--combobox-item-hover-bg` in `globals.css` set to `color-mix(in srgb, var(--sidebar-bg-start) 15%, transparent)`.
- The `CommandItem` component in `command.tsx` now uses this variable for its hover/selected state with `data-[selected=true]:bg-[var(--combobox-item-hover-bg)]`.
- The focus state is currently using the default styling, which doesn't match our custom hover effect.

## Proposed Solution

### Step 1: Modify the CommandItem Component to Include Focus Styling

We need to update the `CommandItem` component in `fortinet-web/components/ui/command.tsx` to include focus styling that matches the hover styling:

```tsx
<CommandPrimitive.Item
  data-slot="command-item"
  className={cn(
    "data-[selected=true]:bg-[var(--combobox-item-hover-bg)] data-[selected=true]:text-accent-foreground focus:bg-[var(--combobox-item-hover-bg)] focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  )}
  {...props}
/>
```

The key changes here are:
- Adding `focus:bg-[var(--combobox-item-hover-bg)]` to match the background color on focus
- Adding `focus:text-accent-foreground` to ensure text color consistency on focus

### Step 2: Create a Combobox Focus Variable in globals.css (Optional)

For better maintainability, we can create a dedicated CSS variable for the focus state in `fortinet-web/app/globals.css`:

In `:root` (light theme):
```css
/* Combobox */
--combobox-item-hover-bg: color-mix(in srgb, var(--sidebar-bg-start) 15%, transparent);
--combobox-item-focus-bg: var(--combobox-item-hover-bg); /* Match hover color */
```

In `.dark` (dark theme):
```css
/* Combobox */
--combobox-item-hover-bg: color-mix(in srgb, var(--sidebar-bg-start) 15%, transparent);
--combobox-item-focus-bg: var(--combobox-item-hover-bg); /* Match hover color */
```

Then update the `CommandItem` component to use this variable:

```tsx
className={cn(
  "data-[selected=true]:bg-[var(--combobox-item-hover-bg)] data-[selected=true]:text-accent-foreground focus:bg-[var(--combobox-item-focus-bg)] focus:text-accent-foreground ...",
  className
)}
```

This approach allows for easier future changes if we want to differentiate between hover and focus states.

### Step 3: Update the Button Component Focus for Combobox Trigger (Optional)

If we want to be thorough, we could also update the focus styling for the button that triggers the combobox to match our new color scheme. This would require modifying the button component or creating a custom variant for when it's used in the combobox.

However, since the focus ring styling for buttons is part of the global design system, it might be better to keep the default focus ring behavior to maintain accessibility and consistency across the application.

## Benefits
- **Visual Consistency:** The focus and hover states will share the same styling, creating a more cohesive user experience.
- **Improved Accessibility:** Clear focus indicators help keyboard users navigate the interface more effectively.
- **Maintainability:** Using CSS variables makes it easy to adjust both hover and focus states simultaneously if needed in the future.