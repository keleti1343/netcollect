# Placeholder Badge Implementation Steps

Based on our review of the VIPs page and the current codebase, we've identified an inconsistency in how placeholder values ("-") are displayed across the application. This document provides detailed steps to implement a consistent approach to displaying placeholder values using the existing Badge component.

## Identified Issues

1. On the VIPs page, in the "VIP NAME" column, placeholder values ("-") are displayed as plain text:
   ```tsx
   <TableCell className="font-medium">
     {vip.vip_name || '-'}
   </TableCell>
   ```

2. But in the same table, other placeholder values (like in the PROTOCOL column) are correctly displayed with Badge components:
   ```tsx
   <TableCell>
     {vip.protocol ? (
       <Badge variant="protocol">
         {vip.protocol}
       </Badge>
     ) : (
       <Badge variant="placeholder">
         -
       </Badge>
     )}
   </TableCell>
   ```

3. Similar inconsistencies may exist across other pages in the application.

## Implementation Steps

### 1. Update VIPs Page

In `fortinet-web/app/vips/page.tsx`, modify the following sections:

#### VIP NAME Column
```tsx
// CURRENT:
<TableCell className="font-medium">
  {vip.vip_name || '-'}
</TableCell>

// CHANGE TO:
<TableCell className="font-medium">
  {vip.vip_name ? (
    vip.vip_name
  ) : (
    <Badge variant="placeholder">
      -
    </Badge>
  )}
</TableCell>
```

#### EXTERNAL PORT Column
```tsx
// CURRENT:
<TableCell>
  <TableCode>{vip.external_port || '-'}</TableCode>
</TableCell>

// CHANGE TO:
<TableCell>
  {vip.external_port ? (
    <TableCode>{vip.external_port}</TableCode>
  ) : (
    <Badge variant="placeholder">
      -
    </Badge>
  )}
</TableCell>
```

#### MAPPED PORT Column
```tsx
// CURRENT:
<TableCell>
  <TableCode>{vip.mapped_port || '-'}</TableCode>
</TableCell>

// CHANGE TO:
<TableCell>
  {vip.mapped_port ? (
    <TableCode>{vip.mapped_port}</TableCode>
  ) : (
    <Badge variant="placeholder">
      -
    </Badge>
  )}
</TableCell>
```

### 2. Create a Utility Component (Optional)

To make future usage more consistent, consider creating a `PlaceholderValue` component:

Create a new file `fortinet-web/components/ui/placeholder-value.tsx`:

```tsx
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

Then update the VIPs page to use this component:

```tsx
import { PlaceholderValue } from "@/components/ui/placeholder-value";

// For normal text values:
<TableCell className="font-medium">
  <PlaceholderValue value={vip.vip_name} />
</TableCell>

// For code-formatted values:
<TableCell>
  <PlaceholderValue value={vip.external_port} useCode />
</TableCell>
```

### 3. Check and Update Other Pages

Review and update the following pages to ensure consistent placeholder handling:

#### Firewalls Page
Check `fortinet-web/app/firewalls/page.tsx` and related components for placeholder handling.

#### VDOMs Page
Check `fortinet-web/app/vdoms/page.tsx` and related components for placeholder handling.

#### Routes Page
Check `fortinet-web/app/routes/page.tsx` and related components for placeholder handling.

#### IP List Page
Check `fortinet-web/app/ip-list/page.tsx` and related components for placeholder handling.

#### Search IPs Page
Check `fortinet-web/app/search-ips/page.tsx` and related components for placeholder handling.

### 4. Update Interfaces Page (Specific Changes)

Based on our review, in `fortinet-web/app/interfaces/page.tsx`, update:

```tsx
// CURRENT:
<TableCell>
  <TableCode>{iface.ip_address || '-'}</TableCode>
</TableCell>

// CHANGE TO:
<TableCell>
  {iface.ip_address ? (
    <TableCode>{iface.ip_address}</TableCode>
  ) : (
    <Badge variant="placeholder">
      -
    </Badge>
  )}
</TableCell>
```

## Testing Instructions

After implementing these changes, verify:

1. **Visual Consistency**: All placeholder values ("-") should have the same styling (light gray background, rounded corners) across all tables and pages.

2. **Check Each Page**: Navigate through all pages to ensure placeholder values are consistently styled.

3. **Test in Both Themes**: Verify the placeholder badges appear correctly in both light and dark themes.

4. **Responsive Testing**: Ensure the placeholder badges display correctly on different screen sizes.

## Future Maintenance

Moving forward, any new tables or data displays that might contain placeholder values should:

1. Use the `Badge` component with the `placeholder` variant for empty/missing values
2. Consider using the new `PlaceholderValue` utility component for consistent handling

This ensures visual consistency throughout the application and provides a better user experience by clearly distinguishing between actual data and placeholder values.