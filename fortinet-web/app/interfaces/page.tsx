import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { getInterfaces, getVdoms } from "@/services/api"; // Import getVdoms
import { InterfaceResponse, VDOMResponse } from "@/types"; // Import VDOMResponse
import { InterfacesFilter } from "./components/interfaces-filter";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"; // Import HoverCard components
import { Button } from "@/components/ui/button";
import { TableCode } from "@/components/ui/table-code"; // Import TableCode
import { HoverCardHeader } from "@/components/ui/hover-card-header"; // Import HoverCardHeader
import { EmptyState } from "@/components/empty-state"; // Import EmptyState

export default async function InterfacesPage({
  searchParams
}: {
  searchParams: { name?: string; ip?: string; vdom_id?: string; page?: string; pageSize?: string }
}) {
  const searchParamsObj = await searchParams;
  const name = searchParamsObj.name;
  const ip = searchParamsObj.ip;
  const vdom_id = searchParamsObj.vdom_id; // Read vdom_id
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParamsObj.pageSize) : 15;

  const filters: Record<string, string> = {};
  if (name) filters.interface_name = name;
  if (ip) filters.ip_address = ip;
  if (vdom_id) filters.vdom_id = vdom_id; // Add vdom_id to filters

  filters.skip = ((page - 1) * pageSize).toString();
  filters.limit = pageSize.toString();

  const interfacesResponse = await getInterfaces(filters);
  const interfaces = interfacesResponse.items;
  const totalCount = interfacesResponse.total_count;

  const vdomsResponse = await getVdoms({}); // Fetch all VDOMs
  const vdoms = vdomsResponse.items;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
          <div>
            <h1 className="text-3xl tracking-tight">Interfaces</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor network interfaces across your Fortinet devices
            </p>
          </div>
        </div>
        {/* Enhanced Filter Card */}
        <Card className="border shadow-md">
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
        <Card className="border shadow-md">
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
                      <TableCell colSpan={6}>
                        <EmptyState title="No Interfaces Found" description="No interfaces match your criteria. Try adjusting your filters." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    interfaces.map((iface: InterfaceResponse) => (
                      <TableRow key={iface.interface_id} className="hover:bg-muted/20 border-b">
                        <TableCell className="font-medium">{iface.interface_name}</TableCell>
                        <TableCell>
                          <TableCode>{iface.ip_address || '-'}</TableCode>
                        </TableCell>
                        <TableCell>
                          {iface.vdom?.vdom_name ? (
                            <Badge variant="vdom">
                              {iface.vdom.vdom_name}
                            </Badge>
                          ) : (
                            <Badge variant="placeholder">
                              -
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {iface.description ? (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Badge variant="info" className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                                  Description
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent className="p-0">
                                <HoverCardHeader>
                                  <h4 className="font-medium">Interface Description</h4>
                                </HoverCardHeader>
                                <div className="p-[var(--hover-card-content-padding)]">
                                  <p className="text-sm">{iface.description}</p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <Badge variant="placeholder">
                              -
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              iface.status === 'up'
                                ? 'success'
                                : iface.status === 'down'
                                ? 'error'
                                : 'warning'
                            }
                          >
                            {iface.status || 'unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <small>{new Date(iface.last_updated).toLocaleString()}</small>
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
  );
}