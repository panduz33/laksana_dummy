import React from 'react';
import Layout from '../Layout';

const PengaturanProfil: React.FC = () => {
  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <h1>Pengaturan Profil</h1>
        </header>
        
        <main className="page-content">
          <div className="dashboard-card">
            <h2>Pengaturan Profil Pengguna</h2>
            <p>Halaman untuk mengatur profil pengguna akan ditampilkan di sini.</p>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default PengaturanProfil;