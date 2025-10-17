// frontend/js/auth.js

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

// ✅ Deployed backend API
const API_URL = "https://social-blog-backend.onrender.com/api/auth";

// ---------------- TOGGLE BETWEEN LOGIN & SIGNUP ----------------
if (loginBtn && signupBtn && loginForm && signupForm) {
  loginBtn.addEventListener("click", () => {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");
  });

  signupBtn.addEventListener("click", () => {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");
  });
}

// ---------------- LOGIN ----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = loginForm.querySelectorAll("input");
    const identifier = inputs[0].value.trim(); // username or email
    const password = inputs[1].value.trim();

    if (!identifier || !password) {
      alert("Please enter all fields!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Login failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  });
}

// ---------------- SIGNUP ----------------
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = signupForm.querySelectorAll("input");
    const username = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value.trim();

    if (!username || !email || !password) {
      alert("Please fill all fields!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok || res.status === 201) {
        alert("Signup successful! Please login.");
        signupForm.reset();
        signupForm.style.display = "none";
        loginForm.style.display = "block";
        loginBtn.classList.add("active");
        signupBtn.classList.remove("active");
      } else {
        alert(data.message || "Signup failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  });
}
