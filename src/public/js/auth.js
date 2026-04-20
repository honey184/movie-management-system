const setMessage = (elementId, message, type) => {
    const messageNode = document.getElementById(elementId);
    if (!messageNode) return;

    messageNode.textContent = message;
    messageNode.className = `form-message ${type}`;
};

const submitAuthForm = async ({ formId, endpoint, messageId, redirectTo, isLogin }) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = Object.fromEntries(new FormData(form).entries());

        try {
            setMessage(messageId, 'Please wait...', 'success');

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            if (isLogin && result.result?.token) {
                MovieHubAuth.set(result.result.token);
            }

            setMessage(
                messageId,
                isLogin ? 'Login successful. Redirecting...' : 'Registration successful. Redirecting to login...',
                'success'
            );

            window.setTimeout(() => {
                const redirectPath = isLogin && result.result?.token && MovieHubAuth.isAdmin()
                    ? '/admin/movies'
                    : redirectTo;
                window.location.href = redirectPath;
            }, 900);
        } catch (error) {
            setMessage(messageId, error.message, 'error');
        }
    });
};

submitAuthForm({
    formId: 'login-form',
    endpoint: '/api/auth/login',
    messageId: 'login-message',
    redirectTo: '/',
    isLogin: true,
});

submitAuthForm({
    formId: 'register-form',
    endpoint: '/api/auth/register',
    messageId: 'register-message',
    redirectTo: '/login',
    isLogin: false,
});
