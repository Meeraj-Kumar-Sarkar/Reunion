import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { LanguageProvider } from './context/LanguageContext';

function AdminPortal() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken"));

  const login = (newToken) => {
    sessionStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    setToken(null);
  };

  if (!token) {
    return <AdminLogin onLoginSuccess={login} />;
  }

  return <AdminDashboard onLogout={logout} />;
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AdminPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#f5f5f5',
            border: '1px solid #404040',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
          },
        }}
      />
    </Router>
  </LanguageProvider>
  );
}

export default App;
