# WeBrew Café Frontend

A responsive React + Vite dashboard for the WeBrew Café backend.

## Run locally

1. Run `npm install` in this folder.
2. Copy `.env.example` to `.env` if your backend does not use `http://localhost:7000`. Set `VITE_API_PROXY_TARGET` to the backend URL.
3. Start the backend, then run `npm run dev`.
4. Open the Vite URL shown in the terminal.

The development server proxies `/api` requests to `VITE_API_PROXY_TARGET`, defaulting to `http://localhost:7000` to match the backend's configured port. For production (including Vercel), deploy the backend separately, set `VITE_API_BASE_URL` to its publicly reachable URL, and configure that host to allow browser requests from the frontend origin. The production frontend reports a configuration error instead of requesting its own static host when this value is missing. `vercel.json` rewrites frontend routes to the Vite app so direct links such as `/products` work.

Production and Vercel deployments require the owner to sign in. The backend verifies credentials from its environment settings and issues a short-lived access token; the browser keeps it in session storage for the current tab. Local development remains open by default.

## Folder structure

```text
src/
  app/                 React Router setup
  components/
    common/            Shared shell, headings, notices, metric cards
    features/          Dashboard, product, and sales pages
    provider/          Shared application providers
    ui/                Reusable buttons and dialogs
  constants/           App name, API base URL, navigation
  context/             Shared product state and hooks
  lib/                 Types and display helpers
  services/            Typed API calls
  styles/              Global styles and responsive design
public/                Static public assets
```

The layout follows the reference repository's separation of routes, common UI, feature UI, providers, context, services, constants, helper utilities, and styles, adapted to Vite and React Router rather than Next.js file-based routing.

## Screens

- `/` — descriptive, predictive, and prescriptive café analytics
- `/sales` — create, search, update, and delete sale records
- `/products` — add, search, update, and delete menu products

The UI displays real API results and shows a retryable message when the backend is unavailable. It does not silently replace missing API data with sample values.
