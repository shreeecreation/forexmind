/**
 * ForexMind Leaderboard Manager
 * 
 * Handles Firestore operations for the global discipline leaderboard.
 * Assumes 'db' (Firestore) and 'auth' (Firebase Auth) are already initialized.
 */

const LeaderboardManager = {
    collectionName: 'leaderboards',

    /**
     * Submits the user's current discipline score to the global leaderboard.
     * @param {number} score - The final discipline score from DisciplineEngine.
     * @param {object} userProfile - The user's profile (name, email, avatar).
     */
    submitScore: async function(score, userProfile) {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error("User must be logged in to submit scores.");
            return { success: false, error: "Not logged in" };
        }

        try {
            const leaderboardRef = firebase.firestore().collection(this.collectionName).doc(user.uid);
            
            await leaderboardRef.set({
                uid: user.uid,
                displayName: userProfile.displayName || user.displayName || 'Anonymous Trader',
                photoURL: userProfile.photoURL || user.photoURL || '',
                score: score,
                tradeCount: appState.trades.length,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            return { success: true };
        } catch (error) {
            console.error("Error submitting score to leaderboard:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Fetches the top N traders from the leaderboard.
     * @param {number} limit - Number of top traders to retrieve.
     */
    getTopTraders: async function(limit = 10) {
        try {
            const snapshot = await firebase.firestore().collection(this.collectionName)
                .orderBy('score', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            return [];
        }
    }
};
