import fs from 'fs';
import path from 'path';
import Papa from 'papaparse'; 
import { columns, FortiInterfaceIP } from "./columns";
import { DataTable } from "./data-table";

// Define a type for the raw CSV row structure
interface CsvRow {
  ip?: string;
  mask?: string;
  site?: string;
  vdom?: string;
  fw_manager?: string;
  fw_analyzer?: string;
  fw_ip?: string;
  fw_name?: string;
  class?: string;
  type?: string;
  interface_name?: string;
  vlanid?: string;
  description?: string;
  [key: string]: string | undefined; 
}

// Define a more generic type for PapaParse results
interface CustomParseResult {
  data: CsvRow[];
  errors: { message: string; row?: number; code?: string; type?: string }[];
  meta?: any; 
}

// Helper function to clean CSV string data
const cleanCsvString = (value: string | undefined): string => {
  if (typeof value !== 'string') return "";
  // Remove leading/trailing whitespace and quotes, and internal newlines that might be part of the field
  return value.replace(/^"|"$/g, '').replace(/\n/g, ' ').trim();
};

async function getData(): Promise<FortiInterfaceIP[]> {
  const filePath = path.join(process.cwd(), '..', 'fortinet', 'forti_interface_ip_list.csv');
  console.log(`Attempting to read CSV from: ${filePath}`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log("Successfully read CSV file content.");
    
    const results: CustomParseResult = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: 'greedy',
      skipBOM: true // Added to handle BOM if present
    }) as CustomParseResult;

    console.log("CSV parsing complete. errors:", results.errors.map(e => ({ msg: e.message, row: e.row })));
    // console.log("Raw parsed data (first 5 rows):", results.data.slice(0, 5));

    if (results.errors && results.errors.length > 0) {
      results.errors.forEach((err: { message: string; row?: number }) => 
        console.error(`CSV Parsing Error: ${err.message} (Row: ${err.row})`)
      );
    }

    const dataToMap = results.data; 

    const typedData = dataToMap.map((row: CsvRow, index: number): FortiInterfaceIP => ({
      id: `row-${index}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ip: cleanCsvString(row.ip),
      mask: cleanCsvString(row.mask),
      site: cleanCsvString(row.site),
      vdom: cleanCsvString(row.vdom),
      interface_name: cleanCsvString(row.interface_name),
      description: cleanCsvString(row.description),
    })).filter((row: FortiInterfaceIP | null): row is FortiInterfaceIP => row !== null && typeof row === 'object'); 
    
    // console.log("Mapped data (first 5 rows):", typedData.slice(0, 5));
    
    const filteredData = typedData.filter((item: FortiInterfaceIP) => {
        return !!(item.ip || item.mask || item.site || item.vdom || item.interface_name || item.description);
    });
    console.log(`Total rows after parsing: ${results.data.length}, after mapping: ${typedData.length}, after filtering: ${filteredData.length}`);
    if (filteredData.length > 0) {
        console.log("Filtered data (first 5 rows):", filteredData.slice(0, 5));
    } else {
        console.log("No data after filtering. Raw data sample:", results.data.slice(0,10)); 
    }
    return filteredData;

  } catch (error: any) {
    console.error("Error in getData function:", error.message, error.stack);
    return [];
  }
}

export default async function IPListPage() {
  console.log("IPListPage rendering...");
  const data = await getData();
  console.log(`Data passed to DataTable: ${data.length} rows`);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">FortiNet Interface IP List</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}