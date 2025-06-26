"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { getVips, getVdoms } from "@/services/api";
import { VIPResponse, VDOMResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCode } from "@/components/ui/table-code"; // Import TableCode
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { VipsFilter } from "./components/vips-filter"; // Import the new filter component

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
      <Card className="border shadow-md">
        <CardHeader className="bg-muted/50 pb-3">
          <CardTitle className="text-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter Options
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <VipsFilter vdoms={vdoms} initialVdomId={vdom_id} />
        </CardContent>
      </Card>
      
      {/* Enhanced Main Content Card */}
      <Card className="border shadow-md">
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
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {vips.length > 0 ?
                `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}` :
                'No VIPs found'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table className="border-collapse">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-muted/20">
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDOM Name</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VIP Name</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">External IP</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Mapped IP</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">External Port</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Mapped Port</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Protocol</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
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
                    <TableRow key={vip.vip_id} className="hover:bg-muted/20 border-b">
                      <TableCell>
                        {vip.vdom?.vdom_name ? (
                          <Badge variant="vdom">
                            {vip.vdom.vdom_name}
                          </Badge>
                        ) : (
                          <Badge variant="placeholder">
                            -
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {vip.vip_name || '-'}
                      </TableCell>
                      <TableCell>
                        <TableCode>{vip.external_ip}</TableCode>
                      </TableCell>
                      <TableCell>
                        <TableCode>{vip.mapped_ip}</TableCode>
                      </TableCell>
                      <TableCell>
                        <TableCode>{vip.external_port || '-'}</TableCode>
                      </TableCell>
                      <TableCell>
                        <TableCode>{vip.mapped_port || '-'}</TableCode>
                      </TableCell>
                      <TableCell>
                        {vip.protocol ? (
                          <Badge variant="protocol">
                            {vip.protocol}
                          </Badge>
                        ) : (
                          <Badge variant="placeholder">
                            -
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <small>{new Date(vip.last_updated).toLocaleString()}</small>
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