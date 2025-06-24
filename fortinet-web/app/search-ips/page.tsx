"use client"

// Temporary comment to force re-processing
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { searchIPs } from "@/services/api";
import { InterfaceResponse, RouteResponse, VIPResponse } from "@/types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataPagination } from "@/components/data-pagination"; // Import DataPagination

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
    } catch (err) {
      console.error("Failed to search IPs:", err);
      setError("Failed to perform search. Please try again.");
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search IPs</h1>

      <Card>
        <CardHeader>
          <CardTitle>IP Address Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ip-search">Enter IP Address or Subnet</Label>
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
          </div>
          <Button onClick={() => handleSearch()} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>

          {error && <p className="text-red-500">{error}</p>}

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}

          {searchResults && (
            <Tabs defaultValue="interfaces" className="w-full">
              <TabsList>
                <TabsTrigger value="interfaces">Interfaces ({searchResults.interfaces.items.length})</TabsTrigger>
                <TabsTrigger value="routes">Routes ({searchResults.routes.items.length})</TabsTrigger>
                <TabsTrigger value="vips">VIPs ({searchResults.vips.items.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="interfaces">
                <Card>
                  <CardHeader>
                    <CardTitle>Interfaces</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchResults.interfaces.items.length === 0 ? (
                      <p>No interfaces found for the given IP.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>VDOM Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.interfaces.items.map((iface) => (
                            <TableRow key={iface.interface_id}>
                              <TableCell>{iface.interface_name}</TableCell>
                              <TableCell>{iface.ip_address || '-'}</TableCell>
                              <TableCell>{iface.vdom?.vdom_name || '-'}</TableCell>
                              <TableCell>
                                {iface.description ? (
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Badge variant="secondary" className="cursor-help bg-blue-500 text-white">
                                        Description
                                      </Badge>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                      <p className="text-sm">{iface.description}</p>
                                    </HoverCardContent>
                                  </HoverCard>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    iface.status === 'up'
                                      ? 'default'
                                      : iface.status === 'down'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                  className={
                                    iface.status === 'up'
                                      ? 'bg-green-500 text-white'
                                      : iface.status === 'down'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-blue-500 text-white'
                                  }
                                >
                                  {iface.status === 'unknown' ? '-' : iface.status || '-'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {searchResults.interfaces.total_count > pageSize && (
                      <div className="mt-4 flex justify-center">
                        <DataPagination
                          currentPage={interfacesPage}
                          totalPages={Math.ceil(searchResults.interfaces.total_count / pageSize)}
                          onPageChange={handleInterfacesPageChange}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="routes">
                <Card>
                  <CardHeader>
                    <CardTitle>Routes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchResults.routes.items.length === 0 ? (
                      <p>No routes found for the given IP.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>VDOM Name</TableHead>
                            <TableHead>Destination Network</TableHead>
                            <TableHead>Gateway</TableHead>
                            <TableHead>Exit Interface</TableHead>
                            <TableHead>Last Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.routes.items.map((route) => (
                            <TableRow key={route.route_id}>
                              <TableCell>{route.vdom?.vdom_name || '-'}</TableCell>
                              <TableCell>{route.destination_network}/{route.mask_length}</TableCell>
                              <TableCell>{route.gateway === 'n/a' ? '-' : route.gateway || '-'}</TableCell>
                              <TableCell>{route.exit_interface_name}</TableCell>
                              <TableCell>{new Date(route.last_updated).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {searchResults.routes.total_count > pageSize && (
                      <div className="mt-4 flex justify-center">
                        <DataPagination
                          currentPage={routesPage}
                          totalPages={Math.ceil(searchResults.routes.total_count / pageSize)}
                          onPageChange={handleRoutesPageChange}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vips">
                <Card>
                  <CardHeader>
                    <CardTitle>VIPs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchResults.vips.items.length === 0 ? (
                      <p>No VIPs found for the given IP.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>VDOM Name</TableHead>
                            <TableHead>External IP</TableHead>
                            <TableHead>Mapped IP</TableHead>
                            <TableHead>External Port</TableHead>
                            <TableHead>Mapped Port</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.vips.items.map((vip) => (
                            <TableRow key={vip.vip_id}>
                              <TableCell>{vip.vdom?.vdom_name || '-'}</TableCell>
                              <TableCell>{vip.external_ip}</TableCell>
                              <TableCell>{vip.mapped_ip}</TableCell>
                              <TableCell>{vip.external_port || '-'}</TableCell>
                              <TableCell>{vip.mapped_port || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {searchResults.vips.total_count > pageSize && (
                      <div className="mt-4 flex justify-center">
                        <DataPagination
                          currentPage={vipsPage}
                          totalPages={Math.ceil(searchResults.vips.total_count / pageSize)}
                          onPageChange={handleVipsPageChange}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}