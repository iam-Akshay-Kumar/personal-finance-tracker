import React, { useState, useEffect } from 'react';
import { Plus, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch budgets
      const budgetsRes = await axios.get('http://127.0.0.1:8000/api/budgets/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch categories (expense only)
      const categoriesRes = await axios.get('http://127.0.0.1:8000/api/categories/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch transactions to calculate spent amounts
      const transactionsRes = await axios.get('http://127.0.0.1:8000/api/transactions/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const expenseCategories = categoriesRes.data.filter(cat => cat.type === 'expense');
      
      // Calculate spent amount for each budget
      const budgetsWithSpent = budgetsRes.data.map(budget => {
        const budgetMonth = new Date(budget.month);
        const spent = transactionsRes.data
          .filter(t => {
            const tDate = new Date(t.date);
            return t.category === budget.category &&
                   tDate.getMonth() === budgetMonth.getMonth() &&
                   tDate.getFullYear() === budgetMonth.getFullYear();
          })
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        return { ...budget, spent };
      });

      setBudgets(budgetsWithSpent);
      setCategories(expenseCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!selectedCategory || !budgetAmount || !selectedMonth) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      await axios.post(
        'http://127.0.0.1:8000/api/budgets/',
        {
          user: userId,
          category: selectedCategory,
          amount: parseFloat(budgetAmount),
          month: selectedMonth + '-01' // First day of month
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchData();
      setShowModal(false);
      setSelectedCategory('');
      setBudgetAmount('');
      setSelectedMonth('');
      alert('Budget added successfully!');
    } catch (err) {
      console.error('Error adding budget:', err);
      alert('Failed to add budget: ' + (err.response?.data?.detail || err.message));
    }
  };

  const getBudgetStatus = (budget) => {
    const percentage = (budget.spent / parseFloat(budget.amount)) * 100;
    if (percentage >= 100) return { color: 'red', status: 'Over Budget', icon: AlertCircle };
    if (percentage >= 80) return { color: 'orange', status: 'Warning', icon: AlertCircle };
    return { color: 'green', status: 'On Track', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set and track monthly budgets for different expense categories
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Budget
        </button>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <TrendingDown className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Budgets Yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first monthly budget</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const percentage = Math.min(100, (budget.spent / parseFloat(budget.amount)) * 100);
            const StatusIcon = status.icon;

            return (
              <div key={budget.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{budget.category_name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(budget.month).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-${status.color}-600`}>
                    <StatusIcon size={20} />
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-bold text-gray-800">
                      ${budget.spent.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      of ${parseFloat(budget.amount).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        percentage >= 100 ? 'bg-red-500' :
                        percentage >= 80 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className={`text-${status.color}-600 font-medium`}>
                    {status.status}
                  </span>
                  <span className="text-gray-500">
                    {percentage.toFixed(0)}% used
                  </span>
                </div>

                {/* Remaining */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-semibold ${
                      parseFloat(budget.amount) - budget.spent < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${Math.abs(parseFloat(budget.amount) - budget.spent).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Budget</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleAddBudget}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
              >
                Add Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}