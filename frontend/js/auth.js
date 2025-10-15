// frontend/js/auth.js

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const API_URL = "https://social-blog-backend.onrender.com/api/auth";

// ---------------- LOGIN ----------------
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save token & user in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show backend message on page instead of alert
                const loginMessage = document.getElementById('loginMessage');
                if (loginMessage) loginMessage.textContent = data.message;
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// ---------------- REGISTER ----------------
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = registerForm.username.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.status === 201) {
                // Show success message
                const registerMessage = document.getElementById('registerMessage');
                if (registerMessage) registerMessage.textContent = data.message;

                // Optionally, clear the form
                registerForm.reset();
            } else {
                const registerMessage = document.getElementById('registerMessage');
                if (registerMessage) registerMessage.textContent = data.message;
            }
        } catch (err) {
            console.error(err);
        }
    });
}
