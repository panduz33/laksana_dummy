import React from 'react';
import Layout from '../Layout';

const Administrator: React.FC = () => {
  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <h1>Administrator</h1>
        </header>
        
        <main className="page-content">
          <div className="dashboard-card">
            <h2>Manajemen Administrator</h2>
            <p>Halaman untuk mengelola akun administrator akan ditampilkan di sini.</p>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Administrator;