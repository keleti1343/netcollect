'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { FirewallsFilter } from "./components/firewalls-filter";
import { getFirewalls, getVdoms } from "@/services/api";
import { VDOMResponse, FirewallResponse } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Button } from "@/components/ui/button";
import { VdomsButton } from "./components/vdoms-button"; // Import the new component
import { TableCode } from "@/components/ui/table-code"; // Import TableCode
import { PrimaryCell, TechnicalCell, DateTimeCell, CountCell } from "@/components/ui/table-cells"; // Import new table cells
import { UniversalHoverCard } from "@/components/ui/universal-hover-card";
import { EmptyState } from "@/components/empty-state"; // Import EmptyState
import { FilterSection } from "@/components/ui/FilterSection"; // Import FilterSection
import { SortableTableHead } from "@/components/ui/sortable-table-head"; // Import SortableTableHead
import { PageFeatures, FeatureTypes } from "@/components/ui/page-features"; // Import PageFeatures
import { RateLimitError } from "@/components/rate-limit-error"; // Import RateLimitError
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FirewallsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [firewalls, setFirewalls] = useState<FirewallResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fw_name = searchParams?.get("fw_name") || "";
  const currentPage = searchParams?.get("page") ? Number(searchParams?.get("page")) : 1;
  const pageSize = searchParams?.get("pageSize") ? Number(searchParams?.get("pageSize")) : 15;
  const sort_by = searchParams?.get("sort_by") || "";
  const sort_order = searchParams?.get("sort_order") || "asc";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build filter object
      const filters: Record<string, string> = {
        skip: ((currentPage - 1) * pageSize).toString(),
        limit: pageSize.toString(),
      };
      if (fw_name) filters.fw_name = fw_name;
      if (sort_by) filters.sort_by = sort_by;
      if (sort_order) filters.sort_order = sort_order;
      
      // Fetch data with filters
      const { items: firewallsData, total_count: totalCountData } = await getFirewalls(filters);
      setFirewalls(firewallsData);
      setTotalCount(totalCountData);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load data. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, fw_name, sort_by, sort_order]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams || undefined);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* Header Card */}
        <Card className="border shadow-sm" style={{
          borderColor: 'rgba(26, 32, 53, 0.15)'
        }}>
          <CardHeader className="bg-muted/50 p-3 pb-2">
            <div className="pb-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Firewalls
                <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Manage and monitor your Fortinet firewall devices
              </CardDescription>
            </div>
            <div className="pt-1 border-t border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <PageFeatures
                    features={[
                      FeatureTypes.hoverCard("VDoms", "Hover over the VDoms column to see detailed list of VDOMs belonging to each firewall"),
                      FeatureTypes.sortableColumns(["Firewall Name", "VDoms"]),
                      FeatureTypes.filtering(["Firewall Name"])
                    ]}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                  <Skeleton className="h-8 w-48" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Main Content Card */}
        <Card className="border shadow-md card-shadow">
          <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Firewall Devices
                <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-32" />
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-48" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-[#202A44] hover:bg-[#202A44] h-9">
                    <TableHead className="text-sm text-white font-semibold">FIREWALL NAME</TableHead>
                    <TableHead className="text-sm text-white font-semibold">IP ADDRESS</TableHead>
                    <TableHead className="text-sm text-white font-semibold">FORTIMANAGER IP</TableHead>
                    <TableHead className="text-sm text-white font-semibold">FORTIANALYZER IP</TableHead>
                    <TableHead className="text-sm text-white font-semibold">VDOMS</TableHead>
                    <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(pageSize)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    // Check if it's a rate limit error
    if (error.includes("RATE_LIMIT_EXCEEDED")) {
      return (
        <div className="space-y-4 max-w-7xl mx-auto">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/50 p-3 pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Firewalls
                <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Manage and monitor your Fortinet firewall devices
              </CardDescription>
            </CardHeader>
          </Card>
          <RateLimitError
            onRetry={fetchData}
            message={error.replace("RATE_LIMIT_EXCEEDED: ", "")}
          />
        </div>
      );
    }

    // Generic error
    return (
      <div className="space-y-6">
        <h1 className="text-3xl">Firewalls</h1>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Compact Unified Header Card */}
      <Card className="border shadow-sm" style={{
        borderColor: 'rgba(26, 32, 53, 0.15)'
      }}>
        <CardHeader className="bg-muted/50 p-3 pb-2">
          {/* Title and Description Section */}
          <div className="pb-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Firewalls
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              View and analyze your Fortinet firewall device inventory
            </CardDescription>
          </div>
          
          {/* Interactive Elements Section */}
          <div className="pt-1 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              {/* Page Features */}
              <div className="flex-1">
                <PageFeatures
                  features={[
                    FeatureTypes.hoverCard("VDoms", "Hover over the VDoms column to see detailed list of VDOMs belonging to each firewall"),
                    FeatureTypes.sortableColumns(["Firewall Name", "VDoms"]),
                    FeatureTypes.filtering(["Firewall Name"])
                  ]}
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <FirewallsFilter initialFirewallName={fw_name} />
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
              Firewall Devices
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Total: {totalCount} devices
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {firewalls.length > 0
              ? `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`
              : 'No firewalls found'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-[#202A44] hover:bg-[#202A44] h-9">
                  <SortableTableHead sortKey="fw_name" className="text-sm text-white font-semibold">FIREWALL NAME</SortableTableHead>
                  <TableHead className="text-sm text-white font-semibold">IP ADDRESS</TableHead>
                  <TableHead className="text-sm text-white font-semibold">FORTIMANAGER IP</TableHead>
                  <TableHead className="text-sm text-white font-semibold">FORTIANALYZER IP</TableHead>
                  <SortableTableHead sortKey="total_vdoms" className="text-sm text-white font-semibold">VDOMS</SortableTableHead>
                  <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
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
                      <TableCell>
                        <UniversalHoverCard
                          trigger={<TableCode>{firewall.total_vdoms} vdoms</TableCode>}
                          title={`${firewall.fw_name}'s vdoms`}
                          content={<VdomsList firewallId={firewall.firewall_id} firewallName={firewall.fw_name} />}
                          positioning="smart"
                          width="wide"
                        />
                      </TableCell>
                      {firewall.last_updated ? (
                        <DateTimeCell date={firewall.last_updated} />
                      ) : (
                        <TableCell>
                          <span className="text-muted-foreground">-</span>
                        </TableCell>
                      )}
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
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} firewalls
              </div>
              <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function VdomsList({ firewallId, firewallName }: { firewallId: number, firewallName: string }) {
  const [vdoms, setVdoms] = useState<VDOMResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVdoms = async () => {
      try {
        setLoading(true);
        // Request all VDOMs without pagination limit for hover card display
        const { items: vdomsData } = await getVdoms({
          firewall_id: firewallId.toString(),
          skip: '0',
          limit: '10000'  // Set a very high limit to get all VDOMs
        });
        setVdoms(vdomsData);
      } catch (err) {
        console.error('Error loading VDOMs:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load VDOMs';
        
        // Check if it's a rate limit error
        if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          setError('Failed to load VDOMs');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVdoms();
  }, [firewallId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 min-h-[200px]">
        <div className="text-xs text-muted-foreground">Loading VDOMs...</div>
      </div>
    );
  }

  if (error) {
    const isRateLimit = error.includes('Rate limit exceeded');
    return (
      <div className="flex flex-col items-center justify-center py-4 px-3 min-h-[200px]">
        <div className={`text-xs mb-2 text-center ${isRateLimit ? 'text-amber-600' : 'text-red-500'}`}>
          {error}
        </div>
        {isRateLimit && (
          <div className="text-xs text-muted-foreground text-center">
            The system is temporarily limiting requests to prevent overload.
          </div>
        )}
      </div>
    );
  }

  return (
    <ScrollArea
      className={`w-full pr-4 ${vdoms.length > 50 ? 'max-h-[60vh]' : 'max-h-[500px]'}`}
      orientation="vertical"
    >
      <div className="p-3">
        {vdoms.length > 0 ? (
          <ul className="text-xs text-muted-foreground">
            {vdoms.map((vdom: VDOMResponse) => (
              <li key={vdom.vdom_id} className="flex items-center leading-tight">
                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                <span className="break-all font-medium">
                  {vdom.vdom_name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-xs min-h-[200px] flex items-center justify-center">
            <TableCode>No VDoms found</TableCode>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

