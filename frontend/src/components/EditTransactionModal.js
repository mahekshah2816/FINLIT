import React, { useState, useEffect } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { FiSave, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditTransactionModal = ({ transaction, onClose, isOpen }) => {
  const { updateTransaction, loading } = useTransaction();
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date(),
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Predefined categories
  const predefinedCategories = {
    expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
  };

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: new Date(transaction.date),
        description: transaction.description || ''
      });
    }
  }, [transaction]);

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

    // Reset category when type changes
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value,
        category: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomCategory(true);
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    } else {
      setShowCustomCategory(false);
      setFormData(prev => ({
        ...prev,
        category: value
      }));
    }
  };

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
    setFormData(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date.toISOString()
      };

      const result = await updateTransaction(transaction._id, transactionData);
      if (result.success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>
            Edit Transaction
          </h2>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                name="amount"
                className="form-input"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
              />
              {errors.amount && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>
                  {errors.amount}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder={`Enter ${formData.type} title`}
            />
            {errors.title && (
              <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>
                {errors.title}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleCategoryChange}
              >
                <option value="">Select a category</option>
                {predefinedCategories[formData.type].map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="custom">+ Add Custom Category</option>
              </select>
              {errors.category && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>
                  {errors.category}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <DatePicker
                selected={formData.date}
                onChange={handleDateChange}
                className="form-input"
                dateFormat="MMM dd, yyyy"
                maxDate={new Date()}
              />
              {errors.date && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>
                  {errors.date}
                </span>
              )}
            </div>
          </div>

          {showCustomCategory && (
            <div className="form-group">
              <label className="form-label">Custom Category</label>
              <input
                type="text"
                className="form-input"
                value={customCategory}
                onChange={handleCustomCategoryChange}
                placeholder="Enter custom category name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a description..."
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              <FiSave />
              {loading ? 'Updating...' : 'Update Transaction'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              <FiX />
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker__input-container input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.2s ease-in-out;
        }
        
        .react-datepicker__input-container input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        @media (max-width: 768px) {
          .form-group {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
};

export default EditTransactionModal;
