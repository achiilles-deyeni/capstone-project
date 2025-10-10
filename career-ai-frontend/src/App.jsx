import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import TestAPI from "./pages/TestAPI";

function App() {
  return (
    <div>
      <h1 className="text-center mt-3">CareerPath AI</h1>
      <TestAPI />
    </div>
  );
}

export default App;
