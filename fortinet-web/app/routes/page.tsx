import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { RoutesFilter } from "./components/routes-filter";
import { getRoutes, getVdoms } from "@/services/api";

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Routes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <RoutesFilter vdoms={vdoms} initialVdomId={vdom_id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Routing Table</CardTitle>
          <CardDescription>Network routes across all firewalls</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
              {routes.map((route, index) => (
                <TableRow key={`${route.route_id}-${index}-${route.destination_network}`}>
                  <TableCell>{route.route_type}</TableCell>
                  <TableCell>{route.destination_network}/{route.mask_length}</TableCell>
                  <TableCell>{route.gateway || '-'}</TableCell>
                  <TableCell>{route.exit_interface_name}</TableCell>
                  <TableCell>
  {route.vdom ? (
    <span>
      {route.vdom.vdom_name}
    </span>
  ) : (
    'No VDOM'
  )}
</TableCell>
                  <TableCell>{new Date(route.last_updated).toLocaleString()}</TableCell>
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
