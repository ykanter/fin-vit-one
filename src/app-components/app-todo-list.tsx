import type { Todo } from "../interfaces/todo-interface";

export default function TodoList({todos}: {todos: Todo[]}){
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">  
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id}>
              <div className="flex gap-2">
                <input type="checkbox" checked={todo.is_completed} />
                <span className={todo.is_completed ? "line-through" : ""}>{todo.body}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
}