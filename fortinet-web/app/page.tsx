import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
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
              Welcome to Forti Visualizer
              <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              A visual interface for Fortinet network configuration data
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className="border shadow-sm" style={{
        borderColor: 'rgba(26, 32, 53, 0.15)'
      }}>
        <CardHeader className="bg-muted/50 p-3 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Project Overview
            <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-1 rounded-full"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            This application connects to Fortinet devices, parses network-specific information,
            and stores them in a PostgreSQL database. The information is then retrieved through
            an API and displayed by this front-end application.
          </p>
          
          <h3 className="text-lg font-semibold">Features</h3>
          <ul className="space-y-2 text-sm">
            <li>• View and filter firewall devices</li>
            <li>• Browse VDoms and their associated configurations</li>
            <li>• Explore routing tables with filtering options</li>
            <li>• Inspect network interfaces with status indicators</li>
            <li>• Review Virtual IP configurations</li>
            <li>• Advanced IP address search functionality</li>
          </ul>
          
          <p className="text-xs text-muted-foreground mt-4 pb-2 border-l-2 border-[var(--color-primary)] pl-3 italic">
            Use the sidebar navigation to explore different sections of the application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
