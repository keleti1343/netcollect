# UI Issues Troubleshooting Guide

This document provides step-by-step instructions to fix the UI issues identified in the Fortinet Web application.

## Issue 1: Dark Text in Combo-boxes on VDOMS Page

**Problem:** 
On the VDOMS page, the "Firewall Name" and "VDOM Name" combo-boxes display text in a dark shade instead of white when an item is selected, making it difficult to read against the selected background.

**Root Cause:**
In the `vdoms-filter.tsx` component, when an item is selected, the class `text-accent-foreground` is applied, which sets the text to a dark color. However, since the background becomes darker with `bg-[var(--combobox-item-hover-bg)]`, we need a lighter text color for better contrast.

**Steps to Fix:**

1. Open the file: `fortinet-web/app/vdoms/components/vdoms-filter.tsx`

2. Locate the Firewall Name combo-box button around line 88-92:
   ```jsx
   className={cn(
     "w-[250px] justify-between shadow-sm",
     selectedFwName && "bg-[var(--combobox-item-hover-bg)] text-accent-foreground"
   )}
   ```

3. Change `text-accent-foreground` to `text-white` or another light color:
   ```jsx
   className={cn(
     "w-[250px] justify-between shadow-sm",
     selectedFwName && "bg-[var(--combobox-item-hover-bg)] text-white"
   )}
   ```

4. Similarly, locate the VDOM Name combo-box button around line 164-167 and make the same change:
   ```jsx
   className={cn(
     "w-[250px] justify-between shadow-sm",
     vdomName && "bg-[var(--combobox-item-hover-bg)] text-white"
   )}
   ```

5. Test the change by selecting an item in each combo-box to ensure the text is now visible against the selected background.

## Issue 2: Missing Firewall Hover-card on VIPs Page

**Problem:**
On the VIPs page, the "VDOM Name" column should display a hover-card with related firewall information when hovering over it, but it doesn't.

**Root Cause:**
The backend API is not including the firewall data when fetching VIPs. While the VIP.vdom relationship might be loaded, the nested VIP.vdom.firewall relationship is not being eagerly loaded. This causes the hover-card to show "Firewall information not available" instead of the actual firewall details.

**Steps to Fix:**

1. **Update VIP CRUD functions** - Open `fortinet-api/app/crud/vip.py`:
   
   a. Add the VDOM model import at the top:
   ```python
   from app.models.vdom import VDOM
   ```
   
   b. Modify the `get_vips` function to include eager loading:
   ```python
   def get_vips(
       db: Session,
       skip: int = 0,
       limit: int = 100,
       vdom_id: Optional[int] = None,
       vip_type: Optional[str] = None
   ) -> Tuple[List[VIP], int]:
       query = db.query(VIP)
       
       # Add eager loading of both VDOM and Firewall
       query = query.options(joinedload(VIP.vdom).joinedload(VDOM.firewall))
       
       if vdom_id:
           query = query.filter(VIP.vdom_id == vdom_id)
       if vip_type:
           query = query.filter(VIP.vip_type == vip_type)
           
       total_count = query.count()
       vips = query.offset(skip).limit(limit).all()
       return vips, total_count
   ```
   
   c. Also update the `get_vip` function:
   ```python
   def get_vip(db: Session, vip_id: int) -> Optional[VIP]:
       return db.query(VIP).options(joinedload(VIP.vdom).joinedload(VDOM.firewall)).filter(VIP.vip_id == vip_id).first()
   ```
   
   d. Update the `search_vips_by_ip` function (around line 89):
   ```python
   # Base query with eager loading
   base_query = db.query(VIP).options(joinedload(VIP.vdom).joinedload(VDOM.firewall))
   ```

2. **Update main.py** - Open `fortinet-api/app/main.py`:
   
   Import all models to ensure relationships are properly set up:
   ```python
   # Import all models to ensure relationships are properly set up
   from app.models.firewall import Firewall
   from app.models.vdom import VDOM
   from app.models.interface import Interface
   from app.models.route import Route
   from app.models.vip import VIP
   ```

3. **Update frontend API service** - Open `fortinet-web/services/api.ts`:
   
   Simplify the getVips function to remove the unnecessary `include_firewall` parameter:
   ```javascript
   export async function getVips(params?: Record<string, string>): Promise<{ items: VIPResponse[], total_count: number }> {
     const queryParams = params ? new URLSearchParams(params).toString() : '';
     const url = queryParams ? `${API_BASE_URL}/vips/?${queryParams}` : `${API_BASE_URL}/vips/`;
     const response = await fetch(url);
     if (!response.ok) {
       const errorData = await response.text();
       console.error(`Failed to fetch vips: ${response.status} ${response.statusText}`, errorData);
       throw new Error(`Failed to fetch vips: ${response.status} ${response.statusText}`);
     }
     return response.json();
   }
   ```

4. **Restart the backend server** to ensure all changes take effect.

5. **Test the changes** by navigating to the VIPs page and hovering over a VDOM name to see if the firewall information now appears in the hover-card.

**Expected Outcome:**
When hovering over a VDOM name in the VIPs page, the hover-card should now display the associated firewall information, including the firewall name and IP address.

**Note:**
This fix ensures that the necessary relationship data is loaded in a single query, which is more efficient than making separate API calls for each VDOM's firewall information.

## Issue 3: $ Sign in Pagination Text on VIPs Page

**Problem:**
On the VIPs page, there is a "$" sign visible in the pagination text because the template string is not properly formatted.

**Root Cause:**
In `fortinet-web/app/vips/page.tsx` around line 282, the string uses `${}` notation for variables but is enclosed in regular quotes instead of backticks, causing the template literal syntax to be displayed as plain text.

**Steps to Fix:**

1. Open the file: `fortinet-web/app/vips/page.tsx`

2. Locate the pagination text around line 282:
   ```jsx
   Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of {totalCount} VIPs
   ```

3. Change the regular quotes to backticks to properly use template literals:
   ```jsx
   Showing {`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)}`} of {totalCount} VIPs
   ```
   
   Or better yet, replace it with:
   ```jsx
   Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} VIPs
   ```

4. Test the pagination to ensure the $ sign is no longer visible and the numbers display correctly.

## Additional Recommendations

1. **Consistent Styling**: Ensure that combo-box components use consistent styling across the application. If you fix the text color for selected items on the VDOMS page, check other pages with similar components.

2. **Data Relationships**: Review the data fetching patterns to ensure all necessary relationships are properly loaded. This may involve updating API endpoints or optimizing frontend data fetching.

3. **Error Handling**: Add proper error handling for cases where data relationships might be missing, such as a fallback UI for the hover-card when firewall data is not available.

4. **Template Literals**: Do a codebase search for other instances of `${}` used in regular strings instead of template literals to prevent similar issues.

These fixes should resolve the reported UI issues and improve the overall user experience of the application.