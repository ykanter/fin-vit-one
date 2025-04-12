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