'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableCode } from "@/components/ui/table-code";
import { DataPagination } from "@/components/data-pagination";
import { VdomsFilter } from "./components/vdoms-filter";
import { InterfacesList } from "./components/interfaces-list";
import { VipsList } from "./components/vips-list";
import { RoutesList } from "./components/routes-list";
import { UniversalHoverCard } from "@/components/ui/universal-hover-card";
import { getVdoms, getFirewalls } from "@/services/api";
import { FirewallResponse, VDOMResponse } from "@/types";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Button } from "@/components/ui/button";
import { PrimaryCell, CountCell, DateTimeCell, TechnicalCell } from "@/components/ui/table-cells"; // Import TechnicalCell at top level
import { EmptyState } from "@/components/empty-state";
import { FilterSection } from "@/components/ui/FilterSection";
import { SortableTableHead } from "@/components/ui/sortable-table-head"; // Import SortableTableHead
import { PageFeatures, FeatureTypes } from "@/components/ui/page-features"; // Import PageFeatures
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VdomsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vdoms, setVdoms] = useState<VDOMResponse[]>([]);
  const [firewalls, setFirewalls] = useState<FirewallResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fw_name = searchParams?.get("fw_name") || "";
  const vdom_name = searchParams?.get("vdom_name") || "";
  const currentPage = searchParams?.get("page") ? Number(searchParams?.get("page")) : 1;
  const pageSize = searchParams?.get("pageSize") ? Number(searchParams?.get("pageSize")) : 15;
  const sort_by = searchParams?.get("sort_by") || "";
  const sort_order = searchParams?.get("sort_order") || "asc";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {
        skip: ((currentPage - 1) * pageSize).toString(),
        limit: pageSize.toString(),
      };
      if (fw_name) filters.fw_name = fw_name;
      if (vdom_name) filters.vdom_name = vdom_name;
      if (sort_by) filters.sort_by = sort_by;
      if (sort_order) filters.sort_order = sort_order;

      const vdomsResponse = await getVdoms(filters);
      setVdoms(vdomsResponse.items);
      setTotalCount(vdomsResponse.total_count);

      const firewallsResponse = await getFirewalls();
      setFirewalls(firewallsResponse.items);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, fw_name, vdom_name, sort_by, sort_order]);

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
            <div className="pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                VDoms
                <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                View virtual domain configurations across your Fortinet devices
              </CardDescription>
            </div>
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <PageFeatures
                    features={[
                      FeatureTypes.hoverCard("Firewall", "Hover over firewall names to see detailed information"),
                      FeatureTypes.sortableColumns(["VDom Name", "Firewall", "Interfaces", "VIPs", "Routes"]),
                      FeatureTypes.filtering(["VDOM name", "Firewall"])
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
                VDom List
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
                    <TableHead className="text-sm text-white font-semibold">VDOM NAME</TableHead>
                    <TableHead className="text-sm text-white font-semibold">FIREWALL</TableHead>
                    <TableHead className="text-sm text-white font-semibold">INTERFACES</TableHead>
                    <TableHead className="text-sm text-white font-semibold">VIPS</TableHead>
                    <TableHead className="text-sm text-white font-semibold">ROUTES</TableHead>
                    <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(pageSize)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
    return (
      <div className="space-y-6">
        <h1 className="text-3xl">VDoms</h1>
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
          <div className="pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              VDoms
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              View virtual domain configurations across your Fortinet devices
            </CardDescription>
          </div>
          
          {/* Interactive Elements Section */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              {/* Page Features */}
              <div className="flex-1">
                <PageFeatures
                  features={[
                    FeatureTypes.hoverCard("Firewall", "Hover over firewall names to see detailed information"),
                    FeatureTypes.sortableColumns(["VDom Name", "Firewall", "Interfaces", "VIPs", "Routes"]),
                    FeatureTypes.filtering(["VDOM name", "Firewall"])
                  ]}
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <VdomsFilter
                  firewalls={firewalls}
                  initialFwName={fw_name}
                  initialVdomName={vdom_name}
                />
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
              VDom List
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Total: {totalCount} virtual domains
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {vdoms.length > 0
              ? `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`
              : 'No VDom found'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-[#202A44] hover:bg-[#202A44] h-9">
                  <SortableTableHead sortKey="vdom_name" className="text-sm text-white font-semibold">VDOM NAME</SortableTableHead>
                  <SortableTableHead sortKey="fw_name" className="text-sm text-white font-semibold">FIREWALL</SortableTableHead>
                  <SortableTableHead sortKey="total_interfaces" className="text-sm text-white font-semibold">INTERFACES</SortableTableHead>
                  <SortableTableHead sortKey="total_vips" className="text-sm text-white font-semibold">VIPS</SortableTableHead>
                  <SortableTableHead sortKey="total_routes" className="text-sm text-white font-semibold">ROUTES</SortableTableHead>
                  <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vdoms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState title="No VDOMs Found" description="No virtual domains match your criteria. Try adjusting your filters." />
                    </TableCell>
                  </TableRow>
                ) : (
                  vdoms.map((vdom) => (
                    <TableRow key={vdom.vdom_id}>
                      <TechnicalCell value={vdom.vdom_name} />
                      <TableCell>
                        {vdom.firewall?.fw_name ? (
                          <TableCode>
                            {vdom.firewall.fw_name}
                          </TableCode>
                        ) : (
                          <TableCode>
                            -
                          </TableCode>
                        )}
                      </TableCell>
                      <TableCell>
                        <UniversalHoverCard
                          trigger={<TableCode>{vdom.total_interfaces || 0} interfaces</TableCode>}
                          title={`${vdom.vdom_name}'s interfaces`}
                          content={<InterfacesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name} />}
                          positioning="smart"
                          width="wide"
                        />
                      </TableCell>
                      <TableCell>
                        <UniversalHoverCard
                          trigger={<TableCode>{vdom.total_vips || 0} vips</TableCode>}
                          title={`${vdom.vdom_name}'s vips`}
                          content={<VipsList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name} />}
                          positioning="smart"
                          width="wide"
                        />
                      </TableCell>
                      <TableCell>
                        <UniversalHoverCard
                          trigger={<TableCode>{vdom.total_routes || 0} routes</TableCode>}
                          title={`${vdom.vdom_name}'s routes`}
                          content={<RoutesList vdomId={vdom.vdom_id} vdomName={vdom.vdom_name} />}
                          positioning="smart"
                          width="wide"
                        />
                      </TableCell>
                      <DateTimeCell date={vdom.last_updated} />
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
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} virtual domains
              </div>
              <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
