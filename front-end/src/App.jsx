import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TicketPage from "./pages/TicketPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/role" element={<RoleSelectionPage />} />
        <Route path="/ticket" element={<TicketPage />} />
      </Routes>
    </Router>
  );
}

export default App;
