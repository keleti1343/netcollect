import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Fortinet Network Visualizer</h1>
      
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>A visual interface for Fortinet network configuration data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This application connects to Fortinet devices, parses network-specific information, 
            and stores them in a PostgreSQL database. The information is then retrieved through 
            an API and displayed by this front-end application.
          </p>
          
          <h3 className="text-lg font-semibold mt-4">Features</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>View and filter firewall devices</li>
            <li>Browse VDoms and their associated configurations</li>
            <li>Explore routing tables with filtering options</li>
            <li>Inspect network interfaces with status indicators</li>
            <li>Review Virtual IP configurations</li>
            <li>Advanced IP address search functionality</li>
          </ul>
          
          <p className="mt-4">
            Use the sidebar navigation to explore different sections of the application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
