/**
 * ForexMind Manual Journal UI v2
 * 
 * Features:
 * - Compact Gallery View for images
 * - Journal Analytics Dashboard
 * - Trade Outcome (TP/SL/Profit)
 * - Close Trade functionality
 */

const ManualJournalUI = {
    renderManualJournalPage: async function() {
        const container = document.getElementById('manual-journal-content');
        if (!container) return;

        const entries = await ManualJournalManager.getEntries();
        const stats = this.calculateJournalStats(entries);

        container.innerHTML = `
            <!-- Journal Analytics Dashboard -->
            <div class="kpi-grid" style="grid-template-columns: repeat(4, 1fr); gap:14px; margin-bottom:24px;">
                <div class="kpi-card"><div class="kpi-label">Journal Win Rate</div><div class="kpi-value kpi-pos">${stats.winRate}%</div><div class="kpi-change kpi-neu">${stats.closedCount} closed trades</div></div>
                <div class="kpi-card"><div class="kpi-label">Total Journal P&L</div><div class="kpi-value ${stats.totalProfit >= 0 ? 'kpi-pos' : 'kpi-neg'}">$${stats.totalProfit.toFixed(2)}</div><div class="kpi-change kpi-neu">Manual entries only</div></div>
                <div class="kpi-card"><div class="kpi-label">Best Strategy</div><div class="kpi-value" style="font-size:18px;">${stats.bestStrategy}</div><div class="kpi-change kpi-neu">Highest win rate</div></div>
                <div class="kpi-card"><div class="kpi-label">Mindset Impact</div><div class="kpi-value" style="font-size:18px;">${stats.bestMindset}</div><div class="kpi-change kpi-neu">Your most profitable mood</div></div>
            </div>

            <div class="row">
                <div class="col" style="flex:1;">
                    <div class="card" style="border-top:4px solid var(--accent); position:sticky; top:80px;">
                        <div class="card-title" style="margin-bottom:16px;">📓 New Journal Entry</div>
                        
                        <div class="form-group">
                            <label class="form-label">Symbol</label>
                            <input type="text" id="mj-symbol" class="form-input" placeholder="EURUSD"/>
                        </div>
                        
                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label class="form-label">Type</label>
                                <select id="mj-type" class="form-input">
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label class="form-label">Lot Size</label>
                                <input type="number" id="mj-lot" class="form-input" step="0.01" placeholder="0.10"/>
                            </div>
                        </div>
                        
                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label class="form-label">Entry Price</label>
                                <input type="number" id="mj-entry" class="form-input" step="0.00001" placeholder="1.08500"/>
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label class="form-label">Stop Loss</label>
                                <input type="number" id="mj-sl" class="form-input" step="0.00001" placeholder="1.08200"/>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Take Profit (Target)</label>
                            <input type="number" id="mj-tp" class="form-input" step="0.00001" placeholder="1.09000"/>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Strategy Used</label>
                            <select id="mj-strategy" class="form-input">
                                <option value="Breakout">Breakout</option>
                                <option value="Retest">Retest</option>
                                <option value="Trend Following">Trend Following</option>
                                <option value="Scalping">Scalping</option>
                                <option value="News Trading">News Trading</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Mindset</label>
                            <select id="mj-mindset" class="form-input">
                                <option value="Calm & Focused">Calm & Focused</option>
                                <option value="Excited / Greedy">Excited / Greedy</option>
                                <option value="Anxious / Fearful">Anxious / Fearful</option>
                                <option value="Tired / Bored">Tired / Bored</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Chart Screenshot</label>
                            <input type="file" id="mj-screenshot" class="form-input" accept="image/*" style="padding:8px;"/>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Trade Notes</label>
                            <textarea id="mj-notes" class="form-input" style="min-height:80px; resize:vertical;" placeholder="Why am I taking this trade?"></textarea>
                        </div>
                        
                        <button class="btn btn-primary btn-full" onclick="ManualJournalUI.submitEntry()">Save Journal Entry</button>
                    </div>
                </div>
                
                <div class="col" style="flex:2;">
                    <div class="card">
                        <div class="card-title" style="margin-bottom:16px;">📜 Journal Feed</div>
                        <div id="mj-feed-container">
                            ${entries.length === 0 ? `
                                <div class="empty-state" style="padding:40px; text-align:center;">
                                    <div style="font-size:48px; margin-bottom:16px;">📓</div>
                                    <div style="font-size:16px; font-weight:600; color:var(--text);">No journal entries yet</div>
                                    <div style="font-size:13px; color:var(--text3);">Start journaling your trades manually!</div>
                                </div>
                            ` : entries.map(entry => this.renderJournalCard(entry)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderJournalCard: function(entry) {
        const date = entry.createdAt ? (entry.createdAt.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt)).toLocaleString() : 'Just now';
        const typeColor = entry.type === 'BUY' ? 'var(--green)' : 'var(--red)';
        const isClosed = entry.status === 'CLOSED';

        return `
            <div class="card-sm" style="background:var(--surface2); border:1px solid var(--border); margin-bottom:16px; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div>
                        <span style="font-weight:700; color:var(--text); font-size:16px;">${entry.symbol}</span>
                        <span class="badge" style="background:${typeColor}20; color:${typeColor}; margin-left:8px;">${entry.type}</span>
                        <span class="badge badge-gray" style="margin-left:4px;">${entry.strategy}</span>
                        <span class="badge ${isClosed ? 'badge-blue' : 'badge-amber'}" style="margin-left:4px;">${entry.status}</span>
                    </div>
                    <div style="font-size:11px; color:var(--text3);">${date}</div>
                </div>
                
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:12px; font-size:12px; color:var(--text2);">
                    <div>Entry: <strong>${entry.entry}</strong></div>
                    <div>SL: <strong>${entry.sl || 'N/A'}</strong></div>
                    <div>TP: <strong>${entry.tp || 'N/A'}</strong></div>
                    <div>Lot: <strong>${entry.lot}</strong></div>
                    <div>Mindset: <strong>${entry.mindset}</strong></div>
                    ${isClosed ? `<div>Profit: <strong class="${entry.profit >= 0 ? 'kpi-pos' : 'kpi-neg'}">$${entry.profit.toFixed(2)}</strong></div>` : ''}
                </div>
                
                <div style="display:flex; gap:12px; align-items:flex-start;">
                    ${entry.screenshotUrl ? `
                        <div style="width:120px; height:80px; flex-shrink:0; border-radius:var(--radius); overflow:hidden; border:1px solid var(--border); cursor:pointer;" onclick="window.open('${entry.screenshotUrl}', '_blank')">
                            <img src="${entry.screenshotUrl}" style="width:100%; height:100%; object-fit:cover;"/>
                        </div>
                    ` : ''}
                    
                    <div style="flex:1; font-size:13px; color:var(--text); line-height:1.5; background:var(--bg); padding:10px; border-radius:var(--radius); min-height:80px;">
                        ${entry.notes}
                    </div>
                </div>

                ${!isClosed ? `
                    <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border); display:flex; gap:10px; align-items:center;">
                        <input type="number" id="exit-${entry.id}" class="form-input" style="width:120px; padding:6px;" placeholder="Exit Price"/>
                        <input type="number" id="profit-${entry.id}" class="form-input" style="width:120px; padding:6px;" placeholder="Profit/Loss $"/>
                        <button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="ManualJournalUI.closeTrade('${entry.id}')">Close Trade</button>
                    </div>
                ` : ''}
            </div>
        `;
    },

    calculateJournalStats: function(entries) {
        const closed = entries.filter(e => e.status === 'CLOSED');
        const winners = closed.filter(e => e.profit > 0);
        const winRate = closed.length ? ((winners.length / closed.length) * 100).toFixed(1) : 0;
        const totalProfit = closed.reduce((s, e) => s + (e.profit || 0), 0);

        // Best Strategy
        const strategies = {};
        closed.forEach(e => {
            if (!strategies[e.strategy]) strategies[e.strategy] = { wins: 0, total: 0 };
            strategies[e.strategy].total++;
            if (e.profit > 0) strategies[e.strategy].wins++;
        });
        let bestStrategy = 'N/A';
        let maxWR = -1;
        Object.keys(strategies).forEach(s => {
            const wr = strategies[s].wins / strategies[s].total;
            if (wr > maxWR) { maxWR = wr; bestStrategy = s; }
        });

        // Best Mindset
        const mindsets = {};
        closed.forEach(e => {
            if (!mindsets[e.mindset]) mindsets[e.mindset] = 0;
            mindsets[e.mindset] += e.profit;
        });
        let bestMindset = 'N/A';
        let maxProfit = -Infinity;
        Object.keys(mindsets).forEach(m => {
            if (mindsets[m] > maxProfit) { maxProfit = mindsets[m]; bestMindset = m; }
        });

        return { winRate, totalProfit, closedCount: closed.length, bestStrategy, bestMindset };
    },

    submitEntry: async function() {
        const symbol = document.getElementById('mj-symbol').value;
        const type = document.getElementById('mj-type').value;
        const lot = document.getElementById('mj-lot').value;
        const entry = document.getElementById('mj-entry').value;
        const sl = document.getElementById('mj-sl').value;
        const tp = document.getElementById('mj-tp').value;
        const strategy = document.getElementById('mj-strategy').value;
        const mindset = document.getElementById('mj-mindset').value;
        const notes = document.getElementById('mj-notes').value;
        const fileInput = document.getElementById('mj-screenshot');
        
        if (!symbol || !lot || !entry) {
            toast("Please fill in Symbol, Lot, and Entry Price!", "error");
            return;
        }

        let screenshotUrl = '';
        if (fileInput.files.length > 0) {
            toast("Uploading screenshot...", "info");
            const uploadResult = await ManualJournalManager.uploadScreenshot(fileInput.files[0]);
            if (uploadResult.success) screenshotUrl = uploadResult.url;
            else { toast("Upload failed: " + uploadResult.error, "error"); return; }
        }

        toast("Saving journal entry...", "info");
        const result = await ManualJournalManager.saveEntry({
            symbol, type, lot, entry, sl, tp, strategy, mindset, notes, screenshotUrl
        });

        if (result.success) {
            toast("Journal entry saved! 📓", "success");
            this.renderManualJournalPage();
        } else {
            toast("Error saving entry: " + result.error, "error");
        }
    },

    closeTrade: async function(id) {
        const exitPrice = document.getElementById(`exit-${id}`).value;
        const profit = document.getElementById(`profit-${id}`).value;

        if (!exitPrice || !profit) {
            toast("Please enter Exit Price and Profit/Loss!", "error");
            return;
        }

        toast("Closing trade...", "info");
        const result = await ManualJournalManager.updateEntry(id, {
            status: 'CLOSED',
            exitPrice: parseFloat(exitPrice),
            profit: parseFloat(profit)
        });

        if (result.success) {
            toast("Trade closed! 🏁", "success");
            this.renderManualJournalPage();
        } else {
            toast("Error closing trade: " + result.error, "error");
        }
    }
};
