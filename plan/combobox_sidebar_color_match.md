# Fix for Dropdown/Combobox Background Color to Match Sidebar

## Problem Description

The dropdown/combobox buttons (showing "Select firewall...") currently have a lighter blue color (#5b5b8a) that doesn't match the sidebar background. Based on user feedback and the screenshot provided, we need to modify the dropdown color to exactly match the sidebar background color.

![Screenshot showing a blue dropdown with "Select firewall..." text](not-saved-image.png)

## Current Implementation

Currently in `fortinet-web/app/globals.css`:

```css
/* Combobox - Light Version of Sidebar Color */
--combobox-bg: #5b5b8a; /* Lighter version of sidebar color #2d2d45 */
--combobox-text: white;
--combobox-hover-bg: #6b6ba0; /* Even lighter for hover state */

/* Combobox */
--combobox-item-hover-bg: var(--combobox-bg, #5b5b8a);
--combobox-item-hover-text: var(--combobox-text, white);
```

The sidebar colors are defined as:

```css
/* Sidebar */
--sidebar-bg-start: #1a2035;
--sidebar-bg-end: #232a40;
```

## Step-by-Step Fix

1. Open the file `fortinet-web/app/globals.css`
2. Find the section with Combobox CSS variables (around line 216-222)
3. Update the combobox background color to match the sidebar background
4. Adjust hover states to be consistent with the sidebar styling

### Implementation

Update the CSS variables in the `fortinet-web/app/globals.css` file:

```css
/* Combobox - Match Sidebar Color */
--combobox-bg: var(--sidebar-bg-start, #1a2035); /* Match sidebar start color */
--combobox-text: white;
--combobox-hover-bg: var(--sidebar-bg-end, #232a40); /* Use sidebar end color for hover */

/* Combobox */
--combobox-item-hover-bg: var(--combobox-bg, #1a2035);
--combobox-item-hover-text: var(--combobox-text, white);
```

## Explanation

1. **Exact Match**: We're now using the exact same color as the sidebar background start color (#1a2035) for the combobox background
2. **Hover State**: Using the sidebar end color (#232a40) for hover, which is slightly lighter but still within the same color family
3. **Variables**: Using CSS variables to ensure consistency if sidebar colors change in the future

## Expected Result

After applying these changes:
1. The dropdown/combobox buttons will have the exact same background color as the sidebar
2. The visual consistency between the sidebar and dropdown elements will be improved
3. The text will remain legible with good contrast against the dark background