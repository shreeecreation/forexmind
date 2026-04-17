/**
 * Advanced Performance Metrics for ForexMind Trading Journal
 * 
 * This script provides functions to calculate sophisticated trading metrics:
 * - Sharpe Ratio
 * - Sortino Ratio
 * - Maximum Drawdown
 * - Profit Factor
 * - Expectancy
 * - R-multiple Analysis
 */

const AdvancedMetrics = {
  /**
   * Calculates the Profit Factor: Gross Profit / Gross Loss
   */
  calculateProfitFactor: function(trades) {
    let grossProfit = 0;
    let grossLoss = 0;
    
    trades.forEach(t => {
      const p = t.profit || 0;
      if (p > 0) grossProfit += p;
      else grossLoss += Math.abs(p);
    });
    
    return grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : (grossProfit / grossLoss);
  },

  /**
   * Calculates the Expectancy: (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
   */
  calculateExpectancy: function(trades) {
    if (trades.length === 0) return 0;
    
    const winners = trades.filter(t => t.profit > 0);
    const losers = trades.filter(t => t.profit <= 0);
    
    const winRate = winners.length / trades.length;
    const lossRate = losers.length / trades.length;
    
    const avgWin = winners.length ? (winners.reduce((s, t) => s + t.profit, 0) / winners.length) : 0;
    const avgLoss = losers.length ? (Math.abs(losers.reduce((s, t) => s + t.profit, 0)) / losers.length) : 0;
    
    return (winRate * avgWin) - (lossRate * avgLoss);
  },

  /**
   * Calculates Maximum Drawdown (MDD)
   */
  calculateMaxDrawdown: function(trades, initialEquity = 10000) {
    if (trades.length === 0) return 0;
    
    let currentEquity = initialEquity;
    let peak = initialEquity;
    let maxDD = 0;
    
    // Sort trades by close time to simulate equity curve
    const sortedTrades = [...trades].sort((a, b) => new Date(a.closeTime) - new Date(b.closeTime));
    
    sortedTrades.forEach(t => {
      currentEquity += (t.profit || 0);
      if (currentEquity > peak) {
        peak = currentEquity;
      }
      const dd = peak - currentEquity;
      if (dd > maxDD) {
        maxDD = dd;
      }
    });
    
    return maxDD; // Returns absolute value. For percentage: (maxDD / peak) * 100
  },

  /**
   * Calculates Sharpe Ratio (simplified for daily/trade-based returns)
   * Formula: (Avg Return - Risk Free Rate) / StdDev of Returns
   */
  calculateSharpeRatio: function(trades, riskFreeRate = 0) {
    if (trades.length < 2) return 0;
    
    const returns = trades.map(t => t.profit || 0);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    const variance = returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    return (avgReturn - riskFreeRate) / stdDev;
  },

  /**
   * Calculates Sortino Ratio
   * Formula: (Avg Return - Risk Free Rate) / Downside Deviation
   */
  calculateSortinoRatio: function(trades, riskFreeRate = 0) {
    if (trades.length < 2) return 0;
    
    const returns = trades.map(t => t.profit || 0);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    const negativeReturns = returns.filter(r => r < 0);
    if (negativeReturns.length === 0) return Infinity;
    
    const downsideVariance = negativeReturns.reduce((s, r) => s + Math.pow(r, 2), 0) / returns.length;
    const downsideDev = Math.sqrt(downsideVariance);
    
    if (downsideDev === 0) return 0;
    return (avgReturn - riskFreeRate) / downsideDev;
  },

  /**
   * Calculates R-Multiple for each trade
   * Requires 'risk' or 'stopLoss' data in trade object
   */
  calculateRMultiples: function(trades) {
    return trades.map(t => {
      // Assuming 'riskAmount' is stored or can be calculated from entry/stop
      let risk = t.riskAmount;
      
      if (!risk && t.openPrice && t.stopLoss) {
        const pips = Math.abs(t.openPrice - t.stopLoss);
        risk = pips * (t.lotSize || 0) * 10; // Simplified pip value calculation
      }
      
      const rMultiple = risk ? (t.profit / risk) : null;
      return {
        ...t,
        rMultiple: rMultiple ? parseFloat(rMultiple.toFixed(2)) : 'N/A'
      };
    });
  }
};

// Example usage in renderDashboard:
// const pf = AdvancedMetrics.calculateProfitFactor(trades);
// const expectancy = AdvancedMetrics.calculateExpectancy(trades);
// const mdd = AdvancedMetrics.calculateMaxDrawdown(trades, appState.userProfile?.accountEquity);
