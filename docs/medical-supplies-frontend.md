# Medical Supplies - Frontend Documentation

## Overview
The Medical Supplies module allows clinics and patients to seamlessly manage, search, and quote medical supplies and inventory.

## Architecture & Integration
This module follows the **Feature-Based Architecture** established in LUCA.
- **Location:** `src/features/medical-supplies`
- **Pages:** `src/app/(dashboard)/medical-supplies`

The frontend integrates directly with the previously built backend module via REST endpoints, utilizing **TanStack React Query** for server state management and asynchronous data fetching.

### Core Components
1. **DashboardCards (`DashboardCards.tsx`)**
   - Renders simple numerical metrics (Total Revenue, Pending Orders, Inventory Items) using a clean, shadow-free card design.
2. **SettingsForm (`SettingsForm.tsx`)**
   - Uses `react-hook-form` and `zod` for validation.
   - Allows configuration of operational hours (24h switch) and Auto-matching settings.
3. **InventoryTable (`InventoryTable.tsx`)**
   - Built on `@tanstack/react-table`.
   - Displays current stock, SKU, Price, and Status with sorting and filtering.
4. **InventoryItemForm (`InventoryItemForm.tsx`)**
   - Modal interface for adding or modifying inventory items on the fly.
5. **QuoteForm (`QuoteForm.tsx`)**
   - The core operational component for the Inbox.
   - Dual-input methodology: Combines an autocomplete selector (fetching from inventory) with a free-text fallback for items not strictly tracked in stock.

## API Integration Hooks
All server communication is abstracted through custom hooks located in `src/features/medical-supplies/hooks/`:
- `useGetInventory()`: Fetches the paginated/filtered list of medical supplies.
- `useAddInventoryItem()`: Mutation for creating new items.
- `useGetDashboardStats()`: Fetches aggregated metrics.
- `useGetSettings()` & `useUpdateSettings()`: Manages supplier configuration state.
- `useSubmitQuote()`: Submits finalized quotes to the backend.

## Design Patterns (Notion-isomatic)
- **Styling:** Tailwind CSS with `lucide-react` icons.
- **Rules applied:** Zero shadows, 1px crisp borders (`border-slate-100`), primary brand color `#23DCE1` (Teal-600), flat white cards on `bg-slate-50`.
- **Modularity:** Strict separation between UI components and asynchronous logic (no mixed concerns in `.tsx` views).
