import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import Layout from '../Layout';
import '../../styles/Pengembalian.css';

interface DeviceItem {
  kategoriAlat: string;
  namaAlat: string;
  jumlah: number;
}

interface ReturnDeviceItem {
  kategoriAlat: string;
  namaAlat: string;
  originalCount: number;
  returnedCount: number;
  kondisi: string;
}

interface PeminjamanData {
  id: number;
  nama_peminjam: string;
  tanggal_peminjaman: string;
  nama_program: string;
  rencana_pengembalian: string;
  alatYangDipinjam: DeviceItem[];
  remainingItems: DeviceItem[] | null;
  nama_operator: string;
  status: string;
  created_at: string;
}

const Pengembalian: React.FC = () => {
  const [peminjamanData, setPeminjamanData] = useState<PeminjamanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<PeminjamanData | null>(null);
  const [returnDevices, setReturnDevices] = useState<ReturnDeviceItem[]>([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchPeminjamanData();
  }, []);

  const fetchPeminjamanData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.peminjaman, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPeminjamanData(data);
        setError('');
      } else {
        setError('Failed to fetch peminjaman data');
      }
    } catch (error) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (loan: PeminjamanData) => {
    setSelectedLoan(loan);
    // Use remaining items if available (for partial returns), otherwise use original items
    const itemsToReturn = loan.remainingItems && loan.remainingItems.length > 0 ? loan.remainingItems : loan.alatYangDipinjam;
    const initialReturnDevices = itemsToReturn.map(device => ({
      kategoriAlat: device.kategoriAlat,
      namaAlat: device.namaAlat,
      originalCount: device.jumlah,
      returnedCount: 0, // Default to returning none, let user select
      kondisi: 'Bagus' // Default condition
    }));
    setReturnDevices(initialReturnDevices);
    setShowReturnModal(true);
  };

  const handleReturnDeviceChange = (index: number, field: keyof ReturnDeviceItem, value: string | number) => {
    setReturnDevices(prev => prev.map((device, i) => 
      i === index ? { ...device, [field]: value } : device
    ));
  };

  const handleSubmitReturn = async () => {
    if (!selectedLoan) return;

    // Only include devices that are actually being returned (count > 0)
    const devicesToReturn = returnDevices.filter(device => device.returnedCount > 0);
    
    if (devicesToReturn.length === 0) {
      setError('Pilih setidaknya satu alat untuk dikembalikan');
      return;
    }

    setSubmittingReturn(true);
    try {
      const response = await fetch(`http://localhost:5000/api/peminjaman/${selectedLoan.id}/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          returnedDevices: devicesToReturn
        })
      });

      if (response.ok) {
        // Refresh the data
        fetchPeminjamanData();
        setShowReturnModal(false);
        setSelectedLoan(null);
        setReturnDevices([]);
      } else {
        setError('Failed to process return');
      }
    } catch (error) {
      setError('Error processing return');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setSelectedLoan(null);
    setReturnDevices([]);
  };

  const filteredData = peminjamanData.filter(item =>
    (item.nama_peminjam || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.nama_program || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.nama_operator || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">Dipinjam</span>;
      case 'returned':
        return <span className="status-badge status-returned">Dikembalikan</span>;
      case 'partial_return':
        return <span className="status-badge status-partial-return">Dikembalikan Sebagian</span>;
      case 'overdue':
        return <span className="status-badge status-overdue">Terlambat</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const isOverdue = (returnDate: string, status: string) => {
    if (status === 'returned') return false;
    return new Date(returnDate) < new Date();
  };

  const renderDevicesList = (devices: DeviceItem[]) => {
    return (
      <div className="devices-list">
        {devices.map((device, index) => (
          <div key={index} className="device-item-summary">
            <span className="device-category">{device.kategoriAlat}</span>
            <span className="device-name">{device.namaAlat}</span>
            <span className="device-quantity">({device.jumlah})</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <header className="page-header">
            <h1>Data Pengembalian</h1>
          </header>
          
          <main className="page-content">
            <div className="pengembalian-container">
              <div className="loading-message">Loading peminjaman data...</div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="page-container">
          <header className="page-header">
            <h1>Data Pengembalian</h1>
          </header>
          
          <main className="page-content">
            <div className="pengembalian-container">
              <div className="error-message">{error}</div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <h1>Data Pengembalian</h1>
        </header>
        
        <main className="page-content">
          <div className="pengembalian-container">
            <div className="search-section">
              <div className="search-group">
                <label htmlFor="searchTerm">Cari Data Peminjaman:</label>
                <input
                  type="text"
                  id="searchTerm"
                  placeholder="Cari berdasarkan nama peminjam, program, atau operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="table-container">
              <table className="pengembalian-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nama Peminjam</th>
                    <th>Program</th>
                    <th>Tanggal Pinjam</th>
                    <th>Rencana Kembali</th>
                    <th>Alat yang Dipinjam</th>
                    <th>Operator</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={isOverdue(item.rencana_pengembalian, item.status) ? 'overdue-row' : ''}
                      >
                        <td>{index + 1}</td>
                        <td className="nama-peminjam">{item.nama_peminjam}</td>
                        <td className="nama-program">{item.nama_program}</td>
                        <td>{formatDate(item.tanggal_peminjaman)}</td>
                        <td className={isOverdue(item.rencana_pengembalian, item.status) ? 'overdue-date' : ''}>
                          {formatDate(item.rencana_pengembalian)}
                        </td>
                        <td className="devices-cell">
                          {renderDevicesList(item.alatYangDipinjam)}
                        </td>
                        <td>{item.nama_operator}</td>
                        <td>
                          {getStatusBadge(
                            isOverdue(item.rencana_pengembalian, item.status) && item.status === 'active' 
                              ? 'overdue' 
                              : item.status
                          )}
                        </td>
                        <td>
                          {(item.status === 'active' || item.status === 'partial_return') ? (
                            <button
                              onClick={() => handleReturnClick(item)}
                              className="return-button"
                            >
                              Kembalikan
                            </button>
                          ) : (
                            <span className="no-action">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data">
                        {searchTerm ? 'Tidak ada data yang cocok dengan pencarian' : 'Belum ada data peminjaman'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-summary">
              <div className="summary-stats">
                <span>Total: {filteredData.length} data</span>
                <span>Aktif: {filteredData.filter(item => item.status === 'active').length}</span>
                <span>Dikembalikan: {filteredData.filter(item => item.status === 'returned').length}</span>
                <span>Dikembalikan Sebagian: {filteredData.filter(item => item.status === 'partial_return').length}</span>
                <span>Terlambat: {filteredData.filter(item => isOverdue(item.rencana_pengembalian, item.status) && item.status === 'active').length}</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedLoan && (
        <div className="modal-overlay" onClick={closeReturnModal}>
          <div className="return-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pengembalian Alat</h3>
              <button className="modal-close" onClick={closeReturnModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="loan-info">
                <h4>Informasi Peminjaman</h4>
                <div className="loan-details">
                  <span><strong>Peminjam:</strong> {selectedLoan.nama_peminjam}</span>
                  <span><strong>Program:</strong> {selectedLoan.nama_program}</span>
                  <span><strong>Tanggal Pinjam:</strong> {formatDate(selectedLoan.tanggal_peminjaman)}</span>
                </div>
              </div>

              <div className="return-devices-section">
                <h4>Alat yang Dikembalikan</h4>
                {returnDevices.map((device, index) => (
                  <div key={index} className="return-device-item">
                    <div className="device-info">
                      <div className="device-name-section">
                        <span className="device-category-tag">{device.kategoriAlat}</span>
                        <span className="device-name">{device.namaAlat}</span>
                      </div>
                      <span className="original-count">Dipinjam: {device.originalCount}</span>
                    </div>

                    <div className="return-controls">
                      <div className="control-group">
                        <label>Jumlah Dikembalikan:</label>
                        <select
                          value={device.returnedCount}
                          onChange={(e) => handleReturnDeviceChange(index, 'returnedCount', parseInt(e.target.value))}
                          disabled={submittingReturn}
                        >
                          {Array.from({ length: device.originalCount + 1 }, (_, i) => i).map(count => (
                            <option key={count} value={count}>{count}</option>
                          ))}
                        </select>
                      </div>

                      <div className="control-group">
                        <label>Kondisi Barang:</label>
                        <select
                          value={device.kondisi}
                          onChange={(e) => handleReturnDeviceChange(index, 'kondisi', e.target.value)}
                          disabled={submittingReturn}
                        >
                          <option value="Bagus">Bagus</option>
                          <option value="Rusak">Rusak</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-button" 
                onClick={closeReturnModal}
                disabled={submittingReturn}
              >
                Batal
              </button>
              <button 
                className="submit-return-button" 
                onClick={handleSubmitReturn}
                disabled={submittingReturn}
              >
                {submittingReturn ? 'Memproses...' : 'Submit Pengembalian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Pengembalian;