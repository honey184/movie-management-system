const watchlistToken = localStorage.getItem('moviehub_token');

const watchlistGrid = document.getElementById('watchlist-grid');
const watchlistCount = document.getElementById('watchlist-count');
const watchlistEmpty = document.getElementById('watchlist-empty');
const recommendationsList = document.getElementById('recommendations-list');
const clearWatchlistBtn = document.getElementById('clear-watchlist-btn');


const loginMessage = document.getElementById('login-message');
const emptyMessage = document.getElementById('empty-message');

if (!watchlistToken && clearWatchlistBtn) {
    clearWatchlistBtn.style.display = "none";
}

const authHeaders = () => ({
    Authorization: `Bearer ${watchlistToken}`,
    'Content-Type': 'application/json',
});

const renderWatchlist = (movies) => {
    if (!watchlistGrid || !watchlistCount || !watchlistEmpty || !clearWatchlistBtn) return;

    watchlistCount.textContent = `${movies.length} item${movies.length === 1 ? '' : 's'}`;

    if (!movies.length) {
        watchlistGrid.innerHTML = '';
        watchlistEmpty.classList.remove('hidden');
        clearWatchlistBtn.style.display = 'none';
        return;
    }

    watchlistEmpty.classList.add('hidden');
    clearWatchlistBtn.style.display = 'block';

    watchlistGrid.innerHTML = movies.map((movie) => `
        <article class="movie-card">
            <div class="movie-card__content">
                <span class="movie-card__year">${movie.releaseYear}</span>
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span>Rating <strong>${Number(movie.ratingsAvg || 0).toFixed(1)}</strong></span>
                    <span>Reviews <strong>${movie.ratingsCount || 0}</strong></span>
                </div>
                <div class="movie-tags">
                    ${(movie.genre || []).map((tag) => `<span>${tag}</span>`).join('')}
                </div>
            </div>
            <div class="hero-actions">
                <a href="/movies/${movie._id}" class="btn btn-ghost">View</a>
                <button class="btn btn-primary remove-watchlist-btn" data-movie-id="${movie._id}" type="button">Remove</button>
            </div>
        </article>
    `).join('');

    document.querySelectorAll('.remove-watchlist-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            await fetch(`/api/watchlist/${button.dataset.movieId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });

            loadWatchlist();
        });
    });
};

const renderRecommendations = (movies, source) => {
    if (!movies.length) {
        watchlistGrid.innerHTML = '';
        watchlistEmpty.classList.remove('hidden');

        if (loginMessage) loginMessage.classList.add('hidden');
        if (emptyMessage) emptyMessage.classList.remove('hidden');

        return;
    }

    recommendationsList.innerHTML = `
        <p>Source: <strong>${source}</strong></p>
        ${movies.map((movie) => `
            <article>
                <strong>${movie.title}</strong>
                <p>${movie.releaseYear} • Rating ${Number(movie.ratingsAvg || 0).toFixed(1)}</p>
            </article>
        `).join('')}
    `;
};

const requireWatchlistLogin = () => {
    if (watchlistToken) {
        if (loginMessage) loginMessage.classList.add('hidden');
        if (emptyMessage) emptyMessage.classList.remove('hidden');
        return true;
    }

    if (watchlistEmpty) watchlistEmpty.classList.remove('hidden');

    if (loginMessage) loginMessage.classList.remove('hidden');
    if (emptyMessage) emptyMessage.classList.add('hidden');

    if (watchlistGrid) watchlistGrid.innerHTML = '';
    if (recommendationsList) recommendationsList.innerHTML = '';

    return false;
};

const loadWatchlist = async () => {
    if (!requireWatchlistLogin()) return;

    try {
        const [watchlistResponse, recommendationsResponse] = await Promise.all([
            fetch('/api/watchlist', { headers: authHeaders() }),
            fetch('/api/watchlist/recommendations', { headers: authHeaders() }),
        ]);

        const watchlistData = await watchlistResponse.json();
        const recommendationsData = await recommendationsResponse.json();

        renderWatchlist(watchlistData.data?.movieIds || []);
        renderRecommendations(recommendationsData.movies || [], recommendationsData.source || 'recommendations');
    } catch (error) {
        if (watchlistEmpty) {
            watchlistEmpty.classList.remove('hidden');
            watchlistEmpty.querySelector('p').textContent = 'Unable to load watchlist right now.';
        }
    }
};

clearWatchlistBtn?.addEventListener('click', async () => {
    if (!requireWatchlistLogin()) return;

    await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: authHeaders(),
    });

    loadWatchlist();
});

document.addEventListener('DOMContentLoaded', loadWatchlist);
