import { createFileRoute } from '@tanstack/react-router'
import AppAbout from '../app-components/app-about'

export const Route = createFileRoute('/about')({ 
    component: AppAbout,
})