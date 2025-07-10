# Troubleshooting "Failed to fetch" Error in Search IPs Function

## Error Description

The application is encountering a `TypeError: Failed to fetch` error when attempting to search for IP addresses. This error occurs in the `searchIPs` function within the API service and is triggered when clicking the Search button.

Error stack trace:
```
TypeError: Failed to fetch
    at searchIPs (http://localhost:3000/_next/static/chunks/_eea826c2._.js:553:28)
    at handleSearch (http://localhost:3000/_next/static/chunks/_eea826c2._.js?id=%255Bproject%255D%252Fapp%252Fsearch-ips%252Fpage.tsx+%255Bapp-client%255D+%2528ecmascript%2529:63:167)
    at onClick (http://localhost:3000/_next/static/chunks/_eea826c2._.js?id=%255Bproject%255D%252Fapp%252Fsearch-ips%252Fpage.tsx+%255Bapp-client%255D+%2528ecmascript%2529:296:46)
```

## Root Cause Analysis

The "Failed to fetch" error typically occurs when:

1. The API server is not running
2. There's a network connectivity issue
3. CORS (Cross-Origin Resource Sharing) restrictions are preventing the request
4. The API endpoint has changed or is misconfigured

Based on the code review, the search function is trying to access the API endpoint at:
`${API_BASE_URL}/search/ip` where `API_BASE_URL` is set to `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800/api'`

## Step-by-Step Resolution

### Step 1: Verify API Server Status

First, we need to ensure the API server is running:

1. Open a terminal and navigate to the fortinet-api directory:
   ```bash
   cd fortinet-api
   ```

2. Check if the API server is running:
   ```bash
   ps aux | grep uvicorn
   ```

3. If the API server is not running, start it:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8800 --reload
   ```

### Step 2: Verify API Endpoint

Ensure the `/search/ip` endpoint exists and is functioning correctly:

1. Use a browser or API testing tool like curl to test the endpoint directly:
   ```bash
   curl "http://localhost:8800/api/search/ip?query=192.168"
   ```

2. If the endpoint returns a 404 error, you'll need to check the API code to ensure the endpoint is properly defined.

### Step 3: Add Error Resilience to the API Client

Modify the `searchIPs` function in `fortinet-web/services/api.ts` to include better error handling and debugging:

```typescript
export async function searchIPs(params: {
  query: string;
  interfaces_skip?: number;
  interfaces_limit?: number;
  routes_skip?: number;
  routes_limit?: number;
  vips_skip?: number;
  vips_limit?: number;
}): Promise<{
  interfaces: { items: InterfaceResponse[]; total_count: number };
  routes: { items: RouteResponse[]; total_count: number };
  vips: { items: VIPResponse[]; total_count: number };
}> {
  const queryParams = new URLSearchParams();
  queryParams.set('query', params.query);
  if (params.interfaces_skip !== undefined) queryParams.set('interfaces.skip', params.interfaces_skip.toString());
  if (params.interfaces_limit !== undefined) queryParams.set('interfaces.limit', params.interfaces_limit.toString());
  if (params.routes_skip !== undefined) queryParams.set('routes.skip', params.routes_skip.toString());
  if (params.routes_limit !== undefined) queryParams.set('routes.limit', params.routes_limit.toString());
  if (params.vips_skip !== undefined) queryParams.set('vips.skip', params.vips_skip.toString());
  if (params.vips_limit !== undefined) queryParams.set('vips.limit', params.vips_limit.toString());

  const url = `${API_BASE_URL}/search/ip?${queryParams.toString()}`;
  
  try {
    console.log(`Attempting to fetch from URL: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Failed to search IPs: ${response.status} ${response.statusText}`, errorData);
      throw new Error(`Failed to search IPs: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error when searching IPs:', error);
    // Return empty results instead of throwing, to avoid crashing the UI
    return {
      interfaces: { items: [], total_count: 0 },
      routes: { items: [], total_count: 0 },
      vips: { items: [], total_count: 0 }
    };
  }
}
```

This modification:
1. Adds more detailed logging
2. Explicitly sets headers for the request
3. Catches network errors and returns empty results rather than throwing an exception

### Step 4: Add Error Handling in the UI Component

Update the `handleSearch` function in `fortinet-web/app/search-ips/page.tsx` to handle API errors more gracefully:

```typescript
const handleSearch = async (
  currentInterfacesPage: number = interfacesPage,
  currentRoutesPage: number = routesPage,
  currentVipsPage: number = vipsPage
) => {
  if (!query.trim()) {
    setError("Please enter an IP address or subnet to search.");
    setSearchResults(null);
    return;
  }
  setLoading(true);
  setError(null);
  try {
    console.log("Initiating search with query:", query);
    const results = await searchIPs({
      query,
      interfaces_skip: (currentInterfacesPage - 1) * pageSize,
      interfaces_limit: pageSize,
      routes_skip: (currentRoutesPage - 1) * pageSize,
      routes_limit: pageSize,
      vips_skip: (currentVipsPage - 1) * pageSize,
      vips_limit: pageSize,
    });
    setSearchResults(results);
    if (results.interfaces.total_count === 0 && 
        results.routes.total_count === 0 && 
        results.vips.total_count === 0) {
      setError("No results found for your search criteria.");
    }
  } catch (err) {
    console.error("Failed to search IPs:", err);
    setError("Failed to perform search. Please ensure the API server is running and try again.");
    setSearchResults(null);
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Check CORS Configuration

If the issue persists, it might be a CORS problem. Ensure the API server has CORS properly configured:

1. Check the FastAPI application in `fortinet-api/app/main.py` to ensure CORS middleware is configured:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 6: Verify Environment Variables

Ensure environment variables are properly set:

1. Check if `.env.local` exists in the fortinet-web directory and contains the correct API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8800/api
   ```

2. If the file doesn't exist, create it with the correct URL.

3. Restart the Next.js development server after making these changes:
   ```bash
   cd fortinet-web
   npm run dev
   ```

## Testing the Fix

1. Start the API server (if not already running)
2. Start the frontend application
3. Try searching for an IP address
4. Check the browser's developer console for any error messages

If the search still fails, the console logs added in the modified code should provide more information about the specific issue.

## Prevention Measures

To prevent similar issues in the future:

1. Add a health check endpoint to the API server
2. Implement API status monitoring in the frontend
3. Consider implementing retry logic for critical API calls
4. Add more comprehensive error handling throughout the application