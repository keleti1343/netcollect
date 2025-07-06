'use client';

import { useState, useEffect } from 'react';
import { getRoutes } from '@/services/api';
import { RouteResponse } from '@/types';
import { TableCode } from '@/components/ui/table-code';

interface RoutesListProps {
  vdomId: number;
  vdomName: string;
}

export function RoutesList({ vdomId, vdomName }: RoutesListProps) {
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        // Request all routes for this VDOM without pagination limit
        const { items: routesData } = await getRoutes({
          vdom_id: vdomId.toString(),
          skip: '0',
          limit: '10000'  // Set a very high limit to get all routes
        });
        setRoutes(routesData);
      } catch (err) {
        console.error('Error loading routes:', err);
        setError('Failed to load routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [vdomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-xs text-muted-foreground">Loading routes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-xs text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2">
      <div className="p-3">
        {routes.length > 0 ? (
          <ul className="text-xs text-muted-foreground space-y-1">
            {routes.map((route: RouteResponse) => (
              <li key={route.route_id} className="flex items-start leading-tight">
                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0 mt-1"></span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium break-words">{route.destination_network}/{route.mask_length}</div>
                  {route.gateway && (
                    <div className="text-muted-foreground text-xs">
                      via {route.gateway}
                    </div>
                  )}
                  {route.exit_interface_name && (
                    <div className="text-muted-foreground text-xs">
                      dev {route.exit_interface_name}
                    </div>
                  )}
                  {route.route_type && (
                    <div className="text-muted-foreground text-xs">
                      ({route.route_type})
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground text-xs p-1">
            No routes found
          </div>
        )}
      </div>
    </div>
  );
}