# Plan Step 11: Web Interface Implementation (Next.js)

This document outlines the detailed implementation plan for creating a web interface using Next.js to display the data collected from Fortinet devices and stored in PostgreSQL. The interface will provide a comprehensive view of firewalls, VDOMs, interfaces, and routes, with advanced search capabilities.

## 1. Project Structure

```
fortinet-web-interface/
├── components/               # Reusable UI components
│   ├── layout/              
│   │   ├── Layout.jsx        # Main layout with navigation
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   └── Sidebar.jsx       # Side navigation (optional)
│   ├── devices/
│   │   ├── DeviceList.jsx    # Device listing component
│   │   ├── DeviceDetails.jsx # Device details view
│   │   └── DeviceCard.jsx    # Card component for device overview
│   ├── vdoms/
│   │   ├── VdomList.jsx      # VDOM listing component
│   │   └── VdomDetails.jsx   # VDOM details view
│   ├── interfaces/
│   │   ├── InterfaceList.jsx # Interface listing component
│   │   └── InterfaceDetails.jsx # Interface details view
│   ├── routes/
│   │   ├── RouteList.jsx     # Route listing component
│   │   └── RouteDetails.jsx  # Route details view
│   ├── vips/
│   │   ├── VipList.jsx       # VIP listing component
│   │   └── VipDetails.jsx    # VIP details view
│   ├── search/
│   │   ├── SearchBar.jsx     # Main search component
│   │   ├── VdomSearch.jsx    # VDOM-specific search
│   │   ├── IPSearchInput.jsx # IP address search input component
│   │   └── IPSearchResults.jsx # IP search results display
│   └── ui/                   # Basic UI components
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Table.jsx
│       ├── Pagination.jsx
│       └── Badge.jsx
├── lib/                      # Utility functions and shared code
│   ├── prisma.js             # Prisma client setup
│   ├── ip-utils.js           # IP address utility functions
│   └── format-utils.js       # Data formatting utilities
├── pages/                    # Next.js pages
│   ├── index.js              # Landing page (device list)
│   ├── devices/
│   │   ├── index.js          # All devices page
│   │   └── [id]/             # Device details routes
│   │       ├── index.js      # Device overview
│   │       ├── vdoms.js      # Device VDOMs
│   │       ├── interfaces.js # Device interfaces
│   │       └── routes.js     # Device routes
│   ├── vdoms/
│   │   ├── index.js          # All VDOMs page
│   │   └── [id].js           # VDOM details
│   ├── interfaces/
│   │   ├── index.js          # All interfaces page
│   │   └── [id].js           # Interface details
│   ├── routes/
│   │   ├── index.js          # All routes page
│   │   └── [id].js           # Route details
│   ├── vips/
│   │   ├── index.js          # All VIPs page
│   │   └── [id].js           # VIP details
│   ├── search.js             # Search page
│   └── api/                  # API routes
│       ├── devices/
│       │   ├── index.js      # Get all devices
│       │   └── [id].js       # Get device details
│       ├── vdoms/
│       │   ├── index.js      # Get all VDOMs
│       │   └── [id].js       # Get VDOM details
│       ├── interfaces/
│       │   ├── index.js      # Get all interfaces
│       │   └── [id].js       # Get interface details
│       ├── routes/
│       │   ├── index.js      # Get all routes
│       │   └── [id].js       # Get route details
│       ├── vips/
│       │   ├── index.js      # Get all VIPs
│       │   └── [id].js       # Get VIP details
│       └── search/
│           ├── vdom.js       # VDOM search API
│           └── ip.js         # IP address search API
├── prisma/                   # Prisma configuration
│   └── schema.prisma         # Database schema definition
├── public/                   # Static assets
│   └── images/
│       └── logo.svg          # Logo and other static assets
├── styles/                   # CSS styles
│   ├── globals.css           # Global styles
│   └── Home.module.css       # Page-specific styles
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## 2. Project Setup

### 2.1 Initialize Next.js Project

```bash
# Create a new Next.js project
npx create-next-app@latest fortinet-web-interface --typescript
cd fortinet-web-interface

# Install required dependencies
npm install @prisma/client prisma
npm install tailwindcss postcss autoprefixer
npm install swr axios
npm install react-table
npm install @heroicons/react
npm install ip-address cidr-match
npm install date-fns

