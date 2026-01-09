import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminMenu from './pages/AdminMenu';
import UserMenu from './pages/UserMenu';
import Users from './pages/Users';
import Models from './pages/Models';
import CreateModel from './pages/CreateModel';
import ModelAdmin from './pages/ModelAdmin';
import Annotate from './pages/Annotate';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/models" replace />
            )
          ) : (
            <Login onLogin={handleLogin} />
          )
        } />
        
        <Route path="/admin" element={
          user?.role === 'admin' ? (
            <AdminMenu onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/users" element={
          user?.role === 'admin' ? (
            <Users />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/admin-models" element={
          user?.role === 'admin' ? (
            <Models isAdmin={true} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/models" element={
          user ? (
            <UserMenu onLogout={handleLogout} user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/create-model" element={
          user?.role === 'admin' ? (
            <CreateModel />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/model/:id/admin" element={
          user?.role === 'admin' ? (
            <ModelAdmin />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/model/:id/annotate" element={
          user ? (
            <Annotate user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
