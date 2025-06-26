# Fortinet-Web Design Implementation Plan

This document outlines a step-by-step plan for implementing the consolidated design system across all pages of the Fortinet-Web application. It provides specific code changes needed for each page to ensure consistency.

## Implementation Approach

1. Create reusable design patterns from the firewalls page (which already follows most design guidelines)
2. Apply these patterns to each page systematically
3. Address page-specific requirements while maintaining design consistency
4. Ensure responsive design across all pages

## Common Page Structure

Every page should follow this consistent structure:

```tsx
<div className="space-y-6 max-w-7xl mx-auto">
  {/* Enhanced Page Header */}
  <div className="flex items-center justify-between pb-6 border-b">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{PageTitle}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {PageDescription}
      </p>
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  </div>
  
  {/* Enhanced Filter Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3">
      <CardTitle className="text-lg flex items-center">
        {/* Filter icon */}
        Filter Options
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      {/* Page-specific filter component */}
    </CardContent>
  </Card>
  
  {/* Enhanced Main Content Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-lg flex items-center">
          {/* Content icon */}
          {ContentTitle}
        </CardTitle>
        <CardDescription>
          Total: {totalCount} {itemType}
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {items.length > 0 ? 
            `Showing ${(currentPage - 1) * currentPageSize + 1}-${Math.min(currentPage * currentPageSize, totalCount)} of ${totalCount}` : 
            `No ${itemType} found`}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-auto">
        <Table className="border-collapse">
          {/* Enhanced table header and body */}
        </Table>
      </div>
      
      {/* Enhanced Pagination */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} {itemType}
          </div>
          <DataPagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

## Page-by-Page Implementation Plan

### 1. Interfaces Page Implementation

Current state: Basic structure but lacks enhanced styling

```tsx
// Current
<div className="space-y-6">
  <h1 className="text-3xl font-bold">Interfaces</h1>
  
  <Card>
    <CardHeader>
      <CardTitle>Filter Options</CardTitle>
    </CardHeader>
    <CardContent>
      <InterfacesFilter initialName={name} initialIp={ip} vdoms={vdoms} />
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Network Interfaces</CardTitle>
      <CardDescription>Manage network interfaces</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        {/* Table content */}
      </Table>
      
      <div className="mt-4 flex justify-center">
        <DataPagination currentPage={page} totalPages={totalPages} />
      </div>
    </CardContent>
  </Card>
</div>
```

Changes needed:
1. Add max width container and update spacing
2. Enhance page header with description and action buttons
3. Style filter card with icon and background
4. Format table header with consistent styling
5. Improve table content with consistent styling
6. Format pagination section consistently

Updated code:

```tsx
<div className="space-y-6 max-w-7xl mx-auto">
  {/* Enhanced Page Header */}
  <div className="flex items-center justify-between pb-6 border-b">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Interfaces</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Manage and monitor network interfaces across your Fortinet devices
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <span className="mr-2">Export</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </Button>
      <Button size="sm">
        <span className="mr-2">Refresh</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
      </Button>
    </div>
  </div>
  
  {/* Enhanced Filter Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3">
      <CardTitle className="text-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter Options
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <InterfacesFilter initialName={name} initialIp={ip} vdoms={vdoms} />
    </CardContent>
  </Card>
  
  {/* Enhanced Main Content Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          Network Interfaces
        </CardTitle>
        <CardDescription>
          Total: {totalCount} interfaces
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {interfaces.length > 0 ? 
            `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}` : 
            'No interfaces found'}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-auto">
        <Table className="border-collapse">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/20">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Name</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">IP Address</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDOM Name</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Description</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Status</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interfaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No interfaces found
                </TableCell>
              </TableRow>
            ) : (
              interfaces.map((iface: import("../types").InterfaceResponse) => (
                <TableRow key={iface.interface_id} className="hover:bg-muted/20 border-b">
                  <TableCell className="font-medium">{iface.interface_name}</TableCell>
                  <TableCell>
                    {iface.ip_address ? (
                      <code className="px-2 py-1 bg-muted rounded text-sm">{iface.ip_address}</code>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{iface.vdom?.vdom_name || '-'}</TableCell>
                  <TableCell>
                    {iface.description ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Badge variant="outline" className="cursor-help flex items-center space-x-1 hover:bg-primary/10">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            <span>Description</span>
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-0">
                          <div className="bg-muted/50 p-3 border-b">
                            <h4 className="font-semibold">Interface Description</h4>
                          </div>
                          <div className="p-3">
                            <p className="text-sm">{iface.description}</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        iface.status === 'up'
                          ? 'bg-green-500 text-white'
                          : iface.status === 'down'
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white'
                      }
                    >
                      {iface.status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className="text-sm">{new Date(iface.last_updated).toLocaleString()}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced Pagination */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} interfaces
          </div>
          <DataPagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### 2. Routes Page Implementation

Current state: Basic structure but lacks enhanced styling

Changes needed:
1. Add max width container and update spacing
2. Enhance page header with description and action buttons
3. Style filter card with icon and background
4. Format table header with consistent styling
5. Improve table content with consistent styling for destination networks
6. Format pagination section consistently

Updated code:

