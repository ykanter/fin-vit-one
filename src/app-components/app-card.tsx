import { ReactNode } from "react";

export default function Card({title, description, children}:{
    title: string;
    description: string;
    children: ReactNode;
}){
    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto" aria-label="app-card">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
            {children}
        </div>
    )
}