// frontend/js/dashboard.js
(() => {
  const feedContainer = document.getElementById("feedContainer");
  const postModal = document.getElementById("postModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const submitPostBtn = document.getElementById("submitPost");
  const postContent = document.getElementById("postContent");
  const postFile = document.getElementById("postFile");

  const profilePic = document.getElementById("profilePic");
  const profileName = document.getElementById("profileName");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // <-- Set BACKEND_URL to your backend host (production or local)
  const BACKEND_URL = "https://social-blog-platform.onrender.com";
  const POSTS_URL = `${BACKEND_URL}/api/posts`;
  const PROFILE_URL = `${BACKEND_URL}/api/users/me`;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // If you require login to view dashboard, redirect
  if (!token || !user) {
    alert("You must log in first!");
    window.location.href = "/index.html";
    return;
  }

  // safe UI updates
  profileName && (profileName.innerText = user.username || "User");
  profilePic && (profilePic.src = user.profilePic || "https://via.placeholder.com/40");

  logoutBtn && logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  });

  openModalBtn && openModalBtn.addEventListener("click", () => (postModal.style.display = "flex"));
  closeModalBtn && closeModalBtn.addEventListener("click", () => (postModal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === postModal) postModal.style.display = "none";
  });

  // Auth-aware fetch wrapper
  const authFetch = async (url, options = {}) => {
    options.headers = options.headers || {};
    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    // If we're sending JSON body, leave Content-Type alone when body is FormData
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      const message = (data && data.message) || res.statusText || "Server error";
      const err = new Error(message);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  };

  // Fetch posts — use authFetch (sends token if exists); backend GET may be public but sending token safe
  const fetchPosts = async () => {
    feedContainer.innerHTML = `<p>Loading posts…</p>`;
    try {
      const posts = await authFetch(POSTS_URL, { method: "GET" });
      if (!Array.isArray(posts)) throw new Error("Invalid posts response");
      renderPosts(posts);
    } catch (err) {
      console.error("fetchPosts error:", err);
      feedContainer.innerHTML =
        `<p style="color:red;">Failed to load posts: ${err.message}</p>`;
    }
  };

  // Render posts robustly (handles populated user object or user id string)
  const renderPosts = (posts) => {
    feedContainer.innerHTML = "";
    // show newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    posts.forEach((post) => {
      const postUserId = post.user && (post.user._id || post.user) ? (post.user._id || post.user).toString() : null;
      const currentUserId = user.id || user._id || user._id_str;
      const isOwner = postUserId && currentUserId && postUserId === currentUserId.toString();
      const isAdmin = !!user.isAdmin;
      const showButtons = isOwner || isAdmin;

      const postDiv = document.createElement("div");
      postDiv.classList.add("post");

      // Build media HTML safely
      let mediaHTML = "";
      if (post.fileUrl && post.fileType) {
        const t = post.fileType.toLowerCase();
        if (t.startsWith("image")) {
          mediaHTML = `<img src="${escapeHtml(post.fileUrl)}" alt="post image" style="max-width:100%;border-radius:8px;margin-top:8px;">`;
        } else if (t.startsWith("video")) {
          mediaHTML = `<video controls style="max-width:100%;border-radius:8px;margin-top:8px;"><source src="${escapeHtml(post.fileUrl)}" type="${escapeHtml(post.fileType)}">Your browser does not support the video tag.</video>`;
        } else if (t.startsWith("audio")) {
          mediaHTML = `<audio controls style="width:100%;margin-top:8px;"><source src="${escapeHtml(post.fileUrl)}" type="${escapeHtml(post.fileType)}">Your browser does not support the audio element.</audio>`;
        } else {
          // fallback link
          mediaHTML = `<a href="${escapeHtml(post.fileUrl)}" target="_blank" rel="noopener">Open attachment</a>`;
        }
      }

      const authorName = (post.user && (post.user.username || post.user.email)) || post.username || "Unknown";

      postDiv.innerHTML = `
        <div class="post-metadata">
          <strong>${escapeHtml(authorName)}</strong>
          <div style="color: #999; font-size: 0.9em; margin-top:4px;">${post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</div>
        </div>
        <div class="post-content" style="margin-top:8px;">${escapeHtml(post.content || "")}</div>
        <div class="media-container">${mediaHTML}</div>
        ${showButtons ? `<div class="btn-group" style="margin-top:8px;">
            <button class="editBtn" data-id="${post._id}">Edit</button>
            <button class="deleteBtn" data-id="${post._id}">Delete</button>
          </div>` : ""}
      `;

      feedContainer.appendChild(postDiv);
    });

    // Attach button listeners
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!id) return;
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
          await authFetch(`${POSTS_URL}/${id}`, { method: "DELETE" });
          fetchPosts();
        } catch (err) {
          alert("Failed to delete post: " + err.message);
        }
      });
    });

    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        const newContent = prompt("Edit your post:");
        if (!newContent) return;
        try {
          await authFetch(`${POSTS_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          });
          fetchPosts();
        } catch (err) {
          alert("Failed to update post: " + err.message);
        }
      });
    });
  };

  const getFileTag = (type) => {
    if (!type) return "a";
    if (type.startsWith("image")) return "img";
    if (type.startsWith("video")) return "video";
    if (type.startsWith("audio")) return "audio";
    return "a";
  };

  // Submit post (FormData for file + content)
  submitPostBtn && submitPostBtn.addEventListener("click", async () => {
    const content = (postContent.value || "").trim();
    const file = postFile.files && postFile.files[0];

    if (!content && !file) return alert("Post cannot be empty");

    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      await authFetch(POSTS_URL, { method: "POST", body: formData });
      postContent.value = "";
      postFile.value = "";
      postModal.style.display = "none";
      fetchPosts();
    } catch (err) {
      alert("Failed to create post: " + err.message);
    }
  });

  // Edit profile
  editProfileBtn && editProfileBtn.addEventListener("click", async () => {
    const newUsername = prompt("Enter new username:", user.username);
    if (!newUsername) return;
    try {
      await authFetch(PROFILE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      user.username = newUsername;
      localStorage.setItem("user", JSON.stringify(user));
      profileName.innerText = newUsername;
      alert("Profile updated!");
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    }
  });

  // small helper to escape HTML to avoid XSS when inserting user content
  function escapeHtml(unsafe) {
    return String(unsafe || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Auto-refresh and initial fetch
  setInterval(fetchPosts, 15000);
  fetchPosts();
})();
