import type { Todo } from "../interfaces/todo-interface";
import TodoCard from "./app-todo-card";
import { useState } from "react";

export default function TodoList(){
    const [todos, setTodos] = useState<Todo[]>([]);
    return (
      <>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto flex flex-col justify-center gap-4">
      <button
        onClick={() => {
          fetch("/api/")
            .then((res) => res.json() as Promise<Todo[]>)
            .then((data) => setTodos(() => data));
        }}
        aria-label="get todos"
        className="bg-slate-100 p-2 rounded-sm hover:bg-slate-200 hover:cursor-pointer"
      >
       Get my todo list
      </button>
      </div>
      {todos.map((todo) => (
            
              <TodoCard key={todo.id} todo={todo} />
            
          ))}
      </>
    )
}