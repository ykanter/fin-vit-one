import { createFileRoute } from '@tanstack/react-router'
import TodoList from '../app-components/app-todo-list'
import { readTodos } from '../app-components/app-todo-list'
import { Todo } from '../interfaces/todo-interface'

    
export const Route = createFileRoute('/todo')({ 
    component: TodoComponent,
    loader: async () => {
        const todos = await readTodos() as Todo[]
        return { todos }
    }
})

function TodoComponent(){
    const { todos } = Route.useLoaderData()
    return (
        <TodoList todos={todos} />
    )
}