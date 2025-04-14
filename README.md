# Configuration and Setup

## Configure tailwindcss
https://tailwindcss.com/docs/installation/using-vite    

## Steps summary:

1. **Install Tailwind CSS and Vite plugin**
   ```bash
   pnpm add tailwindcss @tailwindcss/vite
   ```

2. **Configure the Vite plugin**
   Add the @tailwindcss/vite plugin to your Vite configuration (vite.config.js or vite.config.ts):
   ```javascript
   import { defineConfig } from 'vite'
   import tailwindcss from '@tailwindcss/vite'
   
   export default defineConfig({
     plugins: [
       tailwindcss(),
     ],
   })
   ```

3. **Import Tailwind CSS**
   Add an @import statement to your main CSS file in `src/react-app/index.css`:
   ```css
   @import "tailwindcss";
   
   /* Keep the rest of your existing CSS */
   ```

4. **Start your build process**
   Run your development server:
   ```bash
   pnpm dev
   ```

5. **Start using Tailwind in your App.tsx**
   Update the existing h1 element in your App.tsx to use Tailwind utility classes:
   ```tsx
   // src/react-app/App.tsx
   <h1 className="text-4xl font-bold text-center mb-6 text-blue-600">WELCOME</h1>
   ```
   
   You can also style other elements like the card div:
   ```tsx
   <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
     {/* card content */}
   </div>
   ```

## Local connection setup issues for cf hyperdrive
In my @index.ts file I output the connectionString to console. When I run pnpm run preview, which maps to pnpm run build && vite preview and look my console I see: Current Connection String : postgresql://neondb_owner:npg_3rjfOClvGP2V@366f0f3cd7329af38bf0d630e84a8e3c.hyperdrive.local:5432/neondb?sslmode=disable,
which is really odd, since in wrangler.jsonc file I clearly state:
  "hyperdrive": [
    {
      "binding": "hyper",
      "id": "63e8cb642e534d8d920e440fff88ba83",
      "localConnectionString": "postgresql://neondb_owner:npg_3rjfOClvGP2V@ep-wandering-sun-a5pta77k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
    }
  ]
Can you please research the issue using most recent cloudflare docs and related resources and summarize your findings
in the findings section below
## Findings:

The issue with local connection string for Cloudflare Hyperdrive stems from how local development environments handle Hyperdrive bindings:

1. **Issue Identification**: When running `pnpm run preview` (which uses `vite preview`), the connection string shows as `postgresql://neondb_owner:npg_3rjfOClvGP2V@366f0f3cd7329af38bf0d630e84a8e3c.hyperdrive.local:5432/neondb?sslmode=disable` despite having a proper `localConnectionString` configured in wrangler.json.

2. **Root Cause**: Standard Vite development server doesn't properly emulate the Cloudflare Workers environment with Hyperdrive bindings. When using `vite preview`, it creates a virtualized Hyperdrive endpoint (`hyperdrive.local`) rather than using the specified local connection string.

3. **Best Practice Solutions**:
   - For local development with Hyperdrive, use `wrangler dev` instead of standard Vite development server to properly simulate the Workers environment.
   - Cloudflare provides two recommended approaches:
     1. Set environment variable: `WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_<BINDING_NAME>` (where `<BINDING_NAME>` is your Hyperdrive binding name, in this case "hyper").
     2. Configure `localConnectionString` in wrangler.json (which is already done correctly).

4. **Recommended Workflow**: For local development, use `pnpm wrangler dev` instead of `pnpm dev` or `pnpm preview` to ensure proper binding of the local connection string.

5. **Alternative Implementation**: For additional flexibility, consider implementing a solution that detects local environment via request hostname and connects directly to the Neon database when running locally, bypassing Hyperdrive.

## Followup to the findings :
When I run pnpm wrangler dev, I still get the same incorrect local string as when I run vite

## Followup findings:

Based on the output from running `pnpm wrangler dev`, we've found additional issues with the Hyperdrive local development setup:

1. **Persistent Issue**: Even when using `wrangler dev` as recommended in the documentation, the connection string is still being virtualized to a local Hyperdrive endpoint: `postgresql://neondb_owner:npg_3rjfOClvGP2V@85836ac88ba7171b7f2d5dc42914fb96.hyperdrive.local:5432/neondb?sslmode=disable`

2. **SSL Mode Override**: While the original connection string in `wrangler.json` specifies `sslmode=require`, the local Hyperdrive simulation is overriding this to `sslmode=disable`, causing the connection error: `PostgresError: connection is insecure (try using sslmode=require)`

3. **Environment Variable Detection**: The `.dev.vars` file is being detected with environment variables including `IS_DEV` and `NEON_CONNECTION_STRING`, but these aren't affecting the connection string used by Hyperdrive.

4. **Recommended Solution**: Given these findings, the most reliable approach would be to modify the worker code to detect when it's running with a simulated Hyperdrive connection (identified by `hyperdrive.local` in the connection string) and replace it with the direct Neon connection string stored in an environment variable. This can be implemented by:

   - Setting `NEON_CONNECTION_STRING` in `.dev.vars` (already done)
   - Modifying the worker code to check for `hyperdrive.local` in the connection string and use the environment variable instead
   - Ensure SSL mode is properly set to `require` when connecting to the external Neon database

