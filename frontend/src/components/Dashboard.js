import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import moment from 'moment';

const Dashboard = () => {
  const { summary, loading, filters, setFilters } = useTransaction();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(filters.month);
  const [selectedYear, setSelectedYear] = useState(filters.year);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading your financial data...</div>
      </div>
    );
  }

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    setFilters({ month, year: selectedYear });
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setFilters({ month: selectedMonth, year });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Prepare data for pie chart - handle undefined data safely
  const pieData = summary?.categoryBreakdown ? 
    Object.entries(summary.categoryBreakdown).map(([category, amount]) => ({
      name: category,
      value: amount
    })) : [];

  // Prepare data for bar chart - handle undefined data safely
  const barData = (summary?.monthlyData || []).reduce((acc, item) => {
    const monthYear = `${item._id.month}/${item._id.year}`;
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, income: 0, expense: 0 };
    }
    if (item._id.type === 'income') {
      acc[monthYear].income = item.total;
    } else {
      acc[monthYear].expense = item.total;
    }
    return acc;
  }, {});

  const barChartData = Object.values(barData).slice(-6); // Last 6 months

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here's your financial overview for {moment(`${selectedYear}-${selectedMonth}-01`).format('MMMM YYYY')}
          </p>
        </div>
        <Link to="/add" className="btn btn-primary">
          <FiPlus />
          Add Transaction
        </Link>
      </div>

      {/* Month/Year Selector */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label className="form-label">Month</label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {moment(`${selectedYear}-${month}-01`).format('MMMM')}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, minWidth: '120px' }}>
            <label className="form-label">Year</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={handleYearChange}
            >
              {Array.from({ length: 5 }, (_, i) => moment().year() - 2 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-value income">
            <FiTrendingUp style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />
            ₹{(summary?.totalIncome || 0).toFixed(2)}
          </div>
          <div className="stat-label">Total Income</div>
        </div>

        <div className="card stat-card">
          <div className="stat-value expense">
            <FiTrendingDown style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />
            ₹{(summary?.totalExpenses || 0).toFixed(2)}
          </div>
          <div className="stat-label">Total Expenses</div>
        </div>

        <div className="card stat-card">
          <div className="stat-value balance">
            <FiTrendingUp style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />
            ₹{(summary?.balance || 0).toFixed(2)}
          </div>
          <div className="stat-label">Balance</div>
        </div>

        {user?.monthlyBudget > 0 && (
          <div className="card stat-card">
            <div className="stat-value" style={{ 
              color: summary.totalExpenses > user.monthlyBudget ? 'var(--danger-color)' : 'var(--secondary-color)' 
            }}>
              ₹{user.monthlyBudget.toFixed(2)}
            </div>
            <div className="stat-label">Monthly Budget</div>
            {summary.totalExpenses > user.monthlyBudget && (
              <div style={{ 
                color: 'var(--danger-color)', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem' 
              }}>
                ⚠️ Budget exceeded!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Category Breakdown Pie Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: 'var(--text-secondary)' 
            }}>
              No expense data available for this month
            </div>
          )}
        </div>

        {/* Monthly Income vs Expenses Bar Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Monthly Income vs Expenses</h3>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill="var(--secondary-color)" name="Income" />
                <Bar dataKey="expense" fill="var(--danger-color)" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: 'var(--text-secondary)' 
            }}>
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/add" className="btn btn-primary">
            <FiPlus />
            Add Transaction
          </Link>
          <Link to="/transactions" className="btn btn-outline">
            View All Transactions
          </Link>
          <Link to="/profile" className="btn btn-outline">
            Update Profile
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-container {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
