/**
 * ForexMind Manual Journal Manager v2
 * 
 * Added:
 * - Trade Status (OPEN/CLOSED)
 * - Exit Price & Final Profit/Loss
 * - Update existing entries
 */

const ManualJournalManager = {
    collectionName: 'manual_journal',

    uploadScreenshot: async function(file) {
        const user = firebase.auth().currentUser;
        if (!user) return { success: false, error: "Not logged in" };
        try {
            const storageRef = firebase.storage().ref();
            const timestamp = Date.now();
            const fileRef = storageRef.child(`users/${user.uid}/manual_journal/${timestamp}_${file.name}`);
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return { success: true, url: downloadURL };
        } catch (error) {
            console.error("Error uploading screenshot:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Saves a new manual journal entry.
     * Default status is 'OPEN'.
     */
    saveEntry: async function(entryData) {
        const user = firebase.auth().currentUser;
        if (!user) return { success: false, error: "Not logged in" };
        try {
            const journalRef = firebase.firestore().collection(this.collectionName).doc();
            await journalRef.set({
                uid: user.uid,
                status: 'OPEN',
                exitPrice: null,
                profit: 0,
                ...entryData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error("Error saving journal entry:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Updates an existing entry (e.g., closing a trade).
     */
    updateEntry: async function(entryId, updateData) {
        try {
            const docRef = firebase.firestore().collection(this.collectionName).doc(entryId);
            await docRef.update({
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error("Error updating entry:", error);
            return { success: false, error: error.message };
        }
    },

    getEntries: async function() {
        const user = firebase.auth().currentUser;
        if (!user) return [];
        try {
            const snapshot = await firebase.firestore().collection(this.collectionName)
                .where('uid', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching journal entries:", error);
            // Fallback: fetch without ordering if index is missing
            const fallback = await firebase.firestore().collection(this.collectionName)
                .where('uid', '==', user.uid)
                .get();
            return fallback.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        }
    }
};
