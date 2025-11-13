import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import new analytics components
import {
  MonthComparison,
  SpendingBreakdown,
  TrendChart,
  FinancialHealthScore,
  TopSpendingCategories
} from './AnalyticsSection';

// Import utility function
import { processAnalyticsData } from '../utils/analyticsUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // New analytics data state
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch all data
      const [categoriesRes, transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/categories/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/api/transactions/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/api/budgets/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/api/goals/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const categoryMap = {};
      categoriesRes.data.forEach(cat => {
        categoryMap[cat.id] = cat;
      });

      // Calculate totals (existing code)
      let income = 0;
      let expenses = 0;

      const allTransactions = transactionsRes.data.map(t => {
        const cat = categoryMap[t.category];
        const amount = parseFloat(t.amount);

        if (cat?.type === 'income') {
          income += amount;
        } else if (cat?.type === 'expense') {
          expenses += amount;
        }

        return {
          ...t,
          categoryDetails: cat
        };
      });

      const recent = allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setTotalIncome(income);
      setTotalExpenses(expenses);
      setTotalBalance(income - expenses);
      setRecentTransactions(recent);

      // Process analytics data
      const analytics = processAnalyticsData(
        transactionsRes.data,
        categoriesRes.data,
        budgetsRes.data,
        goalsRes.data
      );
      setAnalyticsData(analytics);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const balancePercent = totalIncome + totalExpenses > 0 
    ? (totalBalance / (totalIncome + totalExpenses)) * 100 
    : 0;
  const incomePercent = totalIncome + totalExpenses > 0
    ? (totalIncome / (totalIncome + totalExpenses)) * 100
    : 0;
  const expensePercent = totalIncome + totalExpenses > 0
    ? (totalExpenses / (totalIncome + totalExpenses)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Cards - KEEP EXISTING */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Total Balance Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <Wallet className="text-purple-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Balance</p>
              <h2 className="text-3xl font-bold text-gray-800">
                ${totalBalance.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Income</p>
              <h2 className="text-3xl font-bold text-gray-800">
                ${totalIncome.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="text-red-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
              <h2 className="text-3xl font-bold text-gray-800">
                ${totalExpenses.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Analytics Section - ADD THIS */}
      {analyticsData && (
        <>
          {/* Month Comparison */}
          <MonthComparison
            currentMonth={analyticsData.monthComparison.currentMonth}
            lastMonth={analyticsData.monthComparison.lastMonth}
          />

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Financial Health Score */}
            <FinancialHealthScore
              score={analyticsData.healthScore}
              metrics={analyticsData.metrics}
            />

            {/* Top Spending Categories */}
            <TopSpendingCategories categories={analyticsData.topCategories} />
          </div>

          {/* Trend Chart - Full Width */}
          <div className="mb-8">
            <TrendChart monthlyData={analyticsData.monthlyData} />
          </div>

          {/* Spending Breakdown */}
          <div className="mb-8">
            <SpendingBreakdown categoryData={analyticsData.categoryData} />
          </div>
        </>
      )}

      {/* ============================================ */}
      {/* KEEP EXISTING: Recent Transactions & Donut Chart */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <button
              onClick={() => navigate('/expenses')}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
            >
              See All
              <ArrowRight size={16} />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.categoryDetails?.type === 'income';
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                        {transaction.categoryDetails?.icon || '💰'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {transaction.categoryDetails?.name || transaction.category_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isIncome ? '+' : '-'} ${parseFloat(transaction.amount).toLocaleString()}
                      {isIncome ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Overview - Donut Chart (KEEP EXISTING) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Financial Overview</h2>

          <div className="flex items-center justify-center mb-8">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="40"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="40"
                  strokeDasharray={`${(balancePercent / 100) * 502.65} 502.65`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="40"
                  strokeDasharray={`${(incomePercent / 100) * 502.65} 502.65`}
                  strokeDashoffset={`-${(balancePercent / 100) * 502.65}`}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="40"
                  strokeDasharray={`${(expensePercent / 100) * 502.65} 502.65`}
                  strokeDashoffset={`-${((balancePercent + incomePercent) / 100) * 502.65}`}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${totalBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-sm text-gray-600">Total Balance</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                ${totalBalance.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Total Expenses</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                ${totalExpenses.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600">Total Income</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                ${totalIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}