# Hardware Counter POS

An offline-first Angular 18 point-of-sale demo for a retail hardware counter. The application uses standalone components, Angular signals, Tailwind CSS, and seeded in-memory data; it does not connect to a backend.

## Run locally

Install the dependencies and start the Angular development server:

```powershell
npm install
npm start
```

## Demo sign-ins

- Admin: `admin` / password `admin123`
- Cashier: `cashier` / PIN `1234`

Admin can access billing, inventory, stock-in, and returns. Cashier access is limited to billing.

## Keyboard shortcuts

- `F2`: focus item search
- `F8`: focus bill discount
- `F9`: cash checkout
- `F10`: credit checkout
- `Enter`: add the selected search result
- `Delete`: remove a focused cart row
- `Esc`: close the receipt preview or clear the active sale

Changes are held in memory for the current browser session. Reloading the page resets the demo data; invoice lookup for returns only includes sales from the current session. Receipt printing uses the browser's print dialog with an 80 mm thermal layout.
