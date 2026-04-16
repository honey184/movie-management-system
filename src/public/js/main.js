console.log("main js called");


const updateNavAuthState = () => {
    const navActions = document.getElementById('nav-auth-actions');
    const siteNav = document.getElementById('site-nav');
    if (!navActions) return;

    const token = MovieHubAuth.getToken();
    const isAdmin = MovieHubAuth.isAdmin();

    if (isAdmin && siteNav && !document.getElementById('admin-nav-link')) {
        const adminLink = document.createElement('a');
        adminLink.id = 'admin-nav-link';
        adminLink.href = '/admin/movies';
        adminLink.textContent = 'Admin';
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
