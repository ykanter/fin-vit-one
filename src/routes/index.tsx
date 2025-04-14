import { createFileRoute } from "@tanstack/react-router";
import AppHome from "../app-components/app-home";

export const Route = createFileRoute('/')({ 
  component: AppHome,
})