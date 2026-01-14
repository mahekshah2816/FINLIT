import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

const initialState = {
  transactions: [],
  summary: {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyData: []
  },
  loading: false,
  error: null,
  filters: {
    month: moment().month() + 1, // Current month (1-12)
    year: moment().year(),
    category: '',
    type: ''
  }
};

const transactionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: false };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload, loading: false };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        loading: false
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t._id === action.payload._id ? action.payload : t
        ),
        loading: false
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t._id !== action.payload),
        loading: false
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          month: moment().month() + 1,
          year: moment().year(),
          category: '',
          type: ''
        }
      };
    default:
      return state;
  }
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const { user } = useAuth();

  // Get transactions
  const getTransactions = async (filters = {}) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const queryParams = new URLSearchParams();
      
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.type) queryParams.append('type', filters.type);

      const res = await axios.get(`/api/transactions?${queryParams}`);
      dispatch({ type: 'SET_TRANSACTIONS', payload: res.data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch transactions'
      });
    }
  };

  // Get summary
  const getSummary = async (month, year) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const queryParams = new URLSearchParams();
      if (month) queryParams.append('month', month);
      if (year) queryParams.append('year', year);

      const res = await axios.get(`/api/transactions/summary?${queryParams}`);
      dispatch({ type: 'SET_SUMMARY', payload: res.data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch summary'
      });
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return { success: false, message: 'User not authenticated' };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post('/api/transactions', transactionData);
      dispatch({ type: 'ADD_TRANSACTION', payload: res.data });
      
      // Refresh summary
      await getSummary(state.filters.month, state.filters.year);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add transaction';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return { success: false, message: 'User not authenticated' };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.put(`/api/transactions/${id}`, transactionData);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: res.data });
      
      // Refresh summary
      await getSummary(state.filters.month, state.filters.year);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update transaction';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return { success: false, message: 'User not authenticated' };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await axios.delete(`/api/transactions/${id}`);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      
      // Refresh summary
      await getSummary(state.filters.month, state.filters.year);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete transaction';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Reset filters
  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load initial data
  useEffect(() => {
    getTransactions(state.filters);
    getSummary(state.filters.month, state.filters.year);
  }, [user]); // Only load when user is authenticated

  // Refresh data when filters change
  useEffect(() => {
    getTransactions(state.filters);
    getSummary(state.filters.month, state.filters.year);
  }, [state.filters, user]); // Only refresh when user is authenticated

  const value = {
    ...state,
    getTransactions,
    getSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    resetFilters,
    clearError
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
