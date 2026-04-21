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

const capitalizeWords = (value = '') => value.replace(/\b\w/g, (char) => char.toUpperCase());

const createAuthHeaders = () => {
    const token = MovieHubAuth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const createMovieCard = (movie) => {
    const article = document.createElement('article');
    article.className = 'movie-card';

    const content = document.createElement('div');
    content.className = 'movie-card__content';

    const year = document.createElement('span');
    year.className = 'movie-card__year';
    year.textContent = movie.releaseYear || '';

    const title = document.createElement('h3');
    title.textContent = movie.title || 'Untitled';

    const description = document.createElement('p');
    description.textContent = movie.description
        ? movie.description.slice(0, 120)
        : 'No description available yet.';

    const meta = document.createElement('div');
    meta.className = 'movie-meta';
    meta.innerHTML = `
        <span>Rating <strong>${Number(movie.ratingsAvg || 0).toFixed(1)}</strong></span>
        <span>Reviews <strong>${movie.ratingsCount || 0}</strong></span>
    `;

    const tags = document.createElement('div');
    tags.className = 'movie-tags';
    (movie.genre || []).slice(0, 3).forEach((tag) => {
        const item = document.createElement('span');
        item.textContent = tag;
        tags.appendChild(item);
    });

    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = `/movies/${movie._id}`;
    link.textContent = 'View details';

    content.append(year, title, description, meta, tags);
    article.append(content, link);
    return article;
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

const loadHeaderUserInfo = async () => {
    const token = MovieHubAuth.getToken();
    const headerUserInfo = document.getElementById('header-user-info');
    const headerUserName = document.getElementById('header-user-name');
    const headerUserEmail = document.getElementById('header-user-email');
    if (!token || !headerUserInfo || !headerUserName || !headerUserEmail) return;

    let responseStatus = null;

    try {
        const response = await fetch('/profile/data', {
            headers: createAuthHeaders(),
        });
        responseStatus = response.status;
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to load profile');
        }

        headerUserName.textContent = result.data?.name || 'User';
        headerUserEmail.textContent = result.data?.email || '';
        headerUserInfo.classList.remove('hidden');
    } catch (error) {
        if (responseStatus === 401) {
            MovieHubAuth.clear();
            window.location.replace('/login');
            return;
        }
    }
};

const loadHomeGenreMovies = async (genre = '') => {
    const movieGrid = document.getElementById('home-movie-grid');
    const genreStatus = document.getElementById('home-genre-status');
    const heading = document.getElementById('home-movies-heading');
    if (!movieGrid || !genreStatus || !heading) return;

    const limit = movieGrid.dataset.defaultLimit || '9';
    const params = new URLSearchParams({
        limit,
        sort: '-releaseYear',
    });

    if (genre) {
        params.set('genre', genre);
    }

    genreStatus.textContent = 'Loading movies...';
    genreStatus.classList.remove('hidden');

    try {
        const response = await fetch(`/api/movies?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to load movies');
        }

        const movies = result.data?.movies || [];
        movieGrid.innerHTML = '';

        heading.textContent = genre ? `${capitalizeWords(genre)} Movies` : 'Latest Movies';

        if (!movies.length) {
            movieGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No movies found</h3>
                    <p>There are no movies available for this genre right now.</p>
                </div>
            `;
            genreStatus.classList.add('hidden');
            return;
        }

        movies.forEach((movie) => {
            movieGrid.appendChild(createMovieCard(movie));
        });
        genreStatus.classList.add('hidden');
    } catch (error) {
        genreStatus.textContent = 'Could not load movies for this genre.';
    }
};

const setupHomeGenreFilter = () => {
    const genreFilter = document.getElementById('home-genre-filter');
    if (!genreFilter) return;

    genreFilter.addEventListener('click', (event) => {
        const button = event.target.closest('[data-genre]');
        if (!button) return;

        genreFilter.querySelectorAll('.genre-filter__btn').forEach((item) => {
            item.classList.remove('active');
        });
        button.classList.add('active');

        loadHomeGenreMovies(button.dataset.genre || '');
    });
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
            <div class="header-user hidden" id="header-user-info">
                <strong id="header-user-name"></strong>
                <span id="header-user-email"></span>
            </div>
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
        <div class="header-user hidden" id="header-user-info">
            <strong id="header-user-name"></strong>
            <span id="header-user-email"></span>
        </div>
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
    loadHeaderUserInfo();
    setupHomeGenreFilter();
});
