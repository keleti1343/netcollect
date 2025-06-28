import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableCode } from "@/components/ui/table-code";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DataPagination } from "@/components/data-pagination";
import { VdomsFilter } from "./components/vdoms-filter";
import { getVdoms, getFirewalls, getInterfaces, getRoutes, getVips } from "@/services/api";
import { InterfaceResponse, RouteResponse, VIPResponse, FirewallResponse } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Button } from "@/components/ui/button";
import { HoverCardHeader } from "@/components/ui/hover-card-header"; // Import HoverCardHeader
import { PrimaryCell, CountCell, DateTimeCell, TechnicalCell } from "@/components/ui/table-cells"; // Import TechnicalCell at top level
import { EmptyState } from "@/components/empty-state";
import { FilterSection } from "@/components/ui/FilterSection";

export default async function VdomsPage({
  searchParams
}: {
  searchParams: { fw_name?: string; vdom_name?: string; page?: string; pageSize?: string }
}) {
  const searchParamsObj = await searchParams;
  const fw_name = searchParamsObj.fw_name;
  const vdom_name = searchParamsObj.vdom_name;
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParams.pageSize) : 15;

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

  // Nested components for Interfaces, VIPs, and Routes lists
  async function InterfacesList({ vdomId, vdomName }: { vdomId: number, vdomName: string }) {
    const { items: interfaces } = await getInterfaces({ vdom_id: vdomId.toString() });

    return (
      <div className="space-y-2">
        <ScrollArea className={interfaces.length > 0 ? "h-[300px] w-full" : "w-full"} orientation="both"> {/* Conditional height */}
          <ul className="list-none pl-4 space-y-1 overflow-x-auto w-max">
            {interfaces.length > 0 ? (
              interfaces.map((iface: InterfaceResponse) => (
                <li key={iface.interface_id} className="p-2 rounded bg-neutral-50 hover:bg-muted flex items-center text-sm">
                  <span className="mr-2 text-muted-foreground">−</span>
                  <TableCode>{iface.interface_name}</TableCode> - <TableCode>{iface.ip_address}</TableCode>
                </li>
              ))
            ) : (
              <li className="p-2 rounded bg-neutral-50 hover:bg-muted flex items-center text-sm">
                <span className="mr-2 text-muted-foreground">−</span>
                <TableCode>No interfaces found</TableCode>
              </li>
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
        <ScrollArea className={vips.length > 0 ? "h-[300px] w-full" : "w-full"} orientation="both"> {/* Conditional height */}
          <ul className="list-none pl-4 space-y-1 overflow-x-auto w-max">
            {vips.length > 0 ? (
              vips.map((vip: VIPResponse) => (
                <li key={vip.vip_id} className="p-2 rounded bg-neutral-50 hover:bg-muted flex items-center text-sm">
                  <span className="mr-2 text-muted-foreground">−</span>
                  <TableCode>{vip.external_ip}</TableCode> → <TableCode>{vip.mapped_ip}</TableCode>
                </li>
              ))
            ) : (
              <li className="p-2 rounded bg-neutral-50 hover:bg-muted flex items-center text-sm">
                <span className="mr-2 text-muted-foreground">−</span>
                <TableCode>No VIPs found</TableCode>
              </li>
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
        <ScrollArea className={routes.length > 0 ? "h-[300px] w-full" : "w-full"} orientation="both"> {/* Conditional height */}
          <ul className="list-none pl-4 space-y-1 overflow-x-auto w-max">
            {routes.length > 0 ? (
              routes.map((route: RouteResponse) => (
                <li key={route.route_id} className="p-2 rounded bg-neutral-50 hover:bg-muted flex items-center text-sm">
                  <span className="mr-2 text-muted-foreground">−</span>
                  <TableCode>{route.destination_network}/{route.mask_length}</TableCode> via <TableCode>{route.gateway || route.exit_interface_name}</TableCode>
                </li>
              ))
            ) : (
              <li className="p-2 rounded bg-neutral-50 hover:bg-muted flex items-center text-sm">
                <span className="mr-2 text-muted-foreground">−</span>
                <TableCode>No routes found</TableCode>
              </li>
            )}
          </ul>
      </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl tracking-tight">
          VDoms
          <div className="h-1 w-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-2 rounded-full"></div>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage virtual domains across your Fortinet devices
        </p>
      </div>
      
      {/* Enhanced Filter Card */}
      <FilterSection>
        <VdomsFilter
          firewalls={firewalls}
          initialFwName={fw_name}
          initialVdomName={vdom_name}
        />
      </FilterSection>
      
      {/* Enhanced Main Content Card */}
      <Card
        className="border shadow-sm"
        style={{
          borderColor: 'rgba(26, 32, 53, 0.15)'
        }}
      >
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
          <div className="text-sm text-muted-foreground">
            {vdoms.length > 0
              ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}`
              : 'No VDom found'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead>VDom Name</TableHead>
                  <TableHead>Firewall</TableHead>
                  <TableHead>Interfaces</TableHead>
                  <TableHead>VIPs</TableHead>
                  <TableHead>Routes</TableHead>
                  <TableHead>Last Updated</TableHead>
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
                    <TableRow key={vdom.vdom_id}>
                      <TechnicalCell value={vdom.vdom_name} />
                      <TableCell>
                        {vdom.firewall?.fw_name ? (
                          <TableCode>
                            {vdom.firewall.fw_name}
                          </TableCode>
                        ) : (
                          <TableCode>
                            -
                          </TableCode>
                        )}
                      </TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <TableCell className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                            <TableCode>
                              {vdom.total_interfaces} interfaces
                            </TableCode>
                          </TableCell>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-0">
                          <HoverCardHeader>
                            <h4 className="font-medium">{vdom.vdom_name}'s interfaces</h4>
                          </HoverCardHeader>
                          <div className="p-[var(--hover-card-content-padding)]">
                            <InterfacesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <TableCell className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                            <TableCode>
                              {vdom.total_vips} VIPs
                            </TableCode>
                          </TableCell>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-0">
                          <HoverCardHeader>
                            <h4 className="font-medium">{vdom.vdom_name}'s VIPs</h4>
                          </HoverCardHeader>
                          <div className="p-[var(--hover-card-content-padding)]">
                            <VipsList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <TableCell className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                            <TableCode>
                              {vdom.total_routes} routes
                            </TableCode>
                          </TableCell>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-0">
                          <HoverCardHeader>
                            <h4 className="font-medium">{vdom.vdom_name}'s routes</h4>
                          </HoverCardHeader>
                          <div className="p-[var(--hover-card-content-padding)]">
                            <RoutesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <DateTimeCell date={vdom.last_updated} />
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
