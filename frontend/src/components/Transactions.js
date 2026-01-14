import React, { useState } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import moment from 'moment';
import EditTransactionModal from './EditTransactionModal';

const Transactions = () => {
  const { transactions, loading, deleteTransaction } = useTransaction();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Education': '📚',
      'Salary': '💰',
      'Freelance': '💼',
      'Investment': '📈',
      'Gift': '🎁'
    };
    return icons[category] || '📊';
  };

  const formatAmount = (amount, type) => {
    const formatted = parseFloat(amount).toFixed(2);
    return type === 'income' ? `+₹${formatted}` : `-₹${formatted}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
          Transactions
        </h1>
        <Link to="/add" className="btn btn-primary">
          <FiPlus />
          Add Transaction
        </Link>
      </div>

      {/* Transactions List */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>No transactions found for the selected filters.</p>
            <Link to="/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <FiPlus />
              Add Your First Transaction
            </Link>
          </div>
        ) : (
          <div>
            {transactions.map(transaction => (
              <div key={transaction._id} className="transaction-item">
                <div className="transaction-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {getCategoryIcon(transaction.category)}
                    </span>
                    <div>
                      <div className="transaction-title">{transaction.title}</div>
                      <div className="transaction-meta">
                        {transaction.category} • {moment(transaction.date).format('MMM DD, YYYY')}
                        {transaction.description && ` • ${transaction.description}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </div>
                  
                  <div className="transaction-actions">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem' }}
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem' }}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={closeEditModal}
          isOpen={showEditModal}
        />
      )}
    </div>
  );
};

export default Transactions;
