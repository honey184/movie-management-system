const movieToken = MovieHubAuth.getToken();
const reviewForm = document.getElementById('review-form');
const reviewTitle = document.getElementById('review-form-title');
const reviewSubmitBtn = document.getElementById('review-submit-btn');
const deleteReviewBtn = document.getElementById('delete-review-btn');
const movieId = reviewForm?.querySelector('input[name="movieId"]')?.value;
let existingReview = null;

const reviewMessage = document.getElementById('review-message');

// Booking form elements
const showBookingFormBtn = document.getElementById('show-booking-form-btn');
const bookingFormContainer = document.getElementById('booking-form-container');
const bookingForm = document.getElementById('booking-form');
const cancelBookingFormBtn = document.getElementById('cancel-booking-form-btn');
const bookingMessage = document.getElementById('booking-message');
const seatsInput = document.getElementById('seats');
const totalPriceEl = document.getElementById('total-price');
const showDateInput = document.getElementById('showDate');

const TICKET_PRICE = 150;

const setReviewMessage = (message, type) => {
    if (!reviewMessage) return;
    reviewMessage.textContent = message;
    reviewMessage.className = `form-message ${type}`;
};

const setBookingMessage = (message, type) => {
    if (!bookingMessage) return;
    bookingMessage.textContent = message;
    bookingMessage.className = `form-message ${type}`;
};

const requireLogin = () => {
    if (movieToken) return true;

    setReviewMessage('Please login first to continue.', 'error');
    window.setTimeout(() => {
        window.location.href = '/login';
    }, 700);
    return false;
};

const canManageReviews = () => MovieHubAuth.getRole() === 'user';
const getReviewId = (review) => review?._id || review?.id || null;

const setReviewMode = (review) => {
    existingReview = review;

    if (!reviewForm || !reviewTitle || !reviewSubmitBtn || !deleteReviewBtn) return;

    if (!review) {
        reviewTitle.textContent = 'Write a Review';
        reviewSubmitBtn.textContent = 'Submit Review';
        deleteReviewBtn.classList.add('hidden');
        reviewForm.rating.value = '';
        reviewForm.comment.value = '';
        return;
    }

    reviewTitle.textContent = 'Edit Your Review';
    reviewSubmitBtn.textContent = 'Update Review';
    deleteReviewBtn.classList.remove('hidden');
    reviewForm.rating.value = String(review.rating || '');
    reviewForm.comment.value = review.comment || '';
};

// Booking form handlers
const initBookingForm = () => {
    if (!showBookingFormBtn || !bookingFormContainer) return;

    // Set minimum date to today
    if (showDateInput) {
        const today = new Date().toISOString().split('T')[0];
        showDateInput.setAttribute('min', today);
    }

    // Show booking form
    showBookingFormBtn.addEventListener('click', () => {
        if (!requireLogin()) return;
        bookingFormContainer.classList.remove('hidden');
        showBookingFormBtn.classList.add('hidden');
    });

    // Hide booking form
    cancelBookingFormBtn?.addEventListener('click', () => {
        bookingFormContainer.classList.add('hidden');
        showBookingFormBtn.classList.remove('hidden');
        setBookingMessage('', '');
    });

    // Update total price when seats change
    seatsInput?.addEventListener('input', () => {
        const seats = parseInt(seatsInput.value) || 1;
        if (totalPriceEl) {
            totalPriceEl.textContent = `Total: ₹${seats * TICKET_PRICE}`;
        }
    });

    // Handle booking form submission
    bookingForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!requireLogin()) return;

        const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
        const submitBtn = document.getElementById('book-tickets-btn');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Booking...';

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${movieToken}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Unable to book tickets');

            setBookingMessage('Booking confirmed! Redirecting...', 'success');
            window.setTimeout(() => {
                window.location.href = '/bookings';
            }, 1000);
        } catch (error) {
            setBookingMessage(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        }
    });
};

const loadMyReview = async () => {
    if (!movieToken || !canManageReviews() || !movieId) return;

    try {
        const response = await fetch(`/api/reviews/my?movieId=${movieId}&limit=1`, {
            headers: {
                Authorization: `Bearer ${movieToken}`,
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load your review');

        const review = result.reviews?.[0] || null;
        setReviewMode(review);
    } catch (error) {
        setReviewMessage(error.message, 'error');
    }
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

reviewForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!requireLogin()) return;
    if (!canManageReviews()) {
        setReviewMessage('Only user accounts can create or update reviews.', 'error');
        return;
    }

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const reviewId = getReviewId(existingReview);

    if (existingReview) {
        delete payload.movieId;
    }

    try {
        const response = await fetch(existingReview ? `/api/reviews/${reviewId}` : '/api/reviews', {
            method: existingReview ? 'PATCH' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${movieToken}`,
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || `Unable to ${existingReview ? 'update' : 'submit'} review`);

        setReviewMessage(`Review ${existingReview ? 'updated' : 'submitted'} successfully. Refreshing...`, 'success');
        window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
        setReviewMessage(error.message, 'error');
    }
});

deleteReviewBtn?.addEventListener('click', async () => {
    if (!requireLogin()) return;
    if (!canManageReviews()) {
        setReviewMessage('Only user accounts can delete reviews.', 'error');
        return;
    }
    const reviewId = getReviewId(existingReview);
    if (!reviewId) {
        setReviewMessage('Unable to find review id for deletion.', 'error');
        return;
    }

    const confirmed = window.confirm('Delete your review for this movie?');
    if (!confirmed) return;

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${movieToken}`,
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to delete review');

        setReviewMessage('Review deleted successfully. Refreshing...', 'success');
        window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
        setReviewMessage(error.message, 'error');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadMyReview();
    initBookingForm();
});
