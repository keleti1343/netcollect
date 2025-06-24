import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DataPagination } from "@/components/data-pagination";
import { FirewallsFilter } from "./components/firewalls-filter";
import { getFirewalls, getVdoms } from "@/services/api";
import { VDOMResponse } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function FirewallsPage({
  searchParams,
}: {
  searchParams: { fw_name?: string; page?: string; pageSize?: string };
}) {
  const searchParamsObj = await searchParams;
  const fw_name = searchParamsObj.fw_name;
  const page = searchParamsObj.page ? Number(searchParamsObj.page) : 1;
  const pageSize = searchParamsObj.pageSize ? Number(searchParamsObj.pageSize) : 15;
  
  // Build filter object
  const filters: Record<string, string> = {};
  if (fw_name) filters.fw_name = fw_name;
  
  // Add pagination params
const currentPage = page;
const currentPageSize = pageSize;
filters.skip = ((currentPage - 1) * currentPageSize).toString();
filters.limit = currentPageSize.toString();
  
  // Fetch data with filters
  const { items: firewalls, total_count: totalCount } = await getFirewalls(filters);
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Firewalls</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <FirewallsFilter initialFirewallName={fw_name} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Firewall Devices</CardTitle>
          <CardDescription>List of managed Fortinet firewall devices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firewall Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>FortiManager IP</TableHead>
                <TableHead>FortiAnalyzer IP</TableHead>
                <TableHead>VDoms</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {firewalls.map((firewall) => (
                <TableRow key={firewall.firewall_id}>
                  <TableCell>{firewall.fw_name}</TableCell>
                  <TableCell>{firewall.fw_ip}</TableCell>
                  <TableCell>{firewall.fmg_ip || '-'}</TableCell>
                  <TableCell>{firewall.faz_ip || '-'}</TableCell>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="cursor-help underline">View VDoms</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <VdomsList firewallId={firewall.firewall_id} firewallName={firewall.fw_name} />
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell>{new Date(firewall.last_updated).toLocaleString()}</TableCell>
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

async function VdomsList({ firewallId, firewallName }: { firewallId: number, firewallName: string }) {
  const { items: vdoms } = await getVdoms({ firewall_id: firewallId.toString() });
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">List of Vdoms for {firewallName}</h4>
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {vdoms.length > 0 ? (
            vdoms.map((vdom: VDOMResponse) => (
              <li key={vdom.vdom_id}>{vdom.vdom_name}</li>
            ))
          ) : (
            <li>No VDoms found</li>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}
