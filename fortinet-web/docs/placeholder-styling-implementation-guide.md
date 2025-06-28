# Placeholder Value Styling Implementation Guide

## Problem Statement

Based on the review of the VIPs page, there's an inconsistency in how placeholder values ("-") are displayed:

- In the PROTOCOL column, placeholder dashes ("-") are wrapped in badge components with rounded corners and appropriate styling
- In the VIP NAME column and other columns (EXTERNAL PORT, MAPPED PORT), placeholder dashes are displayed as plain text
- This inconsistency affects the visual hierarchy and readability of the application

## Implementation Plan

### 1. Create a Reusable PlaceholderBadge Component

```tsx
// fortinet-web/components/ui/placeholder-badge.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface PlaceholderBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string;
  type?: "default" | "protocol" | "vdom" | "info";
}

export function PlaceholderBadge({
  value,
  type = "default",
  className,
  ...props
}: PlaceholderBadgeProps) {
  // If value is not a placeholder, just return it as is
  if (value !== "-") {
    return <span className={className} {...props}>{value}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium",
        "bg-[var(--badge-placeholder-bg)] text-[var(--badge-placeholder-text)] border border-[var(--badge-placeholder-border)]",
        className
      )}
      {...props}
    >
      {value}
    </span>
  );
}
```

### 2. Apply PlaceholderBadge in the VIPs Page

Identify the component that renders the VIPs table. Look for files like:
- `fortinet-web/app/vips/page.tsx`
- `fortinet-web/app/vips/components/vips-table.tsx` or similar

Update the table cells to use the PlaceholderBadge component:

```tsx
import { PlaceholderBadge } from "@/components/ui/placeholder-badge";

// For VIP NAME column
<td className="p-3">
  {row.vipName ? row.vipName : <PlaceholderBadge value="-" />}
</td>

// For PROTOCOL column (already seems to use badges)
<td className="p-3">
  <PlaceholderBadge value={row.protocol || "-"} type="protocol" />
</td>

// For other columns with potential placeholder values
<td className="p-3">
  {row.externalPort ? row.externalPort : <PlaceholderBadge value="-" />}
</td>
```

### 3. Systematically Review and Update All Pages

Check each page with tabular data for consistent placeholder handling:

#### Firewalls Page
- Check `fortinet-web/app/firewalls/page.tsx` and its components
- Update any table cells that might display placeholders

#### VDOMs Page
- Check `fortinet-web/app/vdoms/page.tsx` and its components
- Ensure consistent badge usage for placeholder values

#### Routes Page
- Check `fortinet-web/app/routes/page.tsx` and its components
- Update route tables to handle placeholder values consistently

#### Interfaces Page
- Check `fortinet-web/app/interfaces/page.tsx` and its components
- Verify placeholder handling in interface tables

#### IP List Page
- Check `fortinet-web/app/ip-list/page.tsx` and its components
- Update placeholder handling in IP list tables

#### Search IPs Page
- Check `fortinet-web/app/search-ips/page.tsx` and its components
- Verify placeholder handling in search results

### 4. Check for Shared Table Components

If the application uses shared table components, update those to handle placeholders consistently:

- Look for files like `fortinet-web/components/ui/data-table.tsx`
- Check for custom table cell renderers that might need updating

### 5. Testing

After implementing the changes:

1. **Visual Testing**:
   - Check each page for consistent placeholder styling
   - Verify badges appear correctly in both light and dark themes

2. **Browser Testing**:
   - Test in different browsers (Chrome, Firefox, Safari)
   - Verify responsive behavior on different screen sizes

## Implementation Example

Here's a detailed example of how to update the VIPs page component:

### Step 1: Locate the VIPs Table Component

Find the component that renders the VIPs table in the `fortinet-web/app/vips` directory.

### Step 2: Update the Component

```tsx
// fortinet-web/app/vips/components/vips-table.tsx (example path)
import { PlaceholderBadge } from "@/components/ui/placeholder-badge";

// Inside the component that renders the table rows:
{vips.map((vip) => (
  <tr key={vip.id} className="border-b border-[var(--table-row-border)]">
    <td className="p-3">
      <span className="badge badge-vdom">{vip.vdomName}</span>
    </td>
    <td className="p-3">
      {vip.vipName ? vip.vipName : <PlaceholderBadge value="-" />}
    </td>
    <td className="p-3">
      <span className="text-mono">{vip.externalIp}</span>
    </td>
    <td className="p-3">
      <span className="text-mono">{vip.mappedIp}</span>
    </td>
    <td className="p-3">
      {vip.externalPort ? vip.externalPort : <PlaceholderBadge value="-" />}
    </td>
    <td className="p-3">
      {vip.mappedPort ? vip.mappedPort : <PlaceholderBadge value="-" />}
    </td>
    <td className="p-3">
      <PlaceholderBadge value={vip.protocol || "-"} type="protocol" />
    </td>
    <td className="p-3">
      {vip.lastUpdated}
    </td>
  </tr>
))}
```

## CSS Styling

The CSS for placeholder badges is already defined in `globals.css` with appropriate variables for both light and dark modes:

```css
/* Light mode */
--badge-placeholder-bg: oklch(0.95 0.01 0);
--badge-placeholder-text: oklch(0.3 0.01 0);
--badge-placeholder-border: oklch(0.8 0.01 0 / 30%);

/* Dark mode */
--badge-placeholder-bg: oklch(0.2 0.01 0);
--badge-placeholder-text: oklch(0.7 0.01 0);
--badge-placeholder-border: oklch(0.4 0.01 0 / 30%);
```

## Conclusion

By implementing these changes, we'll achieve:

1. **Visual Consistency**: All placeholder values will have consistent styling across the application
2. **Improved Readability**: Badge-styled placeholders are easier to identify at a glance
3. **Maintainability**: A reusable component for handling placeholders makes future updates simpler
4. **Better User Experience**: Consistent styling enhances the overall polish of the application

This implementation follows the typography design system already established in the application, ensuring that placeholder values receive the same level of design attention as other UI elements.