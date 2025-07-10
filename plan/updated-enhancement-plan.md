# Updated Table Field Styling Enhancement Plan

After reviewing the current code, here's a detailed plan for implementing the requested changes:

1. Replace all "unknown" values with "-" in badge components
2. Wrap all table fields (except "LAST UPDATED") in badge components

## Implementation Plan

### Step 1: Modify the PlaceholderValue Component

The current `PlaceholderValue` component already has some of the functionality we need, but needs to be updated to:
1. Handle "unknown" string values as empty
2. Wrap all values (except when using code) in badge components

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
  // Check for null, undefined, empty string, or "unknown"
  if ((!value && value !== 0) || value === "unknown") {
    return (
      <Badge variant="outline" className="text-muted-foreground font-normal">
        -
      </Badge>
    );
  }
  
  // When value is present and code format is requested
  if (useCode) {
    return <TableCode className={className}>{value}</TableCode>;
  }
  
  // When value is present (normal text wrapped in badge)
  return (
    <Badge variant="secondary" className={`font-normal ${className || ''}`}>
      {value}
    </Badge>
  );
}
```

### Step 2: Update Interface Table Fields in search-ips/page.tsx

1. Wrap the interface_name field in a Badge component (line ~198):

```tsx
<TableCell>
  <Badge variant="secondary" className="font-normal">
    {iface.interface_name}
  </Badge>
</TableCell>
```

2. Leave the status cell as is since it already uses a Badge.

3. Ensure the IP Address field is properly formatted:

```tsx
<TableCell>
  <PlaceholderValue value={iface.ip_address} useCode />
</TableCell>
```

4. Leave the Last Updated cell unchanged (lines ~218-222).

### Step 3: Update Route Table Fields in search-ips/page.tsx

1. Modify the Exit Interface Name field to use a badge (line ~268):

```tsx
<TableCell>
  <Badge variant="secondary" className="font-normal">
    {route.exit_interface_name}
  </Badge>
</TableCell>
```

2. The route_type already uses a Badge, so leave it as is.

3. The destination_network is already using TableCode, but we need to wrap it in a Badge:

```tsx
<TableCell>
  <Badge variant="secondary" className="font-normal">
    <TableCode>{route.destination_network}/{route.mask_length}</TableCode>
  </Badge>
</TableCell>
```

4. Leave the Last Updated cell unchanged (lines ~280-284).

### Step 4: Update VIP Table Fields in search-ips/page.tsx

1. For External IP and Mapped IP fields that use TableCode, wrap them in Badge components:

```tsx
<TableCell>
  <Badge variant="secondary" className="font-normal">
    <TableCode>{vip.external_ip}</TableCode>
  </Badge>
</TableCell>

<TableCell>
  <Badge variant="secondary" className="font-normal">
    <TableCode>{vip.mapped_ip}</TableCode>
  </Badge>
</TableCell>
```

2. Leave the Last Updated cell unchanged (lines ~342-346).

### Step 5: Testing

After implementing these changes:

1. Test in the browser to ensure all fields display correctly
2. Verify that all "unknown" values are now displayed as "-" in a badge
3. Confirm all fields (except Last Updated) are wrapped in badges
4. Check that the styling is consistent across all three tables

## Implementation Notes

1. The `PlaceholderValue` component modification is the most crucial change, as it will handle most of the badge wrapping and "unknown" to "-" conversion.
2. For table cells that directly render values (like interface_name), we'll need to explicitly wrap them in Badge components.
3. For cells that use TableCode, we'll wrap them in Badge components while preserving the code formatting inside.
4. All Last Updated cells will remain unchanged to maintain the current formatting.

This approach creates a clean, consistent UI where:
- All data fields stand out with badge styling
- Empty or "unknown" values are clearly indicated with "-" in a subtle badge
- Last Updated maintains its special formatting for readability