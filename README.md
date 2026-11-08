# Hardware Counter POS

An offline-first retail point-of-sale application for a hardware counter. The repository contains an Angular 18 standalone frontend, a NestJS REST API, a Prisma/PostgreSQL data model, and a shared-types workspace package.

## Features

### Point-of-sale frontend

- **Billing counter:** Search by product name or code, or scan a 3-digit code. Selecting an item stages it and focuses the quantity field; press Enter or **Add to cart** to commit the selected quantity.
- **Cart and inventory checks:** Edit quantities and line discounts inline, view recalculated totals, and receive warnings for insufficient or unavailable stock. Suggestions display available stock and low-stock indicators.
- **Cash and credit sales:** Record customer name and phone for either payment type. Look up or create a customer during checkout; a customer is required for credit sales.
- **Invoice history:** Search and filter invoices by number, customer, phone, date, and payment type. Inspect invoice lines and discounts, print thermal receipts, and reload invoices for editing. Edited invoices are marked in the ledger.
- **Customer management:** Maintain customer details, GSTIN, and credit balances.
- **Inventory and purchases:** Manage 3-digit product codes and prices; new items start at zero stock, with quantities added through stock-in purchases.
- **Sales returns:** Process returns against completed invoices, choose whether returned items are restocked, and review return history.
- **Store settings:** Edit company profile and receipt details.
- **Receipts and preferences:** Preview/print receipts using an 80 mm thermal layout, switch between light and dark themes, and select English or Malayalam.

Inventory, purchases, vendors, returns, and settings are restricted to the admin role. Billing, invoice history, and customer management are available to authenticated admin and cashier roles.

### Backend API

The NestJS API provides PostgreSQL-backed modules for users, items, customers, vendors, purchases, invoices, and the company profile. Login issues 15-minute JWT access tokens; all other API endpoints require authentication. Role policies restrict inventory administration, vendors, purchases, company profile updates, item purchase costs, and invoice profit details to administrators. Passwords are stored as bcrypt hashes. The API listens on port `3000` by default and allows `http://localhost:4200` by default. The Angular app stores its access token in local storage and validates it with the API when restoring a session.

## Requirements

- Node.js and npm
- pnpm
- PostgreSQL (required for the backend API)

## Install dependencies

From the repository root:

```powershell
npx --yes pnpm install
```

## Run the frontend

```powershell
npx --yes pnpm start
```

Open the local URL printed by Angular CLI (usually `http://localhost:4200`).

## Run the backend API

1. Create `backend\.env` from `backend\.env.example`, then configure:
   - `DATABASE_URL` with your PostgreSQL connection string.
   - `JWT_SECRET` with a unique random secret of at least 32 characters. Generate one with:
     ```powershell
     node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
     ```
   - `ADMIN_PASSWORD` with a unique password of at least 12 characters.
   - `PORT` for the API port and `CORS_ORIGIN` for the allowed frontend origin (comma-separated if you use multiple origins).

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Do not commit `backend\.env` or reuse the example credentials in production.

2. Generate the Prisma client, apply the checked-in schema migration, and seed the initial admin account:

   ```powershell
   npx --yes pnpm --filter backend prisma:generate
   npx --yes pnpm --filter backend exec prisma migrate dev
   npx --yes pnpm --filter backend prisma:seed
   ```

   The seed creates the `ADMIN_USERNAME` account (default `admin`) with the configured `ADMIN_PASSWORD`; it never uses a hard-coded password. To change the admin password later, use your established account-management procedure rather than treating the seed as a password-reset command.

3. Start the API in watch mode:

   ```powershell
   npx --yes pnpm --filter backend start:dev
   ```

Build the backend with `npx --yes pnpm --filter backend build`. The Prisma schema is in `backend\prisma\schema.prisma`.

After a successful login, the frontend loads and updates inventory, customers, invoices, the company profile, and (for admins) vendors and purchases through the authenticated API. Checkout and purchase stock changes are persisted transactionally by the backend. Returns restock inventory through the API, while return records remain in the current browser session. Deployments should use HTTPS, keep JWT secrets in a secret manager, and account for the XSS risks of browser local storage.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `F2` | Focus item search |
| `F3` or `Ctrl+N` | Focus the site/notes field during billing |
| `F4` | Focus customer selection |
| `F5` | Focus the selected cart row |
| `F8` | Focus bill discount |
| `F9` | Cash checkout |
| `F10` | Credit checkout |
| `F11` | Switch language |
| `F12` or `Ctrl+Shift+T` | Toggle theme |
| `↑` / `↓` in item search | Move through suggestions |
| `Enter` in item search | Stage the highlighted or exact-code item |
| `Enter` in quantity or line discount | Add the staged item to the cart |
| `↑` / `↓` on a focused cart row | Move between cart rows |
| `Delete` while a cart row is focused | Remove that row |
| `Esc` | Close the receipt preview or clear the active sale |

## Data and limitations

Inventory, customers, vendors, purchases, invoices, and company settings are stored in PostgreSQL and loaded from the API after login. Return history is session-only. Theme and language preferences are saved in browser local storage.
