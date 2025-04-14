import type { Todo } from "../interfaces/todo-interface";
import TodoCard from "./app-todo-card";

export default function TodoList({todos}: {todos: Todo[]}){
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">  
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id}>
              <TodoCard todo={todo} />
            </li>
          ))}
        </ul>
      </div>
    )
}