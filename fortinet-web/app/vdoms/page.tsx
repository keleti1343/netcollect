import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DataPagination } from "@/components/data-pagination";
import { VdomsFilter } from "./components/vdoms-filter";
import { getVdoms, getFirewalls, getInterfaces, getRoutes, getVips } from "@/services/api";
import { InterfaceResponse, RouteResponse, VIPResponse, FirewallResponse } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">List of Vdoms</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <VdomsFilter
            firewalls={firewalls}
            initialFwName={fw_name}
            initialVdomName={vdom_name}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>VDom List</CardTitle>
          <CardDescription>Virtual domains across firewall devices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
              {vdoms.map((vdom) => (
                <TableRow key={vdom.vdom_id}>
                  <TableCell>{vdom.vdom_name}</TableCell>
                  <TableCell>{vdom.firewall?.fw_name || '-'}</TableCell>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="cursor-help underline">View Interfaces</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <InterfacesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="cursor-help underline">View VIPs</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <VipsList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="cursor-help underline">View Routes</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <RoutesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name}/>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell>{new Date(vdom.last_updated).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-center">
            <DataPagination currentPage={page} totalPages={totalPages} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function InterfacesList({ vdomId, vdomName }: { vdomId: number, vdomName: string }) {
  const interfacesResponse = await getInterfaces({ vdom_id: vdomId.toString() });
  const interfaces = interfacesResponse.items; // Access the items array

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Interfaces for {vdomName}</h4>
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {interfaces.length > 0 ? (
            interfaces.map((iface: InterfaceResponse) => (
              <li key={iface.interface_id}>
                {iface.interface_name} - {iface.ip_address || 'No IP'}
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
  const vips = await getVips({ vdom_id: vdomId.toString() });

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">VIPs for {vdomName}</h4>
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {vips.length > 0 ? (
            vips.map((vip: VIPResponse) => (
              <li key={vip.vip_id}>
                {vip.external_ip} → {vip.mapped_ip}
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
      <h4 className="font-semibold">Routes for {vdomName}</h4>
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {routes.length > 0 ? (
            routes.map((route: RouteResponse) => (
              <li key={route.route_id}>
                {route.destination_network}/{route.mask_length} via {route.gateway || route.exit_interface_name}
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
