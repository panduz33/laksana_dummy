import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import DeviceLoanForm from './DeviceLoanForm';
import '../styles/Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <h1>Beranda</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
          </div>
        </header>
        
        <main className="page-content">
          <div className="dashboard-card">
            <h2>Peminjaman Alat</h2>
            <DeviceLoanForm />
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Home;