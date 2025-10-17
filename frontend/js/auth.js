document.addEventListener("DOMContentLoaded", () => {
    // ------------------ SELECT FORMS ------------------
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    // ------------------ BACKEND URL ------------------
    const BACKEND_URL = "https://social-blog-platform-3.onrender.com";

    // ------------------ LOGIN ------------------
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const identifier = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            if (!identifier || !password) {
                return alert("Please enter both username/email and password!");
            }

            try {
                const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier, password })
                });

                const data = await res.json();

                if (data.token) {
                    // ✅ Store token and user
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));

                    // ✅ Redirect to dashboard
                    window.location.href = "/dashboard.html";
                } else {
                    alert(data.message || "Login failed. Check your credentials.");
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Server error. Try again later.");
            }
        });
    }

    // ------------------ SIGNUP ------------------
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("signupUsername").value.trim();
            const email = document.getElementById("signupEmail").value.trim();
            const password = document.getElementById("signupPassword").value.trim();

            if (!username || !email || !password) {
                return alert("Please fill all fields!");
            }

            try {
                const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await res.json();

                if (res.ok && data.token) {
                    // ✅ Store token and user immediately after signup
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));

                    alert("Signup successful! Redirecting to dashboard...");
                    window.location.href = "/dashboard.html";
                } else {
                    alert(data.message || "Signup failed. Try again.");
                }
            } catch (err) {
                console.error("Signup error:", err);
                alert("Server error. Try again later.");
            }
        });
    }
});
