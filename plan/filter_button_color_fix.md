# Fix for "Apply Filter" Button Background Color

## Problem Description

The "Apply Filter" button background color currently doesn't match the sidebar background color as previously designed. This creates a visual inconsistency in the user interface.

## Current Implementation

Currently in `fortinet-web/app/globals.css`:

```css
/* Filter Buttons */
--filter-button-primary-bg: #3b82f6; /* Adjust this to your brand color */
--filter-button-primary-text: white;
--filter-button-primary-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
--filter-button-primary-hover-bg: #2563eb;
--filter-button-primary-hover-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

The sidebar styling uses:

```css
/* Sidebar */
--sidebar-bg-start: #1a2035;
--sidebar-bg-end: #232a40;
--sidebar-button-bg: #2d2d45; /* Lighter shade of sidebar color */
--sidebar-button-hover-bg: #3c3c5c; /* Even lighter shade for hover */
```

## Step-by-Step Fix

1. Open the file `fortinet-web/app/globals.css`
2. Find the section with filter button CSS variables (around line 220)
3. Replace the current filter button CSS variables with:

```css
/* Filter Buttons */
--filter-button-primary-bg: var(--sidebar-button-bg, #2d2d45); /* Match sidebar button color */
--filter-button-primary-text: white;
--filter-button-primary-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
--filter-button-primary-hover-bg: var(--sidebar-button-hover-bg, #3c3c5c); /* Match sidebar button hover */
--filter-button-primary-hover-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
```

## Why This Fix Works

1. **Consistency**: The "Apply Filter" button will now use the same background color as the sidebar buttons, creating visual harmony
2. **Adaptability**: By using CSS variables instead of hardcoded colors, the button will automatically adapt if the sidebar colors are changed
3. **Mode Support**: This approach works for both light and dark modes since it references the appropriate sidebar variables

## Additional Notes

- No changes are needed to the button components themselves as they already use these CSS variables
- The button components at:
  - `fortinet-web/app/firewalls/components/firewalls-filter.tsx`
  - `fortinet-web/app/routes/components/routes-filter.tsx`
  - `fortinet-web/app/interfaces/components/interfaces-filter.tsx`
  - `fortinet-web/app/vips/components/vips-filter.tsx`
  - `fortinet-web/app/vdoms/components/vdoms-filter.tsx`
  - (and any other filter components)
  
  All use the CSS class:
  ```tsx
  className="bg-[var(--filter-button-primary-bg)] text-[var(--filter-button-primary-text)] shadow-[var(--filter-button-primary-shadow)] hover:bg-[var(--filter-button-primary-hover-bg)] hover:shadow-[var(--filter-button-primary-hover-shadow)] transition-all"
  ```

## Expected Result

After applying these changes, the "Apply Filter" button will have a background color that matches the sidebar buttons, creating a more cohesive visual experience.