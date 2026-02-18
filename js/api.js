/**
 * API Wrapper - Replaces client-side DB interactions
 */
const API = {
    baseUrl: '/api',

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
