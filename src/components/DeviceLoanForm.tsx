import React, { useState } from 'react';
import '../styles/DeviceLoanForm.css';

interface DeviceLoan {
  deviceCategory: string;
  deviceMerk: string;
  deviceCount: number;
  condition: string;
}

const DeviceLoanForm: React.FC = () => {
  const [formData, setFormData] = useState<DeviceLoan>({
    deviceCategory: '',
    deviceMerk: '',
    deviceCount: 1,
    condition: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deviceCount' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/device-loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          device_category: formData.deviceCategory,
          device_merk: formData.deviceMerk,
          device_count: formData.deviceCount,
          condition: formData.condition
        })
      });

      if (response.ok) {
        setMessage('Device loan submitted successfully!');
        setFormData({
          deviceCategory: '',
          deviceMerk: '',
          deviceCount: 1,
          condition: ''
        });
      } else {
        setMessage('Failed to submit device loan. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="device-loan-form">
      <div className="form-group">
        <label htmlFor="deviceCategory">Device Category:</label>
        <select
          id="deviceCategory"
          name="deviceCategory"
          value={formData.deviceCategory}
          onChange={handleInputChange}
          required
          disabled={loading}
        >
          <option value="">Select Category</option>
          <option value="Laptop">Laptop</option>
          <option value="Projector">Projector</option>
          <option value="Camera">Camera</option>
          <option value="Audio Equipment">Audio Equipment</option>
          <option value="Network Equipment">Network Equipment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="deviceMerk">Device Merk:</label>
        <input
          type="text"
          id="deviceMerk"
          name="deviceMerk"
          value={formData.deviceMerk}
          onChange={handleInputChange}
          placeholder="Enter device brand/model"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="deviceCount">Device Count:</label>
        <input
          type="number"
          id="deviceCount"
          name="deviceCount"
          value={formData.deviceCount}
          onChange={handleInputChange}
          min="1"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="condition">Condition:</label>
        <select
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleInputChange}
          required
          disabled={loading}
        >
          <option value="">Select Condition</option>
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default DeviceLoanForm;