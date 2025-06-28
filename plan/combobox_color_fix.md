# Fix for Dropdown/Combobox Background Color

## Problem Description

The dropdown/combobox buttons (like the one showing "Select firewall...") currently have a background color that matches the sidebar but is too dark. The user wants to maintain the sidebar color theme but make these elements lighter for better visibility and visual hierarchy.

![Screenshot showing a blue dropdown with "Select firewall..." text](not-saved-image.png)

## Current Implementation

Currently in `fortinet-web/app/globals.css`:

```css
/* Combobox */
--combobox-item-hover-bg: var(--filter-button-primary-bg);
--combobox-item-hover-text: var(--filter-button-primary-text);
```

The combobox is using the filter button's background color, which is now set to:

```css
--filter-button-primary-bg: var(--sidebar-button-bg, #2d2d45); /* Match sidebar button color */
```

## Step-by-Step Fix

1. Open the file `fortinet-web/app/globals.css`
2. Find the section with Combobox CSS variables (around line 216-218)
3. Create a new CSS variable specifically for the combobox background color that is a lighter version of the sidebar color
4. Update the combobox CSS variables to use this new color

### Implementation

Add the following CSS variables in the `fortinet-web/app/globals.css` file:

```css
/* Combobox - Light Version of Sidebar Color */
--combobox-bg: #5b5b8a; /* Lighter version of sidebar color #2d2d45 */
--combobox-text: white;
--combobox-hover-bg: #6b6ba0; /* Even lighter for hover state */

/* Combobox */
--combobox-item-hover-bg: var(--combobox-bg, #5b5b8a);
--combobox-item-hover-text: var(--combobox-text, white);
```

The modifications should be made in both the light and dark mode sections of the CSS file, so the correct colors are used in both themes.

## Explanation of Color Choices

1. **Base Color**: `#5b5b8a` is a lighter shade of the sidebar's `#2d2d45`, maintaining the same hue but with increased lightness
2. **Hover Color**: `#6b6ba0` is even lighter to provide visual feedback on interaction
3. **Text Color**: Keeping white text for good contrast against these background colors

## Changes Overview

1. We're creating dedicated variables for the combobox colors instead of reusing the filter button variables
2. The new colors maintain the same color family as the sidebar (blue-purple tones) but are lighter
3. This creates a clearer visual hierarchy where the sidebar is darkest, the comboboxes are medium, and other UI elements have their own appropriate contrast

## Expected Result

After applying these changes:
1. The dropdown/combobox buttons will have a lighter blue-purple background that complements the sidebar
2. The text will remain legible with good contrast
3. The UI will maintain color harmony while providing better visual distinction between different types of elements