import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { RoutesFilter } from "./components/routes-filter";
import { getRoutes, getVdoms } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrimaryCell, TechnicalCell, DateTimeCell } from "@/components/ui/table-cells";
import { TableCode } from "@/components/ui/table-code";
import { EmptyState } from "@/components/empty-state";
import { UniversalHoverCard } from "@/components/ui/universal-hover-card";
import { FirewallDetails } from "../interfaces/components/firewall-details";
import { FilterSection } from "@/components/ui/FilterSection";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { PageFeatures, FeatureTypes } from "@/components/ui/page-features";

export default async function RoutesPage({
  searchParams
}: {
  searchParams: { vdom_id?: string; page?: string; pageSize?: string; sort_by?: string; sort_order?: string } // Added sorting parameters
}) {
  // Properly handle searchParams
  const searchParamsObj = await searchParams;
  const vdom_id = searchParamsObj.vdom_id; // Changed vdom_name to vdom_id
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParamsObj.pageSize) : 15;
  const sort_by = searchParamsObj.sort_by;
  const sort_order = searchParamsObj.sort_order || 'asc';

  // Build filter object
  const filters: Record<string, string> = {};
  if (vdom_id) filters.vdom_id = vdom_id; // Use vdom_id for filtering

  // Add pagination params
  filters.skip = ((page - 1) * pageSize).toString();
  filters.limit = pageSize.toString();

  // Add sorting params
  if (sort_by) filters.sort_by = sort_by;
  if (sort_order) filters.sort_order = sort_order;

  // Fetch data with filters
  const routesResponse = await getRoutes(filters);
  const routes = routesResponse.items;
  const totalCount = routesResponse.total_count;

  const vdomsResponse = await getVdoms({});
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
              Routes
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              View routing table configurations across your Fortinet devices
            </CardDescription>
          </div>
          
          {/* Interactive Elements Section */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              {/* Page Features */}
              <div className="flex-1">
                <PageFeatures
                  features={[
                    FeatureTypes.sortableColumns(["Route Type", "Exit Interface", "VDom"]),
                    FeatureTypes.filtering(["VDOM"])
                  ]}
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <RoutesFilter vdoms={vdoms} initialVdomId={vdom_id} />
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
              Routing Table
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Total: {totalCount} routes
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {routes.length > 0
              ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}`
              : 'No routes found'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-[#202A44] hover:bg-[#202A44] h-9">
                  <SortableTableHead sortKey="route_type" className="text-sm text-white font-semibold">
                    ROUTE TYPE
                  </SortableTableHead>
                  <TableHead className="text-sm text-white font-semibold">DESTINATION</TableHead>
                  <TableHead className="text-sm text-white font-semibold">GATEWAY</TableHead>
                  <SortableTableHead sortKey="exit_interface_name" className="text-sm text-white font-semibold">
                    EXIT INTERFACE
                  </SortableTableHead>
                  <SortableTableHead sortKey="vdom_name" className="text-sm text-white font-semibold">
                    VDOM
                  </SortableTableHead>
                  <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState title="No Routes Found" description="No routes match your criteria. Try adjusting your filters." />
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route, index) => (
                    <TableRow key={`${route.route_id}-${index}-${route.destination_network}`}>
                      <TechnicalCell value={route.route_type} />
                      <TechnicalCell value={`${route.destination_network}/${route.mask_length}`} />
                      <TechnicalCell value={route.gateway} />
                      <TechnicalCell value={route.exit_interface_name === "unknown" ? "−" : route.exit_interface_name} />
                      <TableCell>
                        {route.vdom ? (
                          <UniversalHoverCard
                            trigger={<TableCode>{route.vdom.vdom_name}</TableCode>}
                            title={`${route.vdom.vdom_name} Details`}
                            content={
                              route.vdom.firewall ? (
                                <FirewallDetails firewall={route.vdom.firewall} />
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
                      <DateTimeCell date={route.last_updated} />
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
  );
}
