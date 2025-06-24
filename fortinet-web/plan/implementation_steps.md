# Implementation Steps for Fortinet Web Application

This document outlines the steps required to implement the Fortinet web application as described in `web_visual_rules.txt`.

## 1. Project Setup

*   Create a new Next.js project (if one doesn't exist).
*   Install the necessary dependencies, including `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `cmdk`, `lucide-react`, `tailwind-merge`, and any other required libraries.
*   Configure Tailwind CSS and Shadcn/UI.

## 2. Basic Layout

*   Implement the basic layout of the application, including the sidebar and card components.
*   Use Shadcn/UI components for the sidebar and card.
*   Create a responsive layout that adapts to different screen sizes.
*   Modify `layout.tsx` to include the `<AppSidebar />` and `<main>` elements.

## 3. Sidebar Menu Items

*   Implement the menu items in the sidebar:
    *   Home
    *   Firewalls
    *   Vdoms
    *   Routes
    *   Interfaces
    *   Vips
    *   Search IPs
*   Use Shadcn/UI components for the menu items.
*   Implement navigation between the different views using Next.js `Link` components.
*   Ensure the active menu item is highlighted.

## 4. Views Implementation

*   Implement the views for each menu item:
    *   **Home:** Display a brief description of the project and list the features of the front-end app using a scrollable Shadcn/UI card component.  Modify `page.tsx` to include this content.
    *   **Firewalls:** Display a table of firewalls and vdoms information using a Shadcn/UI table component stacked on top of a Shadcn/UI card component. Include filtering and pagination. Create a new `firewalls/page.tsx` file.
    *   **Vdoms:** Display a table of vdoms information using a Shadcn/UI table component stacked on top of a card component. Include filtering and pagination. Create a new `vdoms/page.tsx` file.
    *   **Routes:** Display a table of routes information using a Shadcn/UI table component stacked on top of a card component. Include filtering and pagination. Create a new `routes/page.tsx` file.
    *   **Interfaces:** Display a table of interfaces information using a Shadcn/UI table component stacked on top of a card component. Include filtering and pagination. Use a Badge component to display the interface status. Create a new `interfaces/page.tsx` file.
    *   **Vips:** Display a table of vips information using a Shadcn/UI table component stacked on top of a card component. Include filtering and pagination. Create a new `vips/page.tsx` file.
    *   **Search IPs:** Implement the IP address search functionality using Shadcn/UI components for the label, input, and button. Display the search results in three tabs (Interfaces, Routes, Vips) using Shadcn/UI table components. Create a new `search-ips/page.tsx` file.

## 5. Filtering and Pagination

*   Implement filtering for each view using Shadcn/UI label and Combobox components.
*   Implement pagination for each view using a Shadcn/UI Pagination component.
*   Limit the number of displayed rows to 15 per page.

## 6. IP Address Search Functionality

*   Implement the IP address search functionality to handle various search formats:
    *   Partial octet prefix (e.g., `172`)
    *   Partial IP (e.g., `172.25`)
    *   Full IP address (e.g., `172.25.10.1`)
    *   CIDR subnet notation (e.g., `172.25.10.0/24`)
    *   Host with CIDR mask (e.g., `172.25.10.1/32`)
*   Search across the "interfaces", "routes", and "vips" tables to find matching IPs.
*   Display the search results in three tabs (Interfaces, Routes, Vips) using Shadcn/UI table components.

## 7. API Integration

*   **API Client Setup:**
    *   Create an API client using `fetch` or a library like `axios` to interact with the backend API.
    *   Define the base URL for the API.
    *   Implement functions to fetch data for each view (firewalls, vdoms, routes, interfaces, vips, search IPs).
*   Integrate with the Fortinet API to fetch data from the PostgreSQL database.
*   Use the API endpoints defined in the `@/fortinet-api/` project.
*   Handle API errors and display appropriate error messages to the user.

## 8. Testing

*   Test the application thoroughly to ensure that it meets the requirements and design specifications.
*   Test the layout, navigation, filtering, pagination, and IP address search functionality.
*   Test the API integration and error handling.

## 9. Documentation

*   Document the implementation in the `fortinet-web/plan/` directory.
*   Include information on the project setup, layout, menu items, views, filtering, pagination, IP address search functionality, API integration, and testing.