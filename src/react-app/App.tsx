// src/App.tsx

import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("unknown");

  return (
    <>
      <h1 className="text-4xl font-bold text-center mb-6 text-indigo-600">WELCOME</h1>
      <div className="card bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <img
          src="https://imagedelivery.net/VDD55Z4OpiL36ObjDMEizQ/e790e50f-20c3-4c64-8cb8-6efaa6b43700/public"
          alt="Bora bora"
        />
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label="increment"
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="card bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <button
          onClick={() => {
            fetch("/api/")
              .then((res) => res.json() as Promise<{ name: string }>)
              .then((data) => setName((_name) => data.name));
          }}
          aria-label="get name"
        >
          Name from API is: {name}
        </button>
        <p>
          Edit <code>worker/index.ts</code> to change the name
        </p>
      </div>
      
    </>
  );
}

export default App;
