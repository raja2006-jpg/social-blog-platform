(() => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  const BACKEND_URL = "https://social-blog-platform.onrender.com";

  // =============================
  // Toggle login/signup forms
  // =============================
  loginBtn.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");
  });

  signupBtn.addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");
  });

  // =============================
  // LOGIN FUNCTION
  // =============================
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!identifier || !password) {
      return alert("Enter both username/email and password");
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 👇 Change 'email' to 'username' if your backend expects username
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard.html";
      } else {
        alert(data.message || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Try again later.");
    }
  });

  // =============================
  // SIGNUP FUNCTION
  // =============================
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!username || !email || !password) {
      return alert("Please fill all fields");
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful! You can now log in.");
        loginBtn.click(); // switch to login form
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Server error. Try again later.");
    }
  });
})();
