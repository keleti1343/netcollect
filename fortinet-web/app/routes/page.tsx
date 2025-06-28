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
import { FilterSection } from "@/components/ui/FilterSection";

export default async function RoutesPage({
  searchParams
}: {
  searchParams: { vdom_id?: string; page?: string; pageSize?: string } // Changed vdom_name to vdom_id
}) {
  // Properly handle searchParams
  const searchParamsObj = await searchParams;
  const vdom_id = searchParamsObj.vdom_id; // Changed vdom_name to vdom_id
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParamsObj.pageSize) : 15;

  // Build filter object
  const filters: Record<string, string> = {};
  if (vdom_id) filters.vdom_id = vdom_id; // Use vdom_id for filtering

  // Add pagination params
  filters.skip = ((page - 1) * pageSize).toString();
  filters.limit = pageSize.toString();

  // Fetch data with filters
  const routesResponse = await getRoutes(filters);
  const routes = routesResponse.items;
  const totalCount = routesResponse.total_count;

  const vdomsResponse = await getVdoms({});
  const vdoms = vdomsResponse.items;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl tracking-tight">
          Routes
          <div className="h-1 w-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-2 rounded-full"></div>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage routing tables across your Fortinet devices
        </p>
      </div>
      
      {/* Enhanced Filter Card */}
      <FilterSection>
        <RoutesFilter vdoms={vdoms} initialVdomId={vdom_id} />
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Routing Table
            </CardTitle>
            <CardDescription>
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
                <TableRow>
                  <TableHead>Route Type</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Exit Interface</TableHead>
                  <TableHead>VDom</TableHead>
                  <TableHead>Last Updated</TableHead>
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
                      <TechnicalCell value={route.exit_interface_name} />
                      <TechnicalCell value={route.vdom ? route.vdom.vdom_name : '−'} />
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
