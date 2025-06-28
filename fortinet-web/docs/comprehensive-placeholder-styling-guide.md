# Comprehensive Placeholder Styling Guide

## Overview

After reviewing the codebase, we've identified multiple instances where placeholder values ("-") are inconsistently displayed across the application. This guide provides comprehensive instructions for standardizing placeholder styling using the Badge component.

## Current Inconsistencies

The following patterns are currently being used for placeholder values:

1. **Plain Text**: `{value || '-'}`
2. **TableCode Wrapped**: `<TableCode>{value || '-'}</TableCode>`
3. **Badge Component** (correct approach): `<Badge variant="placeholder">-</Badge>`

## Files Requiring Updates

### 1. VIPs Page (`fortinet-web/app/vips/page.tsx`)

```tsx
// Line 185: VIP NAME column
<TableCell className="font-medium">
  {vip.vip_name || '-'}
</TableCell>

// Line 194-197: EXTERNAL PORT and MAPPED PORT columns
<TableCell>
  <TableCode>{vip.external_port || '-'}</TableCode>
</TableCell>
<TableCell>
  <TableCode>{vip.mapped_port || '-'}</TableCode>
</TableCell>
```

### 2. Interfaces Page (`fortinet-web/app/interfaces/page.tsx`)

```tsx
// Line 111: IP ADDRESS column
<TableCell>
  <TableCode>{iface.ip_address || '-'}</TableCode>
</TableCell>
```

### 3. VDOMs Page (`fortinet-web/app/vdoms/page.tsx`)

```tsx
// Line 212: Interface listing
<li key={iface.interface_id}>
  {iface.interface_name} - <TableCode>{iface.ip_address || '-'}</TableCode>
</li>
```

### 4. Search IPs Page (`fortinet-web/app/search-ips/page.tsx`)

```tsx
// Line 194: IP ADDRESS column
<TableCell>
  <TableCode>{iface.ip_address || '-'}</TableCode>
</TableCell>

// Line 229: STATUS column (might already be using a Badge)
{iface.status || '-'}

// Line 288: GATEWAY column
<TableCell>
  <TableCode>{route.gateway === 'n/a' ? '-' : route.gateway || '-'}</TableCode>
</TableCell>
```

### 5. IP List Page (`fortinet-web/app/ip-list/page.tsx`)

```tsx
// Line 113: IP ADDRESS column
<TableCell>
  <TableCode>{iface.ip_address || '-'}</TableCode>
</TableCell>
```

### 6. IP List Columns (`fortinet-web/app/ip-list/columns.tsx`)

```tsx
// Line 74: VDOM Name column
cell: ({ row }) => <div>{row.original.vdom?.vdom_name || '-'}</div>,
```

## Implementation Plan

### 1. Create a Utility Component

To ensure consistent handling of placeholders across the application, create a new utility component:

```tsx
// fortinet-web/components/ui/placeholder-value.tsx
import React from "react";
import { Badge } from "./badge";
import { TableCode } from "./table-code";

interface PlaceholderValueProps {
  value: string | number | null | undefined;
  useCode?: boolean;
  className?: string;
}

export function PlaceholderValue({ 
  value, 
  useCode = false,
  className 
}: PlaceholderValueProps) {
  if (!value && value !== 0) {
    return (
      <Badge variant="placeholder">
        -
      </Badge>
    );
  }
  
  return useCode ? (
    <TableCode className={className}>{value}</TableCode>
  ) : (
    <span className={className}>{value}</span>
  );
}
```

### 2. Update Each File

#### VIPs Page (`fortinet-web/app/vips/page.tsx`)

```tsx
// Import the utility component
import { PlaceholderValue } from "@/components/ui/placeholder-value";

// Replace VIP NAME column
<TableCell className="font-medium">
  <PlaceholderValue value={vip.vip_name} />
</TableCell>

// Replace EXTERNAL PORT column
<TableCell>
  <PlaceholderValue value={vip.external_port} useCode />
</TableCell>

// Replace MAPPED PORT column
<TableCell>
  <PlaceholderValue value={vip.mapped_port} useCode />
</TableCell>
```

#### Interfaces Page (`fortinet-web/app/interfaces/page.tsx`)

```tsx
// Import the utility component
import { PlaceholderValue } from "@/components/ui/placeholder-value";

// Replace IP ADDRESS column
<TableCell>
  <PlaceholderValue value={iface.ip_address} useCode />
</TableCell>
```

#### VDOMs Page (`fortinet-web/app/vdoms/page.tsx`)

```tsx
// Import the utility component
import { PlaceholderValue } from "@/components/ui/placeholder-value";

// Replace interface listing
<li key={iface.interface_id}>
  {iface.interface_name} - <PlaceholderValue value={iface.ip_address} useCode />
</li>
```

#### Search IPs Page (`fortinet-web/app/search-ips/page.tsx`)

```tsx
// Import the utility component
import { PlaceholderValue } from "@/components/ui/placeholder-value";

// Replace IP ADDRESS column
<TableCell>
  <PlaceholderValue value={iface.ip_address} useCode />
</TableCell>

// Replace STATUS column (if not already using Badge)
<PlaceholderValue value={iface.status} />

// Replace GATEWAY column
<TableCell>
  <PlaceholderValue value={route.gateway === 'n/a' ? null : route.gateway} useCode />
</TableCell>
```

#### IP List Page (`fortinet-web/app/ip-list/page.tsx`)

```tsx
// Import the utility component
import { PlaceholderValue } from "@/components/ui/placeholder-value";

// Replace IP ADDRESS column
<TableCell>
  <PlaceholderValue value={iface.ip_address} useCode />
</TableCell>
```

#### IP List Columns (`fortinet-web/app/ip-list/columns.tsx`)

```tsx
// Import the utility component
import { PlaceholderValue } from "@/components/ui/placeholder-value";

// Replace VDOM Name column
cell: ({ row }) => <PlaceholderValue value={row.original.vdom?.vdom_name} />,
```

## Alternative Approach (Without Utility Component)

If you prefer not to create a utility component, you can directly update each instance:

```tsx
// For regular text values
{value ? value : <Badge variant="placeholder">-</Badge>}

// For code-formatted values
{value ? <TableCode>{value}</TableCode> : <Badge variant="placeholder">-</Badge>}
```

## Testing

After implementing these changes:

1. **Visual Inspection**: Navigate through each page to verify all placeholder values are consistently styled.
2. **Theme Testing**: Check appearance in both light and dark themes.
3. **Responsive Testing**: Ensure proper display across different screen sizes.

## Benefits

1. **Visual Consistency**: All placeholder values will have the same styling across the application.
2. **Improved UX**: Users can quickly identify placeholder values vs. actual data.
3. **Maintainability**: A unified approach makes future updates easier.
4. **Accessibility**: Badge components provide better visual differentiation than plain text dashes.

## Future Development Guidelines

For all new components that may display placeholder values:

1. Use the `PlaceholderValue` utility component, or
2. Use the `Badge` component with `variant="placeholder"` for missing values

This ensures that placeholder styling remains consistent as the application evolves.