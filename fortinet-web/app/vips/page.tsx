"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { getVips, getVdoms } from "@/services/api";
import { VIPResponse, VDOMResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { VipsFilter } from "./components/vips-filter";
import { PrimaryCell, TechnicalCell, DateTimeCell, EmptyCell, EmptyValue } from "@/components/ui/table-cells";
import { EmptyState } from "@/components/empty-state";
import { FirewallDetails } from "../interfaces/components/firewall-details";
import { UniversalHoverCard } from "@/components/ui/universal-hover-card";
import { FilterSection } from "@/components/ui/FilterSection";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCode } from "@/components/ui/table-code";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { PageFeatures, FeatureTypes } from "@/components/ui/page-features";

export default function VipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vips, setVips] = useState<VIPResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vdoms, setVdoms] = useState<VDOMResponse[]>([]); // State to store VDOMs for the filter

  const vdom_id = searchParams?.get("vdom_id") || ""; // Get vdom_id from search params
  const currentPage = searchParams?.get("page") ? Number(searchParams?.get("page")) : 1;
  const pageSize = searchParams?.get("pageSize") ? Number(searchParams?.get("pageSize")) : 15;
  const sort_by = searchParams?.get("sort_by") || "";
  const sort_order = searchParams?.get("sort_order") || "asc";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch VIPs
      const vipParams: Record<string, string> = {
        skip: ((currentPage - 1) * pageSize).toString(),
        limit: pageSize.toString(),
      };
      if (vdom_id) {
        vipParams.vdom_id = vdom_id;
      }
      if (sort_by) {
        vipParams.sort_by = sort_by;
      }
      if (sort_order) {
        vipParams.sort_order = sort_order;
      }
      const vipsResponse = await getVips(vipParams);
      setVips(vipsResponse.items);
      setTotalCount(vipsResponse.total_count);

      // Fetch VDOMs for the filter
      const vdomsResponse = await getVdoms({});
      setVdoms(vdomsResponse.items);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, vdom_id, sort_by, sort_order]); // Add sorting parameters to dependency array

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams || undefined);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  // Error and Loading states
  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* Enhanced Page Header */}
        {/* Compact Unified Header Card */}
        <Card className="border shadow-sm" style={{
          borderColor: 'rgba(26, 32, 53, 0.15)'
        }}>
          <CardHeader className="bg-muted/50 p-3 pb-2">
            {/* Title and Description Section */}
            <div className="pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                VIPs
                <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                View virtual IP mapping configurations across your Fortinet devices
              </CardDescription>
            </div>
            
            {/* Interactive Elements Section */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between gap-4">
                {/* Page Features */}
                <div className="flex-1">
                  <PageFeatures
                    features={[
                      FeatureTypes.sortableColumns(["VDOM Name"]),
                      FeatureTypes.filtering(["VDOM"])
                    ]}
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                  <Skeleton className="h-8 w-48" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Enhanced Main Content Card */}
        <Card className="border shadow-md card-shadow">
          <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a1.93 1.93 0 0 0-.97 1.68v4.62a1.93 1.93 0 0 0 .97 1.68l3.65 1.9"/><path d="m22 17.65-3.37 1.75a1.93 1.93 0 0 1-1.81 0l-3.65-1.9a1.93 1.93 0 0 1-.97-1.68v-4.62a1.93 1.93 0 0 1 .97-1.68l3.65-1.9a1.93 1.93 0 0 1 1.81 0L22 9.37"/></svg>
                VIP Devices
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-24" />
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative overflow-visible">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-[#202A44] hover:bg-[#202A44] h-9">
                    <TableHead className="text-sm text-white font-semibold">VDOM NAME</TableHead>
                    <TableHead className="text-sm text-white font-semibold">VIP NAME</TableHead>
                    <TableHead className="text-sm text-white font-semibold">EXTERNAL IP</TableHead>
                    <TableHead className="text-sm text-white font-semibold">MAPPED IP</TableHead>
                    <TableHead className="text-sm text-white font-semibold">EXTERNAL PORT</TableHead>
                    <TableHead className="text-sm text-white font-semibold">MAPPED PORT</TableHead>
                    <TableHead className="text-sm text-white font-semibold">PROTOCOL</TableHead>
                    <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(pageSize)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
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

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl">VIPs</h1>
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
              VIPs
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              View virtual IP mapping configurations across your Fortinet devices
            </CardDescription>
          </div>
          
          {/* Interactive Elements Section */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              {/* Page Features */}
              <div className="flex-1">
                <PageFeatures
                  features={[
                    FeatureTypes.sortableColumns(["VDOM Name"]),
                    FeatureTypes.filtering(["VDOM"])
                  ]}
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <VipsFilter vdoms={vdoms} initialVdomId={vdom_id} />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Enhanced Main Content Card */}
      <Card
        className="border shadow-sm overflow-visible"
        style={{
          borderColor: 'rgba(26, 32, 53, 0.15)'
        }}
      >
        <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              VIP Devices
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Total: {totalCount} virtual IPs
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {vips.length > 0
              ? `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`
              : 'No VIPs found'}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-visible">
          <div className="relative overflow-visible">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-[#202A44] hover:bg-[#202A44] h-9">
                  <SortableTableHead sortKey="vdom_name" className="text-sm text-white font-semibold">VDOM NAME</SortableTableHead>
                  <TableHead className="text-sm text-white font-semibold">VIP NAME</TableHead>
                  <TableHead className="text-sm text-white font-semibold">EXTERNAL IP</TableHead>
                  <TableHead className="text-sm text-white font-semibold">MAPPED IP</TableHead>
                  <TableHead className="text-sm text-white font-semibold">EXTERNAL PORT</TableHead>
                  <TableHead className="text-sm text-white font-semibold">MAPPED PORT</TableHead>
                  <TableHead className="text-sm text-white font-semibold">PROTOCOL</TableHead>
                  <TableHead className="text-sm text-white font-semibold">LAST UPDATED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState title="No VIPs Found" description="No virtual IPs match your criteria. Try adjusting your filters." />
                    </TableCell>
                  </TableRow>
                ) : (
                  vips.map((vip) => (
                    <TableRow key={vip.vip_id}>
                      <TableCell>
                        {vip.vdom ? (
                          <UniversalHoverCard
                            trigger={<TableCode>{vip.vdom.vdom_name}</TableCode>}
                            title={`${vip.vdom.vdom_name} Details`}
                            content={
                              vip.vdom.firewall ? (
                                <FirewallDetails firewall={vip.vdom.firewall} />
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
                      <TechnicalCell value={vip.vip_name} />
                      <TechnicalCell value={vip.external_ip} />
                      <TechnicalCell value={vip.mapped_ip} />
                      <TechnicalCell value={vip.external_port} />
                      <TechnicalCell value={vip.mapped_port} />
                      <TableCell>
                        {vip.protocol ? (
                          <Badge variant="protocol">
                            {vip.protocol}
                          </Badge>
                        ) : (
                          <EmptyValue />
                        )}
                      </TableCell>
                      <DateTimeCell date={vip.last_updated} />
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
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} VIPs
              </div>
              <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
