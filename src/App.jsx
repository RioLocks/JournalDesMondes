import { useState } from "react";
import "./App.css";
import Sidebar from "./ui/utils/Sidebar";
import Home from "./ui/pages/Home";
import Journal from "./ui/pages/Journal";
import Review from "./ui/pages/Review";
import Settings from "./ui/pages/Settings";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <main className="main-container">
        <Sidebar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/review" element={<Review />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;