5. **Alternative Workaround**: Use `wrangler dev --remote` to bypass local simulation entirely and use the actual Hyperdrive service, though this would require an internet connection and consume Cloudflare resources during development.

## Followup contiued:
I went with the `wrangler dev --remote` solution and it seems to work. The string that is printed looks strange: `Current Connection String : postgresql://5daed812fcc54484a1807aaf3dafa3d4:efced7e95151affb9deeebb1cbc3063d@f3f7f60bc801c61326253a14bbe5c575.hyperdrive.local:5432/63e8cb642e534d8d920e440fff88ba83?sslmode=disable`

## Response continued: 

The connection string you're seeing with `wrangler dev --remote` is expected behavior and indicates you're successfully connecting to the actual Cloudflare Hyperdrive service rather than a local simulation. Here's what's happening:

1. **Obfuscated Credentials**: The strange-looking connection string (`postgresql://5daed812fcc54484a1807aaf3dafa3d4:efced7e95151affb9deeebb1cbc3063d@f3f7f60bc801c61326253a14bbe5c575.hyperdrive.local:5432/63e8cb642e534d8d920e440fff88ba83?sslmode=disable`) contains obfuscated/encrypted credentials rather than your actual Neon database credentials. This is a security feature of Cloudflare's Hyperdrive service.

2. **Hyperdrive Proxy**: Even though the hostname still shows `hyperdrive.local`, when using `--remote` mode, Wrangler is communicating with the actual Cloudflare Hyperdrive service, which then securely connects to your Neon database.

3. **Connection Security**: Despite the `sslmode=disable` parameter in the connection string, the actual connection between Cloudflare Hyperdrive and your Neon database is secure. Cloudflare manages this security layer.

4. **Working as Intended**: The fact that your application is working correctly indicates that the remote Hyperdrive service is properly connecting to your Neon database using the credentials and connection details configured in your `wrangler.json` file.

5. **Best Practice for Development**: Using `wrangler dev --remote` is actually the recommended approach for developing applications that use Hyperdrive, as it provides the most accurate simulation of how your application will behave in production. The tradeoff is that it requires an internet connection and counts against your Cloudflare resource usage.

This approach aligns with the memory we have about solving similar issues, where the solution was to detect the environment and use the appropriate connection method based on whether the application is running locally or in production.

## Add tanstack router 
https://tanstack.com/router/latest/docs/framework/react/installation

### Steps summary:

1. **Install TanStack Router and related packages**
   ```bash
   pnpm add @tanstack/react-router
   pnpm add -D @tanstack/router-plugin @tanstack/react-router-devtools
   ```

2. **Configure the Vite Plugin**
   Add the TanStack Router Vite plugin to your Vite configuration (vite.config.ts):
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

   export default defineConfig({
     plugins: [
       // Important: TanStackRouterVite must come before react plugin
       TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
       react(),
       // other plugins...
     ],
   })
   ```

3. **Create the basic route files structure**
   ```
   src/routes/
   ├── __root.tsx        # Root layout component with navigation
   ├── index.tsx         # Home page route
   └── about.tsx         # Example additional route
   ```

4. **Define the root route** in `src/routes/__root.tsx`:
   ```tsx
   import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
   import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

   export const Route = createRootRoute({
     component: () => (
       <>
         <div className="p-2 flex gap-2">
           <Link to="/" className="[&.active]:font-bold">Home</Link>
           <Link to="/about" className="[&.active]:font-bold">About</Link>
         </div>
         <hr />
         <Outlet />
         {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
       </>
     ),
   })
   ```

5. **Create route components** for each page
   Example for `src/routes/index.tsx` (home page):
   ```tsx
   import { createLazyFileRoute } from '@tanstack/react-router'

   export const Route = createLazyFileRoute('/')({ 
     component: Index,
   })

   function Index() {
     return (
       <div className="p-2">
         <h3>Welcome Home!</h3>
       </div>
     )
   }
   ```

6. **Set up the router in your main entry file** (e.g., `src/main.tsx`):
   ```tsx
   import { StrictMode } from 'react'
   import ReactDOM from 'react-dom/client'
   import { RouterProvider, createRouter } from '@tanstack/react-router'

   // Import the generated route tree (created automatically by the plugin)
   import { routeTree } from './routeTree.gen'

   // Create a new router instance
   const router = createRouter({ routeTree })

   // Register router for type safety
   declare module '@tanstack/react-router' {
     interface Register {
       router: typeof router
     }
   }

   // Render the app
   const rootElement = document.getElementById('root')!
   if (!rootElement.innerHTML) {
     const root = ReactDOM.createRoot(rootElement)
     root.render(
       <StrictMode>
         <RouterProvider router={router} />
       </StrictMode>
     )
   }
   ```

7. **Run the development server**
   ```bash
   pnpm wrangler dev
   ```
   The router plugin will automatically generate the route tree file (`src/routeTree.gen.ts`) based on your route files.

