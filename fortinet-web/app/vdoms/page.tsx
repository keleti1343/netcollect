import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DataPagination } from "@/components/data-pagination";
import { VdomsFilter } from "./components/vdoms-filter";
import { getVdoms, getFirewalls, getInterfaces, getRoutes, getVips } from "@/services/api";
import { InterfaceResponse, RouteResponse, VIPResponse, FirewallResponse } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Button } from "@/components/ui/button";
import { HoverCardHeader } from "@/components/ui/hover-card-header"; // Import HoverCardHeader
import { TableCode } from "@/components/ui/table-code"; // Import TableCode

export default async function VdomsPage({
  searchParams
}: {
  searchParams: { fw_name?: string; vdom_name?: string; page?: string; pageSize?: string }
}) {
  const searchParamsObj = await searchParams;
  const fw_name = searchParamsObj.fw_name;
  const vdom_name = searchParamsObj.vdom_name;
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParamsObj.pageSize) : 15;

  const filters: Record<string, string> = {};
  if (fw_name) filters.fw_name = fw_name;
  if (vdom_name) filters.vdom_name = vdom_name;

  filters.skip = ((page - 1) * pageSize).toString();
  filters.limit = pageSize.toString();

  const vdomsResponse = await getVdoms(filters);
  const vdoms = vdomsResponse.items;
  const totalCount = vdomsResponse.total_count;

  const firewallsResponse = await getFirewalls();
  const firewalls = firewallsResponse.items;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl tracking-tight">VDoms</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage virtual domains across your Fortinet devices
        </p>
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
          <VdomsFilter
            firewalls={firewalls}
            initialFwName={fw_name}
            initialVdomName={vdom_name}
          />
        </CardContent>
      </Card>
      
      {/* Enhanced Main Content Card */}
      <Card className="border shadow-md">
        <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              VDom List
            </CardTitle>
            <CardDescription>
              Total: {totalCount} virtual domains
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {vdoms.length > 0 ?
                `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}` :
                'No VDom found'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-muted/20">
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDom Name</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Firewall</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Interfaces</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VIPs</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Routes</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vdoms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState title="No VDOMs Found" description="No virtual domains match your criteria. Try adjusting your filters." />
                    </TableCell>
                  </TableRow>
                ) : (
                  vdoms.map((vdom) => (
                    <TableRow key={vdom.vdom_id} className="hover:bg-muted/20 border-b">
                      <TableCell className="font-medium">{vdom.vdom_name}</TableCell>
                      <TableCell>
                        {vdom.firewall?.fw_name ? (
                          <Badge variant="placeholder">
                            {vdom.firewall.fw_name}
                          </Badge>
                        ) : (
                          <Badge variant="placeholder">
                            -
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Badge variant="info" count={vdom.total_interfaces || 0} className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                              Interfaces
                            </Badge>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-0">
                            <HoverCardHeader>
                              <h4 className="font-medium">Interfaces for {vdom.vdom_name}</h4>
                            </HoverCardHeader>
                            <div className="p-[var(--hover-card-content-padding)]">
                              <InterfacesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Badge variant="info" count={vdom.total_vips || 0} className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                              VIPs
                            </Badge>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-0">
                            <HoverCardHeader>
                              <h4 className="font-medium">VIPs for {vdom.vdom_name}</h4>
                            </HoverCardHeader>
                            <div className="p-[var(--hover-card-content-padding)]">
                              <VipsList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Badge variant="info" count={vdom.total_routes || 0} className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                              Routes
                            </Badge>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-0">
                            <HoverCardHeader>
                              <h4 className="font-medium">Routes for {vdom.vdom_name}</h4>
                            </HoverCardHeader>
                            <div className="p-[var(--hover-card-content-padding)]">
                              <RoutesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <small>{new Date(vdom.last_updated).toLocaleString()}</small>
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
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} virtual domains
              </div>
              <DataPagination currentPage={page} totalPages={totalPages} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function InterfacesList({ vdomId, vdomName }: { vdomId: number, vdomName: string }) {
  const { items: interfaces } = await getInterfaces({ vdom_id: vdomId.toString() });

  return (
    <div className="space-y-2">
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {interfaces.length > 0 ? (
            interfaces.map((iface: InterfaceResponse) => (
              <li key={iface.interface_id}>
                {iface.interface_name} - <TableCode>{iface.ip_address || '-'}</TableCode>
              </li>
            ))
          ) : (
            <li>No interfaces found</li>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}

async function VipsList({ vdomId, vdomName }: { vdomId: number, vdomName: string }) {
  const { items: vips } = await getVips({ vdom_id: vdomId.toString() });

  return (
    <div className="space-y-2">
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {vips.length > 0 ? (
            vips.map((vip: VIPResponse) => (
              <li key={vip.vip_id}>
                <TableCode>{vip.external_ip}</TableCode> → <TableCode>{vip.mapped_ip}</TableCode>
              </li>
            ))
          ) : (
            <li>No VIPs found</li>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}

async function RoutesList({ vdomId, vdomName }: { vdomId: number, vdomName: string }) {
  const { items: routes } = await getRoutes({ vdom_id: vdomId.toString() });

  return (
    <div className="space-y-2">
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {routes.length > 0 ? (
            routes.map((route: RouteResponse) => (
              <li key={route.route_id}>
                <TableCode>{route.destination_network}/{route.mask_length}</TableCode> via {route.gateway ? (
                  <TableCode>{route.gateway}</TableCode>
                ) : (
                  <TableCode>{route.exit_interface_name}</TableCode>
                )}
              </li>
            ))
          ) : (
            <li>No routes found</li>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}
