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


# State management
How do I keep my todos displayed on the UI in sync with todos in the database. Please analyze the project structure starting with todo.tsx route and come up with a plan. Please summarize your plan in the section below, called Keeping remote and local state in sync

## Keeping remote and local state in sync:

After analyzing the project structure, here's a comprehensive plan for keeping todos in the UI synchronized with the database:

1. **Use React Query (TanStack Query)** for server state management:
   - Implement a centralized data fetching and caching layer
   - Automatically handle invalidation and refetching on mutations
   - Provide loading and error states for better UX

2. **Create a custom hook for todos management**:
   - Encapsulate all todo-related operations (fetch, create, update, delete)
   - Handle optimistic updates for immediate UI feedback
   - Leverage React Query's mutation capabilities

3. **Implement a context provider** for shared state:
   - Make todo state and operations accessible throughout the component tree
   - Simplify prop passing between components

4. **Add proper mutation handling**:
   - Update NewTodoCard to use mutations that automatically invalidate queries
   - Implement edit and delete functionality in TodoCard with proper UI updates
   - Add optimistic UI updates for a smoother user experience

5. **Specific implementation steps**:
   - Install required packages: `pnpm add @tanstack/react-query @tanstack/react-query-devtools`
   - Set up Query Client Provider in the application root:
   ```tsx
   // src/main.tsx or equivalent entry point
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
   
   // Create a client with default or custom options
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 1000 * 60 * 5, // 5 minutes
         refetchOnWindowFocus: false,
       },
     },
   })
   
   // Wrap app with QueryClientProvider
   root.render(
     <StrictMode>
       <QueryClientProvider client={queryClient}>
         <RouterProvider router={router} />
         {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
       </QueryClientProvider>
     </StrictMode>
   )
   ```
   
   - Create a TodoContext and Provider in `src/contexts/todo-context.tsx`:
   ```tsx
   import { createContext, useContext, ReactNode } from 'react'
   import { Todo } from '../interfaces/todo-interface'
   import { useTodos } from '../hooks/use-todos'
   
   type TodoContextType = {
     todos: Todo[]
     isPending: boolean
     isError: boolean
     error: Error | null
     addTodo: (todo: Omit<Todo, 'id'>) => Promise<Todo>
     updateTodo: (todo: Todo) => Promise<Todo>
     deleteTodo: (id: string) => Promise<void>
     toggleComplete: (id: string, isCompleted: boolean) => Promise<Todo>
   }
   
   const TodoContext = createContext<TodoContextType | undefined>(undefined)
   
   export function TodoProvider({ children }: { children: ReactNode }) {
     const todoOperations = useTodos()
     
     return (
       <TodoContext.Provider value={todoOperations}>
         {children}
       </TodoContext.Provider>
     )
   }
   
   export function useTodoContext() {
     const context = useContext(TodoContext)
     if (context === undefined) {
       throw new Error('useTodoContext must be used within a TodoProvider')
     }
     return context
   }
   ```
   
   - Implement the useTodos hook in `src/hooks/use-todos.ts`:
   ```tsx
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
   import { Todo } from '../interfaces/todo-interface'
   
   // API functions - specialized for Cloudflare Workers environment
   const fetchTodos = async (): Promise<Todo[]> => {
     const response = await fetch('/api/')
     if (!response.ok) throw new Error('Failed to fetch todos')
     return response.json()
   }
   
   const createTodo = async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
     const response = await fetch('/api/', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify([todo]),
     })
     if (!response.ok) throw new Error('Failed to create todo')
     const data = await response.json()
     return data[0] // Assuming API returns array of created todos
   }
   
   const updateTodoApi = async (todo: Todo): Promise<Todo> => {
     const response = await fetch(`/api/${todo.id}`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(todo),
     })
     if (!response.ok) throw new Error('Failed to update todo')
     return response.json()
   }
   
   const deleteTodoApi = async (id: string): Promise<void> => {
     const response = await fetch(`/api/${id}`, { method: 'DELETE' })
     if (!response.ok) throw new Error('Failed to delete todo')
   }
   
   export function useTodos() {
     const queryClient = useQueryClient()
     
     // Main query to fetch todos
     const todosQuery = useQuery({
       queryKey: ['todos'],
       queryFn: fetchTodos,
     })
     
     // Optimistic update helpers
     const optimisticlyAddTodo = (newTodo: Omit<Todo, 'id'>) => {
       // Generate temporary ID for optimistic update
       const tempId = `temp-${Date.now()}`
       const optimisticTodo = { ...newTodo, id: tempId }
       
       // Add to cache optimistically
       queryClient.setQueryData(['todos'], (old: Todo[] | undefined) => {
         return [...(old || []), optimisticTodo]
       })
       
       return { tempId }
     }
     
     // Add Todo Mutation
     const addTodoMutation = useMutation({
       mutationFn: createTodo,
       onMutate: optimisticlyAddTodo,
       onError: (error, variables, context) => {
         // Rollback on error
         if (context?.tempId) {
           queryClient.setQueryData(['todos'], (old: Todo[] | undefined) => {
             return (old || []).filter(todo => todo.id !== context.tempId)
           })
         }
       },
       onSettled: () => {
         // Always refetch after error or success
         queryClient.invalidateQueries({ queryKey: ['todos'] })
       },
     })
     
     // Update Todo Mutation with optimistic updates
     const updateTodoMutation = useMutation({
       mutationFn: updateTodoApi,
       onMutate: (updatedTodo) => {
         // Save previous todos
         const previousTodos = queryClient.getQueryData(['todos'])
         
         // Optimistically update the cache
         queryClient.setQueryData(['todos'], (old: Todo[] | undefined) => {
           return (old || []).map(todo => 
             todo.id === updatedTodo.id ? updatedTodo : todo
           )
         })
         
         return { previousTodos }
       },
       onError: (error, variables, context) => {
         // Rollback on error
         if (context?.previousTodos) {
           queryClient.setQueryData(['todos'], context.previousTodos)
         }
       },
       onSettled: () => {
         queryClient.invalidateQueries({ queryKey: ['todos'] })
       },
     })
     
     // Delete Todo Mutation with optimistic updates
     const deleteTodoMutation = useMutation({
       mutationFn: deleteTodoApi,
       onMutate: (id) => {
         // Save previous todos
         const previousTodos = queryClient.getQueryData(['todos'])
         
         // Optimistically remove from cache
         queryClient.setQueryData(['todos'], (old: Todo[] | undefined) => {
           return (old || []).filter(todo => todo.id !== id)
         })
         
         return { previousTodos }
       },
       onError: (error, variables, context) => {
         // Rollback on error
         if (context?.previousTodos) {
           queryClient.setQueryData(['todos'], context.previousTodos)
         }
       },
       onSettled: () => {
         queryClient.invalidateQueries({ queryKey: ['todos'] })
       },
     })
     
     // Helper function for toggling todo completion
     const toggleComplete = async (id: string, isCompleted: boolean) => {
       const todoToUpdate = todosQuery.data?.find(todo => todo.id === id)
       if (!todoToUpdate) throw new Error('Todo not found')
       
       return updateTodoMutation.mutateAsync({
         ...todoToUpdate,
         is_completed: isCompleted
       })
     }
     
     return {
       todos: todosQuery.data || [],
       isPending: todosQuery.isPending,
       isError: todosQuery.isError,
       error: todosQuery.error,
       addTodo: addTodoMutation.mutateAsync,
       updateTodo: updateTodoMutation.mutateAsync,
       deleteTodo: deleteTodoMutation.mutateAsync,
       toggleComplete,
     }
   }
   ```
   
   - Refactor the todo route component in `src/routes/todo.tsx`:
   ```tsx
   import { createFileRoute } from '@tanstack/react-router'
   import TodoList from '../app-components/app-todo-list'
   import { TodoProvider } from '../contexts/todo-context'
   
   export const Route = createFileRoute('/todo')({ 
     component: TodoComponent,
   })
   
   function TodoComponent() {
     return (
       <TodoProvider>
         <TodoList />
       </TodoProvider>
     )
   }
   ```
   
   - Update TodoList component in `src/app-components/app-todo-list.tsx`:
   ```tsx
   import TodoCard from './app-todo-card'
   import NewTodoCard from './app-new-todo'
   import { useTodoContext } from '../contexts/todo-context'
   
   export default function TodoList() {
     const { todos, isPending, isError, error } = useTodoContext()
     
     if (isPending) return <div className="text-center p-4">Loading todos...</div>
     if (isError) return <div className="text-center p-4 text-red-500">Error loading todos: {error?.message}</div>
     
     return (
       <> 
         <h1 className="flex justify-center mt-4">Todo List</h1>
         <NewTodoCard />
         {todos.length === 0 ? (
           <div className="text-center p-4 text-gray-500">No todos yet. Create one above!</div>
         ) : (
           <div className="w-[90vw] mx-auto bg-white rounded-lg shadow-md p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {todos.map((todo) => (
               <TodoCard key={todo.id} todo={todo} />
             ))}
           </div>
         )}
       </>
     )
   }
   ```
   
   - Enhance the TodoCard component in `src/app-components/app-todo-card.tsx`:
   ```tsx
   import { useState } from 'react'
   import { Todo } from '../interfaces/todo-interface'
   import { useTodoContext } from '../contexts/todo-context'
   
   export default function TodoCard({ todo }: { todo: Todo }) {
     const { updateTodo, deleteTodo, toggleComplete } = useTodoContext()
     const [isEditing, setIsEditing] = useState(false)
     const [editedBody, setEditedBody] = useState(todo.body)
     const [isUpdating, setIsUpdating] = useState(false)
     const [isDeleting, setIsDeleting] = useState(false)
     
     const handleToggleComplete = async () => {
       try {
         await toggleComplete(todo.id, !todo.is_completed)
       } catch (error) {
         console.error('Failed to toggle todo completion:', error)
       }
     }
     
     const handleDelete = async () => {
       try {
         setIsDeleting(true)
         await deleteTodo(todo.id)
       } catch (error) {
         console.error('Failed to delete todo:', error)
       } finally {
         setIsDeleting(false)
       }
     }
     
     const handleEdit = async () => {
       if (isEditing) {
         try {
           setIsUpdating(true)
           await updateTodo({ ...todo, body: editedBody })
         } catch (error) {
           console.error('Failed to update todo:', error)
         } finally {
           setIsUpdating(false)
         }
       }
       setIsEditing(!isEditing)
     }
     
     const handleKeyDown = (e: React.KeyboardEvent) => {
       if (e.key === 'Enter') {
         handleEdit()
       } else if (e.key === 'Escape') {
         setIsEditing(false)
         setEditedBody(todo.body) // Reset to original value
       }
     }
     
     return (
       <div className="flex flex-col gap-2 bg-white shadow-md p-2 rounded-lg my-2">
         <div className="flex items-center gap-2">
           <input 
             type="checkbox" 
             checked={todo.is_completed} 
             onChange={handleToggleComplete}
             disabled={todo.id.startsWith('temp-')} // Disable during optimistic update
           />
           {isEditing ? (
             <input 
               type="text" 
               value={editedBody} 
               onChange={(e) => setEditedBody(e.target.value)}
               onKeyDown={handleKeyDown}
               className="w-full border p-1 rounded"
               autoFocus
             />
           ) : (
             <span className={todo.is_completed ? "text-slate-300" : ""}>{todo.body}</span>
           )}
         </div>
         <div className="flex items-center justify-center gap-2">
           <button 
             className={`bg-blue-100 p-2 rounded-sm hover:bg-blue-200 hover:cursor-pointer ${isUpdating ? 'opacity-50' : ''}`}
             onClick={handleEdit}
             disabled={isUpdating}
           >
             {isEditing ? (isUpdating ? 'Saving...' : 'Save') : 'Edit'}
           </button>
           <button 
             className={`bg-amber-500 p-2 rounded-sm hover:bg-amber-600 hover:cursor-pointer ${isDeleting ? 'opacity-50' : ''}`}
             onClick={handleDelete}
             disabled={isDeleting}
           >
             {isDeleting ? 'Deleting...' : 'Delete'}
           </button>
         </div>
       </div>
     )
   }
   ```
   
   - Update the NewTodoCard component in `src/app-components/app-new-todo.tsx`:
   ```tsx
   import { useState } from 'react'
   import { useTodoContext } from '../contexts/todo-context'
   
   export default function NewTodoCard() {
     const { addTodo } = useTodoContext()
     const [todoBody, setTodoBody] = useState('')
     const [isAdding, setIsAdding] = useState(false)
     
     const handleAddTodo = async () => {
       if (!todoBody.trim() || isAdding) return
       
       try {
         setIsAdding(true)
         await addTodo({
           body: todoBody,
           is_completed: false
         })
         setTodoBody('') // Clear input after successful add
       } catch (error) {
         console.error('Failed to add todo:', error)
       } finally {
         setIsAdding(false)
       }
     }
     
     const handleKeyDown = (e: React.KeyboardEvent) => {
       if (e.key === 'Enter') {
         handleAddTodo()
       }
     }
     
     return (
       <div className="flex flex-col gap-2 bg-white shadow-md p-2 rounded-lg my-2 max-w-2xl mx-auto">
         <div className="flex items-center gap-2">
           <input type="checkbox" disabled />
           <input 
             type="text" 
             placeholder="Add new todo" 
             className="w-full border p-2 rounded-md" 
             value={todoBody}
             onChange={(e) => setTodoBody(e.target.value)}
             onKeyDown={handleKeyDown}
             disabled={isAdding}
           />
         </div>
         <div className="flex items-center justify-center gap-2">
           <button 
             className={`bg-blue-200 p-2 rounded-sm hover:bg-blue-300 hover:cursor-pointer ${isAdding ? 'opacity-50' : ''}`}
             onClick={handleAddTodo}
             disabled={isAdding}
           >
             {isAdding ? 'Adding...' : 'Add'}
           </button>
         </div>
       </div>
     )
   }
   ```

This approach will ensure that todos displayed in the UI stay in sync with the database by centralizing the state management and automatically handling refetching after mutations. It also provides a clean architecture that separates concerns and makes the code more maintainable.

