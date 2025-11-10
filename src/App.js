import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../src/components/Home";
import Navbar from "./components/Navbar";
// import ProjectOverview from "./pages/ProjectOverview";
// import MaterialList from "./pages/MaterialList";
import MaterialForm from "./components/MaterialForm";
import MaterialPredictor from "./components/pages/MaterialPredictor";
import "./App.css";

function App() {
  return (
    <Router>
       <Navbar />
     
       
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/overview" element={<ProjectOverview />} />
        <Route path="/materials" element={<MaterialList />} /> */}
        <Route path="/prediction" element={<MaterialForm />} />
        <Route path="/material-predictor" element={<MaterialPredictor />} />
      </Routes>
    </Router>
  );
}

export default App;
