import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { getInterfaces, getVdoms } from "@/services/api";
import { InterfaceResponse, VDOMResponse } from "@/types";
import { InterfacesFilter } from "./components/interfaces-filter";
import { FirewallDetails } from "./components/firewall-details";
import { PrimaryCell, TechnicalCell, EmptyCell, DateTimeCell } from "@/components/ui/table-cells";
import { TableCode } from "@/components/ui/table-code";
import { FilterSection } from "@/components/ui/FilterSection";
import { EmptyState } from "@/components/empty-state";
import { UniversalHoverCard } from "@/components/ui/universal-hover-card";
import { StatusGifCell } from "@/components/ui/status-gif-cell";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { PageFeatures, FeatureTypes } from "@/components/ui/page-features";

export default async function InterfacesPage({
  searchParams
}: {
  searchParams: Promise<{ name?: string; ip?: string; vdom_id?: string; page?: string; pageSize?: string; sort_by?: string; sort_order?: string }>
}) {
  const searchParamsObj = await searchParams;
  const name = searchParamsObj.name;
  const ip = searchParamsObj.ip;
  const vdom_id = searchParamsObj.vdom_id; // Read vdom_id
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParamsObj.pageSize) : 15;
  const sort_by = searchParamsObj.sort_by;
  const sort_order = searchParamsObj.sort_order || 'asc';

  const filters: Record<string, string> = {};
  if (name) filters.interface_name = name;
  if (ip) filters.ip_address = ip;
  if (vdom_id) filters.vdom_id = vdom_id; // Add vdom_id to filters
  if (sort_by) filters.sort_by = sort_by;
  if (sort_order) filters.sort_order = sort_order;

  filters.skip = ((page - 1) * pageSize).toString();
  filters.limit = pageSize.toString();

  const interfacesResponse = await getInterfaces(filters);
  const interfaces = interfacesResponse.items;
  const totalCount = interfacesResponse.total_count;

  const vdomsResponse = await getVdoms({}); // Fetch all VDOMs
  const vdoms = vdomsResponse.items;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Compact Unified Header Card */}
      <Card className="border shadow-sm" style={{
        borderColor: 'rgba(26, 32, 53, 0.15)'
      }}>
        <CardHeader className="bg-muted/50 p-3 pb-2">
          {/* Title and Description Section */}
          <div className="pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Interfaces
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              View network interface configurations across your Fortinet devices
            </CardDescription>
          </div>
          
          {/* Interactive Elements Section */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              {/* Page Features */}
              <div className="flex-1">
                <PageFeatures
                  features={[
                    FeatureTypes.sortableColumns(["Name", "VDOM Name"]),
                    FeatureTypes.filtering(["Interface name", "IP address", "VDOM"])
                  ]}
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <InterfacesFilter initialName={name} initialIp={ip} vdoms={vdoms} />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
        
        {/* Enhanced Main Content Card */}
        <Card className="border shadow-md card-shadow">
          <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Network Interfaces
                <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Total: {totalCount} interfaces
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {interfaces.length > 0
                ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}`
                : 'No interfaces found'}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-[#202A44] hover:bg-[#202A44] h-9">
                    <SortableTableHead sortKey="interface_name" className="text-sm text-white font-semibold">NAME</SortableTableHead>
                    <TableHead className="text-sm text-white font-semibold">IP ADDRESS</TableHead>
                    <SortableTableHead sortKey="vdom_name" className="text-sm text-white font-semibold">VDOM NAME</SortableTableHead>
                    <TableHead className="text-sm text-white font-semibold">DESCRIPTION</TableHead>
                    <SortableTableHead sortKey="status" className="text-sm text-white font-semibold">STATUS</SortableTableHead>
                    <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
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
                      <TableRow key={iface.interface_id}>
                        <TechnicalCell value={iface.interface_name} />
                        <TechnicalCell value={iface.ip_address} />
                        <TableCell>
                          {iface.vdom ? (
                            <UniversalHoverCard
                              trigger={<TableCode>{iface.vdom.vdom_name}</TableCode>}
                              title={`${iface.vdom.vdom_name} Details`}
                              content={
                                iface.vdom.firewall ? (
                                  <FirewallDetails firewall={iface.vdom.firewall} />
                                ) : (
                                  <div className="text-center py-4 text-muted-foreground text-xs flex items-center justify-center">
                                    <TableCode>Firewall information not available</TableCode>
                                  </div>
                                )
                              }
                              positioning="smart"
                              width="wide"
                            />
                          ) : (
                            <TableCode>−</TableCode>
                          )}
                        </TableCell>
                        <TechnicalCell value={iface.description || '−'} />
                        <StatusGifCell status={iface.status} />
                        <DateTimeCell date={iface.last_updated} />
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