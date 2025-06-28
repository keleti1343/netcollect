import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Page Header */}
      <div className="bg-muted/50 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl tracking-tight">
          Welcome to Fortinet Network Visualizer
          <div className="h-1 w-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mt-2 rounded-full"></div>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          A visual interface for Fortinet network configuration data
        </p>
      </div>

      <Card className="w-full max-w-4xl shadow-sm border border-[var(--color-neutral)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-h2">Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[var(--spacing-md)]">
          <p className="text-body">
            This application connects to Fortinet devices, parses network-specific information,
            and stores them in a PostgreSQL database. The information is then retrieved through
            an API and displayed by this front-end application.
          </p>
          
          <h3 className="text-h3 mt-[var(--spacing-lg)]">Features</h3>
          <ul className="text-feature-list space-y-[var(--spacing-sm)]">
            <li className="text-body">View and filter firewall devices</li>
            <li className="text-body">Browse VDoms and their associated configurations</li>
            <li className="text-body">Explore routing tables with filtering options</li>
            <li className="text-body">Inspect network interfaces with status indicators</li>
            <li className="text-body">Review Virtual IP configurations</li>
            <li className="text-body">Advanced IP address search functionality</li>
          </ul>
          
          <p className="text-body-secondary mt-[var(--spacing-lg)] pb-2 border-l-2 border-[var(--color-primary)] pl-3 italic">
            Use the sidebar navigation to explore different sections of the application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
