// src/app-components/app-home.tsx

import { useState } from "react";
import TodoList from "./app-todo-list"
function AppHome() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col w-full items-center justify-center gap-4 mt-4">
      <h1 className="text-4xl font-bold text-center mb-6 text-indigo-600">WELCOME</h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto flex flex-col justify-center gap-4">
        <img
          src="https://imagedelivery.net/VDD55Z4OpiL36ObjDMEizQ/e790e50f-20c3-4c64-8cb8-6efaa6b43700/public"
          alt="Bora bora"
          className="rounded-md mb-2"
        />
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label="increment"
          className="bg-slate-100 p-2 rounded-sm hover:bg-slate-200 hover:cursor-pointer"
        >
          count is {count}
        </button>
      </div>
      <TodoList />
    </div>
  );
}

export default AppHome;
