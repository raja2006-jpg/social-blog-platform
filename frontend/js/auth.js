// frontend/js/auth.js

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Base API URL of your Render backend
const API_URL = "https://social-blog-backend.onrender.com/api/auth";

// ---------------- LOGIN ----------------
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            const loginMessage = document.getElementById('loginMessage');
            if (res.ok) {
                // Save token & user in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show backend message on page
                if (loginMessage) loginMessage.textContent = data.message || "Login failed";
            }
        } catch (err) {
            console.error(err);
            const loginMessage = document.getElementById('loginMessage');
            if (loginMessage) loginMessage.textContent = "Server error, try again later.";
        }
    });
}

// ---------------- REGISTER ----------------
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = registerForm.username.value.trim();
        const email = registerForm.email.value.trim();
        const password = registerForm.password.value.trim();

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();
            const registerMessage = document.getElementById('registerMessage');

            if (res.status === 201) {
                if (registerMessage) registerMessage.textContent = data.message || "Registered successfully!";
                registerForm.reset();
            } else {
                if (registerMessage) registerMessage.textContent = data.message || "Registration failed";
            }
        } catch (err) {
            console.error(err);
            const registerMessage = document.getElementById('registerMessage');
            if (registerMessage) registerMessage.textContent = "Server error, try again later.";
        }
    });
}
