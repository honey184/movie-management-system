const removeNode = (selector) => {
    document.querySelector(selector)?.remove();
};

const enforceAdminPageAccess = (isAdmin) => {
    if (!isAdmin) return;

    const currentPath = window.location.pathname;

    if (
        currentPath === '/'
        || currentPath === '/movies'
        || currentPath.startsWith('/movies/')
        || currentPath === '/watchlist'
        || currentPath.startsWith('/watchlist/')
    ) {
        window.location.replace('/admin/movies');
    }
};

const updateAdminHomeState = (isAdmin) => {
    if (!isAdmin) return;

    const heroActions = document.getElementById('home-hero-actions');
    if (heroActions) {
        heroActions.innerHTML = '<a href="/admin/movies" class="btn btn-primary">Admin Dashboard</a>';
    }

    removeNode('#home-view-all-link');
};

const updateNavAuthState = () => {
    const navActions = document.getElementById('nav-auth-actions');
    const siteNav = document.getElementById('site-nav');
    if (!navActions) return;

    const token = MovieHubAuth.getToken();
    const isAdmin = MovieHubAuth.isAdmin();
    enforceAdminPageAccess(isAdmin);
    updateAdminHomeState(isAdmin);

    if (isAdmin) {
        removeNode('#home-nav-link');
        removeNode('#movies-nav-link');
        removeNode('#watchlist-nav-link');
    }

    if (isAdmin && siteNav && !document.getElementById('admin-nav-link')) {
        const adminLink = document.createElement('a');
        adminLink.id = 'admin-nav-link';
        adminLink.href = '/admin/movies';
        adminLink.textContent = 'Admin Dashboard';
        if (window.location.pathname.startsWith('/admin')) {
            adminLink.classList.add('active');
        }
        siteNav.appendChild(adminLink);
    }

    if (!token) {
        navActions.innerHTML = `
            <a href="/login" class="btn btn-ghost">Login</a>
            <a href="/register" class="btn btn-primary">Register</a>
        `;
        return;
    }

    if (isAdmin) {
        navActions.innerHTML = `
            <button class="btn btn-primary" id="logout-btn" type="button">Logout</button>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn?.addEventListener('click', () => {
            MovieHubAuth.clear();
            window.location.href = '/login';
        });
        return;
    }

    navActions.innerHTML = `
        <a href="/watchlist" class="btn btn-ghost">Watchlist</a>
        <button class="btn btn-primary" id="logout-btn" type="button">Logout</button>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
        MovieHubAuth.clear();
        window.location.href = '/login';
    });
};

document.addEventListener('DOMContentLoaded', updateNavAuthState);
