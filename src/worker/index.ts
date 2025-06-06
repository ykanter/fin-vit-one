import { Context, Hono } from "hono";
import postgres from "postgres";
import type { Todo } from "../interfaces/todo-interface";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", async (c : Context<{ Bindings: Env }>) => {
   //const connectionString = c.env.hyper.connectionString;
   const connectionString = "postgresql://neondb_owner:npg_3rjfOClvGP2V@ep-wandering-sun-a5pta77k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

   const sql = postgres(connectionString, {
        // Workers limit the number of concurrent external connections, so be sure to limit
        // the size of the local connection pool that postgres.js may establish.
        max: 5,
  
        // If you are not using array types in your Postgres schema,
        // disabling this will save you an extra round-trip every time you connect.
        fetch_types: false,
        
    });    
      try {
        // Sample query
        const results = await sql`SELECT * FROM todo` as Todo[];
  
        // Clean up the client after the response is returned, before the Worker is killed
        c.executionCtx.waitUntil(sql.end());
  
        // Return result rows as JSON
        return Response.json(results);
      } catch (e) {
        console.error(e);
        return Response.json(
          { error: e instanceof Error ? e.message : e },
          { status: 500 },
        );
      }
});
app.post("/api/", async (c : Context<{ Bindings: Env }>) => {
  const connectionString = "postgresql://neondb_owner:npg_3rjfOClvGP2V@ep-wandering-sun-a5pta77k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" 
  const sql = postgres(connectionString, {
        // Workers limit the number of concurrent external connections, so be sure to limit
        // the size of the local connection pool that postgres.js may establish.
        max: 5,
  
        // If you are not using array types in your Postgres schema,
        // disabling this will save you an extra round-trip every time you connect.
        fetch_types: false,
        
    });
    const todoArray = await c.req.json()
    for (const newTodo of todoArray) {
        const { body } = newTodo;
        const todo : Todo = {
            body,
            is_completed: false
        }
    try {
        await sql`INSERT INTO todo (body, is_completed) VALUES (${todo.body}, ${todo.is_completed})`;
        c.executionCtx.waitUntil(sql.end());
        return Response.json({message: "Todo added successfully"});
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: e instanceof Error ? e.message : e },
            { status: 500 },
        );
    }
  }
});

app.put("/api/:todoId", async (c : Context<{ Bindings: Env }>) => {
  const connectionString = "postgresql://neondb_owner:npg_3rjfOClvGP2V@ep-wandering-sun-a5pta77k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

  const sql = postgres(connectionString, {
    max: 5,
    fetch_types: false,
  });
  const todoId = c.req.param("todoId");
  const todoJson = await c.req.json();
  const { body } = todoJson;
  const todo : Todo = {
    body,
    is_completed: false
  };
  try {
    await sql`UPDATE todo SET body = ${todo.body}, is_completed = ${todo.is_completed} WHERE id = ${todoId}`;
    c.executionCtx.waitUntil(sql.end());
    return Response.json({ message: "Todo updated successfully" });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: e instanceof Error ? e.message : e },
      { status: 500 },
    );
  }
});
app.delete("/api/:todoId  ", async (c : Context<{ Bindings: Env }>) => {
  const connectionString = "postgresql://neondb_owner:npg_3rjfOClvGP2V@ep-wandering-sun-a5pta77k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

  const sql = postgres(connectionString, {
    max: 5,
    fetch_types: false,
  });
  const todoId = c.req.param("todoId");
  try {
    await sql`DELETE FROM todo WHERE id = ${todoId}`;
    c.executionCtx.waitUntil(sql.end());
    return Response.json({ message: "Todo deleted successfully" });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: e instanceof Error ? e.message : e },
      { status: 500 },
    );
  }
})

export default app;
