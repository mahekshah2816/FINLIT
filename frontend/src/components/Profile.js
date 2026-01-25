import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiSave, FiEdit, FiCreditCard } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    monthlyBudget: ''
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        monthlyBudget: user.monthlyBudget || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear success message when editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.monthlyBudget && isNaN(formData.monthlyBudget)) {
      newErrors.monthlyBudget = 'Monthly budget must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const profileData = {
        name: formData.name.trim(),
        monthlyBudget: parseFloat(formData.monthlyBudget) || 0
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      monthlyBudget: user.monthlyBudget || ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
            Profile Settings
          </h1>
          {!isEditing && (
            <button onClick={handleEdit} className="btn btn-outline">
              <FiEdit />
              Edit Profile
            </button>
          )}
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <FiUser style={{ marginRight: '0.5rem' }} />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={!isEditing}
            />
            {errors.name && (
              <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiMail style={{ marginRight: '0.5rem' }} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              disabled
              style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Email address cannot be changed
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiCreditCard style={{ marginRight: '0.5rem' }} />
              Monthly Budget
            </label>
            <input
              type="number"
              name="monthlyBudget"
              className="form-input"
              value={formData.monthlyBudget}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={!isEditing}
            />
            {errors.monthlyBudget && (
              <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>
                {errors.monthlyBudget}
              </span>
            )}
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Set to 0 to disable budget tracking
            </small>
          </div>

          {isEditing && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                <FiSave />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Information */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Account Information</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '500' }}>Member Since:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '500' }}>Account ID:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{user._id}</span>
          </div>
        </div>
      </div>

      {/* Budget Tips */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>💡 Budget Tips</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Set a realistic monthly budget based on your income</li>
          <li>Track your expenses regularly to stay within budget</li>
          <li>Use categories to identify spending patterns</li>
          <li>Review your budget monthly and adjust as needed</li>
          <li>Save money by cutting unnecessary expenses</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
