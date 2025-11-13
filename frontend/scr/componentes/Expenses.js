import React, { useState, useEffect } from 'react';
import { Plus, Download, TrendingDown } from 'lucide-react';
import axios from 'axios';

export default function Expenses() {
  const [showModal, setShowModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('🛍️');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [chartData, setChartData] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const icons = ['🛍️', '✈️', '💡', '🏠', '🚗', '🍔', '🎮', '💊', '📚', '🎬'];

  // Fetch expense data on component mount
  useEffect(() => {
    fetchExpenseData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch categories first
      const categoriesRes = await axios.get('http://127.0.0.1:8000/api/categories/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create category map
      const categoryMap = {};
      categoriesRes.data.forEach(cat => {
        categoryMap[cat.id] = cat;
      });

      // Fetch transactions
      const transactionsRes = await axios.get('http://127.0.0.1:8000/api/transactions/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter only expense transactions
      const expenseTransactions = transactionsRes.data
        .filter(t => {
          const cat = categoryMap[t.category];
          return cat && cat.type === 'expense';
        })
        .map(t => ({
          ...t,
          categoryDetails: categoryMap[t.category]
        }));

      // Sort by date (most recent first)
      expenseTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Process chart data (last 15 days)
      const chartMap = {};
      expenseTransactions.forEach(t => {
        const dateStr = new Date(t.date).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short' 
        });
        chartMap[dateStr] = (chartMap[dateStr] || 0) + parseFloat(t.amount);
      });

      const processedChartData = Object.entries(chartMap)
        .map(([date, amount]) => ({ date, amount }))
        .slice(-15);

      setChartData(processedChartData);
      setAllExpenses(expenseTransactions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching expense data:', err);
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!category || !amount || !date) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      // Create or get the category
      let categoryId;
      try {
        const categoryRes = await axios.post(
          'http://127.0.0.1:8000/api/categories/',
          {
            user: userId,
            name: category,
            type: 'expense',
            icon: selectedIcon
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        categoryId = categoryRes.data.id;
      } catch (err) {
        // If category exists, find it
        const categoriesRes = await axios.get('http://127.0.0.1:8000/api/categories/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const existingCat = categoriesRes.data.find(
          c => c.name === category && c.type === 'expense'
        );
        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          throw err;
        }
      }

      // Create the transaction
      await axios.post(
        'http://127.0.0.1:8000/api/transactions/',
        {
          user: userId,
          category: categoryId,
          amount: parseFloat(amount),
          payment_mode: 'cash',
          description: category,
          date: date
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data
      await fetchExpenseData();
      
      // Close modal and reset
      setShowModal(false);
      setCategory('');
      setAmount('');
      setDate('');
      setSelectedIcon('🛍️');
      
      alert('Expense added successfully!');
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense: ' + (err.response?.data?.detail || err.message));
    }
  };

  const maxAmount = chartData.length > 0 ? Math.max(...chartData.map(d => d.amount)) : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expense Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your spending trends over time and gain insights into where your money goes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            No expense data yet. Add your first expense!
          </div>
        ) : (
          <>
            <div className="h-80 relative">
              <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                {/* Create path for area chart */}
                <path
                  d={`
                    M 0 300
                    ${chartData.map((point, i) => {
                      const x = (i / (chartData.length - 1)) * 800;
                      const y = 300 - ((point.amount / maxAmount) * 280);
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L 800 300
                    Z
                  `}
                  fill="url(#expenseGradient)"
                />
                
                {/* Line on top */}
                <polyline
                  points={chartData.map((point, i) => {
                    const x = (i / (chartData.length - 1)) * 800;
                    const y = 300 - ((point.amount / maxAmount) * 280);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="3"
                />
                
                {/* Points */}
                {chartData.map((point, i) => {
                  const x = (i / (chartData.length - 1)) * 800;
                  const y = 300 - ((point.amount / maxAmount) * 280);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#7c3aed"
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between mt-4 px-2">
              {chartData.map((item, i) => (
                <span key={i} className="text-xs text-gray-600">
                  {item.date}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* All Expenses */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">All Expenses</h2>
          <button 
            onClick={() => {
              const csvHeaders = ['Date', 'Category', 'Amount', 'Payment Mode', 'Description'];
              const csvRows = allExpenses.map(t => [
                t.date,
                t.categoryDetails?.name || t.category_name,
                t.amount,
                t.payment_mode || 'N/A',
                t.description || ''
              ]);
              const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
              ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'expenses.csv';
              link.click();
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            <Download size={18} />
            Download CSV
          </button>
          </div>

        {allExpenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No expenses yet
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {allExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    {expense.categoryDetails?.icon || '💸'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {expense.categoryDetails?.name || expense.category_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  - ${parseFloat(expense.amount).toLocaleString()}
                  <TrendingDown size={18} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Expense</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Icon Picker */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="text-purple-600">🖼️</span>
                  Pick Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition ${
                        selectedIcon === icon
                          ? 'bg-purple-100 ring-2 ring-purple-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Rent, Groceries, etc"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddExpense}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}