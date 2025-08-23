import React from 'react';
import Layout from '../Layout';

const Petugas: React.FC = () => {
  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <h1>Petugas</h1>
        </header>
        
        <main className="page-content">
          <div className="dashboard-card">
            <h2>Manajemen Petugas</h2>
            <p>Halaman untuk mengelola akun petugas akan ditampilkan di sini.</p>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Petugas;