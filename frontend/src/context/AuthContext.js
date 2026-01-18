import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = "https://finlit-backend-jhpn.onrender.com";


const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token header
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const res = await axios.get('/api/auth/profile');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: res.data, token: state.token }
          });
        } catch (error) {
          dispatch({ type: 'AUTH_FAIL', payload: error.response?.data?.message || 'Authentication failed' });
        }
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };

    loadUser();
  }, [state.token]);

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const res = await axios.post('/api/auth/register', userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const res = await axios.post('/api/auth/login', userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const res = await axios.put('/api/auth/profile', profileData);
      dispatch({ type: 'UPDATE_PROFILE', payload: res.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
