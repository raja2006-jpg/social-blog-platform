(() => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  // Deployed backend URL
  const BACKEND_URL = "https://social-blog-platform.onrender.com";

  // ------------------- LOGIN -------------------
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
          body: JSON.stringify({ identifier, password }),
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
  }

  // ------------------- SIGNUP -------------------
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
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Signup successful! You can now log in.");
          document.getElementById("loginBtn").click(); // Switch to login form
        } else {
          alert(data.message || "Signup failed. Try again.");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("Server error. Try again later.");
      }
    });
  }
})();
