/**
 * IndexedDB Wrapper — Client-Side Storage for Submissions
 *
 * Replaces MySQL/FormHelper.php with browser-native IndexedDB.
 * Database: customer_satisfaction
 * Object Store: submissions (autoIncrement id)
 *
 * Usage:
 *   const db = await DB.open();
 *   await DB.insert({ name, category, service, satisfaction, comments });
 *   const all = await DB.getAll();
 *   const counts = await DB.getCounts();
 */

const DB = (() => {
    const DB_NAME = 'customer_satisfaction';
    const DB_VERSION = 1;
    const STORE_NAME = 'submissions';

    /**
     * Open (or create) the IndexedDB database.
     * @returns {Promise<IDBDatabase>}
     */
    function open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('satisfaction', 'satisfaction', { unique: false });
                    store.createIndex('created_at', 'created_at', { unique: false });
                }
            };

            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Insert a new submission.
     * @param {Object} data - { name, category, service, satisfaction, comments }
     * @returns {Promise<number>} The auto-generated id
     */
    async function insert(data) {
        const db = await open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            const record = {
                name: data.name || null,
                category: data.category || null,
                service: data.service || null,
                satisfaction: data.satisfaction,
                comments: data.comments || null,
                created_at: new Date().toISOString()
            };

            const request = store.add(record);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);

            tx.oncomplete = () => db.close();
        });
    }

    /**
     * Retrieve all submissions, newest first.
     * @returns {Promise<Array>}
     */
    async function getAll() {
        const db = await open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort newest first by created_at
                const results = request.result.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                resolve(results);
            };
            request.onerror = () => reject(request.error);

            tx.oncomplete = () => db.close();
        });
    }

    /**
     * Get submission counts.
     * @returns {Promise<{total: number, satisfied: number, notSatisfied: number}>}
     */
    async function getCounts() {
        const all = await getAll();
        const satisfied = all.filter(s => s.satisfaction === 'Satisfied').length;
        return {
            total: all.length,
            satisfied: satisfied,
            notSatisfied: all.length - satisfied
        };
    }

    return { open, insert, getAll, getCounts };
})();
