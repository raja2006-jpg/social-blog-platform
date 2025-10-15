// frontend/js/auth.js

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const API_URL = "https://social-blog-backend.onrender.com/api/auth"; // Deployed backend

const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

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
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                if (loginMessage) loginMessage.textContent = data.message || "Login failed";
            }
        } catch (err) {
            console.error(err);
            if (loginMessage) loginMessage.textContent = "Server error. Try again.";
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
                if (registerMessage) registerMessage.textContent = data.message;
                registerForm.reset();
            } else {
                if (registerMessage) registerMessage.textContent = data.message;
            }
        } catch (err) {
            console.error(err);
            if (registerMessage) registerMessage.textContent = "Server error. Try again.";
        }
    });
}
