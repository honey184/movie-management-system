// Booking Management JavaScript

const API_BASE = '/api/bookings';
const bookingToken = localStorage.getItem('moviehub_token');

// State
let allBookings = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!bookingToken) {
        window.location.href = '/login';
        return;
    }
    loadBookings();
    setupFilters();
});

// Load user's bookings
async function loadBookings() {
    const loadingEl = document.getElementById('bookings-loading');
    const listEl = document.getElementById('bookings-list');
    const emptyEl = document.getElementById('bookings-empty');
    const statsEl = document.getElementById('total-bookings');

    try {
        loadingEl.classList.remove('hidden');
        listEl.classList.add('hidden');
        emptyEl.classList.add('hidden');

        const response = await fetch(`${API_BASE}/my-bookings`, {
            headers: {
                'Authorization': `Bearer ${bookingToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('moviehub_token');
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to load bookings');
        }

        const data = await response.json();
        allBookings = data.data || [];

        // Update stats
        statsEl.textContent = `${allBookings.length} booking${allBookings.length !== 1 ? 's' : ''}`;

        // Render bookings
        renderBookings();

    } catch (error) {
        console.error('Error loading bookings:', error);
        showMessage('Failed to load bookings', 'error');
    } finally {
        loadingEl.classList.add('hidden');
    }
}

// Render bookings based on current filter
function renderBookings() {
    const listEl = document.getElementById('bookings-list');
    const emptyEl = document.getElementById('bookings-empty');
    const emptyTitleEl = emptyEl.querySelector('h3');
    const emptyTextEl = emptyEl.querySelector('p');
    const emptyLinkEl = emptyEl.querySelector('a');

    // Filter bookings
    let filteredBookings = allBookings;
    if (currentFilter !== 'all') {
        filteredBookings = allBookings.filter(b => b.status === currentFilter);
    }

    if (filteredBookings.length === 0) {
        listEl.innerHTML = '';
        listEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');

        if (currentFilter === 'confirmed') {
            emptyTitleEl.textContent = 'No confirmed bookings';
            emptyTextEl.textContent = 'You do not have any confirmed bookings right now.';
            emptyLinkEl.classList.add('hidden');
        } else if (currentFilter === 'cancelled') {
            emptyTitleEl.textContent = 'No cancelled bookings';
            emptyTextEl.textContent = 'You have not cancelled any bookings.';
            emptyLinkEl.classList.add('hidden');
        } else {
            emptyTitleEl.textContent = 'No bookings yet';
            emptyTextEl.textContent = 'Start by booking a movie from our collection.';
            emptyLinkEl.classList.remove('hidden');
        }

        return;
    }

    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    emptyLinkEl.classList.remove('hidden');

    listEl.innerHTML = filteredBookings.map(booking => createBookingCard(booking)).join('');

    // Add event listeners to cancel buttons
    listEl.querySelectorAll('.cancel-booking-btn').forEach(btn => {
        btn.addEventListener('click', handleCancelBooking);
    });
}

// Create booking card HTML
function createBookingCard(booking) {
    const movie = booking.movie || {};
    const showDate = new Date(booking.showDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusClass = `status-${booking.status}`;
    const canCancel = booking.status === 'confirmed' && new Date(booking.showDate) > new Date();

    return `
        <article class="booking-card ${statusClass}">
            <div class="booking-header">
                <div class="booking-movie-info">
                    <h3>${movie.title || 'Unknown Movie'}</h3>
                    <span class="booking-genre">${movie.genre ? movie.genre.join(', ') : 'N/A'}</span>
                </div>
                <span class="booking-status ${statusClass}">${booking.status}</span>
            </div>
            
            <div class="booking-details">
                <div class="detail-item">
                    <span class="detail-label">Show Date</span>
                    <strong>${showDate}</strong>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Show Time</span>
                    <strong>${booking.showTime}</strong>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Seats</span>
                    <strong>${booking.seats}</strong>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Price</span>
                    <strong>₹${booking.totalPrice}</strong>
                </div>
            </div>

            <div class="booking-footer">
                <span class="booking-date">Booked on ${new Date(booking.createdAt).toLocaleDateString()}</span>
                ${canCancel ? `
                    <button class="btn btn-ghost cancel-booking-btn" data-booking-id="${booking._id}">
                        Cancel Booking
                    </button>
                ` : ''}
            </div>
        </article>
    `;
}

// Setup filter buttons
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update filter and re-render
            currentFilter = btn.dataset.status;
            renderBookings();
        });
    });
}

// Handle cancel booking
async function handleCancelBooking(e) {
    const bookingId = e.target.dataset.bookingId;
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        e.target.disabled = true;
        e.target.textContent = 'Cancelling...';

        const response = await fetch(`${API_BASE}/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${bookingToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }

        showMessage('Booking cancelled successfully', 'success');
        await loadBookings(); // Reload bookings

    } catch (error) {
        console.error('Error cancelling booking:', error);
        showMessage('Failed to cancel booking', 'error');
        e.target.disabled = false;
        e.target.textContent = 'Cancel Booking';
    }
}

// Show message
function showMessage(message, type = 'info') {
    // Create or update message element
    let msgEl = document.querySelector('.booking-message');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.className = 'booking-message';
        document.querySelector('.container').prepend(msgEl);
    }

    msgEl.className = `booking-message ${type}`;
    msgEl.textContent = message;
    msgEl.classList.remove('hidden');

    setTimeout(() => {
        msgEl.classList.add('hidden');
    }, 3000);
}
