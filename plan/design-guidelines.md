# Design Guidelines for Fortinet Network Visualizer

This document captures the styling elements and design principles used across the application, extracted from visual analysis and code implementation. This serves as a reference for maintaining consistency and re-using design patterns.

## 1. Sidebar Styling

**Conceptual Styling Elements:**

1.  **Overall Sidebar Container:**
    *   **Background:** A dark, solid background color (e.g., `bg-gray-900` or `bg-zinc-900`).
    *   **Width:** A fixed width (e.g., `w-64` or `w-72`).
    *   **Height:** Full height of the viewport (e.g., `h-screen`).
    *   **Positioning:** Fixed to the left side (e.g., `fixed left-0 top-0`).
    *   **Shadow/Border:** Subtle right border or shadow for separation (e.g., `border-r border-gray-800` or `shadow-lg`).
    *   **Padding:** Vertical padding (e.g., `py-4`).

2.  **Header/Logo Section:**
    *   **Text Color:** White or light gray (e.g., `text-white` or `text-gray-100`).
    *   **Font:** Bold and slightly larger (e.g., `font-bold text-xl`).
    *   **Padding/Margin:** Padding around the text (e.g., `px-4 pb-6`).

3.  **Navigation Links (Default State):**
    *   **Text Color:** Light gray (e.g., `text-gray-300`).
    *   **Hover State:** Subtle background change on hover (e.g., `hover:bg-gray-800`).
    *   **Padding:** Horizontal and vertical padding for each link (e.g., `px-4 py-2`).
    *   **Font:** Regular weight, medium size (e.g., `font-medium text-base`).
    *   **Transition:** Smooth transition for hover effects (e.g., `transition-colors duration-200`).

4.  **Active Navigation Link:**
    *   **Background:** A distinct, slightly lighter background color (e.g., `bg-blue-600` or `bg-indigo-600`).
    *   **Text Color:** White (e.g., `text-white`).
    *   **Border/Indicator:** A subtle left border or indicator line (e.g., `border-l-4 border-blue-500`).
    *   **Font:** Potentially slightly bolder (e.g., `font-semibold`).

**Implementation Example (from `fortinet-web/components/app-sidebar.tsx`):**

```typescript
// fortinet-web/components/app-sidebar.tsx
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const pathname = usePathname();

  const routes = [
    // ... routes definition ...
  ];

  return (
    <div className="w-64 border-r border-gray-800 bg-gray-900 h-screen flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-gray-800">
        <Link href="/" className="font-semibold text-lg text-white">
          Fortinet Network Visualizer
        </Link>
      </div>
      <ScrollArea className="flex-grow"> {/* Use flex-grow to fill remaining space */}
        <nav className="p-2 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "block rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200",
                pathname === route.path
                  ? "bg-blue-600 text-white" // Active link styling
                  : "text-gray-300 hover:bg-gray-800 hover:text-white" // Inactive link styling
              )}
            >
              {route.name}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
```

## 2. Table Styling

**Conceptual Styling Elements for the Table:**

1.  **Overall Table Container (`<Table>` component):**
    *   **Background:** Typically inherited from the parent container, but often a light background (e.g., `bg-white` or `bg-gray-50`). For dark theme, `bg-gray-900`.
    *   **Borders:** Subtle borders around the entire table or between rows/columns. Shadcn's `Table` component usually handles this by default.

2.  **Table Header (`<TableHeader>` and `<TableHead>` components):**
    *   **Background:** A slightly darker, solid background color to distinguish it from the body (e.g., `bg-gray-100` or `bg-neutral-100`). For dark theme, `bg-gray-800`.
    *   **Text Color:** Darker text color (e.g., `text-gray-800` or `text-neutral-800`). For dark theme, `text-gray-300`.
    *   **Font:** Bold font weight (e.g., `font-semibold`).
    *   **Padding:** Generous padding within header cells (e.g., `px-4 py-3`).
    *   **Alignment:** Text typically left-aligned.

