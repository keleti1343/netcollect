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
import { PrimaryCell, TechnicalCell, DateTimeCell, EmptyCell } from "@/components/ui/table-cells";
import { EmptyState } from "@/components/empty-state";
import { FilterSection } from "@/components/ui/FilterSection";

export default function VipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vips, setVips] = useState<VIPResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vdoms, setVdoms] = useState<VDOMResponse[]>([]); // State to store VDOMs for the filter

  const vdom_id = searchParams.get("vdom_id") || ""; // Get vdom_id from search params
  const currentPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 15;

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
  }, [currentPage, pageSize, vdom_id]); // Add vdom_id to dependency array

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  // Error and Loading states
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl">VIPs</h1>
        <Card>
          <CardHeader>
            <CardTitle>VIP Devices</CardTitle>
            <CardDescription>Loading VIPs...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl tracking-tight">VIPs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage virtual IP mappings across your Fortinet devices
        </p>
      </div>
      
      {/* Enhanced Filter Card */}
      <FilterSection>
        <VipsFilter vdoms={vdoms} initialVdomId={vdom_id} />
      </FilterSection>
      
      {/* Enhanced Main Content Card */}
      <Card
        className="border shadow-md"
        style={{
          borderColor: 'rgba(26, 32, 53, 0.15)',
          boxShadow: '0 1px 3px 0 rgba(26, 32, 53, 0.1), 0 1px 2px 0 rgba(26, 32, 53, 0.06)'
        }}
      >
        <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a1.93 1.93 0 0 0-.97 1.68v4.62a1.93 1.93 0 0 0 .97 1.68l3.65 1.9"/><path d="m22 17.65-3.37 1.75a1.93 1.93 0 0 1-1.81 0l-3.65-1.9a1.93 1.93 0 0 1-.97-1.68v-4.62a1.93 1.93 0 0 1 .97-1.68l3.65-1.9a1.93 1.93 0 0 1 1.81 0L22 9.37"/></svg>
              VIP Devices
            </CardTitle>
            <CardDescription>
              Total: {totalCount} virtual IPs
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {vips.length > 0
              ? `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`
              : 'No VIPs found'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead>VDOM Name</TableHead>
                  <TableHead>VIP Name</TableHead>
                  <TableHead>External IP</TableHead>
                  <TableHead>Mapped IP</TableHead>
                  <TableHead>External Port</TableHead>
                  <TableHead>Mapped Port</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Last Updated</TableHead>
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
                      {vip.vdom?.vdom_name ? (
                        <TechnicalCell value={vip.vdom.vdom_name} />
                      ) : (
                        <EmptyCell />
                      )}
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
                          <EmptyCell />
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
