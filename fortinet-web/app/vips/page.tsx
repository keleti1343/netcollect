"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { getVips } from "@/services/api";
import { VIPResponse } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vips, setVips] = useState<VIPResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 15;

  useEffect(() => {
    const fetchVips = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          skip: ((currentPage - 1) * pageSize).toString(),
          limit: pageSize.toString(),
        };
        const response = await getVips(params);
        setVips(response.items);
        setTotalCount(response.total_count);
      } catch (err) {
        console.error("Failed to fetch VIPs:", err);
        setError("Failed to load VIPs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVips();
  }, [currentPage, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">VIPs</h1>
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
        <h1 className="text-3xl font-bold">VIPs</h1>
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">VIPs</h1>

      <Card>
        <CardHeader>
          <CardTitle>VIP Devices</CardTitle>
          <CardDescription>List of managed Fortinet Virtual IPs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
              {vips.map((vip) => (
                <TableRow key={vip.vip_id}>
                  <TableCell>{vip.vdom?.vdom_name || '-'}</TableCell>
                  <TableCell>{vip.vip_name || '-'}</TableCell>
                  <TableCell>{vip.external_ip}</TableCell>
                  <TableCell>{vip.mapped_ip}</TableCell>
                  <TableCell>{vip.external_port || '-'}</TableCell>
                  <TableCell>{vip.mapped_port || '-'}</TableCell>
                  <TableCell>{vip.protocol || '-'}</TableCell>
                  <TableCell>{new Date(vip.last_updated).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-center">
            <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}