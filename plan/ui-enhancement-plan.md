# Table Field Styling Enhancement Plan

Based on your request to enhance the table field display in the Search IPs functionality, I'll create a detailed plan for implementing these changes:

1. Replace all "unknown" values with "-" in badge components
2. Wrap all table fields (except "LAST UPDATED") in badge components

## Implementation Plan

### Step 1: Modify the PlaceholderValue Component

First, we need to update the `PlaceholderValue` component to display "-" instead of "unknown" and wrap its output in a badge.

1. Locate the `PlaceholderValue` component:
   ```
   fortinet-web/components/ui/placeholder-value.tsx
   ```

2. Modify the component to:
   - Display "-" instead of "unknown" when values are empty/null
   - Wrap non-empty values in a badge component when not using code formatting
   - Add a "placeholder" variant for badges that contain "-" values

```tsx
import { Badge } from "@/components/ui/badge";
import { TableCode } from "@/components/ui/table-code";

interface PlaceholderValueProps {
  value: string | null | undefined;
  useCode?: boolean;
}

export function PlaceholderValue({ value, useCode = false }: PlaceholderValueProps) {
  // When value is empty/null/undefined
  if (!value || value === "unknown") {
    return (
      <Badge variant="outline" className="text-muted-foreground font-normal">
        -
      </Badge>
    );
  }

  // When value is present and code format is requested
  if (useCode) {
    return <TableCode>{value}</TableCode>;
  }

  // When value is present (normal text wrapped in badge)
  return (
    <Badge variant="secondary" className="font-normal">
      {value}
    </Badge>
  );
}
```

### Step 2: Update Interface Table Fields in search-ips/page.tsx

1. Modify the Interface Name field to use a badge (around line 198):

```tsx
<TableCell>
  <Badge variant="secondary" className="font-normal">
    {iface.interface_name}
  </Badge>
</TableCell>
```

2. Ensure IP Address field is properly formatted (around line 196):

```tsx
<TableCell>
  {iface.ip_address ? (
    <Badge variant="secondary" className="font-normal">
      <TableCode>{iface.ip_address}</TableCode>
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground font-normal">
      -
    </Badge>
  )}
</TableCell>
```

3. Leave the Last Updated cell unchanged (around line 218-222).

### Step 3: Update Route Table Fields in search-ips/page.tsx

1. Update the Destination Network cell to wrap TableCode in a Badge (around line 266):

```tsx
<TableCell>
  <Badge variant="secondary" className="font-normal">
    <TableCode>{route.destination_network}/{route.mask_length}</TableCode>
  </Badge>
</TableCell>
```

2. Modify the Exit Interface Name field to use a badge (around line 268):

```tsx
<TableCell>
  <Badge variant="secondary" className="font-normal">
    {route.exit_interface_name}
  </Badge>
</TableCell>
```

3. Ensure Gateway field properly handles 'n/a' values (around line 274):

```tsx
<TableCell>
  {route.gateway && route.gateway !== 'n/a' ? (
    <Badge variant="secondary" className="font-normal">
      <TableCode>{route.gateway}</TableCode>
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground font-normal">
      -
    </Badge>
  )}
</TableCell>
```

4. Leave the Last Updated cell unchanged (around line 280-284).

### Step 4: Update VIP Table Fields in search-ips/page.tsx

1. Update the External IP and Mapped IP cells to wrap TableCode in a Badge (around lines 327-331):

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

2. Update the VIP Type cell to ensure consistent badge formatting (around line 332-337):

```tsx
<TableCell>
  {vip.vip_type ? (
    <Badge variant="secondary" className="font-normal">
      {vip.vip_type}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground font-normal">
      -
    </Badge>
  )}
</TableCell>
```

3. Leave the Last Updated cell unchanged (around line 342-346).

### Step 5: Alternative Approach - Update Each Location Directly

If modifying the PlaceholderValue component isn't preferred, we can alternatively update each individual instance directly in the search-ips/page.tsx file:

#### For Interface Table:
- Replace each occurrence of `<PlaceholderValue value={...} />` with:
  ```tsx
  {value ? (
    <Badge variant="secondary" className="font-normal">
      {value}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground font-normal">
      -
    </Badge>
  )}
  ```

- For values with `useCode` property, replace with:
  ```tsx
  {value ? (
    <Badge variant="secondary" className="font-normal">
      <TableCode>{value}</TableCode>
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground font-normal">
      -
    </Badge>
  )}
  ```

- Wrap non-badge fields (except Last Updated) with:
  ```tsx
  <Badge variant="secondary" className="font-normal">
    {/* existing content */}
  </Badge>
  ```

## Implementation Notes

1. The design will maintain a consistent look across all tables
2. The Last Updated column will remain in its current format
3. Special formatting (like code blocks) will be preserved within badges
4. We'll use a muted badge variant for placeholder values ("-") to indicate they're empty values
5. Regular values will use a more prominent badge style to highlight actual data

This approach will create a clean, consistent UI where:
- All data fields stand out with badge styling
- Empty values are clearly indicated with "-" in a subtle badge
- Last Updated maintains its special formatting for readability