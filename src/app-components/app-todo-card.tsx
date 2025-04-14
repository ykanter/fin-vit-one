import { Todo } from "../interfaces/todo-interface";

export default function TodoCard({todo}: {todo: Todo}){
    return (
        <div className="flex flex-col gap-2 bg-white shadow-md p-2 rounded-lg">
            <div className="flex items-center gap-2">
                <input type="checkbox" checked={todo.is_completed} />
                <span className={todo.is_completed ? "text-slate-300" : ""}>{todo.body}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
                <button className="bg-blue-100 p-2 rounded-sm hover:bg-blue-200 hover:cursor-pointer">Edit</button>
                <button className="bg-amber-500 p-2 rounded-sm hover:bg-amber-600 hover:cursor-pointer">Delete</button>
            </div>
        </div>
    )
}