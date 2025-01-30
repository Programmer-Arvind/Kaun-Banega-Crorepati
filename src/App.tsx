import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import SplashScreen from "./components/SplashScreen"
import KBCGame from "./components/KBCGame"

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/game" element={<KBCGame />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

