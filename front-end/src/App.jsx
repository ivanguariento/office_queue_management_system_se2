import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import TicketPage from "./pages/TicketPage";
import CounterPage from "./pages/CounterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/role" element={<RoleSelectionPage />} />
      <Route path="/ticket" element={<TicketPage />} />
      <Route path="/counter/:id" element={<CounterPage />} />
    </Routes>
  );
}

export default App;
