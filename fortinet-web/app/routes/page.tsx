import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { RoutesFilter } from "./components/routes-filter";
import { getRoutes, getVdoms } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCode } from "@/components/ui/table-code"; // Import TableCode

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
        <h1 className="text-3xl tracking-tight">Routes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage routing tables across your Fortinet devices
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
          <RoutesFilter vdoms={vdoms} initialVdomId={vdom_id} />
        </CardContent>
      </Card>
      
      {/* Enhanced Main Content Card */}
      <Card className="border shadow-md">
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
                `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of {totalCount}` :
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
                    <TableCell colSpan={6}>
                      <EmptyState title="No Routes Found" description="No routes match your criteria. Try adjusting your filters." />
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route, index) => (
                    <TableRow key={`${route.route_id}-${index}-${route.destination_network}`} className="hover:bg-muted/20 border-b">
                      <TableCell>
                        <Badge variant="protocol">
                          {route.route_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TableCode>
                          {route.destination_network}/{route.mask_length}
                        </TableCode>
                      </TableCell>
                      <TableCell>
                        <TableCode>{route.gateway && route.gateway !== 'None' && route.gateway !== 'n/a' ? route.gateway : '-'}</TableCode>
                      </TableCell>
                      <TableCell className="font-medium">{route.exit_interface_name}</TableCell>
                      <TableCell>
                        {route.vdom ? (
                          <Badge variant="vdom">
                            {route.vdom.vdom_name}
                          </Badge>
                        ) : (
                          <Badge variant="placeholder">
                            -
                          </Badge>
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
  );
}
