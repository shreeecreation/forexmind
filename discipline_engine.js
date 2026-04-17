/**
 * ForexMind Discipline Analysis Engine (STRICT VERSION)
 * 
 * Implements aggressive penalties for critical trading failures:
 * - No Stop-Loss (Critical)
 * - Revenge Trading (High)
 * - Overtrading (Medium)
 * - Early Exits (Medium)
 */

const DisciplineEngine = {
    
    analyze: function(trades, userProfile = { accountEquity: 10000, maxRiskPerTrade: 2 }) {
        if (!trades || trades.length === 0) return null;

        const sortedTrades = [...trades].sort((a, b) => new Date(a.closeTime) - new Date(b.closeTime));
        
        // Calculate Pillar Scores
        const risk = this.calculateRiskScore(sortedTrades, userProfile);
        const emotional = this.calculateEmotionalScore(sortedTrades);
        const patience = this.calculatePatienceScore(sortedTrades);
        const consistency = this.calculateConsistencyScore(sortedTrades);

        // STRICT WEIGHTING
        // Risk is the foundation. If Risk is failed, the whole score should suffer.
        let finalScore = (risk.score * 0.5) + (emotional.score * 0.25) + (patience.score * 0.15) + (consistency.score * 0.10);

        // CRITICAL PENALTY OVERRIDE
        // If more than 20% of trades have no SL, the score cannot exceed 40
        if (risk.noSLCount / trades.length > 0.20) {
            finalScore = Math.min(finalScore, 40);
        }

        return {
            finalScore: Math.round(finalScore),
            pillars: { risk, emotional, patience, consistency },
            insights: this.generateInsights(risk, emotional, patience, consistency),
            stats: {
                noSL: risk.noSLCount,
                revenge: emotional.revengeTrades,
                earlyExits: consistency.earlyExits,
                overtradingDays: patience.overtradingDays
            }
        };
    },

    /**
     * RISK DISCIPLINE (STRICT)
     * Penalty: -10 points for EVERY trade without a Stop Loss.
     */
    calculateRiskScore: function(trades, profile) {
        let noSLCount = 0;
        let riskViolations = 0;
        
        trades.forEach(t => {
            // Check for No Stop Loss
            if (!t.stopLoss || t.stopLoss === 0) noSLCount++;
            
            // Check for Risk % Violation
            const riskAmt = t.riskAmount || (Math.abs(t.openPrice - (t.stopLoss || t.openPrice)) * t.lotSize * 10);
            const riskPct = (riskAmt / profile.accountEquity) * 100;
            if (riskPct > profile.maxRiskPerTrade * 1.1) riskViolations++;
        });

        let score = 100;
        score -= (noSLCount * 10); // Massive penalty for no SL
        score -= (riskViolations * 5); // Penalty for over-risking

        return {
            score: Math.max(0, Math.round(score)),
            noSLCount,
            riskViolations
        };
    },

    /**
     * EMOTIONAL CONTROL (STRICT)
     * Penalty: -15 points for every Revenge Trade.
     */
    calculateEmotionalScore: function(trades) {
        let revengeTrades = 0;
        let lotSpikes = 0;
        
        for (let i = 1; i < trades.length; i++) {
            const prev = trades[i-1];
            const curr = trades[i];
            
            if (prev.profit < 0) {
                const timeDiff = (new Date(curr.openTime) - new Date(prev.closeTime)) / (1000 * 60);
                if (timeDiff < 15) revengeTrades++; // Strict 15 min rule
                if (curr.lotSize > prev.lotSize * 1.1) lotSpikes++;
            }
        }

        let score = 100;
        score -= (revengeTrades * 15);
        score -= (lotSpikes * 10);

        return {
            score: Math.max(0, Math.round(score)),
            revengeTrades,
            lotSpikes
        };
    },

    /**
     * PATIENCE (STRICT)
     * Focus: Daily trade limits.
     */
    calculatePatienceScore: function(trades) {
        const tradesPerDay = {};
        trades.forEach(t => {
            const date = (t.openTime || '').substring(0, 10);
            tradesPerDay[date] = (tradesPerDay[date] || 0) + 1;
        });

        let overtradingDays = 0;
        const limit = 3; // Strict limit of 3 trades per day
        Object.values(tradesPerDay).forEach(count => {
            if (count > limit) overtradingDays++;
        });

        let score = 100;
        score -= (overtradingDays * 20);

        return {
            score: Math.max(0, Math.round(score)),
            overtradingDays
        };
    },

    /**
     * CONSISTENCY (STRICT)
     * Focus: Early Exits.
     */
    calculateConsistencyScore: function(trades) {
        const winners = trades.filter(t => t.profit > 0);
        if (winners.length === 0) return { score: 50, earlyExits: 0 };

        const avgWin = winners.reduce((s, t) => s + t.profit, 0) / winners.length;
        
        // Early Exit: Winner < 30% of average winner
        let earlyExits = 0;
        winners.forEach(t => {
            if (t.profit < avgWin * 0.3) earlyExits++;
        });

        let score = 100;
        score -= (earlyExits * 10);

        return {
            score: Math.max(0, Math.round(score)),
            earlyExits
        };
    },

    generateInsights: function(risk, emotional, patience, consistency) {
        const insights = [];
        if (risk.noSLCount > 0) insights.push(`🚨 CRITICAL: ${risk.noSLCount} trades had NO Stop Loss. This is account suicide.`);
        if (emotional.revengeTrades > 0) insights.push(`😡 Revenge: ${emotional.revengeTrades} trades taken in frustration. Walk away after losses.`);
        if (patience.overtradingDays > 0) insights.push(`📉 Overtrading: You exceeded your daily limit on ${patience.overtradingDays} days.`);
        if (consistency.earlyExits > 0) insights.push(`🏃 Early Exits: You cut ${consistency.earlyExits} winners too soon. Trust your targets.`);
        return insights;
    }
};
