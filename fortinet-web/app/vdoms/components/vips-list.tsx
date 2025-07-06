'use client';

import { useState, useEffect } from 'react';
import { getVips } from '@/services/api';
import { VIPResponse } from '@/types';
import { TableCode } from '@/components/ui/table-code';

interface VipsListProps {
  vdomId: number;
  vdomName: string;
}

export function VipsList({ vdomId, vdomName }: VipsListProps) {
  const [vips, setVips] = useState<VIPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVips = async () => {
      try {
        setLoading(true);
        // Request all VIPs for this VDOM without pagination limit
        const { items: vipsData } = await getVips({
          vdom_id: vdomId.toString(),
          skip: '0',
          limit: '10000'  // Set a very high limit to get all VIPs
        });
        setVips(vipsData);
      } catch (err) {
        console.error('Error loading VIPs:', err);
        setError('Failed to load VIPs');
      } finally {
        setLoading(false);
      }
    };

    fetchVips();
  }, [vdomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-xs text-muted-foreground">Loading VIPs...</div>
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
        {vips.length > 0 ? (
          <ul className="text-xs text-muted-foreground">
            {vips.map((vip: VIPResponse) => (
              <li key={vip.vip_id} className="flex items-center leading-tight">
                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                <div className="break-all">
                  <span className="font-medium mr-1">{vip.external_ip || vip.vip_name}</span>
                  {vip.external_port && (
                    <span className="text-muted-foreground">
                      :{vip.external_port}
                    </span>
                  )}
                  {vip.mapped_ip && (
                    <span className="text-muted-foreground ml-2">
                      → {vip.mapped_ip}
                      {vip.mapped_port && `:${vip.mapped_port}`}
                    </span>
                  )}
                  {vip.protocol && (
                    <span className="text-muted-foreground ml-2">
                      ({vip.protocol})
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground text-xs p-1">
            No VIPs found
          </div>
        )}
      </div>
    </div>
  );
}