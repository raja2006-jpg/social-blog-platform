const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Your deployed backend URL
const BACKEND_URL = "https://social-blog-platform.onrender.com";

// ------------------- LOGIN -------------------
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password!");
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }) // <--- use email here
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to dashboard
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Login failed. Check your credentials.");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Server error. Try again later.");
    }
});

// ------------------- SIGNUP -------------------
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!username || !email || !password) {
        alert("Please fill all fields!");
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Signup successful! You can now log in.");
            document.getElementById("loginBtn").click(); // switch to login form
        } else {
            alert(data.message || "Signup failed. Try again.");
        }
    } catch (err) {
        console.error("Signup error:", err);
        alert("Server error. Try again later.");
    }
});
