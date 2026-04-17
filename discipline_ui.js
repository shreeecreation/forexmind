/**
 * UI Integration for Strict Discipline Analysis
 */

const DisciplineUI = {
    renderDisciplineDashboard: function(analysis) {
        if (!analysis) return;

        const container = document.getElementById('discipline-analysis-content');
        if (!container) return;

        container.innerHTML = `
            <div class="discipline-header" style="text-align:center; margin-bottom:30px; padding:20px; background:var(--bg2); border-radius:var(--radius-lg);">
                <div style="font-size:14px; color:var(--text3); text-transform:uppercase; letter-spacing:1px;">Strict Discipline Score</div>
                <div style="font-size:72px; font-weight:700; color:${this.getScoreColor(analysis.finalScore)}; font-family:'Space Grotesk'; line-height:1;">${analysis.finalScore}</div>
                <div class="badge ${this.getScoreBadgeClass(analysis.finalScore)}" style="margin-top:10px; padding:6px 16px; font-size:14px;">${this.getScoreLabel(analysis.finalScore)}</div>
            </div>

            <div class="critical-alerts" style="margin-bottom:24px;">
                ${analysis.stats.noSL > 0 ? `
                    <div style="background:rgba(239,68,68,0.1); border:1px solid var(--red); color:var(--red); padding:12px; border-radius:var(--radius); margin-bottom:10px; display:flex; align-items:center; gap:12px;">
                        <span style="font-size:20px;">🚫</span>
                        <div><strong>CRITICAL:</strong> ${analysis.stats.noSL} trades with No Stop-Loss detected.</div>
                    </div>
                ` : ''}
            </div>

            <div class="kpi-grid" style="grid-template-columns: repeat(2, 1fr); gap:16px; margin-bottom:24px;">
                ${this.renderPillarCard('Risk (SL & Size)', analysis.pillars.risk)}
                ${this.renderPillarCard('Emotional (Revenge)', analysis.pillars.emotional)}
                ${this.renderPillarCard('Patience (Overtrading)', analysis.pillars.patience)}
                ${this.renderPillarCard('Consistency (Exits)', analysis.pillars.consistency)}
            </div>

            <div class="card" style="background:var(--bg3); border-left:4px solid var(--accent);">
                <div class="card-title" style="font-size:14px; margin-bottom:10px;">📋 Actionable Feedback</div>
                <ul style="margin:0; padding-left:20px; color:var(--text2); font-size:13px; line-height:1.8;">
                    ${analysis.insights.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
        `;
    },

    renderPillarCard: function(title, pillar) {
        const color = this.getScoreColor(pillar.score);
        return `
            <div class="card-sm" style="background:var(--surface2); border:1px solid var(--border);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div style="font-size:12px; font-weight:600; color:var(--text2);">${title}</div>
                    <div style="font-weight:700; color:${color};">${pillar.score}%</div>
                </div>
                <div class="progress-track" style="height:6px; background:var(--bg); border-radius:3px; overflow:hidden;">
                    <div class="progress-fill" style="width:${pillar.score}%; background:${color}; height:100%;"></div>
                </div>
                <div style="margin-top:10px; font-size:11px; color:var(--text3); display:flex; flex-direction:column; gap:4px;">
                    ${this.getPillarDetails(title, pillar)}
                </div>
            </div>
        `;
    },

    getPillarDetails: function(title, pillar) {
        if (title.includes('Risk')) return `<span>• No SL Trades: <strong>${pillar.noSLCount}</strong></span><span>• Risk Violations: <strong>${pillar.riskViolations}</strong></span>`;
        if (title.includes('Emotional')) return `<span>• Revenge Trades: <strong>${pillar.revengeTrades}</strong></span><span>• Lot Spikes: <strong>${pillar.lotSpikes}</strong></span>`;
        if (title.includes('Patience')) return `<span>• Overtrading Days: <strong>${pillar.overtradingDays}</strong></span>`;
        if (title.includes('Consistency')) return `<span>• Early Exits: <strong>${pillar.earlyExits}</strong></span>`;
        return '';
    },

    getScoreColor: function(score) {
        if (score >= 85) return '#22c55e'; // Green
        if (score >= 70) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    },

    getScoreBadgeClass: function(score) {
        if (score >= 85) return 'badge-green';
        if (score >= 70) return 'badge-amber';
        return 'badge-red';
    },

    getScoreLabel: function(score) {
        if (score >= 95) return 'Market Master';
        if (score >= 85) return 'Disciplined Pro';
        if (score >= 70) return 'Average Trader';
        if (score >= 50) return 'High Risk';
        return 'Account at Risk';
    }
};
