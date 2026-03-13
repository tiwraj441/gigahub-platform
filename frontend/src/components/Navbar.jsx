import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between">
      <h1 className="font-bold">Hardware & IT</h1>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login" className="mr-4">LoginSignup</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}
