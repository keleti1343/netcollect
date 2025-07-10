# Table Padding Reduction Plan

## Problem Statement
The current table cell padding in the Fortinet Network Visualizer application is too large, causing inefficient use of screen space and requiring excessive scrolling. The tables should display more data in the same vertical space.

## Current Configuration
Looking at the `globals.css` file, the table cell padding is currently defined as:
```css
--table-cell-padding-x: 1rem; /* Horizontal padding */
--table-cell-padding-y: 1rem; /* Vertical padding */
```

This results in 16px of padding on all sides of table cells, which is excessive for a data-dense application.

## Solution Approach
We'll modify the table cell padding variables in the global CSS file to reduce the spacing while maintaining readability.

## Step-by-Step Implementation

### 1. Modify the CSS Variables

1. Open the file: `fortinet-web/app/globals.css`
2. Locate the table cell padding variables (around line 192-193)
3. Reduce the padding values as follows:

```css
--table-cell-padding-x: 0.5rem; /* Reduced from 1rem to 0.5rem (8px) */
--table-cell-padding-y: 0.375rem; /* Reduced from 1rem to 0.375rem (6px) */
```

4. Save the file

### 2. Add Compact Table Utility Class (Optional)

If you want to provide flexibility for different table densities, add a utility class that can be applied to specific tables:

1. In the same `globals.css` file, add the following class at the end (after line 500):

```css
/* Compact table variant */
.table-compact {
  --table-cell-padding-x: 0.375rem; /* 6px */
  --table-cell-padding-y: 0.25rem; /* 4px */
}
```

2. Save the file

### 3. Adjust Table Row Height (Recommended)

1. To maintain visual consistency, also adjust the table row height variable:

```css
--table-row-height: 2.5rem; /* Reduced from 3.5rem */
```

2. Save the file

### 4. Apply Changes and Verify

1. Rebuild the application using:
```bash
docker-compose build --no-cache fortinet-web-1 fortinet-web-2
```

2. Restart the containers:
```bash
docker-compose restart fortinet-web-1 fortinet-web-2
```

3. Refresh the browser and verify the changes

## Alternative Implementation (Component-Based)

If you prefer to keep the default padding and only apply the compact styling to specific tables:

1. Create a CSS utility class as shown in step 2 above
2. Apply the class selectively to tables in your components:

```tsx
<div className="table-compact">
  <table>
    {/* Table content */}
  </table>
</div>
```

## Expected Results

After implementing these changes:

1. Tables will display more rows in the same vertical space
2. Horizontal spacing will be reduced without compromising readability
3. The application will feel more data-dense and professional
4. Users will need to scroll less to view the same amount of data

## Visual Comparison

Before:
- Each table row takes ~56px vertical space (3.5rem)
- Padding around cell content is 16px on all sides

After:
- Each table row takes ~40px vertical space (2.5rem)
- Padding is 8px horizontally and 6px vertically
- Approximately 40% more rows visible in the same space

## Troubleshooting

If the changes don't appear after rebuilding and restarting:

1. Clear browser cache or do a hard refresh (Ctrl+F5)
2. Check browser developer tools to ensure CSS is being loaded
3. Verify CSS variables are being applied to table cells

## Additional Considerations

- Test across different screen sizes to ensure readability is maintained
- Consider user feedback after implementation
- For extremely dense tables, consider adding hover highlighting to improve row tracking