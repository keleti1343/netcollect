'use client';

import { useState, useEffect } from 'react';
import { getInterfaces } from '@/services/api';
import { InterfaceResponse } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableCode } from '@/components/ui/table-code';

interface InterfacesListProps {
  vdomId: number;
  vdomName: string;
}

export function InterfacesList({ vdomId, vdomName }: InterfacesListProps) {
  const [interfaces, setInterfaces] = useState<InterfaceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        setLoading(true);
        // Request all interfaces for this VDOM without pagination limit
        const { items: interfacesData } = await getInterfaces({
          vdom_id: vdomId.toString(),
          skip: '0',
          limit: '10000'  // Set a very high limit to get all interfaces
        });
        setInterfaces(interfacesData);
      } catch (err) {
        console.error('Error loading interfaces:', err);
        setError('Failed to load interfaces');
      } finally {
        setLoading(false);
      }
    };

    fetchInterfaces();
  }, [vdomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-xs text-muted-foreground">Loading interfaces...</div>
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
    <ScrollArea
      className={`w-full pr-4 ${interfaces.length > 50 ? 'max-h-[60vh]' : 'max-h-[500px]'}`}
      orientation="vertical"
    >
      <div className="p-3">
        {interfaces.length > 0 ? (
          <ul className="text-xs text-muted-foreground">
            {interfaces.map((iface: InterfaceResponse) => (
              <li key={iface.interface_id} className="flex items-center leading-tight">
                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                <div className="break-all">
                  <span className="font-medium mr-1">{iface.interface_name}</span>
                  {iface.ip_address && (
                    <span className="text-muted-foreground">
                      - {iface.ip_address}
                    </span>
                  )}
                  {iface.type && (
                    <span className="text-muted-foreground ml-2">
                      ({iface.type})
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground text-xs p-1">
            No interfaces found
          </div>
        )}
      </div>
    </ScrollArea>
  );
}