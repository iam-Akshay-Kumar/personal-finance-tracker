import React, { useState, useEffect } from 'react';
import { Plus, Download, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

// Import download utility
const downloadTransactionsCSV = (transactions, filename = 'income_transactions.csv') => {
  const headers = ['Date', 'Category', 'Amount', 'Payment Mode', 'Description'];
  const rows = transactions.map(t => [
    t.date,
    t.categoryDetails?.name || t.category_name || 'Unknown',
    t.amount,
    t.payment_mode || 'N/A',
    t.description || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function Income() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState('💼');
  const [incomeSource, setIncomeSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [chartData, setChartData] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [loading, setLoading] = useState(true);

  const icons = ['💼', '🏦', '🛒', '🎨', '💰', '📊', '💳', '🎯'];

  useEffect(() => {
    fetchIncomeData();
  }, []);

  const fetchIncomeData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const categoriesRes = await axios.get('http://127.0.0.1:8000/api/categories/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const categoryMap = {};
      categoriesRes.data.forEach(cat => {
        categoryMap[cat.id] = cat;
      });

      const transactionsRes = await axios.get('http://127.0.0.1:8000/api/transactions/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const incomeTransactions = transactionsRes.data
        .filter(t => {
          const cat = categoryMap[t.category];
          return cat && cat.type === 'income';
        })
        .map(t => ({
          ...t,
          categoryDetails: categoryMap[t.category]
        }));

      // Process chart data
      const chartMap = {};
      incomeTransactions.forEach(t => {
        const dateStr = new Date(t.date).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short' 
        });
        chartMap[dateStr] = (chartMap[dateStr] || 0) + parseFloat(t.amount);
      });

      const processedChartData = Object.entries(chartMap)
        .map(([date, amount]) => ({ date, amount }))
        .slice(-10);

      setChartData(processedChartData);

      // Process income sources
      const sourceMap = {};
      incomeTransactions.forEach(t => {
        const catDetails = t.categoryDetails;
        const catName = catDetails?.name || 'Other';
        if (!sourceMap[catName]) {
          sourceMap[catName] = {
            id: t.category,
            icon: catDetails?.icon || '💰',
            name: catName,
            date: t.date,
            amount: 0,
            transactions: []
          };
        }
        sourceMap[catName].amount += parseFloat(t.amount);
        sourceMap[catName].transactions.push(t);
        if (new Date(t.date) > new Date(sourceMap[catName].date)) {
          sourceMap[catName].date = t.date;
        }
      });

      const sources = Object.values(sourceMap);
      setIncomeSources(sources);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setLoading(false);
    }
  };

  const handleAddIncome = async () => {
    if (!incomeSource || !amount || !date) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      let categoryId;
      try {
        const categoryRes = await axios.post(
          'http://127.0.0.1:8000/api/categories/',
          {
            user: userId,
            name: incomeSource,
            type: 'income',
            icon: selectedIcon
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        categoryId = categoryRes.data.id;
      } catch (err) {
        const categoriesRes = await axios.get('http://127.0.0.1:8000/api/categories/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const existingCat = categoriesRes.data.find(
          c => c.name === incomeSource && c.type === 'income'
        );
        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          throw err;
        }
      }

      await axios.post(
        'http://127.0.0.1:8000/api/transactions/',
        {
          user: userId,
          category: categoryId,
          amount: parseFloat(amount),
          payment_mode: 'cash',
          description: incomeSource,
          date: date
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchIncomeData();
      closeModal();
      alert('Income added successfully!');
    } catch (err) {
      console.error('Error adding income:', err);
      alert('Failed to add income: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditMode(true);
    setEditingTransaction(transaction);
    setIncomeSource(transaction.categoryDetails?.name || '');
    setAmount(transaction.amount);
    setDate(transaction.date);
    setSelectedIcon(transaction.categoryDetails?.icon || '💼');
    setShowModal(true);
  };

  const handleUpdateIncome = async () => {
    if (!amount || !date) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.patch(
        `http://127.0.0.1:8000/api/transactions/${editingTransaction.id}/`,
        {
          amount: parseFloat(amount),
          date: date,
          description: incomeSource
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchIncomeData();
      closeModal();
      alert('Income updated successfully!');
    } catch (err) {
      console.error('Error updating income:', err);
      alert('Failed to update income');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://127.0.0.1:8000/api/transactions/${transactionId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchIncomeData();
      alert('Transaction deleted successfully!');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingTransaction(null);
    setIncomeSource('');
    setAmount('');
    setDate('');
    setSelectedIcon('💼');
  };

  const handleDownload = () => {
    const allTransactions = incomeSources.flatMap(source => source.transactions);
    downloadTransactionsCSV(allTransactions, 'income_transactions.csv');
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
          <h1 className="text-2xl font-bold text-gray-800">Income Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your earnings over time and analyze your income trends.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Income
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            No income data yet. Add your first income!
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between h-80 gap-4">
              {chartData.map((item, index) => {
                const height = (item.amount / maxAmount) * 100;
                const isHighest = item.amount === maxAmount;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-64">
                      <div
                        className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                          isHighest ? 'bg-purple-600' : 'bg-purple-300'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`$${item.amount.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">{item.date}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">0</span>
              <span className="text-sm text-gray-500">{Math.ceil(maxAmount)}</span>
            </div>
          </>
        )}
      </div>

      {/* Income Sources */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Income Sources</h2>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>

        {incomeSources.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No income sources yet
          </div>
        ) : (
          <div className="space-y-3">
            {incomeSources.map((source) => (
              <div key={source.id}>
                <div className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {source.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{source.name}</h3>
                      <p className="text-sm text-gray-500">
                        {source.transactions.length} transaction(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    + ${source.amount.toLocaleString()}
                    <TrendingUp size={18} />
                  </div>
                </div>
                
                {/* Individual Transactions */}
                <div className="ml-16 mt-2 space-y-2">
                  {source.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                    >
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-gray-500">{transaction.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-800">
                          ${parseFloat(transaction.amount).toLocaleString()}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editMode ? 'Edit Income' : 'Add Income'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {!editMode && (
                <>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Income Source
                    </label>
                    <input
                      type="text"
                      placeholder="Freelance, Salary, etc"
                      value={incomeSource}
                      onChange={(e) => setIncomeSource(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}

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

              <button
                onClick={editMode ? handleUpdateIncome : handleAddIncome}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
              >
                {editMode ? 'Update Income' : 'Add Income'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}