import { createFileRoute } from '@tanstack/react-router'
import TodoList from '../app-components/app-todo-list'

export const Route = createFileRoute('/todo')({ 
    component: TodoList,
})