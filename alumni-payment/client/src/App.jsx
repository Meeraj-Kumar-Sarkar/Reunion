import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PaymentSuccess from "./components/PaymentSuccess";

// Layout for public pages with Navbar and Footer
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="grow">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/success" element={<PublicLayout><PaymentSuccess /></PublicLayout>} />
      </Routes>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;
