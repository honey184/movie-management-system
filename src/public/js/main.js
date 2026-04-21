const removeNode = (selector) => {
    document.querySelector(selector)?.remove();
};

const createRankRow = (movie, metric) => {
    const row = document.createElement('div');
    row.className = 'rank-row';

    const title = document.createElement('span');
    title.textContent = movie.title;

    const value = document.createElement('strong');
    value.textContent = metric === 'ratingsAvg'
        ? Number(movie.ratingsAvg || 0).toFixed(1)
        : movie.ratingsCount || 0;

    row.append(title, value);
    return row;
};

const renderAnalyticsList = (listId, statusId, movies, metric) => {
    const list = document.getElementById(listId);
    const status = document.getElementById(statusId);

    if (!list || !status) return;

    list.innerHTML = '';

    if (!movies.length) {
        status.textContent = 'No analytics available right now.';
        return;
    }

    status.remove();
    movies.forEach((movie) => {
        list.appendChild(createRankRow(movie, metric));
    });
};

const loadAnalyticsDashboard = async () => {
    const analyticsRoot = document.getElementById('analytics-dashboard');
    if (!analyticsRoot) return;

    const analyticsUrl = analyticsRoot.dataset.analyticsUrl;
    const topRatedCount = document.getElementById('top-rated-count');
    const mostReviewedCount = document.getElementById('most-reviewed-count');

    try {
        const response = await fetch(analyticsUrl);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to load analytics');
        }

        const topRated = result.data?.topRated || [];
        const mostReviewed = result.data?.mostReviewed || [];

        if (topRatedCount) topRatedCount.textContent = `${topRated.length} titles`;
        if (mostReviewedCount) mostReviewedCount.textContent = `${mostReviewed.length} titles`;

        renderAnalyticsList('top-rated-list', 'top-rated-status', topRated, 'ratingsAvg');
        renderAnalyticsList('most-reviewed-list', 'most-reviewed-status', mostReviewed, 'ratingsCount');
    } catch (error) {
        if (topRatedCount) topRatedCount.textContent = 'Unavailable';
        if (mostReviewedCount) mostReviewedCount.textContent = 'Unavailable';

        const topRatedStatus = document.getElementById('top-rated-status');
        const mostReviewedStatus = document.getElementById('most-reviewed-status');

        if (topRatedStatus) topRatedStatus.textContent = 'Could not load analytics.';
        if (mostReviewedStatus) mostReviewedStatus.textContent = 'Could not load analytics.';
    }
};

const enforceAdminPageAccess = (isAdmin) => {
    if (!isAdmin) return;

    const currentPath = window.location.pathname;

    if (
        currentPath === '/'
        || currentPath === '/analytics'
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
        removeNode('#analytics-nav-link');
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

document.addEventListener('DOMContentLoaded', () => {
    updateNavAuthState();
    loadAnalyticsDashboard();
});