# Set up Tailwind CSS
npx tailwindcss init -p
```

### 2.2 Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        }
      }
    },
  },
  plugins: [],
}
```

Update `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.3 Prisma Configuration

Initialize Prisma with PostgreSQL:

```bash
npx prisma init --datasource-provider postgresql
```

Create the Prisma schema that mirrors our PostgreSQL database structure in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Firewall {
  firewall_id  Int      @id @default(autoincrement())
  fw_name      String   @unique
  fw_ip        String   @unique
  fmg_ip       String?
  faz_ip       String?
  site         String?
  last_updated DateTime

  vdoms      Vdom[]
  interfaces Interface[]

  @@map("firewalls")
}

model Vdom {
  vdom_id     Int      @id @default(autoincrement())
  firewall_id Int
  vdom_name   String
  vdom_index  Int?
  last_updated DateTime

  firewall   Firewall @relation(fields: [firewall_id], references: [firewall_id], onDelete: Cascade)
  routes     Route[]
  vips       Vip[]
  interfaces Interface[]

  @@unique([firewall_id, vdom_name])
  @@map("vdoms")
}

model Interface {
  interface_id           Int      @id @default(autoincrement())
  firewall_id            Int
  vdom_id                Int?
  interface_name         String
  ip_address             String?
  mask                   String?
  type                   String
  vlan_id                Int?
  description            String?
  status                 String?
  physical_interface_name String?
  last_updated           DateTime

  firewall Firewall @relation(fields: [firewall_id], references: [firewall_id], onDelete: Cascade)
  vdom     Vdom?     @relation(fields: [vdom_id], references: [vdom_id], onDelete: SetNull)

  @@unique([firewall_id, vdom_id, interface_name])
  @@map("interfaces")
}

model Route {
  route_id               Int      @id @default(autoincrement())
  vdom_id                Int
  destination_network    String
  mask_length            Int
  route_type             String
  gateway                String?
  exit_interface_name    String
  exit_interface_details String?
  last_updated           DateTime

  vdom Vdom @relation(fields: [vdom_id], references: [vdom_id], onDelete: Cascade)

  @@unique([vdom_id, destination_network, mask_length, route_type, exit_interface_name])
  @@map("routes")
}

model Vip {
  vip_id             Int      @id @default(autoincrement())
  vdom_id            Int
  vip_name           String
  external_ip        String
  external_port      Int?
  mapped_ip          String
  mapped_port        Int?
  vip_type           String?
  external_interface String?
  comment            String?
  last_updated       DateTime

  vdom Vdom @relation(fields: [vdom_id], references: [vdom_id], onDelete: Cascade)

  @@unique([vdom_id, vip_name])
  @@map("vips")
}
```

### 2.4 Environment Configuration

Create `.env` file in the project root:

```
# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:55322/postgres?schema=public"

# Application Settings
NEXT_PUBLIC_APP_NAME="Fortinet Network Collector"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 2.5 Set Up Prisma Client

Create `lib/prisma.js` to set up the Prisma client singleton:

```javascript
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances of Prisma Client in development
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
```

## 3. IP Address Search Functionality

The IP address search functionality is one of the most complex features of the web interface. It needs to handle various search formats:

1. Partial octet prefix (e.g., `172`) - Match all IPs starting with this prefix
2. Partial IP (e.g., `172.25`) - Match all IPs starting with these octets
3. Full IP address (e.g., `172.25.10.1`) - Match this exact IP
4. CIDR subnet notation (e.g., `172.25.10.0/24`) - Match all IPs in this subnet
5. Host with CIDR mask (e.g., `172.25.10.1/32`) - Match this specific IP with mask

### 3.1 IP Address Utility Module

Create `lib/ip-utils.js` to handle IP address operations:

```javascript
import ipaddr from 'ip-address';
import cidrMatch from 'cidr-match';

/**
 * Determines the type of IP search query and normalizes it
 * @param {string} query - The raw search query
 * @returns {Object} - Information about the query type and normalized values
 */
