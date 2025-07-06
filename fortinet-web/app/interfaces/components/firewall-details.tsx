'use client';

import { FirewallResponse } from '@/types';
import { TableCode } from '@/components/ui/table-code';

interface FirewallDetailsProps {
  firewall: FirewallResponse;
}

export function FirewallDetails({ firewall }: FirewallDetailsProps) {
  return (
    <div className="p-3">
        <p className="text-xs mb-1">This VDOM belongs to:</p>
        <ul className="text-xs text-muted-foreground">
          <li className="flex items-center leading-tight">
            <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
            <span className="font-medium mr-1">Firewall Name:</span>
            <span>{firewall.fw_name}</span>
          </li>
          <li className="flex items-center leading-tight">
            <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
            <span className="font-medium mr-1">Firewall IP:</span>
            <span>{firewall.fw_ip}</span>
          </li>
          {firewall.fmg_ip && (
            <li className="flex items-center leading-tight">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
              <span className="font-medium mr-1">FortiManager IP:</span>
              <span>{firewall.fmg_ip}</span>
            </li>
          )}
          {firewall.faz_ip && (
            <li className="flex items-center leading-tight">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
              <span className="font-medium mr-1">FortiAnalyzer IP:</span>
              <span>{firewall.faz_ip}</span>
            </li>
          )}
        </ul>
    </div>
  );
}