// src/utils/analyticsUtils.js

export const processAnalyticsData = (transactions, categories, budgets, goals) => {
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat;
    });
  
    // Add category details to transactions
    const enrichedTransactions = transactions.map(t => ({
      ...t,
      categoryDetails: categoryMap[t.category]
    }));
  
    // Separate income and expenses
    const incomeTransactions = enrichedTransactions.filter(
      t => t.categoryDetails?.type === 'income'
    );
    const expenseTransactions = enrichedTransactions.filter(
      t => t.categoryDetails?.type === 'expense'
    );
  
    // Calculate current month data
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
    const currentMonthIncome = incomeTransactions
      .filter(t => new Date(t.date) >= currentMonthStart)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
    const currentMonthExpense = expenseTransactions
      .filter(t => new Date(t.date) >= currentMonthStart)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
    const lastMonthIncome = incomeTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
    const lastMonthExpense = expenseTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
    // Month comparison data
    const monthComparison = {
      currentMonth: {
        income: currentMonthIncome,
        expense: currentMonthExpense,
        savings: currentMonthIncome - currentMonthExpense
      },
      lastMonth: {
        income: lastMonthIncome,
        expense: lastMonthExpense,
        savings: lastMonthIncome - lastMonthExpense
      }
    };
  
    // Category breakdown (expenses only)
    const categoryBreakdown = {};
    expenseTransactions.forEach(t => {
      const catName = t.categoryDetails?.name || 'Other';
      const catIcon = t.categoryDetails?.icon || '💸';
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = {
          name: catName,
          icon: catIcon,
          amount: 0
        };
      }
      categoryBreakdown[catName].amount += parseFloat(t.amount);
    });
  
    const categoryData = Object.values(categoryBreakdown);
  
    // 6-month trend data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
  
      const monthIncome = incomeTransactions
        .filter(t => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
      const monthExpense = expenseTransactions
        .filter(t => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expense: monthExpense
      });
    }
  
    // Financial health score calculation
    const savingsRate = currentMonthIncome > 0 
      ? ((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100 
      : 0;
  
    // Budget adherence
    let budgetAdherence = 100;
    if (budgets.length > 0) {
      const overBudgetCount = budgets.filter(b => {
        const spent = expenseTransactions
          .filter(t => {
            const tDate = new Date(t.date);
            const bDate = new Date(b.month);
            return t.category === b.category &&
                   tDate.getMonth() === bDate.getMonth() &&
                   tDate.getFullYear() === bDate.getFullYear();
          })
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return spent > parseFloat(b.amount);
      }).length;
      budgetAdherence = Math.max(0, 100 - (overBudgetCount / budgets.length) * 100);
    }
  
    // Goal progress
    let goalProgress = 0;
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, g) => {
        const progress = (parseFloat(g.current_amount) / parseFloat(g.target_amount)) * 100;
        return sum + Math.min(100, progress);
      }, 0) / goals.length;
      goalProgress = avgProgress;
    }
  
    // Overall health score (weighted average)
    const healthScore = Math.round(
      (savingsRate * 0.4) + 
      (budgetAdherence * 0.3) + 
      (goalProgress * 0.3)
    );
  
    return {
      monthComparison,
      categoryData,
      monthlyData,
      healthScore: Math.min(100, Math.max(0, healthScore)),
      metrics: {
        savingsRate: savingsRate.toFixed(1),
        budgetAdherence: budgetAdherence.toFixed(1),
        goalProgress: goalProgress.toFixed(1)
      },
      topCategories: categoryData
    };
  };