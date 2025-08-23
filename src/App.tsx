import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Komoditas from './components/pages/Komoditas';
import Peminjaman from './components/pages/Peminjaman';
import Pengembalian from './components/pages/Pengembalian';
import Administrator from './components/pages/Administrator';
import Petugas from './components/pages/Petugas';
import PengaturanProfil from './components/pages/PengaturanProfil';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/komoditas" 
            element={
              <ProtectedRoute>
                <Komoditas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/peminjaman" 
            element={
              <ProtectedRoute>
                <Peminjaman />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pengembalian" 
            element={
              <ProtectedRoute>
                <Pengembalian />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/administrator" 
            element={
              <ProtectedRoute>
                <Administrator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/petugas" 
            element={
              <ProtectedRoute>
                <Petugas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pengaturan-profil" 
            element={
              <ProtectedRoute>
                <PengaturanProfil />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
