const adminGuard = () => {
    if (MovieHubAuth.isAdmin()) return true;

    window.location.href = '/login';
    return false;
};

const splitCommaValues = (value) =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const setAdminMessage = (id, message, type) => {
    const node = document.getElementById(id);
    if (!node) return;

    node.textContent = message;
    node.className = `form-message ${type}`;
};

const updateAdminCount = () => {
    const countNode = document.getElementById('admin-movie-count');
    const items = document.querySelectorAll('.admin-item').length;
    if (countNode) {
        countNode.textContent = `${items} item${items === 1 ? '' : 's'}`;
    }
};

const getAdminHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${MovieHubAuth.getToken()}`,
});

const normalizeMoviePayload = (form) => {
    const formData = Object.fromEntries(new FormData(form).entries());

    return {
        title: formData.title,
        description: formData.description,
        genre: splitCommaValues(formData.genre),
        releaseYear: Number(formData.releaseYear),
        cast: splitCommaValues(formData.cast || ''),
    };
};

const bindCreateMovie = () => {
    const form = document.getElementById('create-movie-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const payload = normalizeMoviePayload(form);
            const response = await fetch('/api/movies', {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Unable to create movie');

            setAdminMessage('admin-create-message', 'Movie added successfully. Refreshing...', 'success');
            window.setTimeout(() => window.location.reload(), 900);
        } catch (error) {
            setAdminMessage('admin-create-message', error.message, 'error');
        }
    });
};

const bindDeleteMovie = () => {
    document.querySelectorAll('.admin-delete-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            const confirmed = window.confirm('Delete this movie permanently?');
            if (!confirmed) return;

            try {
                const response = await fetch(`/api/movies/${button.dataset.movieId}`, {
                    method: 'DELETE',
                    headers: getAdminHeaders(),
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.message || 'Unable to delete movie');

                button.closest('.admin-item')?.remove();
                updateAdminCount();
            } catch (error) {
                window.alert(error.message);
            }
        });
    });
};

const bindEditMovie = () => {
    const form = document.getElementById('edit-movie-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const payload = normalizeMoviePayload(form);
            const response = await fetch(`/api/movies/${form.dataset.movieId}`, {
                method: 'PATCH',
                headers: getAdminHeaders(),
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Unable to update movie');

            setAdminMessage('admin-edit-message', 'Movie updated successfully.', 'success');
        } catch (error) {
            setAdminMessage('admin-edit-message', error.message, 'error');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.startsWith('/admin')) return;
    if (!adminGuard()) return;

    bindCreateMovie();
    bindDeleteMovie();
    bindEditMovie();
    updateAdminCount();
});

// Re-check authentication when page becomes visible (handles back button navigation)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.location.pathname.startsWith('/admin')) {
        if (!adminGuard()) return;
        // Re-initialize admin functionality if still authenticated
        bindCreateMovie();
        bindDeleteMovie();
        bindEditMovie();
        updateAdminCount();
    }
});
