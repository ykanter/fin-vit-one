// src/app-components/app-home.tsx

import { useState } from "react";
import type { Todo } from "../interfaces/todo-interface";
import TodoList from "./app-todo-list"
function AppHome() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <>
      <h1 className="text-4xl font-bold text-center mb-6 text-indigo-600">WELCOME</h1>
      <div className="card bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <img
          src="https://imagedelivery.net/VDD55Z4OpiL36ObjDMEizQ/e790e50f-20c3-4c64-8cb8-6efaa6b43700/public"
          alt="Bora bora"
        />
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label="increment"
        >
          count is {count}
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <button
          onClick={() => {
            fetch("/api/")
              .then((res) => res.json() as Promise<Todo[]>)
              .then((data) => setTodos((_todos) => data));
          }}
          aria-label="get todos"
        >
         Get my todo list
        </button>
        <TodoList todos={todos} />
      </div>
    </>
  );
}

export default AppHome;
