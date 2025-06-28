# Badge Style Consistency Fix

The current implementation has inconsistent badge styling between columns. The VDOM NAME column badges have a different background color compared to the IP ADDRESS column badges. Here's a step-by-step plan to fix this issue:

## Issue Analysis

Based on the screenshot, I can see:
- VDOM NAME column shows badges with purple background color (e.g., "mobile-web")
- IP ADDRESS column shows badges with a more subtle styling
- The inconsistency creates a visual imbalance in the table

## Implementation Plan

### Step 1: Examine Badge Variants in the System

First, we need to identify which badge variants are available in the system and what styling they apply. Looking at the code, we need to find which variant is used for IP addresses.

1. Check the Badge component implementation in `fortinet-web/components/ui/badge.tsx`
2. Identify the variant that provides the styling used for IP addresses

### Step 2: Update PlaceholderValue Component to Use Consistent Badge Variant

Modify the `PlaceholderValue` component to use the same badge variant for all values:

```tsx
// fortinet-web/components/ui/placeholder-value.tsx
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
    // Use TableCode but don't wrap in a badge for code values
    return <TableCode className={className}>{value}</TableCode>;
  }
  
  // When value is present (normal text wrapped in badge)
  // Use the same variant as seen in the VDOM NAME column in the screenshot
  return (
    <Badge variant="protocol" className={`font-normal ${className || ''}`}>
      {value}
    </Badge>
  );
}
```

### Step 3: Update Direct Badge Usage in search-ips/page.tsx

For cases where badges are directly used (not through PlaceholderValue), we need to update them to use the consistent variant:

1. For Interface Table Name Field:
```tsx
<TableCell>
  <Badge variant="protocol" className="font-normal">
    {iface.interface_name}
  </Badge>
</TableCell>
```

2. For Destination Network in Routes Table:
```tsx
<TableCell>
  <Badge variant="protocol" className="font-normal">
    <TableCode>{route.destination_network}/{route.mask_length}</TableCode>
  </Badge>
</TableCell>
```

3. For Exit Interface Name in Routes Table:
```tsx
<TableCell>
  <Badge variant="protocol" className="font-normal">
    {route.exit_interface_name}
  </Badge>
</TableCell>
```

4. For VIP External IP and Mapped IP:
```tsx
<TableCell>
  <Badge variant="protocol" className="font-normal">
    <TableCode>{vip.external_ip}</TableCode>
  </Badge>
</TableCell>

<TableCell>
  <Badge variant="protocol" className="font-normal">
    <TableCode>{vip.mapped_ip}</TableCode>
  </Badge>
</TableCell>
```

5. For VIP Type:
```tsx
<TableCell>
  {vip.vip_type ? (
    <Badge variant="protocol" className="font-normal">
      {vip.vip_type}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground font-normal">
      -
    </Badge>
  )}
</TableCell>
```

### Step 4: Testing and Verification

After implementing these changes:

1. Test in the browser to ensure all badges have consistent styling
2. Verify the badge style under "VDOM NAME" matches the badge style under "IP ADDRESS"
3. Check that the styling is consistent across all three tables (Interfaces, Routes, VIPs)

## Key Points

1. The issue was caused by using different badge variants across different columns
2. The fix involves using a consistent badge variant ("protocol") for all table fields
3. Empty/unknown values will continue to use the "outline" variant for visual distinction
4. The "LAST UPDATED" column remains unchanged, as requested

This approach ensures visual consistency across the table while maintaining the requirements to:
- Replace "unknown" values with "-" in badge components
- Wrap all table fields (except "LAST UPDATED") in badge components
- Use consistent badge styling across all columns