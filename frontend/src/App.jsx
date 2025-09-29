import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Climbing from "./pages/Climbing.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Navigation from "./components/Navigation.jsx";

function App() {
  return (
    <Router>
      <Navigation />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/climbing" element={<Climbing />} />
      </Routes>
    </Router>
  );
}

export default App;
