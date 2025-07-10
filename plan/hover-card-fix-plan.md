# Hover Card Fix Plan - Immediate Actions

## 🚨 **Current Issue**
The screenshot shows hover cards are appearing but:
- Multiple cards are stacking/overlapping
- Positioning is not clean and precise
- Cards appear "messy" instead of clean individual popups

## 🔧 **Immediate Fix Strategy**

### **Step 1: Simplify the Universal Component**
- Remove complex positioning logic temporarily
- Use the exact same positioning logic that was working on Firewalls page
- Focus on getting ONE clean hover card working first

### **Step 2: Fix Positioning Logic**
- Use the original `rect.right - 50` approach that was working
- Remove the smart positioning complexity for now
- Get back to the working state, then enhance

### **Step 3: Fix Display Logic**
- Ensure only one hover card shows at a time
- Fix z-index conflicts
- Clean up the CSS classes

### **Step 4: Test One Page at a Time**
- Start with Firewalls page (was working before)
- Verify it works exactly like before
- Then migrate other pages one by one

## 📋 **Next Steps**

1. **Revert to Simple Positioning** - Use the exact logic that was working
2. **Fix Display Issues** - Ensure clean single card display
3. **Test Firewalls Page** - Verify it works like before
4. **Migrate Remaining Pages** - One at a time with testing

## 🎯 **Goal**
Get back to the clean, working hover card behavior you had before, but centralized across all pages.

---

**Action**: Fix the Universal component to use the proven working positioning logic.