import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Home from "./components/Home";
import "./CSS/global.css";

function App() {
  const [token, setToken] = useState<string>("");

  return (
    <BrowserRouter>
      {!token ? (
        <LoginPage setToken={setToken} />
      ) : (
        <Home token={token} setToken={setToken} />
      )}
    </BrowserRouter>
  );
}

export default App;
