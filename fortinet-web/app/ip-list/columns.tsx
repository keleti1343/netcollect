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
import { InterfaceResponse } from "@/types"

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
      <div>
        {row.original.ip_address ? (
          <code className="px-2 py-1 bg-muted rounded text-sm">{row.original.ip_address}</code>
        ) : (
          '-'
        )}
      </div>
    ),
  },
  {
    accessorKey: "vdom.vdom_name",
    header: "VDOM Name",
    cell: ({ row }) => <div>{row.original.vdom?.vdom_name || '-'}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div>
        {row.original.description ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Badge variant="outline" className="cursor-help flex items-center space-x-1 hover:bg-primary/10">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Description</span>
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0">
              <div className="bg-muted/50 p-3 border-b">
                <h4 className="font-semibold">Interface Description</h4>
              </div>
              <div className="p-3">
                <p className="text-sm">{row.original.description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          '-'
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.status === 'up'
            ? 'bg-green-500 text-white'
            : row.original.status === 'down'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }
      >
        {row.original.status || 'unknown'}
      </Badge>
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