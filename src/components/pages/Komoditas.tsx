import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../Layout';
import { API_ENDPOINTS } from '../../config/api';
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

interface NewItemState {
  form: NewKomoditasForm;
  isNewCategory: boolean;
  newCategoryName: string;
  isNewDeviceName: boolean;
  newDeviceName: string;
  deviceNameSearch: string;
  filteredDeviceNames: string[];
}

const Komoditas: React.FC = () => {
  const [searchCategory, setSearchCategory] = useState('');
  const [searchName, setSearchName] = useState('');
  const [komoditasData, setKomoditasData] = useState<KomoditasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submittingNew, setSubmittingNew] = useState(false);
  const [newItemState, setNewItemState] = useState<NewItemState>({
    form: {
      device_category: '',
      device_name: '',
      quantity: 1
    },
    isNewCategory: false,
    newCategoryName: '',
    isNewDeviceName: false,
    newDeviceName: '',
    deviceNameSearch: '',
    filteredDeviceNames: []
  });

  // Fetch komoditas data from API
  const fetchKomoditasData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      
      if (searchCategory) params.append('category', searchCategory);
      if (searchName) params.append('name', searchName);
      
      const url = `${API_ENDPOINTS.komoditas}${params.toString() ? '?' + params.toString() : ''}`;
      
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
  }, [searchCategory, searchName]);

  useEffect(() => {
    fetchKomoditasData();
  }, [fetchKomoditasData]);

  const handleOpenModal = () => {
    setNewItemState({
      form: {
        device_category: '',
        device_name: '',
        quantity: 1
      },
      isNewCategory: false,
      newCategoryName: '',
      isNewDeviceName: false,
      newDeviceName: '',
      deviceNameSearch: '',
      filteredDeviceNames: []
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewItemState({
      form: {
        device_category: '',
        device_name: '',
        quantity: 1
      },
      isNewCategory: false,
      newCategoryName: '',
      isNewDeviceName: false,
      newDeviceName: '',
      deviceNameSearch: '',
      filteredDeviceNames: []
    });
  };

  const handleFormChange = (field: keyof NewKomoditasForm, value: string | number) => {
    if (field === 'device_category') {
      if (value === 'new_category') {
        setNewItemState(prev => ({
          ...prev,
          isNewCategory: true,
          newCategoryName: '',
          form: { ...prev.form, device_name: '' },
          isNewDeviceName: false,
          newDeviceName: '',
          deviceNameSearch: '',
          filteredDeviceNames: []
        }));
      } else {
        const categoryValue = value as string;
        const availableDeviceNames = getDeviceNamesByCategory(categoryValue);
        setNewItemState(prev => ({
          ...prev,
          form: { ...prev.form, [field]: categoryValue, device_name: '' },
          isNewCategory: false,
          newCategoryName: '',
          isNewDeviceName: false,
          newDeviceName: '',
          deviceNameSearch: '',
          filteredDeviceNames: availableDeviceNames
        }));
      }
    } else if (field === 'device_name') {
      if (value === 'new_device_name') {
        setNewItemState(prev => ({
          ...prev,
          isNewDeviceName: true,
          newDeviceName: ''
        }));
      } else {
        setNewItemState(prev => ({
          ...prev,
          form: { ...prev.form, [field]: value as string },
          isNewDeviceName: false,
          newDeviceName: ''
        }));
      }
    } else {
      if (field === 'quantity') {
        setNewItemState(prev => ({
          ...prev,
          form: { ...prev.form, quantity: value as number }
        }));
      } else {
        setNewItemState(prev => ({
          ...prev,
          form: { ...prev.form, [field]: value as string }
        }));
      }
    }
  };

  const handleNewCategoryChange = (value: string) => {
    setNewItemState(prev => ({
      ...prev,
      newCategoryName: value,
      form: { ...prev.form, device_category: value }
    }));
  };

  const handleNewDeviceNameChange = (value: string) => {
    setNewItemState(prev => ({
      ...prev,
      newDeviceName: value,
      form: { ...prev.form, device_name: value }
    }));
  };

  const handleDeviceNameSearch = (searchTerm: string) => {
    const currentCategory = newItemState.isNewCategory ? newItemState.newCategoryName : newItemState.form.device_category;
    if (!currentCategory) return;
    
    const availableDeviceNames = getDeviceNamesByCategory(currentCategory);
    const filtered = filterDeviceNames(availableDeviceNames, searchTerm);
    
    setNewItemState(prev => ({
      ...prev,
      deviceNameSearch: searchTerm,
      filteredDeviceNames: filtered
    }));
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = newItemState.isNewCategory ? newItemState.newCategoryName : newItemState.form.device_category;
    let finalDeviceName = newItemState.isNewDeviceName ? newItemState.newDeviceName : newItemState.form.device_name;
    
    // If no device name selected but there's a search term, use the search term as new device name
    if (!finalDeviceName && newItemState.deviceNameSearch) {
      finalDeviceName = newItemState.deviceNameSearch;
    }
    
    if (!finalCategory || !finalDeviceName || newItemState.form.quantity < 1) {
      setError('Please fill all fields with valid data');
      return;
    }

    const submitData = {
      device_category: finalCategory,
      device_name: finalDeviceName,
      quantity: newItemState.form.quantity
    };

    setSubmittingNew(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.komoditas, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
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

  const getDeviceNamesByCategory = (category: string) => {
    if (!category || category === 'new_category') return [];
    const deviceNames = komoditasData
      .filter(item => item.device_category.toLowerCase() === category.toLowerCase())
      .map(item => item.device_name);
    return Array.from(new Set(deviceNames));
  };

  const filterDeviceNames = (deviceNames: string[], searchTerm: string) => {
    if (!searchTerm) return deviceNames;
    return deviceNames.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchKomoditasData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchKomoditasData]);

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
                  value={newItemState.isNewCategory ? 'new_category' : newItemState.form.device_category}
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
                
                {newItemState.isNewCategory && (
                  <input
                    type="text"
                    placeholder="Enter new category name..."
                    value={newItemState.newCategoryName}
                    onChange={(e) => handleNewCategoryChange(e.target.value)}
                    className="new-category-input"
                    required
                    disabled={submittingNew}
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newDeviceName">Device Name:</label>
                
                {/* Show device name selection only if category is selected */}
                {((newItemState.form.device_category && !newItemState.isNewCategory) || (newItemState.isNewCategory && newItemState.newCategoryName)) && (
                  <>
                    {/* Search/Filter input for device names */}
                    <input
                      type="text"
                      placeholder="Search device names or type new name..."
                      value={newItemState.deviceNameSearch}
                      onChange={(e) => handleDeviceNameSearch(e.target.value)}
                      className="device-search-input"
                      disabled={submittingNew}
                    />
                    
                    {/* Device name dropdown with filtered options */}
                    {newItemState.filteredDeviceNames.length > 0 && (
                      <select
                        id="deviceNameSelect"
                        value={newItemState.isNewDeviceName ? 'new_device_name' : newItemState.form.device_name}
                        onChange={(e) => handleFormChange('device_name', e.target.value)}
                        required
                        disabled={submittingNew}
                        className="device-name-select"
                      >
                        <option value="">Select Device Name</option>
                        {newItemState.filteredDeviceNames.map((deviceName) => (
                          <option key={deviceName} value={deviceName}>
                            {deviceName}
                          </option>
                        ))}
                        <option value="new_device_name">+ Add New Device Name</option>
                      </select>
                    )}
                    
                    {/* Show add new device name input */}
                    {newItemState.isNewDeviceName && (
                      <input
                        type="text"
                        placeholder="Enter new device name..."
                        value={newItemState.newDeviceName}
                        onChange={(e) => handleNewDeviceNameChange(e.target.value)}
                        className="new-device-input"
                        required
                        disabled={submittingNew}
                      />
                    )}
                    
                    {/* Show message when no devices found in search */}
                    {newItemState.deviceNameSearch && newItemState.filteredDeviceNames.length === 0 && !newItemState.isNewDeviceName && (
                      <div className="no-devices-message">
                        No existing devices found. The search term will be used as new device name.
                      </div>
                    )}
                  </>
                )}
                
                {/* Show disabled input if no category selected */}
                {!newItemState.form.device_category && !newItemState.isNewCategory && (
                  <input
                    type="text"
                    id="newDeviceName"
                    placeholder="Select a category first..."
                    disabled={true}
                    className="disabled-input"
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newQuantity">Quantity:</label>
                <input
                  type="number"
                  id="newQuantity"
                  min="1"
                  value={newItemState.form.quantity}
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