export function parseIpQuery(query) {
  // Remove any whitespace
  query = query.trim();
  
  // Initialize the result object
  const result = {
    originalQuery: query,
    type: null,
    value: null,
    cidr: null,
    prefix: null,
    isValid: false,
    error: null
  };
  
  try {
    // Check if the query is in CIDR notation (contains '/')
    if (query.includes('/')) {
      // Try to parse as CIDR
      try {
        // Validate CIDR notation using ipaddr.js
        const cidrParts = query.split('/');
        const ip = cidrParts[0];
        const prefix = parseInt(cidrParts[1], 10);
        
        // Validate IP part
        new ipaddr.Address4(ip);
        
        // Validate prefix part (0-32 for IPv4)
        if (prefix < 0 || prefix > 32) {
          throw new Error('Invalid prefix length');
        }
        
        // Valid CIDR
        result.type = 'cidr';
        result.value = query;
        result.cidr = query;
        result.prefix = prefix;
        result.isValid = true;
      } catch (e) {
        result.error = 'Invalid CIDR notation';
      }
    }
    // Check if it's a full IP address (4 octets)
    else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(query)) {
      try {
        // Validate as IPv4
        new ipaddr.Address4(query);
        
        result.type = 'ip';
        result.value = query;
        result.cidr = `${query}/32`; // Convert to CIDR with /32 mask
        result.prefix = 32;
        result.isValid = true;
      } catch (e) {
        result.error = 'Invalid IP address';
      }
    }
    // Handle partial IP (prefix search)
    else if (/^\d{1,3}(\.\d{1,3}){0,2}$/.test(query)) {
      const octets = query.split('.');
      
      // Validate each octet is in range 0-255
      for (const octet of octets) {
        const num = parseInt(octet, 10);
        if (num < 0 || num > 255) {
          throw new Error('Invalid octet range');
        }
      }
      
      result.type = 'prefix';
      result.value = query;
      result.prefix = octets.length * 8; // Each octet represents 8 bits
      result.isValid = true;
    }
    else {
      result.error = 'Unrecognized IP format';
    }
  } catch (e) {
    result.error = e.message || 'Invalid IP format';
  }
  
  return result;
}

/**
 * Checks if an IP address is within a CIDR range
 * @param {string} ip - The IP address to check
 * @param {string} cidr - The CIDR range to check against
 * @returns {boolean} - True if the IP is in the range
 */
export function isIpInCidr(ip, cidr) {
  try {
    const matcher = cidrMatch(cidr);
    return matcher.test(ip);
  } catch (e) {
    console.error('Error in CIDR matching:', e);
    return false;
  }
}

/**
 * Checks if two CIDR ranges overlap
 * @param {string} cidr1 - First CIDR range
 * @param {string} cidr2 - Second CIDR range
 * @returns {boolean} - True if the ranges overlap
 */
export function doCidrsOverlap(cidr1, cidr2) {
  try {
    return cidrMatch.overlap(cidr1, cidr2);
  } catch (e) {
    console.error('Error checking CIDR overlap:', e);
    return false;
  }
}

/**
 * Converts a subnet mask (e.g., 255.255.255.0) to CIDR prefix length
 * @param {string} mask - Subnet mask in dotted decimal notation
 * @returns {number} - CIDR prefix length
 */
export function maskToCidr(mask) {
  try {
    return ipaddr.createAddress(mask).prefixLength();
  } catch (e) {
    console.error('Error converting mask to CIDR:', e);
    return null;
  }
}

/**
 * Normalizes a route to CIDR notation
 * @param {string} network - Network address
 * @param {number} maskLength - Mask length
 * @returns {string} - CIDR notation
 */
export function routeToCidr(network, maskLength) {
  if (!network || maskLength === undefined || maskLength === null) return null;
  return `${network}/${maskLength}`;
}
```

### 3.2 IP Search API Implementation

Create `pages/api/search/ip.js` to implement the search API:

```javascript
import prisma from '../../../lib/prisma';
import { parseIpQuery, isIpInCidr, doCidrsOverlap, routeToCidr } from '../../../lib/ip-utils';

