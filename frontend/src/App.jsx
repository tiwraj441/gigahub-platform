import { BrowserRouter, Routes, Route } from "react-router-dom";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginSignup from "./pages/LoginSignup";   // ✅ create this page
import Dashboard from "./pages/Dashboard";       // ✅ create this page
import ProtectedRoute from "./components/ProtectedRoute"; // for private pages

function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold">Welcome to Hardware & IT Solutions</h1>
      <p className="mt-4 text-gray-600">
        Your trusted partner for technology solutions.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
