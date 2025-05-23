import type { Todo } from "../interfaces/todo-interface";
import TodoCard from "./app-todo-card";
import NewTodoCard from "./app-new-todo";

export const readTodos = async () => {
    const response = await fetch("/api/");
    return await response.json() as Promise<Todo[]>;
}


export default function TodoList({todos}: {todos: Todo[]}){
    return (
      <> 
      <h1 className="flex justify-center mt-4"> Todo List </h1>
      <NewTodoCard />
      <div className="w-[90vw] mx-auto bg-white rounded-lg shadow-md p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
        ))}
      </div>
      </>
    )
}