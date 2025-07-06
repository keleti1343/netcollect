"use client"

// Temporary comment to force re-processing
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageFeatures, FeatureTypes } from "@/components/ui/page-features";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { searchIPs } from "@/services/api";
import { InterfaceResponse, RouteResponse, VIPResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TechnicalCell, DateTimeCell } from "@/components/ui/table-cells";
import { TableCode } from "@/components/ui/table-code";
import { Skeleton } from "@/components/ui/skeleton";
import { DataPagination } from "@/components/data-pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/empty-state";
import { StatusGifCell } from "@/components/ui/status-gif-cell";

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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Compact Unified Header Card */}
      <Card className="border shadow-sm" style={{
        borderColor: 'rgba(26, 32, 53, 0.15)'
      }}>
        <CardHeader className="bg-muted/50 p-3 pb-2">
          {/* Title and Description Section */}
          <div className="pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Search IPs
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Search for IP addresses across interfaces, routes, and VIPs
            </CardDescription>
          </div>
          
          {/* Interactive Elements Section */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              {/* Page Features */}
              <div className="flex-1">
                <PageFeatures
                  features={[
                    FeatureTypes.custom(
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
                      "Advanced Search",
                      "Search across interfaces, routes, and VIPs simultaneously"
                    ),
                    FeatureTypes.custom(
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
                      "Multiple Formats",
                      "Supports partial IPs, full addresses, and CIDR notation"
                    )
                  ]}
                />
              </div>

              {/* IP Address Search */}
              <div className="flex items-center gap-2">
                <Label htmlFor="ip-search" className="text-sm font-medium whitespace-nowrap">Search for IP:</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="ip-search"
                        placeholder="e.g., 172, 192.168, 192.168.1.1"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                          }
                        }}
                        className="w-64"
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
                <Button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="bg-[var(--filter-button-primary-bg)] text-[var(--filter-button-primary-text)] shadow-[var(--filter-button-primary-shadow)] hover:bg-[var(--filter-button-primary-hover-bg)] hover:shadow-[var(--filter-button-primary-hover-shadow)] transition-all"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        {(error || loading) && (
          <CardContent className="pt-0 pb-3">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {loading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {searchResults && (
        <Card className="border shadow-md card-shadow">
          <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Search Results
                <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Total: {(searchResults.interfaces.total_count + searchResults.routes.total_count + searchResults.vips.total_count)} results found across Interfaces, Routes, and VIPs
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {(searchResults.interfaces.total_count + searchResults.routes.total_count + searchResults.vips.total_count) > 0
                ? `Found ${searchResults.interfaces.total_count} interfaces, ${searchResults.routes.total_count} routes, ${searchResults.vips.total_count} VIPs`
                : 'No results found'}
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
                      <TableHeader>
                        <TableRow className="bg-[#202A44] hover:bg-[#202A44]">
                          <TableHead className="text-sm font-semibold text-white py-3">IP ADDRESS</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">NAME</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">TYPE</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">VDOM NAME</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">STATUS</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">LAST UPDATED</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.interfaces.items.map((iface) => (
                          <TableRow key={iface.interface_id} className="hover:bg-muted/20 border-b">
                            <TableCell>
                              <TableCode>{iface.ip_address === 'unknown' || !iface.ip_address ? '−' : iface.ip_address}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{iface.interface_name === 'unknown' || !iface.interface_name ? '−' : iface.interface_name}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{iface.type === 'unknown' || !iface.type ? '−' : iface.type}</TableCode>
                            </TableCell>
                            <TableCell
                              className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const hoverCard = e.currentTarget.querySelector('.hover-card') as HTMLElement;
                                if (hoverCard) {
                                  // First position off-screen to measure actual dimensions
                                  hoverCard.style.position = 'fixed';
                                  hoverCard.style.top = '-9999px';
                                  hoverCard.style.left = '-9999px';
                                  hoverCard.style.visibility = 'visible';
                                  hoverCard.style.opacity = '1';
                                  
                                  // Get actual card dimensions
                                  const cardRect = hoverCard.getBoundingClientRect();
                                  const cardHeight = cardRect.height;
                                  const cardWidth = cardRect.width;
                                  
                                  // Get viewport dimensions
                                  const viewportHeight = window.innerHeight;
                                  const viewportWidth = window.innerWidth;
                                  
                                  // Calculate horizontal position (prefer right side, but adjust if needed)
                                  let leftPos = rect.right - 50;
                                  if (leftPos + cardWidth > viewportWidth) {
                                    leftPos = rect.left - cardWidth + 50;
                                  }
                                  if (leftPos < 0) {
                                    leftPos = 10;
                                  }
                                  
                                  // Calculate vertical position
                                  let topPos;
                                  if (rect.bottom + cardHeight + 10 > viewportHeight) {
                                    // Position above the cell
                                    topPos = rect.top - cardHeight;
                                  } else {
                                    // Position below the cell
                                    topPos = rect.bottom;
                                  }
                                  
                                  // Apply final positioning
                                  hoverCard.style.left = `${leftPos}px`;
                                  hoverCard.style.top = `${topPos}px`;
                                  hoverCard.style.zIndex = '99999';
                                }
                              }}
                            >
                              {iface.vdom ? (
                                <>
                                  <TableCode>
                                    {iface.vdom.vdom_name}
                                  </TableCode>
                                  <div className="hover-card hidden group-hover:block hover:block w-80 rounded-lg border border-border bg-popover shadow-lg overflow-hidden" style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: 99999 }}>
                                    {iface.vdom.firewall ? (
                                      <div>
                                        <div className="bg-muted p-3 border-b border-border">
                                          <h4 className="font-medium">{iface.vdom.firewall.fw_name}</h4>
                                        </div>
                                        <div className="p-3">
                                          <p className="text-xs mb-1">This VDOM belongs to:</p>
                                          <ul className="text-xs text-muted-foreground">
                                            <li className="flex items-center leading-tight">
                                              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                              <span className="font-medium mr-1">Firewall Name:</span>
                                              <span>{iface.vdom.firewall.fw_name}</span>
                                            </li>
                                            <li className="flex items-center leading-tight">
                                              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                              <span className="font-medium mr-1">Firewall IP:</span>
                                              <span>{iface.vdom.firewall.fw_ip}</span>
                                            </li>
                                            {iface.vdom.firewall.fmg_ip && (
                                              <li className="flex items-center leading-tight">
                                                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="font-medium mr-1">FortiManager IP:</span>
                                                <span>{iface.vdom.firewall.fmg_ip}</span>
                                              </li>
                                            )}
                                            {iface.vdom.firewall.faz_ip && (
                                              <li className="flex items-center leading-tight">
                                                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="font-medium mr-1">FortiAnalyzer IP:</span>
                                                <span>{iface.vdom.firewall.faz_ip}</span>
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-4 text-xs text-muted-foreground">
                                        Firewall information not available.
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <TableCode>−</TableCode>
                              )}
                            </TableCell>
                            <StatusGifCell status={iface.status} />
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
                      <TableHeader>
                        <TableRow className="bg-[#202A44] hover:bg-[#202A44]">
                          <TableHead className="text-sm font-semibold text-white py-3">DESTINATION NETWORK</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">EXIT INTERFACE</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">ROUTE TYPE</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">GATEWAY</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">VDOM NAME</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">LAST UPDATED</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.routes.items.map((route) => (
                          <TableRow key={route.route_id} className="hover:bg-muted/20 border-b">
                            <TableCell>
                              <TableCode>{`${route.destination_network}/${route.mask_length}`}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{route.exit_interface_name === 'unknown' || !route.exit_interface_name ? '−' : route.exit_interface_name}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{route.route_type === 'unknown' || !route.route_type ? '−' : route.route_type}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{route.gateway === 'n/a' || route.gateway === 'unknown' || !route.gateway ? '−' : route.gateway}</TableCode>
                            </TableCell>
                            <TableCell
                              className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const hoverCard = e.currentTarget.querySelector('.hover-card') as HTMLElement;
                                if (hoverCard) {
                                  // First position off-screen to measure actual dimensions
                                  hoverCard.style.position = 'fixed';
                                  hoverCard.style.top = '-9999px';
                                  hoverCard.style.left = '-9999px';
                                  hoverCard.style.visibility = 'visible';
                                  hoverCard.style.opacity = '1';
                                  
                                  // Get actual card dimensions
                                  const cardRect = hoverCard.getBoundingClientRect();
                                  const cardHeight = cardRect.height;
                                  const cardWidth = cardRect.width;
                                  
                                  // Get viewport dimensions
                                  const viewportHeight = window.innerHeight;
                                  const viewportWidth = window.innerWidth;
                                  
                                  // Calculate horizontal position (prefer right side, but adjust if needed)
                                  let leftPos = rect.right - 50;
                                  if (leftPos + cardWidth > viewportWidth) {
                                    leftPos = rect.left - cardWidth + 50;
                                  }
                                  if (leftPos < 0) {
                                    leftPos = 10;
                                  }
                                  
                                  // Calculate vertical position
                                  let topPos;
                                  if (rect.bottom + cardHeight + 10 > viewportHeight) {
                                    // Position above the cell
                                    topPos = rect.top - cardHeight;
                                  } else {
                                    // Position below the cell
                                    topPos = rect.bottom;
                                  }
                                  
                                  // Apply final positioning
                                  hoverCard.style.left = `${leftPos}px`;
                                  hoverCard.style.top = `${topPos}px`;
                                  hoverCard.style.zIndex = '99999';
                                }
                              }}
                            >
                              {route.vdom ? (
                                <>
                                  <TableCode>
                                    {route.vdom.vdom_name}
                                  </TableCode>
                                  <div className="hover-card hidden group-hover:block hover:block w-80 rounded-lg border border-border bg-popover shadow-lg overflow-hidden" style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: 99999 }}>
                                    {route.vdom.firewall ? (
                                      <div>
                                        <div className="bg-muted p-3 border-b border-border">
                                          <h4 className="font-medium">{route.vdom.firewall.fw_name}</h4>
                                        </div>
                                        <div className="p-3">
                                          <p className="text-xs mb-1">This VDOM belongs to:</p>
                                          <ul className="text-xs text-muted-foreground">
                                            <li className="flex items-center leading-tight">
                                              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                              <span className="font-medium mr-1">Firewall Name:</span>
                                              <span>{route.vdom.firewall.fw_name}</span>
                                            </li>
                                            <li className="flex items-center leading-tight">
                                              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                              <span className="font-medium mr-1">Firewall IP:</span>
                                              <span>{route.vdom.firewall.fw_ip}</span>
                                            </li>
                                            {route.vdom.firewall.fmg_ip && (
                                              <li className="flex items-center leading-tight">
                                                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="font-medium mr-1">FortiManager IP:</span>
                                                <span>{route.vdom.firewall.fmg_ip}</span>
                                              </li>
                                            )}
                                            {route.vdom.firewall.faz_ip && (
                                              <li className="flex items-center leading-tight">
                                                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="font-medium mr-1">FortiAnalyzer IP:</span>
                                                <span>{route.vdom.firewall.faz_ip}</span>
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-4 text-xs text-muted-foreground">
                                        Firewall information not available.
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <TableCode>−</TableCode>
                              )}
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
                      <TableHeader>
                        <TableRow className="bg-[#202A44] hover:bg-[#202A44]">
                          <TableHead className="text-sm font-semibold text-white py-3">EXTERNAL IP</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">MAPPED IP</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">VIP TYPE</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">VDOM NAME</TableHead>
                          <TableHead className="text-sm font-semibold text-white py-3">LAST UPDATED</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.vips.items.map((vip) => (
                          <TableRow key={vip.vip_id} className="hover:bg-muted/20 border-b">
                            <TableCell>
                              <TableCode>{vip.external_ip === 'unknown' || !vip.external_ip ? '−' : vip.external_ip}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{vip.mapped_ip === 'unknown' || !vip.mapped_ip ? '−' : vip.mapped_ip}</TableCode>
                            </TableCell>
                            <TableCell>
                              <TableCode>{vip.vip_type === 'unknown' || !vip.vip_type ? '−' : vip.vip_type}</TableCode>
                            </TableCell>
                            <TableCell
                              className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const hoverCard = e.currentTarget.querySelector('.hover-card') as HTMLElement;
                                if (hoverCard) {
                                  const viewportHeight = window.innerHeight;
                                  const cardHeight = 300; // Approximate card height
                                  
                                  hoverCard.style.position = 'fixed';
                                  hoverCard.style.left = `${rect.right - 50}px`;
                                  
                                  // Check if card would go off-screen at bottom
                                  if (rect.bottom + cardHeight > viewportHeight) {
                                    // Position above the cell
                                    hoverCard.style.top = `${rect.top - cardHeight}px`;
                                  } else {
                                    // Position below the cell
                                    hoverCard.style.top = `${rect.bottom}px`;
                                  }
                                  
                                  hoverCard.style.zIndex = '99999';
                                }
                              }}
                            >
                              {vip.vdom ? (
                                <>
                                  <TableCode>
                                    {vip.vdom.vdom_name}
                                  </TableCode>
                                  <div className="hover-card hidden group-hover:block hover:block w-80 rounded-lg border border-border bg-popover shadow-lg overflow-hidden" style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: 99999 }}>
                                    {vip.vdom.firewall ? (
                                      <div>
                                        <div className="bg-muted p-3 border-b border-border">
                                          <h4 className="font-medium">{vip.vdom.firewall.fw_name}</h4>
                                        </div>
                                        <div className="p-3">
                                          <p className="text-xs mb-1">This VDOM belongs to:</p>
                                          <ul className="text-xs text-muted-foreground">
                                            <li className="flex items-center leading-tight">
                                              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                              <span className="font-medium mr-1">Firewall Name:</span>
                                              <span>{vip.vdom.firewall.fw_name}</span>
                                            </li>
                                            <li className="flex items-center leading-tight">
                                              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                              <span className="font-medium mr-1">Firewall IP:</span>
                                              <span>{vip.vdom.firewall.fw_ip}</span>
                                            </li>
                                            {vip.vdom.firewall.fmg_ip && (
                                              <li className="flex items-center leading-tight">
                                                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="font-medium mr-1">FortiManager IP:</span>
                                                <span>{vip.vdom.firewall.fmg_ip}</span>
                                              </li>
                                            )}
                                            {vip.vdom.firewall.faz_ip && (
                                              <li className="flex items-center leading-tight">
                                                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="font-medium mr-1">FortiAnalyzer IP:</span>
                                                <span>{vip.vdom.firewall.faz_ip}</span>
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-4 text-xs text-muted-foreground">
                                        Firewall information not available.
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <TableCode>−</TableCode>
                              )}
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