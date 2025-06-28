import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DataPagination } from "@/components/data-pagination";
import { FirewallsFilter } from "./components/firewalls-filter";
import { getFirewalls, getVdoms } from "@/services/api";
import { VDOMResponse } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Button } from "@/components/ui/button";
import { VdomsButton } from "./components/vdoms-button"; // Import the new component
import { TableCode } from "@/components/ui/table-code"; // Import TableCode
import { HoverCardHeader } from "@/components/ui/hover-card-header"; // Import HoverCardHeader
import { PrimaryCell, TechnicalCell, DateTimeCell, CountCell } from "@/components/ui/table-cells"; // Import new table cells
import { EmptyState } from "@/components/empty-state"; // Import EmptyState
import { FilterSection } from "@/components/ui/FilterSection"; // Import FilterSection

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl tracking-tight">Firewalls</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and monitor your Fortinet firewall devices
        </p>
      </div>
      
      {/* Enhanced Filter Card */}
      <FilterSection>
        <FirewallsFilter initialFirewallName={fw_name} />
      </FilterSection>
      
      {/* Enhanced Main Content Card */}
      <Card className="border shadow-md" style={{
        borderColor: 'rgba(26, 32, 53, 0.15)',
        boxShadow: '0 4px 6px -1px rgba(26, 32, 53, 0.1), 0 2px 4px -1px rgba(26, 32, 53, 0.06)'
      }}>
        <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              Firewall Devices
            </CardTitle>
            <CardDescription>
              Total: {totalCount} devices
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {firewalls.length > 0
              ? `Showing ${(currentPage - 1) * currentPageSize + 1}-${Math.min(currentPage * currentPageSize, totalCount)} of ${totalCount}`
              : 'No firewalls found'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
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
                {firewalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState title="No Firewalls Found" description="No firewall devices match your criteria. Try adjusting your filters." />
                    </TableCell>
                  </TableRow>
                ) : (
                  firewalls.map((firewall) => (
                    <TableRow key={firewall.firewall_id}>
                      <TechnicalCell value={firewall.fw_name} />
                      <TechnicalCell value={firewall.fw_ip} />
                      <TechnicalCell value={firewall.fmg_ip} />
                      <TechnicalCell value={firewall.faz_ip} />
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <TableCell className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
                            <TableCode>
                              {firewall.total_vdoms} vdoms
                            </TableCode>
                          </TableCell>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-0">
                          <HoverCardHeader>
                            <h4 className="font-medium">List of VDoms for {firewall.fw_name}</h4>
                          </HoverCardHeader>
                          <div className="p-[var(--hover-card-content-padding)]">
                            <VdomsList firewallId={firewall.firewall_id} firewallName={firewall.fw_name} />
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <DateTimeCell date={firewall.last_updated} />
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
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * currentPageSize, totalCount)} of {totalCount} firewalls
              </div>
              <DataPagination currentPage={page} totalPages={totalPages} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


async function VdomsList({ firewallId, firewallName }: { firewallId: number, firewallName: string }) {
  const { items: vdoms } = await getVdoms({ firewall_id: firewallId.toString() });
  
  return (
    <div className="p-3">
      <ScrollArea className="h-[200px] w-full">
        {vdoms.length > 0 ? (
          <div className="space-y-1">
            {vdoms.map((vdom: VDOMResponse) => (
              <div key={vdom.vdom_id} className="flex items-center p-2 rounded hover:bg-muted">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#1a2035' }}></div>
                <span>{vdom.vdom_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No VDoms found
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

