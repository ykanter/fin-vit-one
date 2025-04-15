import { useState } from "react";
import type {Todo} from "../interfaces/todo-interface";

const createTodos = async (todos : Todo[]) => {
    const response = await fetch("/api/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todos),
    });
    return await response.json() as Promise<Todo[]>;
}

const addTodo = ({body} : {body : string}) => {
    const newTodo : Todo = {
        body,
        is_completed: false
    }
    createTodos([newTodo])
}

export default function NewTodoCard(){
    const [todoBody, setTodoBody] = useState('')

    return (
        <div className="flex flex-col gap-2 bg-white shadow-md p-2 rounded-lg my-2">
            <div className="flex items-center gap-2">
                <input type="checkbox" />
                <input type="text" 
                placeholder="Add new todo" 
                className="w-full border p-2 rounded-md" 
                value={todoBody}
                onChange={(e) => setTodoBody(() => e.target.value)}
                />
            </div>
            <div className="flex items-center justify-center gap-2">
                <button className="bg-blue-200 p-2 rounded-sm hover:bg-blue-300 hover:cursor-pointer"
                onClick={() => addTodo({body: todoBody})}
                >Add</button>
            </div>
        </div>
    )
}