// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import CaregiverDash from "./pages/CaregiverDash";
import SeniorDash from "./pages/SeniorDash";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth"             element={<Auth />} />
        <Route path="/caregiver-dashboard" element={<CaregiverDash />} />
        <Route path="/senior-dashboard"    element={<SeniorDash />} />
      </Routes>
    </BrowserRouter>
  );
}