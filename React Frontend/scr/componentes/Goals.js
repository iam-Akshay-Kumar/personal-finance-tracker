import React, { useState, useEffect } from 'react';
import { Plus, Target, DollarSign, Calendar, TrendingUp, X } from 'lucide-react';
import axios from 'axios';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add goal form
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Update goal form
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const goalsRes = await axios.get('http://127.0.0.1:8000/api/goals/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(goalsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!title || !targetAmount) {
      alert('Please fill required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      await axios.post(
        'http://127.0.0.1:8000/api/goals/',
        {
          user: userId,
          title,
          target_amount: parseFloat(targetAmount),
          current_amount: currentAmount ? parseFloat(currentAmount) : 0,
          target_date: targetDate || null,
          is_active: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchGoals();
      setShowAddModal(false);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      alert('Goal added successfully!');
    } catch (err) {
      console.error('Error adding goal:', err);
      alert('Failed to add goal');
    }
  };

  const handleUpdateProgress = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newAmount = parseFloat(selectedGoal.current_amount) + parseFloat(addAmount);

      await axios.patch(
        `http://127.0.0.1:8000/api/goals/${selectedGoal.id}/`,
        {
          current_amount: newAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchGoals();
      setShowUpdateModal(false);
      setSelectedGoal(null);
      setAddAmount('');
      alert('Progress updated!');
    } catch (err) {
      console.error('Error updating goal:', err);
      alert('Failed to update progress');
    }
  };

  const handleToggleActive = async (goal) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://127.0.0.1:8000/api/goals/${goal.id}/`,
        {
          is_active: !goal.is_active
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchGoals();
    } catch (err) {
      console.error('Error toggling goal:', err);
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-blue-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-purple-500';
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
          <h1 className="text-2xl font-bold text-gray-800">Financial Goals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set and track your savings goals
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Target className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Goals Yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first financial goal</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = parseFloat(goal.progress_percent || 0);
            const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);
            const isCompleted = progress >= 100;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition ${
                  !goal.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{goal.title}</h3>
                    {goal.target_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        {new Date(goal.target_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleActive(goal)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      goal.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {goal.is_active ? 'Active' : 'Paused'}
                  </button>
                </div>

                {/* Progress Circle */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                        className={isCompleted ? 'text-green-500' : 'text-purple-500'}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {progress.toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">Complete</span>
                    </div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current</span>
                    <span className="font-semibold text-gray-800">
                      ${parseFloat(goal.current_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target</span>
                    <span className="font-semibold text-gray-800">
                      ${parseFloat(goal.target_amount).toLocaleString()}
                    </span>
                  </div>
                  {!isCompleted && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold text-purple-600">
                        ${remaining.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {goal.is_active && !isCompleted && (
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowUpdateModal(true);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={16} />
                    Add Progress
                  </button>
                )}
                {isCompleted && (
                  <div className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-medium text-center">
                    🎉 Goal Achieved!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create New Goal</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Vacation Fund, New Car"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <button
                onClick={handleAddGoal}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Update Progress</h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedGoal(null);
                  setAddAmount('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">{selectedGoal.title}</h3>
              <p className="text-sm text-gray-600">
                Current: ${parseFloat(selectedGoal.current_amount).toLocaleString()} / ${parseFloat(selectedGoal.target_amount).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <button
                onClick={handleUpdateProgress}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}