3.  **Table Body (`<TableBody>` and `<TableRow>`, `<TableCell>` components):**
    *   **Row Backgrounds:**
        *   Default rows: White or very light background (e.g., `bg-white`). For dark theme, `bg-gray-900`.
        *   Alternating rows: A very subtle different shade (e.g., `even:bg-gray-50` or `odd:bg-white`). Shadcn's `TableRow` often has a default hover state.
    *   **Cell Borders:** Subtle bottom border for each row (e.g., `border-b border-gray-200`). For dark theme, `border-gray-700`.
    *   **Text Color:** Standard dark text color (e.g., `text-gray-700` or `text-neutral-700`). For dark theme, `text-gray-200`.
    *   **Padding:** Standard padding within data cells (e.g., `px-4 py-2`).
    *   **Font:** Regular font weight.

4.  **Specific Column Styling (e.g., "VDoms" column, "Description" column):**
    *   **Badge:** For interactive elements like "VDoms (X)" or "Description", a `Badge` component is used.
        *   **Background:** A distinct color (e.g., `bg-blue-500` or `bg-indigo-500`).
        *   **Text Color:** White (e.g., `text-white`).
        *   **Padding/Rounding:** Standard badge padding and rounded corners (e.g., `px-2 py-1 rounded-full`).
        *   **Cursor:** `cursor-help` or `cursor-pointer` to indicate interactivity.
    *   **HoverCard Integration:** The badge acts as the `HoverCardTrigger`, and the `HoverCardContent` provides additional details (e.g., a scrollable list of VDOMs or a full description).

**Implementation Example (from `fortinet-web/app/firewalls/page.tsx`):**

```typescript
// fortinet-web/app/firewalls/page.tsx
// ...
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
// ...

export default async function FirewallsPage(...) {
  // ...
  return (
    // ...
    <CardContent>
      <Table className="bg-gray-900 text-gray-100">
        <TableHeader className="bg-gray-800">
          <TableRow>
            <TableHead className="text-gray-300">Firewall Name</TableHead>
            <TableHead className="text-gray-300">IP Address</TableHead>
            <TableHead className="text-gray-300">FortiManager IP</TableHead>
            <TableHead className="text-gray-300">FortiAnalyzer IP</TableHead>
            <TableHead className="text-gray-300">VDoms</TableHead>
            <TableHead className="text-gray-300">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firewalls.map((firewall) => (
            <TableRow key={firewall.firewall_id} className="border-gray-700 hover:bg-gray-800">
              <TableCell className="text-gray-200">{firewall.fw_name}</TableCell>
              <TableCell className="text-gray-200">{firewall.fw_ip}</TableCell>
              <TableCell className="text-gray-200">{firewall.fmg_ip === 'None' || firewall.fmg_ip === 'n/a' ? '-' : firewall.fmg_ip || '-'}</TableCell>
              <TableCell className="text-gray-200">{firewall.faz_ip === 'None' || firewall.faz_ip === 'n/a' ? '-' : firewall.faz_ip || '-'}</TableCell>
              <TableCell className="text-gray-200">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="secondary" className="cursor-help bg-blue-500 text-white">
                      VDoms ({firewall.total_vdoms || 0})
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <VdomsList firewallId={firewall.firewall_id} firewallName={firewall.fw_name} />
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell className="text-gray-200">{new Date(firewall.last_updated).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
    // ...
  );
}

// VdomsList function (as defined in fortinet-web/app/firewalls/page.tsx)
async function VdomsList({ firewallId, firewallName }: { firewallId: number, firewallName: string }) {
  const { items: vdoms } = await getVdoms({ firewall_id: firewallId.toString() });
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">List of Vdoms for {firewallName}</h4>
      <ScrollArea className="h-[200px] w-full">
        <ul className="list-disc pl-4">
          {vdoms.length > 0 ? (
            vdoms.map((vdom: VDOMResponse) => (
              <li key={vdom.vdom_id}>{vdom.vdom_name}</li>
            ))
          ) : (
            <li>No VDoms found</li>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}