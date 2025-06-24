import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { getInterfaces, getVdoms } from "@/services/api"; // Import getVdoms
import { InterfaceResponse, VDOMResponse } from "@/types"; // Import VDOMResponse
import { InterfacesFilter } from "./components/interfaces-filter";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"; // Import HoverCard components

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
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>VDOM Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interfaces.map((iface: import("../types").InterfaceResponse) => (
                <TableRow key={iface.interface_id}>
                  <TableCell>{iface.interface_name}</TableCell>
                  <TableCell>{iface.ip_address || '-'}</TableCell>
                  <TableCell>{iface.vdom?.vdom_name || '-'}</TableCell>
                  <TableCell>
                    {iface.description ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Badge variant="secondary" className="cursor-help bg-blue-500 text-white">
                            Description
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <p className="text-sm">{iface.description}</p>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        iface.status === 'up'
                          ? 'default'
                          : iface.status === 'down'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className={
                        iface.status === 'up'
                          ? 'bg-green-500 text-white'
                          : iface.status === 'down'
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white' // Same color as Apply Filter button
                      }
                    >
                      {iface.status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(iface.last_updated).toLocaleString()}</TableCell>
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