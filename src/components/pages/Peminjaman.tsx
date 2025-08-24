import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../Layout';
import '../../styles/Peminjaman.css';

interface DeviceItem {
  id: string;
  kategoriAlat: string;
  namaAlat: string;
  jumlah: number;
}

interface PeminjamanForm {
  namaPeminjam: string;
  tanggalPeminjaman: string;
  namaProgram: string;
  rencanaPengembalian: string;
  alatYangDipinjam: DeviceItem[];
  namaOperator: string;
}

interface KomoditasOption {
  id: number;
  device_category: string;
  device_name: string;
  available_quantity: number;
}

const Peminjaman: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PeminjamanForm>({
    namaPeminjam: '',
    tanggalPeminjaman: new Date().toISOString().split('T')[0],
    namaProgram: '',
    rencanaPengembalian: '',
    alatYangDipinjam: [{ id: '1', kategoriAlat: '', namaAlat: '', jumlah: 1 }],
    namaOperator: user?.username || ''
  });

  const [komoditasOptions, setKomoditasOptions] = useState<KomoditasOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  // Fetch komoditas options
  useEffect(() => {
    fetchKomoditasOptions();
  }, []);

  // Update operator name when user changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      namaOperator: user?.username || ''
    }));
  }, [user]);

  const fetchKomoditasOptions = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.komoditas, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setKomoditasOptions(data);
      }
    } catch (error) {
      console.error('Error fetching komoditas:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeviceChange = (id: string, field: keyof DeviceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      alatYangDipinjam: prev.alatYangDipinjam.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addDeviceItem = () => {
    const newId = Date.now().toString();
    setFormData(prev => ({
      ...prev,
      alatYangDipinjam: [
        ...prev.alatYangDipinjam,
        { id: newId, kategoriAlat: '', namaAlat: '', jumlah: 1 }
      ]
    }));
  };

  const removeDeviceItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      alatYangDipinjam: prev.alatYangDipinjam.filter(item => item.id !== id)
    }));
  };

  const getAvailableDevicesByCategory = (category: string) => {
    return komoditasOptions.filter(item => item.device_category === category);
  };

  const getUniqueCategories = () => {
    const categories = komoditasOptions.map(item => item.device_category);
    return Array.from(new Set(categories));
  };

  const getMaxQuantity = (deviceName: string) => {
    const device = komoditasOptions.find(item => item.device_name === deviceName);
    return device ? device.available_quantity : 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Basic validation
    if (!formData.namaPeminjam || !formData.namaProgram || !formData.rencanaPengembalian) {
      setMessage('Please fill in all required fields');
      return;
    }

    // Validate devices
    const invalidDevices = formData.alatYangDipinjam.filter(
      device => !device.kategoriAlat || !device.namaAlat || device.jumlah < 1
    );

    if (invalidDevices.length > 0) {
      setMessage('Please complete all device information');
      return;
    }

    // Show confirmation dialog (don't set loading here)
    setShowConfirmationDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    setLoading(true);
    setShowConfirmationDialog(false);

    try {
      const response = await fetch(API_ENDPOINTS.peminjaman, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Loan request submitted successfully!');
        // Reset form
        setFormData({
          namaPeminjam: '',
          tanggalPeminjaman: new Date().toISOString().split('T')[0],
          namaProgram: '',
          rencanaPengembalian: '',
          alatYangDipinjam: [{ id: '1', kategoriAlat: '', namaAlat: '', jumlah: 1 }],
          namaOperator: user?.username || ''
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to submit loan request'}`);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationDialog(false);
    setLoading(false); // Ensure loading state is reset
  };

  return (
    <Layout>
      <div className="page-container">
        <header className="page-header">
          <h1>Form Peminjaman</h1>
        </header>
        
        <main className="page-content">
          <div className="peminjaman-container">
            <form onSubmit={handleSubmit} className="peminjaman-form">
              <div className="form-section">
                <h3>Informasi Peminjaman</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="namaPeminjam">Nama Peminjam *</label>
                    <input
                      type="text"
                      id="namaPeminjam"
                      name="namaPeminjam"
                      value={formData.namaPeminjam}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama peminjam"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tanggalPeminjaman">Tanggal Peminjaman *</label>
                    <input
                      type="date"
                      id="tanggalPeminjaman"
                      name="tanggalPeminjaman"
                      value={formData.tanggalPeminjaman}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="namaProgram">Nama Program *</label>
                    <input
                      type="text"
                      id="namaProgram"
                      name="namaProgram"
                      value={formData.namaProgram}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama program/kegiatan"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rencanaPengembalian">Rencana Pengembalian *</label>
                    <input
                      type="date"
                      id="rencanaPengembalian"
                      name="rencanaPengembalian"
                      value={formData.rencanaPengembalian}
                      onChange={handleInputChange}
                      min={formData.tanggalPeminjaman}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="devices-header">
                  <h3>Alat yang Dipinjam</h3>
                  <button
                    type="button"
                    onClick={addDeviceItem}
                    className="add-device-btn"
                    disabled={loading}
                  >
                    + Tambah Alat
                  </button>
                </div>

                {formData.alatYangDipinjam.map((device, index) => (
                  <div key={device.id} className="device-item">
                    <div className="device-header">
                      <span>Alat {index + 1}</span>
                      {formData.alatYangDipinjam.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeviceItem(device.id)}
                          className="remove-device-btn"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="device-fields">
                      <div className="form-group">
                        <label>Kategori Alat *</label>
                        <select
                          value={device.kategoriAlat}
                          onChange={(e) => {
                            handleDeviceChange(device.id, 'kategoriAlat', e.target.value);
                            handleDeviceChange(device.id, 'namaAlat', ''); // Reset nama alat
                          }}
                          required
                          disabled={loading}
                        >
                          <option value="">Pilih Kategori</option>
                          {getUniqueCategories().map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Nama Alat *</label>
                        <select
                          value={device.namaAlat}
                          onChange={(e) => handleDeviceChange(device.id, 'namaAlat', e.target.value)}
                          required
                          disabled={loading || !device.kategoriAlat}
                        >
                          <option value="">Pilih Nama Alat</option>
                          {getAvailableDevicesByCategory(device.kategoriAlat).map(item => (
                            <option key={item.id} value={item.device_name}>
                              {item.device_name} (Tersedia: {item.available_quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Jumlah *</label>
                        <input
                          type="number"
                          value={device.jumlah}
                          onChange={(e) => handleDeviceChange(device.id, 'jumlah', parseInt(e.target.value) || 1)}
                          min="1"
                          max={getMaxQuantity(device.namaAlat)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="namaOperator">Nama Operator</label>
                  <input
                    type="text"
                    id="namaOperator"
                    name="namaOperator"
                    value={formData.namaOperator}
                    readOnly
                    className="readonly-field"
                  />
                </div>
              </div>

              {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Mengirim...' : 'Submit Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmationDialog && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h3>Konfirmasi Pengajuan Peminjaman</h3>
            </div>
            
            <div className="confirmation-body">
              <p className="confirmation-intro">
                Mohon periksa kembali data peminjaman berikut:
              </p>
              
              <div className="confirmation-section">
                <h4>Informasi Peminjaman</h4>
                <div className="confirmation-row">
                  <span className="label">Nama Peminjam:</span>
                  <span className="value">{formData.namaPeminjam}</span>
                </div>
                <div className="confirmation-row">
                  <span className="label">Tanggal Peminjaman:</span>
                  <span className="value">{formData.tanggalPeminjaman}</span>
                </div>
                <div className="confirmation-row">
                  <span className="label">Nama Program:</span>
                  <span className="value">{formData.namaProgram}</span>
                </div>
                <div className="confirmation-row">
                  <span className="label">Rencana Pengembalian:</span>
                  <span className="value">{formData.rencanaPengembalian}</span>
                </div>
                <div className="confirmation-row">
                  <span className="label">Nama Operator:</span>
                  <span className="value">{formData.namaOperator}</span>
                </div>
              </div>

              <div className="confirmation-section">
                <h4>Alat yang Dipinjam</h4>
                {formData.alatYangDipinjam.map((device, index) => (
                  <div key={device.id} className="device-summary">
                    <div className="device-header">
                      <strong>Alat {index + 1}</strong>
                    </div>
                    <div className="confirmation-row">
                      <span className="label">Kategori:</span>
                      <span className="value">{device.kategoriAlat}</span>
                    </div>
                    <div className="confirmation-row">
                      <span className="label">Nama Alat:</span>
                      <span className="value">{device.namaAlat}</span>
                    </div>
                    <div className="confirmation-row">
                      <span className="label">Jumlah:</span>
                      <span className="value">{device.jumlah} unit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="confirmation-footer">
              <button 
                type="button" 
                onClick={handleCancelConfirmation}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmedSubmit}
                className="confirm-button"
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'OK - Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Peminjaman;