import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './forest.js';
import './styles/pages.css';
import './styles/additions.css';
import { AuthProvider } from './auth.jsx';
import InternalLinks from './components/InternalLinks.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Home from './pages/Home.jsx';
import Manage from './pages/Manage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <InternalLinks />
        <RequireAuth>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RequireAuth>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
