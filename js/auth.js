/**
 * Auth Module — Client-Side Admin Authentication
 *
 * Replaces AuthHelper.php with localStorage-based session management.
 * Credentials are hardcoded (no server to verify against).
 *
 * Usage:
 *   if (Auth.login(username, password)) { ... }
 *   Auth.requireLogin();   // redirects if not logged in
 *   Auth.logout();         // clears session and redirects
 */

const Auth = (() => {
    const SESSION_KEY = 'admin_session';
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'S0C@DMIN321';

    /**
     * Attempt to log in with the given credentials.
     * @param {string} username
     * @param {string} password
     * @returns {boolean} True if login succeeded
     */
    function login(username, password) {
        if (!username || !password) return false;

        if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                username: ADMIN_USERNAME,
                loggedInAt: new Date().toISOString()
            }));
            return true;
        }

        return false;
    }

    /**
     * Check if an admin session is active.
     * @returns {boolean}
     */
    function isLoggedIn() {
        return localStorage.getItem(SESSION_KEY) !== null;
    }

    /**
     * Get the logged-in admin username.
     * @returns {string|null}
     */
    function getUsername() {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return null;

        try {
            return JSON.parse(session).username;
        } catch {
            return null;
        }
    }

    /**
     * Enforce admin authentication.
     * Redirects to login page if not logged in.
     */
    function requireLogin() {
        if (!isLoggedIn()) {
            // Determine correct path to login page based on current location
            const path = window.location.pathname;
            const inAdmin = path.includes('/admin/');
            window.location.href = inAdmin ? '../admin_login.html' : 'admin_login.html';
        }
    }

    /**
     * Log out the current admin and redirect to login page.
     */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        const path = window.location.pathname;
        const inAdmin = path.includes('/admin/');
        window.location.href = inAdmin ? '../admin_login.html' : 'admin_login.html';
    }

    return { login, isLoggedIn, getUsername, requireLogin, logout };
})();
