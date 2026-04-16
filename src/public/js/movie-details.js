const movieToken = localStorage.getItem('moviehub_token');

const reviewMessage = document.getElementById('review-message');

const setReviewMessage = (message, type) => {
    if (!reviewMessage) return;
    reviewMessage.textContent = message;
    reviewMessage.className = `form-message ${type}`;
};

const requireLogin = () => {
    if (movieToken) return true;

    setReviewMessage('Please login first to continue.', 'error');
    window.setTimeout(() => {
        window.location.href = '/login';
    }, 700);
    return false;
};

document.getElementById('add-to-watchlist-btn')?.addEventListener('click', async (event) => {
    if (!requireLogin()) return;

    const movieId = event.currentTarget.dataset.movieId;

    try {
        const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${movieToken}`,
            },
            body: JSON.stringify({ movieId }),
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Unable to add to watchlist');

        setReviewMessage('Movie added to watchlist.', 'success');
    } catch (error) {
        setReviewMessage(error.message, 'error');
    }
});

document.getElementById('review-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!requireLogin()) return;

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${movieToken}`,
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Unable to submit review');

        setReviewMessage('Review submitted successfully. Refreshing...', 'success');
        window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
        setReviewMessage(error.message, 'error');
    }
});
