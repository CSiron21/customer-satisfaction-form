/**
 * API Wrapper - Replaces client-side DB interactions
 */
const API = {
    // Detect if running on localhost (dev) or production (behind Nginx)
    // If protocol is file:, or if hostname is localhost/127.0.0.1 but port is NOT 3000 (e.g. Live Server on 5500),
    // we assume the backend is on http://localhost:3000.
    // Otherwise (production), use relative path /api.
    baseUrl: (window.location.protocol === 'file:' || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000')
        ? 'http://localhost:3000/api'
        : '/api',

    async submitFeedback(data) {
        const response = await fetch(`${this.baseUrl}/submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Submission failed');
        return response.json();
    },

    async getAllSubmissions() {
        const response = await fetch(`${this.baseUrl}/submissions`);
        if (!response.ok) throw new Error('Fetch failed');
        return response.json();
    },

    async login(username, password) {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return response.json();
    }
};