export default async function handler(req, res) {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Parse and validate the IP query
    const parsedQuery = parseIpQuery(query);
    
    if (!parsedQuery.isValid) {
      return res.status(400).json({ 
        error: parsedQuery.error || 'Invalid IP format',
        details: parsedQuery
      });
    }
    
    // Prepare search results container
    const results = {
      query: parsedQuery,
      interfaces: [],
      routes: [],
      totalResults: 0
    };
    
    // Apply different search strategies based on query type
    if (parsedQuery.type === 'prefix') {
      // Fetch interfaces matching the prefix
      results.interfaces = await searchInterfacesByPrefix(parsedQuery.value);
      
      // Fetch routes matching the prefix
      results.routes = await searchRoutesByPrefix(parsedQuery.value);
    } 
    else if (parsedQuery.type === 'ip') {
      // For exact IP match
      results.interfaces = await searchInterfacesByExactIp(parsedQuery.value);
      
      // For routes, we need to check if this IP is contained within any route
      results.routes = await searchRoutesContainingIp(parsedQuery.value);
    }
    else if (parsedQuery.type === 'cidr') {
      // For CIDR notation, check interfaces with IPs in this range
      results.interfaces = await searchInterfacesInCidr(parsedQuery.cidr);
      
      // For routes, check for overlapping networks
      results.routes = await searchRoutesOverlappingCidr(parsedQuery.cidr);
    }
    
    // Calculate total results
    results.totalResults = results.interfaces.length + results.routes.length;
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in IP search:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Helper functions for different search types

/**
 * Search interfaces by IP prefix
 */
async function searchInterfacesByPrefix(prefix) {
  return await prisma.interface.findMany({
    where: {
      ip_address: {
        startsWith: prefix
      }
    },
    include: {
      firewall: {
        select: {
          firewall_id: true,
          fw_name: true,
          fw_ip: true
        }
      },
      vdom: {
        select: {
          vdom_id: true,
          vdom_name: true
        }
      }
    }
  });
}

/**
 * Search routes by network prefix
 */
async function searchRoutesByPrefix(prefix) {
  return await prisma.route.findMany({
    where: {
      destination_network: {
        startsWith: prefix
      }
    },
    include: {
      vdom: {
        include: {
          firewall: {
            select: {
              firewall_id: true,
              fw_name: true,
              fw_ip: true
            }
          }
        }
      }
    }
  });
}

/**
 * Search interfaces by exact IP match
 */
async function searchInterfacesByExactIp(ip) {
  return await prisma.interface.findMany({
    where: {
      ip_address: ip
    },
    include: {
      firewall: {
        select: {
          firewall_id: true,
          fw_name: true,
          fw_ip: true
        }
      },
      vdom: {
        select: {
          vdom_id: true,
          vdom_name: true
        }
      }
    }
  });
}

/**
 * Search routes containing a specific IP
 * This requires post-processing since we can't do CIDR calculations in the DB query
 */
async function searchRoutesContainingIp(ip) {
  // Fetch all routes - this could be optimized with a prefix filter
  const allRoutes = await prisma.route.findMany({
    include: {
      vdom: {
        include: {
          firewall: {
            select: {
              firewall_id: true,
              fw_name: true,
              fw_ip: true
            }
          }
        }
      }
    }
  });
  
  // Filter routes containing the IP
  return allRoutes.filter(route => {
    const routeCidr = routeToCidr(route.destination_network, route.mask_length);
    if (!routeCidr) return false;
    
    return isIpInCidr(ip, routeCidr);
  });
}

/**
 * Search interfaces with IPs in a CIDR range
 * This requires post-processing due to CIDR calculations
 */
async function searchInterfacesInCidr(cidr) {
  // Fetch interfaces with non-null IPs
  const interfaces = await prisma.interface.findMany({
    where: {
      ip_address: {
        not: null
      }
    },
    include: {
      firewall: {
        select: {
          firewall_id: true,
          fw_name: true,
          fw_ip: true
        }
      },
      vdom: {
        select: {
          vdom_id: true,
          vdom_name: true
        }
      }
    }
  });
  
  // Filter interfaces in the CIDR range
  return interfaces.filter(intf => {
    if (!intf.ip_address) return false;
    return isIpInCidr(intf.ip_address, cidr);
  });
}

/**
 * Search routes that overlap with a CIDR range
 */
async function searchRoutesOverlappingCidr(cidr) {
  // Fetch all routes
  const allRoutes = await prisma.route.findMany({
    include: {
      vdom: {
        include: {
          firewall: {
            select: {
              firewall_id: true,
              fw_name: true,
              fw_ip: true
            }
          }
        }
      }
    }
  });
  
  // Filter routes that overlap with the CIDR
  return allRoutes.filter(route => {
    const routeCidr = routeToCidr(route.destination_network, route.mask_length);
    if (!routeCidr) return false;
    
    return doCidrsOverlap(cidr, routeCidr);
  });
}
```

### 3.3 IP Search Input Component

Create `components/search/IPSearchInput.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react';
import { parseIpQuery } from '../../lib/ip-utils';

export default function IPSearchInput({ onSearch, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [parsedQuery, setParsedQuery] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const inputRef = useRef(null);

  // Parse query when it changes
  useEffect(() => {
    if (!query) {
      setIsValid(true);
      setError('');
      setParsedQuery(null);
      return;
    }
    
    const result = parseIpQuery(query);
    setParsedQuery(result);
    setIsValid(result.isValid);
    setError(result.error || '');
    
  }, [query]);

  // Show search hints when the input is focused
  const handleFocus = () => {
    setShowHints(true);
  };

  // Perform search on Enter key or when clicking search button
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!query) {
      return;
    }
    
    if (!isValid) {
      // Focus input if query is invalid
      inputRef.current.focus();
      return;
    }
    
    onSearch(query, parsedQuery);
  };

  // Handle input changes with debounce for validation
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsTyping(true);
    clearTimeout(window.ipSearchTimeout);
    
    window.ipSearchTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Search IP (e.g. 172.25 or 192.168.1.0/24)"
            className={`w-full px-4 py-2 border ${
              isValid ? 'border-gray-300' : 'border-red-500'
            } rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-invalid={!isValid}
          />
          <button
            type="submit"
            disabled={!isValid || !query}
            className={`px-4 py-2 font-medium text-white rounded-r-md ${
              isValid && query
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Search
          </button>
        </div>
        
        {isTyping && (
          <div className="mt-1 text-sm text-gray-500">Validating input...</div>
        )}
        
        {error && !isTyping && (
          <div className="mt-1 text-sm text-red-500">{error}</div>
        )}
        
        {parsedQuery && !error && !isTyping && (
          <div className="mt-1 text-sm text-green-600">
            {parsedQuery.type === 'prefix' && `Searching for IPs starting with ${parsedQuery.value}`}
            {parsedQuery.type === 'ip' && `Searching for exact IP ${parsedQuery.value}`}
            {parsedQuery.type === 'cidr' && `Searching for IPs in range ${parsedQuery.cidr}`}
          </div>
        )}
        
        {showHints && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
            <strong className="block mb-1 text-gray-700">Search Formats:</strong>
            <ul className="space-y-1 text-gray-600">
              <li><code className="bg-gray-100 px-1">172</code> - Find all IPs starting with 172</li>
              <li><code className="bg-gray-100 px-1">172.25</code> - Find all IPs in the 172.25.x.x range</li>
              <li><code className="bg-gray-100 px-1">172.25.10.1</code> - Find this exact IP address</li>
              <li><code className="bg-gray-100 px-1">172.25.10.0/24</code> - Find all IPs in this subnet</li>
              <li><code className="bg-gray-100 px-1">172.25.10.1/32</code> - Find this specific host with mask</li>
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
```

### 3.4 IP Search Results Component

Create `components/search/IPSearchResults.jsx`:

```jsx
import { useState } from 'react';
import Link from 'next/link';
import { maskToCidr } from '../../lib/ip-utils';

export default function IPSearchResults({ results, isLoading }) {
  const [activeTab, setActiveTab] = useState('all');
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!results) {
    return null;
  }
  
  const { interfaces, routes, totalResults, query } = results;
  
  if (totalResults === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <h2 className="text-xl font-semibold mb-4">No results found</h2>
        <p className="text-gray-600">
          No interfaces or routes found matching <code className="bg-gray-100 px-1">{query.originalQuery}</code>.
        </p>
      </div>
    );
  }
  
  // Function to format IP with mask for display
  const formatIpWithMask = (ip, mask) => {
    if (!ip) return 'N/A';
    if (!mask) return ip;
    
    const cidrMask = typeof mask === 'number' 
      ? mask 
      : maskToCidr(mask);
      
    return cidrMask ? `${ip}/${cidrMask}` : ip;
  };
  
  // Filter results based on active tab
  const displayResults = activeTab === 'all' 
    ? [...interfaces, ...routes]
    : activeTab === 'interfaces' 
      ? interfaces 
      : routes;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Search Results <span className="text-gray-500">({totalResults})</span>
        </h2>
        <div className="text-sm text-gray-600">
          Query: <code className="bg-gray-100 px-1">{query.originalQuery}</code>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Results ({totalResults})
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interfaces'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('interfaces')}
          >
            Interfaces ({interfaces.length})
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'routes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('routes')}
          >
            Routes ({routes.length})
          </button>
        </nav>
      </div>
      
      {/* Results table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP/Network
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VDOM
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayResults.map((item, index) => {
              // Determine if this is an interface or route
              const isInterface = 'interface_id' in item;
              
              // Extract firewall and vdom info
              const firewall = isInterface 
                ? item.firewall 
                : item.vdom?.firewall;
                
              const vdom = isInterface 
                ? item.vdom 
                : item.vdom;
              
              // Format IP address or network
              const ipDisplay = isInterface
                ? formatIpWithMask(item.ip_address, item.mask)
                : formatIpWithMask(item.destination_network, item.mask_length);
                
              // Detail text based on item type
              const detailText = isInterface
                ? `${item.interface_name} (${item.type}${item.status ? `, ${item.status}` : ''})`
                : `${item.route_type} route via ${item.gateway || 'directly connected'} (${item.exit_interface_name})`;
                
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isInterface 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isInterface ? 'Interface' : 'Route'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ipDisplay}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {firewall ? (
                      <Link href={`/devices/${firewall.firewall_id}`} className="text-blue-600 hover:text-blue-800">
                        {firewall.fw_name}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vdom ? (
                      <Link href={`/vdoms/${vdom.vdom_id}`} className="text-blue-600 hover:text-blue-800">
                        {vdom.vdom_name}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isInterface ? (
                      <Link href={`/interfaces/${item.interface_id}`} className="text-blue-600 hover:text-blue-800">
                        {detailText}
                      </Link>
                    ) : (
                      <Link href={`/routes/${item.route_id}`} className="text-blue-600 hover:text-blue-800">
                        {detailText}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 3.5 Search Page Implementation

Create `pages/search.js` to integrate the search components:

```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import IPSearchInput from '../components/search/IPSearchInput';
import IPSearchResults from '../components/search/IPSearchResults';

export default function SearchPage() {
  const router = useRouter();
  const { query, type } = router.query;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize search input from URL parameters when page loads
  useEffect(() => {
    if (query && type === 'ip') {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query, type]);
  
  // Handle search submission
  const handleSearch = (inputQuery, parsedQuery) => {
    // Update URL to make search bookmarkable/shareable
    router.push({
      pathname: '/search',
      query: { type: 'ip', query: inputQuery },
    }, undefined, { shallow: true });
    
    performSearch(inputQuery);
  };
  
  // Perform the actual search API call
  const performSearch = async (inputQuery) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/search/ip?query=${encodeURIComponent(inputQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'An error occurred during the search');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">IP Address Search</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <IPSearchInput 
            onSearch={handleSearch} 
            initialQuery={searchQuery}
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <IPSearchResults 
          results={searchResults} 
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
}
```

## 4. VDOM Search Functionality

### 4.1 VDOM Search API

Create `pages/api/search/vdom.js`:

```javascript
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const vdoms = await prisma.vdom.findMany({
      where: {
        vdom_name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        firewall: {
          select: {
            firewall_id: true,
            fw_name: true,
            fw_ip: true
          }
        },
        _count: {
          select: {
            interfaces: true,
            routes: true,
            vips: true
          }
        }
      },
      take: 20, // Limit to 20 results for performance
    });
    
    return res.status(200).json(vdoms);
  } catch (error) {
    console.error('Error in VDOM search:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
```

### 4.2 VDOM Search Component

Create `components/search/VdomSearch.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function VdomSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 1) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/search/vdom?query=${searchQuery}`);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching VDOM suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/search?type=vdom&query=${searchQuery}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search VDOMs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => {
            if (searchQuery && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-md px-4 py-2"
        >
          Search
        </button>
      </form>
      
      {loading && (
        <div className="absolute right-12 top-3">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white shadow-lg rounded-b-md mt-1 border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((vdom) => (
            <div 
              key={vdom.vdom_id} 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                router.push(`/vdoms/${vdom.vdom_id}`);
                setShowSuggestions(false);
              }}
            >
              <div className="font-medium">{vdom.vdom_name}</div>
              <div className="text-sm text-gray-600">
                <span>Device: {vdom.firewall.fw_name}</span>
                <span className="ml-2">
                  Interfaces: {vdom._count.interfaces}, 
                  Routes: {vdom._count.routes}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 5. Database Optimization for Search Performance

For optimal search performance, add the following indexes to the database:

```sql
-- Indexes for IP address searches
CREATE INDEX idx_interfaces_ip_address ON interfaces(ip_address);
CREATE INDEX idx_routes_destination_network ON routes(destination_network);
CREATE INDEX idx_routes_mask_length ON routes(mask_length);

-- Indexes for VDOM searches
CREATE INDEX idx_vdoms_vdom_name ON vdoms(vdom_name);
```

PostgreSQL has built-in IP address types and CIDR operators that can improve search performance. Consider using these types instead of TEXT:

```sql
-- Alter columns to use IP-specific types
ALTER TABLE interfaces 
ALTER COLUMN ip_address TYPE inet USING ip_address::inet;

ALTER TABLE routes 
ALTER COLUMN destination_network TYPE inet USING destination_network::inet;
```

To reflect these changes in the Prisma schema:

```prisma
model Interface {
  // Other fields...
  ip_address String? @db.Inet // Use PostgreSQL's inet type
  // Rest of the model...
}

model Route {
  // Other fields...
  destination_network String @db.Inet // Use PostgreSQL's inet type
  // Rest of the model...
}
```

With these types, PostgreSQL's powerful CIDR operators (`<<`, `<<=`, `>>`, `>>=`, `&&`) can be used directly in queries for better performance.

## 6. Implementation Steps

1. **Set Up Next.js Project**
   - Initialize the project with TypeScript support
   - Configure Tailwind CSS
   - Set up project structure with components, pages, and lib directories

2. **Implement Database Connection**
   - Set up Prisma configuration
   - Define the schema models
   - Create a database connection singleton

3. **Develop Core Components**
   - Layout components (Layout, Navbar)
   - Data display components (tables, cards)
   - Implement pagination and filtering utilities

4. **Implement API Routes**
   - Device data endpoints
   - VDOM data endpoints
   - Interface data endpoints
   - Route data endpoints
   - Search endpoints (IP, VDOM)

5. **Build Pages**
   - Landing page with device list
   - Device detail pages
   - VDOM, interface, and route pages
   - Search page with advanced filtering

6. **Implement Search Functionality**
   - IP address search with multiple formats
   - VDOM search with dynamic suggestions
   - Optimize search performance

7. **Test and Refine**
   - Test with real data
   - Optimize queries for performance
   - Fix any issues with display or search

## 7. Testing Strategy

### 7.1 Unit Testing

Test individual components and utilities:

- IP address utilities
- Data formatting functions
- UI component rendering

### 7.2 Integration Testing

Test the integration between components:

- API endpoints with database queries
- Search components with API responses
- Page navigation and state management

### 7.3 End-to-End Testing

Test complete user flows:

- Navigate from landing page to details
- Perform searches and filter results
- Test with various screen sizes for responsiveness

## 8. Deployment Considerations

### 8.1 Development Environment

For local development:

```bash
# Start the Next.js development server
npm run dev

# Access the application at http://localhost:3000
```

### 8.2 Production Build

For production deployment:

```bash
# Build the production version
npm run build

# Start the production server
npm start
```

### 8.3 Environment Configuration

Configure environment variables for different environments:

- Development: `.env.development`
- Production: `.env.production`

Include database connection string, API URLs, and other configuration values.

## 9. Performance Considerations

- Implement server-side pagination for large data sets
- Use SWR for data fetching with automatic revalidation
- Optimize database queries with proper indexes
- Implement caching for frequently accessed data
- Use virtualized lists for displaying large result sets

## 10. Conclusion

This detailed implementation plan provides a comprehensive roadmap for developing the Next.js web interface for the Fortinet Network Collector. The plan focuses on creating a modern, responsive UI with powerful search capabilities that fulfill all the requirements specified.

The IP address search functionality supports all the required search formats and provides a user-friendly interface for exploring network configuration data. By following this plan, a coding engineer will be able to implement a robust and efficient web interface that complements the existing Python backend.