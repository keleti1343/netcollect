"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { TechnicalCell } from "@/components/ui/table-cells"
import { InterfaceResponse } from "@/types"
import { PlaceholderValue } from "@/components/ui/placeholder-value";
import { HoverCardHeader } from "@/components/ui/hover-card-header";

export const columns: ColumnDef<InterfaceResponse>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "interface_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("interface_name")}</div>,
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
    cell: ({ row }) => (
      <PlaceholderValue value={row.original.ip_address} useCode />
    ),
  },
  {
    accessorKey: "vdom.vdom_name",
    header: "VDOM Name",
    cell: ({ row }) => <PlaceholderValue value={row.original.vdom?.vdom_name} />,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      row.original.description ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge variant="info" className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
              Description
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="p-0">
            <HoverCardHeader>
              <h4 className="font-medium">Interface Description</h4>
            </HoverCardHeader>
            <div className="p-[var(--hover-card-content-padding)]">
              <p className="text-sm">{row.original.description}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : (
        <PlaceholderValue value={row.original.description} />
      )
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <TechnicalCell value={row.original.status || '−'} />
    ),
  },
  {
    accessorKey: "last_updated",
    header: "Last Updated",
    cell: ({ row }) => (
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span className="text-sm">{new Date(row.original.last_updated).toLocaleString()}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const interfaceIp = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(interfaceIp.ip_address || "")}
            >
              Copy IP Address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]