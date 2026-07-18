import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RegisterAsset from "./pages/RegisterAsset";
import TokenDashboard from "./pages/TokenDashboard";
import VerifyLogo from "./pages/VerifyLogo";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterAsset />} />
        <Route path="/verify" element={<VerifyLogo />} />
        <Route path="/dashboard" element={<TokenDashboard />} />
        <Route
          path="*"
          element={
            <main className="page-container page-section">
              <div className="page-heading">
                <h1>Page not found</h1>
                <p>Use the navigation above to return to the dApp.</p>
              </div>
            </main>
          }
        />
      </Routes>
      <footer className="site-footer">
        <div className="page-container">
          <p>ALU Digital Asset Protection dApp · Built with React, ethers.js and Solidity</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
