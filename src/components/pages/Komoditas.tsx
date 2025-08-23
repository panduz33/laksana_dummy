import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import '../../styles/Komoditas.css';

interface KomoditasData {
  id: number;
  device_category: string;
  device_name: string;
  available_quantity: number;
  loaned_quantity: number;
  total_quantity: number;
}

interface NewKomoditasForm {
  device_category: string;
  device_name: string;
  quantity: number;
}

const Komoditas: React.FC = () => {
  const [searchCategory, setSearchCategory] = useState('');
  const [searchName, setSearchName] = useState('');
  const [komoditasData, setKomoditasData] = useState<KomoditasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submittingNew, setSubmittingNew] = useState(false);
  const [newItemForm, setNewItemForm] = useState<NewKomoditasForm>({
    device_category: '',
    device_name: '',
    quantity: 1
  });

  // Fetch komoditas data from API
  const fetchKomoditasData = async () => {
    try {
      const params = new URLSearchParams();
      
      if (searchCategory) params.append('category', searchCategory);
      if (searchName) params.append('name', searchName);
      
      const url = `http://localhost:5000/api/komoditas${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setKomoditasData(data);
        setError('');
      } else {
        setError('Failed to fetch komoditas data');
      }
    } catch (error) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKomoditasData();
  }, []);

  const handleOpenModal = () => {
    setNewItemForm({
      device_category: '',
      device_name: '',
      quantity: 1
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewItemForm({
      device_category: '',
      device_name: '',
      quantity: 1
    });
  };

  const handleFormChange = (field: keyof NewKomoditasForm, value: string | number) => {
    setNewItemForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemForm.device_category || !newItemForm.device_name || newItemForm.quantity < 1) {
      setError('Please fill all fields with valid data');
      return;
    }

    setSubmittingNew(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/komoditas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newItemForm)
      });

      if (response.ok) {
        // Refresh the data
        await fetchKomoditasData();
        handleCloseModal();
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add new item');
      }
    } catch (error) {
      setError('Error adding new item');
    } finally {
      setSubmittingNew(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = komoditasData.map(item => item.device_category);
    return Array.from(new Set(categories));
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchKomoditasData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchCategory, searchName]);

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <header className="page-header">
            <h1>Komoditas</h1>
          </header>
          
          <main className="page-content">
            <div className="komoditas-container">
              <div className="loading-message">Loading komoditas data...</div>
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
            <h1>Komoditas</h1>
          </header>
          
          <main className="page-content">
            <div className="komoditas-container">
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
          <h1>Komoditas</h1>
        </header>
        
        <main className="page-content">
          <div className="komoditas-container">
            <div className="search-section">
              <div className="search-inputs">
                <div className="search-group">
                  <label htmlFor="searchCategory">Device Category:</label>
                  <input
                    type="text"
                    id="searchCategory"
                    placeholder="Search by category..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="search-group">
                  <label htmlFor="searchName">Device Name:</label>
                  <input
                    type="text"
                    id="searchName"
                    placeholder="Search by device name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="add-item-section">
                <button 
                  onClick={handleOpenModal}
                  className="add-item-button"
                  disabled={loading}
                >
                  Tambah Barang
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="komoditas-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Device Category</th>
                    <th>Device Name</th>
                    <th>Available Quantity</th>
                    <th>Loaned Quantity</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {komoditasData.length > 0 ? (
                    komoditasData.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.device_category}</td>
                        <td>{item.device_name}</td>
                        <td className="quantity-cell available">{item.available_quantity}</td>
                        <td className="quantity-cell loaned">{item.loaned_quantity}</td>
                        <td className="quantity-cell total">{item.total_quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="no-data">
                        No data found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-summary">
              <p>Showing {komoditasData.length} items</p>
            </div>
          </div>
        </main>
      </div>

      {/* Add New Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tambah Barang Baru</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmitNew} className="modal-body">
              <div className="form-group">
                <label htmlFor="newCategory">Device Category:</label>
                <select
                  id="newCategory"
                  value={newItemForm.device_category}
                  onChange={(e) => handleFormChange('device_category', e.target.value)}
                  required
                  disabled={submittingNew}
                >
                  <option value="">Select Category</option>
                  {getUniqueCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="new_category">+ Add New Category</option>
                </select>
                
                {newItemForm.device_category === 'new_category' && (
                  <input
                    type="text"
                    placeholder="Enter new category name..."
                    onChange={(e) => handleFormChange('device_category', e.target.value)}
                    className="new-category-input"
                    required
                    disabled={submittingNew}
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newDeviceName">Device Name:</label>
                <input
                  type="text"
                  id="newDeviceName"
                  placeholder="Enter device name..."
                  value={newItemForm.device_name}
                  onChange={(e) => handleFormChange('device_name', e.target.value)}
                  required
                  disabled={submittingNew}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newQuantity">Quantity:</label>
                <input
                  type="number"
                  id="newQuantity"
                  min="1"
                  value={newItemForm.quantity}
                  onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 1)}
                  required
                  disabled={submittingNew}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  disabled={submittingNew}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submittingNew}
                >
                  {submittingNew ? 'Adding...' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Komoditas;