```tsx
<div className="space-y-6 max-w-7xl mx-auto">
  {/* Enhanced Page Header */}
  <div className="flex items-center justify-between pb-6 border-b">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Routes</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Manage routing tables across your Fortinet devices
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <span className="mr-2">Export</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </Button>
      <Button size="sm">
        <span className="mr-2">Refresh</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
      </Button>
    </div>
  </div>
  
  {/* Enhanced Filter Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3">
      <CardTitle className="text-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter Options
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <RoutesFilter vdoms={vdoms} initialVdomId={vdom_id} />
    </CardContent>
  </Card>
  
  {/* Enhanced Main Content Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Routing Table
        </CardTitle>
        <CardDescription>
          Total: {totalCount} routes
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {routes.length > 0 ? 
            `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}` : 
            'No routes found'}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-auto">
        <Table className="border-collapse">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/20">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Route Type</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Destination</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Gateway</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Exit Interface</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDom</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No routes found
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route, index) => (
                <TableRow key={`${route.route_id}-${index}-${route.destination_network}`} className="hover:bg-muted/20 border-b">
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                      {route.route_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      {route.destination_network}/{route.mask_length}
                    </code>
                  </TableCell>
                  <TableCell>{route.gateway === 'None' || route.gateway === 'n/a' ? '-' : route.gateway || '-'}</TableCell>
                  <TableCell className="font-medium">{route.exit_interface_name}</TableCell>
                  <TableCell>
                    {route.vdom ? (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-200">
                        {route.vdom.vdom_name}
                      </Badge>
                    ) : (
                      'No VDOM'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className="text-sm">{new Date(route.last_updated).toLocaleString()}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced Pagination */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} routes
          </div>
          <DataPagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### 3. VIPs Page Implementation

Current state: Client-side rendered with loading/error states but lacking enhanced styling

Changes needed:
1. Add max width container and update spacing
2. Enhance page header with description and action buttons
3. Style filter card with icon and background
4. Format table header with consistent styling
5. Improve table content with consistent styling
6. Format pagination section consistently
7. Maintain client-side loading/error states

Updated code:

```tsx
<div className="space-y-6 max-w-7xl mx-auto">
  {/* Enhanced Page Header */}
  <div className="flex items-center justify-between pb-6 border-b">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">VIPs</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Manage virtual IP mappings across your Fortinet devices
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <span className="mr-2">Export</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </Button>
      <Button size="sm" onClick={() => fetchData()}>
        <span className="mr-2">Refresh</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
      </Button>
    </div>
  </div>
  
  {/* Enhanced Filter Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3">
      <CardTitle className="text-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter Options
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <VipsFilter vdoms={vdoms} initialVdomId={vdom_id} />
    </CardContent>
  </Card>
  
  {/* Enhanced Main Content Card */}
  <Card className="border shadow-sm">
    <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a1.93 1.93 0 0 0-.97 1.68v4.62a1.93 1.93 0 0 0 .97 1.68l3.65 1.9"/><path d="m22 17.65-3.37 1.75a1.93 1.93 0 0 1-1.81 0l-3.65-1.9a1.93 1.93 0 0 1-.97-1.68v-4.62a1.93 1.93 0 0 1 .97-1.68l3.65-1.9a1.93 1.93 0 0 1 1.81 0L22 9.37"/></svg>
          VIP Devices
        </CardTitle>
        <CardDescription>
          Total: {totalCount} virtual IPs
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {vips.length > 0 ? 
            `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}` : 
            'No VIPs found'}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-auto">
        <Table className="border-collapse">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/20">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDOM Name</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VIP Name</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">External IP</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Mapped IP</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">External Port</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Mapped Port</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Protocol</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No VIPs found
                </TableCell>
              </TableRow>
            ) : (
              vips.map((vip) => (
                <TableRow key={vip.vip_id} className="hover:bg-muted/20 border-b">
                  <TableCell>
                    {vip.vdom?.vdom_name ? (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-200">
                        {vip.vdom.vdom_name}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{vip.vip_name || '-'}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm">{vip.external_ip}</code>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm">{vip.mapped_ip}</code>
                  </TableCell>
                  <TableCell>{vip.external_port || '-'}</TableCell>
                  <TableCell>{vip.mapped_port || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                      {vip.protocol || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className="text-sm">{new Date(vip.last_updated).toLocaleString()}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced Pagination */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} VIPs
          </div>
          <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### 4. Implementation Plan for Other Pages

For IP List, Search IPs, and VDoms pages, follow the same pattern:

1. Add max width container and update spacing
2. Enhance page header with description and action buttons
3. Style filter card with icon and background
4. Format table header with consistent styling
5. Improve table content with consistent styling
6. Format pagination section consistently

## Animation & Interaction Implementation

Add these animations to each page:

1. Add hover effects to table rows:
```css
/* Already included in the updated code with the hover:bg-muted/20 classes */
```

2. Add transitions to interactive elements:
```css
/* Add to global.css */
.interactive-element {
  transition: background-color 0.2s, transform 0.1s;
}
```

3. Enhance focus states:
```css
/* Add to global.css */
.interactive-element:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

## Mobile Responsiveness Implementation

Add responsive classes to each page:

1. Main container:
```tsx
<div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

2. Page header:
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b">
```

3. Table container:
```tsx
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <Table>
      {/* Table content */}
    </Table>
  </div>
</div>
```

4. Pagination:
```tsx
<div className="border-t p-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
      {/* Pagination info */}
    </div>
    <DataPagination currentPage={page} totalPages={totalPages} />
  </div>
</div>
```

## Implementation Strategy

1. Start with the components that are used across all pages:
   - Page header
   - Filter card
   - Main content card with table
   - Pagination

2. Apply the design to each page in this order:
   - Interfaces page
   - Routes page
   - VIPs page
   - IP List page
   - Search IPs page
   - VDoms page

3. After each page implementation, verify the page looks consistent with the design system

4. Once all pages are updated, verify the responsive design by testing at different screen sizes

5. Add the animations and transitions as the final step