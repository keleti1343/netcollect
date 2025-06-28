"use client"

// Temporary comment to force re-processing
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { searchIPs } from "@/services/api";
import { InterfaceResponse, RouteResponse, VIPResponse } from "@/types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { TechnicalCell, DateTimeCell } from "@/components/ui/table-cells";
import { TableCode } from "@/components/ui/table-code";
import { Skeleton } from "@/components/ui/skeleton";
import { DataPagination } from "@/components/data-pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/empty-state";

export default function SearchIPsPage() {
  const [query, setQuery] = useState("");
  const [interfacesPage, setInterfacesPage] = useState(1);
  const [routesPage, setRoutesPage] = useState(1);
  const [vipsPage, setVipsPage] = useState(1);
  const pageSize = 15; // Limit rows to 15

  const [searchResults, setSearchResults] = useState<{
    interfaces: { items: InterfaceResponse[]; total_count: number };
    routes: { items: RouteResponse[]; total_count: number };
    vips: { items: VIPResponse[]; total_count: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (
    currentInterfacesPage: number = interfacesPage,
    currentRoutesPage: number = routesPage,
    currentVipsPage: number = vipsPage
  ) => {
    if (!query.trim()) {
      setError("Please enter an IP address or subnet to search.");
      setSearchResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("Initiating search with query:", query);
      const results = await searchIPs({
        query,
        interfaces_skip: (currentInterfacesPage - 1) * pageSize,
        interfaces_limit: pageSize,
        routes_skip: (currentRoutesPage - 1) * pageSize,
        routes_limit: pageSize,
        vips_skip: (currentVipsPage - 1) * pageSize,
        vips_limit: pageSize,
      });
      setSearchResults(results);
      if (results.interfaces.total_count === 0 &&
          results.routes.total_count === 0 &&
          results.vips.total_count === 0) {
        setError("No results found for your search criteria.");
      }
    } catch (err) {
      console.error("Failed to search IPs:", err);
      setError("Failed to perform search. Please ensure the API server is running and try again.");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial search on component mount or query change
  // React.useEffect(() => {
  //   if (query) {
  //     handleSearch();
  //   }
  // }, [query]); // Removed for now, will be triggered by button click

  const handleInterfacesPageChange = (page: number) => {
    setInterfacesPage(page);
    handleSearch(page, routesPage, vipsPage);
  };

  const handleRoutesPageChange = (page: number) => {
    setRoutesPage(page);
    handleSearch(interfacesPage, page, vipsPage);
  };

  const handleVipsPageChange = (page: number) => {
    setVipsPage(page);
    handleSearch(interfacesPage, routesPage, page);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl tracking-tight">
          Search IPs
          <div className="h-1 w-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-2 rounded-full"></div>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search for IP addresses across interfaces, routes, and VIPs
        </p>
      </div>

      {/* Enhanced Filter Card (Search Input) */}
      <Card className="border border-[rgba(26,32,53,0.15)] shadow-sm">
        <CardHeader className="bg-muted/50 pb-3">
          <CardTitle className="text-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            IP Address Search
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ip-search">Search for IP:</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="ip-search"
                    placeholder="e.g., 172, 192.168, 192.168.1, 192.168.1.1, 10.0.0.0/24"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Supported formats:</p>
                  <ul className="space-y-1 mt-2">
                    <li><Badge variant="secondary">Partial octet prefix (e.g., 172)</Badge></li>
                    <li><Badge variant="secondary">Partial IP (e.g., 172.25)</Badge></li>
                    <li><Badge variant="secondary">Full IP address (e.g., 172.25.10.1)</Badge></li>
                    <li><Badge variant="secondary">CIDR subnet notation (e.g., 172.25.10.0/24)</Badge></li>
                    <li><Badge variant="secondary">Host with CIDR mask (e.g., 172.25.10.1/32)</Badge></li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-[var(--filter-button-primary-bg)] text-[var(--filter-button-primary-text)] shadow-[var(--filter-button-primary-shadow)] hover:bg-[var(--filter-button-primary-hover-bg)] hover:shadow-[var(--filter-button-primary-hover-shadow)] transition-all"
          >
            {loading ? "Searching..." : "Search"}
          </Button>

          {error && <p className="text-red-500">{error}</p>}

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {searchResults && (
        <Card className="border border-[rgba(26,32,53,0.15)] shadow-sm">
          <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                Search Results
              </CardTitle>
              <CardDescription>
                Results found across Interfaces, Routes, and VIPs
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="interfaces" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="interfaces">Interfaces ({searchResults.interfaces.total_count})</TabsTrigger>
                <TabsTrigger value="routes">Routes ({searchResults.routes.total_count})</TabsTrigger>
                <TabsTrigger value="vips">VIPs ({searchResults.vips.total_count})</TabsTrigger>
              </TabsList>

              <TabsContent value="interfaces" className="p-4">
                <div className="overflow-auto">
                  {searchResults.interfaces.items.length === 0 ? (
                    <EmptyState title="No Interfaces Found" description="No interfaces match your search criteria." />
                  ) : (
                    <Table className="border-collapse">
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-muted/20">
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">IP Address</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Name</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Type</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDOM Name</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Status</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.interfaces.items.map((iface) => (
                          <TableRow key={iface.interface_id} className="hover:bg-muted/20 border-b">
                            <TableCell>
                              <TableCode>{iface.ip_address || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{iface.interface_name || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{iface.type || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{iface.vdom?.vdom_name || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{iface.status || '−'}</TableCode>
                            </TableCell>
                            <DateTimeCell date={iface.last_updated} />
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                {searchResults.interfaces.total_count > pageSize && (
                  <div className="border-t p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {(interfacesPage - 1) * pageSize + 1}-{Math.min(interfacesPage * pageSize, searchResults.interfaces.total_count)} of {searchResults.interfaces.total_count} interfaces
                      </div>
                      <DataPagination
                        currentPage={interfacesPage}
                        totalPages={Math.ceil(searchResults.interfaces.total_count / pageSize)}
                        onPageChange={handleInterfacesPageChange}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="routes" className="p-4">
                <div className="overflow-auto">
                  {searchResults.routes.items.length === 0 ? (
                    <EmptyState title="No Routes Found" description="No routes match your search criteria." />
                  ) : (
                    <Table className="border-collapse">
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-muted/20">
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Destination Network</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Exit Interface</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Route Type</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Gateway</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDOM Name</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.routes.items.map((route) => (
                          <TableRow key={route.route_id} className="hover:bg-muted/20 border-b">
                            <TableCell>
                              <TableCode>{`${route.destination_network}/${route.mask_length}`}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{route.exit_interface_name || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{route.route_type || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{route.gateway === 'n/a' ? '−' : route.gateway}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{route.vdom?.vdom_name || '−'}</TableCode>
                            </TableCell>
                            <DateTimeCell date={route.last_updated} />
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                {searchResults.routes.total_count > pageSize && (
                  <div className="border-t p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {(routesPage - 1) * pageSize + 1}-{Math.min(routesPage * pageSize, searchResults.routes.total_count)} of {searchResults.routes.total_count} routes
                      </div>
                      <DataPagination
                        currentPage={routesPage}
                        totalPages={Math.ceil(searchResults.routes.total_count / pageSize)}
                        onPageChange={handleRoutesPageChange}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="vips" className="p-4">
                <div className="overflow-auto">
                  {searchResults.vips.items.length === 0 ? (
                    <EmptyState title="No VIPs Found" description="No VIPs match your search criteria." />
                  ) : (
                    <Table className="border-collapse">
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-muted/20">
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">External IP</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Mapped IP</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VIP Type</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">VDOM Name</TableHead>
                          <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3">Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.vips.items.map((vip) => (
                          <TableRow key={vip.vip_id} className="hover:bg-muted/20 border-b">
                            <TableCell>
                              <TableCode>{vip.external_ip || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{vip.mapped_ip || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{vip.vip_type || '−'}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{vip.vdom?.vdom_name || '−'}</TableCode>
                            </TableCell>
                            <DateTimeCell date={vip.last_updated} />
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                {searchResults.vips.total_count > pageSize && (
                  <div className="border-t p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {(vipsPage - 1) * pageSize + 1}-{Math.min(vipsPage * pageSize, searchResults.vips.total_count)} of {searchResults.vips.total_count} VIPs
                      </div>
                      <DataPagination
                        currentPage={vipsPage}
                        totalPages={Math.ceil(searchResults.vips.total_count / pageSize)}
                        onPageChange={handleVipsPageChange}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}