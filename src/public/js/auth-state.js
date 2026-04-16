const MovieHubAuth = (() => {
    const TOKEN_KEY = 'moviehub_token';

    const getToken = () => localStorage.getItem(TOKEN_KEY);

    const decodeToken = () => {
        const token = getToken();
        if (!token) return null;

        try {
            const payload = token.split('.')[1];
            const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(normalized));
        } catch (error) {
            return null;
        }
    };

    const getRole = () => decodeToken()?.role || null;
    const isAdmin = () => getRole() === 'admin';
    const isLoggedIn = () => Boolean(getToken());
    const clear = () => localStorage.removeItem(TOKEN_KEY);
    const set = (token) => localStorage.setItem(TOKEN_KEY, token);

    return { getToken, decodeToken, getRole, isAdmin, isLoggedIn, clear, set };
})();
