# VDoms Hover Card Data Restoration Plan

## Current Issue Analysis

From the screenshot and code review, I can see that:

1. **Hover cards are positioning correctly** - The positioning fix worked
2. **Content is placeholder data** - Currently showing static text like "Showing X of X interfaces" instead of actual data
3. **Missing data components** - Need to create components that fetch and display actual interfaces, VIPs, and routes

## What Should Be Displayed

Based on the application structure, each hover card should show:

### Interfaces Hover Card
- List of actual network interfaces for that VDOM
- Interface names, IPs, status, etc.
- Fetched from the interfaces API endpoint

### VIPs Hover Card  
- List of actual Virtual IPs for that VDOM
- VIP names, addresses, ports, etc.
- Fetched from the VIPs API endpoint

### Routes Hover Card
- List of actual routes for that VDOM
- Destination networks, gateways, interfaces, etc.
- Fetched from the routes API endpoint

## Implementation Plan

### Step 1: Create Data Components
Create three new components similar to `VdomsList` from the Firewalls page:
- `InterfacesList` - Fetches and displays interfaces for a VDOM
- `VipsList` - Fetches and displays VIPs for a VDOM  
- `RoutesList` - Fetches and displays routes for a VDOM

### Step 2: Update VDoms Page
Replace the placeholder content in the `UniversalHoverCard` components with the actual data components:

```typescript
// Current placeholder:
content={
  <div className="text-center py-4 text-muted-foreground text-xs min-h-[200px] flex items-center justify-center">
    <TableCode>Showing {vdom.total_interfaces || 0} of {vdom.total_interfaces || 0} interfaces</TableCode>
  </div>
}

// Should be:
content={<InterfacesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name} />}
```

### Step 3: API Integration
Each data component will:
- Accept `vdomId` and `vdomName` as props
- Fetch data from the appropriate API endpoint when the component mounts
- Display loading state while fetching
- Show the actual data in a scrollable list format
- Handle error states gracefully

### Step 4: Data Display Format
Follow the same pattern as `VdomsList` in the Firewalls page:
- Scrollable area for long lists
- Consistent styling with bullet points
- Technical formatting for names/IDs
- Proper loading and error states

## API Endpoints Needed

Based on the application structure, these endpoints should exist:
- `/interfaces?vdom_id={vdomId}` - Get interfaces for a VDOM
- `/vips?vdom_id={vdomId}` - Get VIPs for a VDOM  
- `/routes?vdom_id={vdomId}` - Get routes for a VDOM

## Implementation Steps

1. **Create InterfacesList component** - Fetch and display interfaces
2. **Create VipsList component** - Fetch and display VIPs
3. **Create RoutesList component** - Fetch and display routes
4. **Update VDoms page** - Replace placeholder content with data components
5. **Test functionality** - Verify data loads correctly in hover cards

## Expected Result

After implementation:
- Hover cards will show actual data instead of placeholder text
- Users can see detailed lists of interfaces, VIPs, and routes for each VDOM
- Data will be fetched dynamically when hover cards are opened
- Consistent experience across all hover cards in the application

## Files to Modify

1. `fortinet-web/app/vdoms/components/` - Create new data list components
2. `fortinet-web/app/vdoms/page.tsx` - Update hover card content
3. `fortinet-web/services/api.ts` - Add API functions if needed

This will restore the full functionality that users expect from the VDoms hover cards.