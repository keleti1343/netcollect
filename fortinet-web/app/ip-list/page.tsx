import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { getInterfaces, getVdoms } from "@/services/api";
import { InterfaceResponse } from "@/types";
import { IpListFilter } from "./components/ip-list-filter";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { TechnicalCell } from "@/components/ui/table-cells";
import { HoverCardHeader } from "@/components/ui/hover-card-header";
import { EmptyState } from "@/components/empty-state";
import { PlaceholderValue } from "@/components/ui/placeholder-value";

export default async function IpListPage({
  searchParams,
}: {
  searchParams: { name?: string; ip?: string; vdom_id?: string; page?: string; pageSize?: string };
}) {
  const searchParamsObj = await searchParams;
  const name = searchParamsObj.name;
  const ip = searchParamsObj.ip;
  const vdom_id = searchParamsObj.vdom_id;
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParamsObj.pageSize) : 15;

  const filters: Record<string, string> = {};
  if (name) filters.interface_name = name;
  if (ip) filters.ip_address = ip;
  if (vdom_id) filters.vdom_id = vdom_id;

  filters.skip = ((page - 1) * pageSize).toString();
  filters.limit = pageSize.toString();

  const interfacesResponse = await getInterfaces(filters);
  const interfaces = interfacesResponse.items;
  const totalCount = interfacesResponse.total_count;

  const vdomsResponse = await getVdoms({});
  const vdoms = vdomsResponse.items;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-3xl tracking-tight">IP List</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage FortiNet interface IP addresses
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
          <IpListFilter vdoms={vdoms} initialVdomId={vdom_id} initialIp={ip} initialName={name} />
        </CardContent>
      </Card>

      {/* Enhanced Main Content Card */}
      <Card className="border shadow-md">
        <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
              IP Addresses
            </CardTitle>
            <CardDescription>
              Total: {totalCount} IP addresses
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {interfaces.length > 0 ?
                `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}` :
                'No IP addresses found'}
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
                      <EmptyState title="No IP Addresses Found" description="No IP addresses match your criteria. Try adjusting your filters." />
                    </TableCell>
                  </TableRow>
                ) : (
                  interfaces.map((iface: InterfaceResponse) => (
                    <TableRow key={iface.interface_id} className="hover:bg-muted/20 border-b">
                      <TableCell className="font-medium">{iface.interface_name}</TableCell>
                      <TableCell>
                        <PlaceholderValue value={iface.ip_address} useCode />
                      </TableCell>
                      <TableCell>
                        <PlaceholderValue value={iface.vdom?.vdom_name} />
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
                          <PlaceholderValue value={iface.description} />
                        )}
                      </TableCell>
                      <TechnicalCell value={iface.status || '−'} />
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
                Showing {(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of {totalCount} IP addresses
              </div>
              <DataPagination currentPage={page} totalPages={totalPages} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}