import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

export function MonthComparison({ currentMonth, lastMonth }) {
  const incomeChange = currentMonth.income - lastMonth.income;
  const expenseChange = currentMonth.expense - lastMonth.expense;
  const savingsChange = currentMonth.savings - lastMonth.savings;
  
  const incomePercent = lastMonth.income > 0 
    ? ((incomeChange / lastMonth.income) * 100).toFixed(1)
    : 0;
  const expensePercent = lastMonth.expense > 0
    ? ((expenseChange / lastMonth.expense) * 100).toFixed(1)
    : 0;
  const savingsPercent = lastMonth.savings > 0
    ? ((savingsChange / lastMonth.savings) * 100).toFixed(1)
    : 0;

  const StatCard = ({ title, current, change, percent, icon: Icon, positive }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <Icon className="text-gray-400" size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-2">
        ${current.toLocaleString()}
      </div>
      <div className={`flex items-center gap-1 text-sm ${
        positive ? 'text-green-600' : 'text-red-600'
      }`}>
        {positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>
          {change >= 0 ? '+' : ''}${Math.abs(change).toFixed(0)} ({percent}%)
        </span>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Month Comparison (Current vs Last Month)
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Income"
          current={currentMonth.income}
          change={incomeChange}
          percent={incomePercent}
          icon={TrendingUp}
          positive={incomeChange >= 0}
        />
        <StatCard
          title="Expenses"
          current={currentMonth.expense}
          change={expenseChange}
          percent={expensePercent}
          icon={TrendingDown}
          positive={expenseChange < 0}
        />
        <StatCard
          title="Savings"
          current={currentMonth.savings}
          change={savingsChange}
          percent={savingsPercent}
          icon={DollarSign}
          positive={savingsChange >= 0}
        />
      </div>
    </div>
  );
}

// ==========================================
// Spending Breakdown Pie Chart
// ==========================================

export function SpendingBreakdown({ categoryData }) {
  const total = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  
  // Generate colors
  const colors = [
    '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316'
  ];

  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = categoryData.map((cat, index) => {
    const percentage = (cat.amount / total) * 100;
    const angle = (cat.amount / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return {
      ...cat,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle: currentAngle,
      color: colors[index % colors.length]
    };
  });

  // Helper to calculate pie slice path
  const getSlicePath = (startAngle, endAngle) => {
    const start = polarToCartesian(100, 100, 80, endAngle);
    const end = polarToCartesian(100, 100, 80, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', 80, 80, 0, largeArc, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Spending by Category
        </h3>
        <div className="text-center py-12 text-gray-400">
          No expense data to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Spending by Category
      </h3>
      <div className="flex items-center gap-8">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={getSlicePath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="hover:opacity-80 transition cursor-pointer"
              />
            ))}
            {/* Center circle */}
            <circle cx="100" cy="100" r="50" fill="white" />
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-sm fill-gray-600"
            >
              Total
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              className="text-lg font-bold fill-gray-800"
            >
              ${total.toLocaleString()}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 max-h-64 overflow-y-auto">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-gray-700">{segment.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  ${segment.amount.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">
                  {segment.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Income vs Expense Trend (6 months)

export function TrendChart({ monthlyData }) {
  if (monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          6-Month Trend
        </h3>
        <div className="text-center py-12 text-gray-400">
          Not enough data to display trend
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...monthlyData.map(m => Math.max(m.income, m.expense))
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Income vs Expense Trend (Last 6 Months)
      </h3>
      
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={40 * i}
              x2="600"
              y2={40 * i}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Income line (green) */}
          <polyline
            points={monthlyData.map((m, i) => {
              const x = (i / (monthlyData.length - 1)) * 600;
              const y = 200 - ((m.income / maxValue) * 180);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />

          {/* Expense line (red) */}
          <polyline
            points={monthlyData.map((m, i) => {
              const x = (i / (monthlyData.length - 1)) * 600;
              const y = 200 - ((m.expense / maxValue) * 180);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
          />

          {/* Income points */}
          {monthlyData.map((m, i) => {
            const x = (i / (monthlyData.length - 1)) * 600;
            const y = 200 - ((m.income / maxValue) * 180);
            return (
              <circle
                key={`income-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill="#10b981"
              />
            );
          })}

          {/* Expense points */}
          {monthlyData.map((m, i) => {
            const x = (i / (monthlyData.length - 1)) * 600;
            const y = 200 - ((m.expense / maxValue) * 180);
            return (
              <circle
                key={`expense-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill="#ef4444"
              />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4">
        {monthlyData.map((m, i) => (
          <span key={i} className="text-xs text-gray-600">
            {m.month}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">Expenses</span>
        </div>
      </div>
    </div>
  );
}

// Financial Health Score

export function FinancialHealthScore({ score, metrics }) {
  const getScoreColor = (score) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Excellent' };
    if (score >= 60) return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Good' };
    if (score >= 40) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Fair' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Needs Attention' };
  };

  const scoreStyle = getScoreColor(score);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Financial Health Score
      </h3>
      
      <div className="flex items-center gap-8">
        {/* Score Circle */}
        <div className="relative w-32 h-32 flex-shrink-0">
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
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
              className={scoreStyle.color}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${scoreStyle.color}`}>
              {score}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-3">
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${scoreStyle.bg} ${scoreStyle.color}`}>
            {scoreStyle.label}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Savings Rate</span>
              <span className="font-medium">{metrics.savingsRate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget Adherence</span>
              <span className="font-medium">{metrics.budgetAdherence}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Goal Progress</span>
              <span className="font-medium">{metrics.goalProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Spending Categories

export function TopSpendingCategories({ categories }) {
  const sortedCategories = [...categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const maxAmount = sortedCategories[0]?.amount || 1;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Top 5 Spending Categories
      </h3>
      
      {sortedCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No spending data yet
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((cat, index) => {
            const percentage = (cat.amount / maxAmount) * 100;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    ${cat.amount.toFixed(0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}