/**
 * UI Integration for the Global Discipline Leaderboard
 */

const LeaderboardUI = {
    /**
     * Renders the leaderboard section.
     * @param {Array} topTraders - List of top traders from LeaderboardManager.
     */
    renderLeaderboard: function(topTraders) {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;

        if (!topTraders || topTraders.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding:40px; text-align:center;">
                    <div style="font-size:48px; margin-bottom:16px;">🏆</div>
                    <div style="font-size:16px; font-weight:600; color:var(--text);">No rankings yet</div>
                    <div style="font-size:13px; color:var(--text3);">Be the first to share your discipline score!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-wrap" style="border:none; background:transparent;">
                <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
                    <thead>
                        <tr style="background:transparent;">
                            <th style="width:60px; text-align:center; background:transparent; border:none;">Rank</th>
                            <th style="background:transparent; border:none;">Trader</th>
                            <th style="text-align:center; background:transparent; border:none;">Score</th>
                            <th style="text-align:right; background:transparent; border:none;">Trades</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topTraders.map((trader, index) => this.renderTraderRow(trader, index + 1)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderTraderRow: function(trader, rank) {
        const isCurrentUser = firebase.auth().currentUser?.uid === trader.uid;
        const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--text3)';
        const avatar = trader.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(trader.displayName)}&background=random`;

        return `
            <tr style="background:${isCurrentUser ? 'rgba(20,184,166,0.1)' : 'var(--surface)'}; border-radius:var(--radius);">
                <td style="text-align:center; padding:12px; border-radius:var(--radius) 0 0 var(--radius);">
                    <span style="font-weight:700; color:${rankColor}; font-size:16px;">#${rank}</span>
                </td>
                <td style="padding:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${avatar}" style="width:32px; height:32px; border-radius:50%; border:2px solid ${isCurrentUser ? 'var(--accent)' : 'var(--border)'};" />
                        <div>
                            <div style="font-weight:600; color:var(--text); font-size:14px;">${trader.displayName} ${isCurrentUser ? '<span class="badge badge-gold" style="font-size:9px; padding:2px 6px; margin-left:4px;">YOU</span>' : ''}</div>
                            <div style="font-size:11px; color:var(--text3);">Updated ${this.formatTime(trader.updatedAt)}</div>
                        </div>
                    </div>
                </td>
                <td style="text-align:center; padding:12px;">
                    <div style="font-weight:700; color:${this.getScoreColor(trader.score)}; font-size:18px; font-family:'Space Grotesk';">${trader.score}</div>
                </td>
                <td style="text-align:right; padding:12px; border-radius:0 var(--radius) var(--radius) 0;">
                    <div style="font-size:12px; color:var(--text2);">${trader.tradeCount} trades</div>
                </td>
            </tr>
        `;
    },

    formatTime: function(timestamp) {
        if (!timestamp) return 'recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    },

    getScoreColor: function(score) {
        if (score >= 85) return 'var(--green)';
        if (score >= 70) return 'var(--amber)';
        return 'var(--red)';
    }
};
