import Card from "./app-card";

export default function AppAbout(){
    return (
        <Card title="About" description="About page">
            <img 
            className="rounded-md"
            src="https://imagedelivery.net/VDD55Z4OpiL36ObjDMEizQ/41092c51-86fe-47f7-6459-fe4c73371500/public" 
            alt="Oahu beach" />
        </Card>
    )
}