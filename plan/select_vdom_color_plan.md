# Plan: Match Select VDOM Color with Combobox Hover Color

## Objective
To ensure visual consistency, the background color of the selected VDOM in the Select VDOM component should match the hover background color of items in the combobox.

## Current State
- The Select VDOM component likely uses a default or inherited background color for selected items.
- The combobox hover state has a specific background color defined in its CSS.

## Proposed Steps

1.  **Identify the Combobox Hover Color:**
    *   Locate the CSS definition for the combobox item hover state. This is likely in `fortinet-web/components/ui/command.tsx` or a related CSS file.
    *   Identify the exact CSS property (e.g., `background-color`) and its value (e.g., `#f0f0f0` or a CSS variable like `var(--hover-color)`).

2.  **Locate the Select VDOM Component:**
    *   Identify the component responsible for rendering the selected VDOM. Based on the file list, `fortinet-web/app/firewalls/components/vdoms-button.tsx` or `fortinet-web/app/vdoms/components/` might be relevant.

3.  **Apply the Color to Selected VDOM:**
    *   Modify the CSS or component styling of the selected VDOM element to use the identified combobox hover color.
    *   This might involve:
        *   Adding a new CSS class.
        *   Modifying an existing CSS class.
        *   Applying inline styles (less preferred for maintainability).
        *   Using a shared CSS variable if available.

4.  **Test and Verify:**
    *   Run the application.
    *   Navigate to the page where the Select VDOM component is used.
    *   Verify that the selected VDOM's background color now matches the combobox item's hover color.
    *   Check for any unintended side effects on other components.

## Files to Investigate/Modify
*   `fortinet-web/components/ui/command.tsx` (for combobox hover color)
*   `fortinet-web/app/firewalls/components/vdoms-button.tsx` (potential location for Select VDOM component)
*   Other files in `fortinet-web/app/vdoms/components/` or `fortinet-web/components/ui/` that might define VDOM selection styling.

## Success Criteria
The selected VDOM in the UI has the same background color as a hovered item in the combobox.