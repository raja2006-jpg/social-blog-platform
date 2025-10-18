// frontend/js/dashboard.js
// Instagram-like feed features: likes, comments, edit/delete, admin delete, auto-refresh

(() => {
  const BACKEND = "https://social-blog-platform.onrender.com";
  const POSTS_URL = `${BACKEND}/api/posts`;
  const USERS_URL = `${BACKEND}/api/users`;

  // elements
  const feedContainer = document.getElementById("feedContainer");
  const postForm = document.getElementById("postForm");
  const postContentEl = document.getElementById("postContent");
  const postImageEl = document.getElementById("postImage");
  const submitPostBtn = document.getElementById("submitPostBtn");
  const clearPostBtn = document.getElementById("clearPostBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const toggleAutoBtn = document.getElementById("toggleAutoBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const navAvatar = document.getElementById("navAvatar");
  const navUsername = document.getElementById("navUsername");
  const navEmail = document.getElementById("navEmail");
  const welcomeAvatar = document.getElementById("welcomeAvatar");
  const welcomeUsername = document.getElementById("welcomeUsername");
  const welcomeEmail = document.getElementById("welcomeEmail");
  const miniAvatar = document.getElementById("miniAvatar");
  const miniName = document.getElementById("miniName");
  const miniEmail = document.getElementById("miniEmail");
  const adminControls = document.getElementById("adminControls");
  const manageUsersBtn = document.getElementById("manageUsersBtn");
  const modalRoot = document.getElementById("modalRoot");

  let token = localStorage.getItem("token");
  let user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    // Not logged in → redirect
    window.location.href = "/index.html";
    return;
  }

  // If server provides more user info (isAdmin), try to fetch fresh profile
  async function fetchProfile() {
    try {
      // Try endpoint /api/users/me (if exists) or /api/users/:id
      const res = await fetch(`${USERS_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        user = { ...user, ...data };
        localStorage.setItem("user", JSON.stringify(user));
        return;
      }
    } catch (err) {
      // ignore, try fallback
    }
    // fallback to GET /api/users/:id if available
    try {
      const res2 = await fetch(`${USERS_URL}/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res2.ok) {
        const data = await res2.json();
        user = { ...user, ...data };
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (err) {
      // ignore - isAdmin remains whatever is in localStorage
    }
  }

  // UI init
  function renderProfileUI() {
    const avatar = user.profilePic || "assets/default-avatar.png";
    navAvatar.src = avatar;
    welcomeAvatar.src = avatar;
    miniAvatar.src = avatar;
    navUsername.textContent = user.username || "User";
    navEmail.textContent = user.email || "";
    welcomeUsername.textContent = user.username || "Welcome";
    welcomeEmail.textContent = user.email || "";
    miniName.textContent = user.username || "—";
    miniEmail.textContent = user.email || "—";

    // admin controls
    const isAdmin = Boolean(user.isAdmin);
    if (isAdmin) {
      adminControls.style.display = "inline-block";
    } else {
      adminControls.style.display = "none";
    }
  }

  // POST CREATE
  async function createPost(content, image) {
    try {
      const res = await fetch(POSTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, image }),
      });
      if (!res.ok) throw new Error("Create failed");
      return true;
    } catch (err) {
      console.error("Create post error:", err);
      alert("Failed to create post");
      return false;
    }
  }

  // FETCH all posts (global feed)
  async function fetchPosts() {
    if (!feedContainer) return;
    feedContainer.innerHTML = "<div class='small'>Loading feed…</div>";
    try {
      const res = await fetch(POSTS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const posts = await res.json();
      renderPosts(posts);
    } catch (err) {
      console.error("Fetch posts error:", err);
      feedContainer.innerHTML = "<p class='small'>Failed to load posts. Try again.</p>";
    }
  }

  // RENDER POSTS
  function renderPosts(posts) {
    feedContainer.innerHTML = "";
    if (!Array.isArray(posts) || posts.length === 0) {
      feedContainer.innerHTML = "<div class='small'>No posts yet — be the first!</div>";
      return;
    }

    posts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    posts.forEach(post => {
      const author = post.user || post.author || { username: "Unknown", _id: null, profilePic: "" };
      const authorId = author._id || author.id || post.user;
      const isOwner = String(authorId) === String(user.id);
      const isAdmin = Boolean(user.isAdmin);
      const liked = Array.isArray(post.likes) && post.likes.includes(user.id);

      const card = document.createElement("article");
      card.className = "post-card";
      card.innerHTML = `
        <div class="post-header">
          <img src="${author.profilePic || 'assets/default-avatar.png'}" width="48" height="48" style="border-radius:50%;object-fit:cover" />
          <div style="flex:1">
            <div style="display:flex; gap:8px; align-items:center">
              <div class="post-creator">${escapeHtml(author.username || "Unknown")}</div>
              ${isAdmin && "<span class='admin-badge'>ADMIN</span>" || ""}
            </div>
            <div class="small">${timeAgo(post.createdAt)}</div>
          </div>
          <div style="display:flex; gap:8px">
            ${isOwner ? `<button class="btn ghost editBtn" data-id="${post._id}">Edit</button>` : ""}
            ${(isOwner || isAdmin) ? `<button class="btn ghost deleteBtn" data-id="${post._id}">Delete</button>` : ""}
          </div>
        </div>

        <div class="post-content">${escapeHtml(post.content || "")}</div>
        ${post.image ? `<img class="post-image" src="${escapeAttr(post.image)}" alt="post image" />` : ""}
        <div class="post-actions">
          <button class="like-btn ${liked ? "liked" : ""}" data-id="${post._id}">
            <span class="like-icon">${liked ? "♥" : "♡"}</span>
            <span class="like-count">${Array.isArray(post.likes) ? post.likes.length : 0}</span>
          </button>
          <button class="btn ghost commentBtn" data-id="${post._id}">Comments (${Array.isArray(post.comments)?post.comments.length:0})</button>
        </div>
      `;

      feedContainer.appendChild(card);
    });

    // attach event listeners
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        confirmAndDelete(id);
      });
    });
    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        startEditPost(id);
      });
    });
    document.querySelectorAll(".like-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        toggleLike(id, e.currentTarget);
      });
    });
    document.querySelectorAll(".commentBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        openCommentsModal(id);
      });
    });
  }

  // Escape helper
  function escapeHtml(s = "") {
    return String(s)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;");
  }
  function escapeAttr(s = "") {
    return String(s).replace(/"/g,"&quot;");
  }

  // time ago friendly
  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff/60)}m`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h`;
    return d.toLocaleString();
  }

  // DELETE (confirm)
  async function confirmAndDelete(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${POSTS_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchPosts();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post.");
    }
  }

  // EDIT flow: fetch post content, prompt, call PUT
  async function startEditPost(id) {
    try {
      const getRes = await fetch(`${POSTS_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!getRes.ok) throw new Error("Cannot fetch post");
      const post = await getRes.json();
      const newContent = prompt("Edit your post:", post.content || "");
      if (!newContent || newContent.trim() === post.content) return;
      const putRes = await fetch(`${POSTS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newContent }),
      });
      if (!putRes.ok) throw new Error("Update failed");
      await fetchPosts();
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update post.");
    }
  }

  // Like / Unlike (optimistic)
  async function toggleLike(id, btnEl) {
    try {
      const liked = btnEl.classList.contains("liked");
      // optimistic UI
      const countSpan = btnEl.querySelector(".like-count");
      const current = parseInt(countSpan?.textContent || "0", 10);
      if (liked) {
        btnEl.classList.remove("liked");
        countSpan.textContent = Math.max(0, current - 1);
      } else {
        btnEl.classList.add("liked");
        countSpan.textContent = current + 1;
      }

      // call backend — prefer POST /api/posts/:id/like (toggle) or endpoint your backend offers
      const res = await fetch(`${POSTS_URL}/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // rollback if failed
        if (liked) {
          btnEl.classList.add("liked");
          countSpan.textContent = current;
        } else {
          btnEl.classList.remove("liked");
          countSpan.textContent = current;
        }
        throw new Error("Like failed");
      }
      // optionally update UI with server response
    } catch (err) {
      console.error("Like error:", err);
      alert("Failed to like/unlike post.");
    }
  }

  // COMMENTS modal
  function openCommentsModal(postId) {
    // build modal markup
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between">
        <h3>Comments</h3>
        <div class="close-x" id="closeModal">×</div>
      </div>
      <div id="commentsContainer" style="margin-top:8px;max-height:300px;overflow:auto"></div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <input id="newCommentInput" placeholder="Write a comment..." style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6e7eb" />
        <button id="sendCommentBtn" class="btn primary">Send</button>
      </div>
    `;
    backdrop.appendChild(modal);
    modalRoot.appendChild(backdrop);

    // close handlers
    function close() { backdrop.remove(); }
    modal.querySelector("#closeModal").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

    // load comments
    (async function loadComments() {
      try {
        const res = await fetch(`${POSTS_URL}/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch post");
        const post = await res.json();
        const comments = Array.isArray(post.comments) ? post.comments : [];
        const container = modal.querySelector("#commentsContainer");
        container.innerHTML = "";
        if (comments.length === 0) container.innerHTML = "<div class='small'>No comments yet</div>";
        comments.forEach(c => {
          const el = document.createElement("div");
          el.className = "comment";
          const who = (c.user && (c.user.username || c.user.email)) || "Someone";
          el.innerHTML = `<div style="font-weight:700">${escapeHtml(who)}</div>
                          <div style="margin-top:6px">${escapeHtml(c.text || c.content || "")}</div>
                          <div class="small" style="margin-top:6px">${timeAgo(c.createdAt)}</div>`;
          container.appendChild(el);
        });
      } catch (err) {
        console.error("Load comments error:", err);
      }
    })();

    // send comment handler
    modal.querySelector("#sendCommentBtn").addEventListener("click", async () => {
      const input = modal.querySelector("#newCommentInput");
      const text = (input.value || "").trim();
      if (!text) return;
      try {
        const res = await fetch(`${POSTS_URL}/${postId}/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("Comment failed");
        input.value = "";
        // reload comments
        const container = modal.querySelector("#commentsContainer");
        container.innerHTML = "<div class='small'>Refreshing comments…</div>";
        // small delay to let backend update
        setTimeout(() => {
          loadComments();
        }, 400);
      } catch (err) {
        console.error("Comment error:", err);
        alert("Failed to post comment.");
      }
    });
  }

  // Auto-refresh controls
  let autoRefresh = true;
  let autoTimer = null;
  function setAuto(value) {
    autoRefresh = !!value;
    toggleAutoBtn.textContent = `Auto: ${autoRefresh ? "On" : "Off"}`;
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    if (autoRefresh) autoTimer = setInterval(fetchPosts, 12000);
  }

  // confirm logout
  logoutBtn.addEventListener("click", () => {
    if (!confirm("Logout now?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  });

  // refresh and toggle
  refreshBtn.addEventListener("click", fetchPosts);
  toggleAutoBtn.addEventListener("click", () => setAuto(!autoRefresh));
  clearPostBtn.addEventListener("click", () => { postContentEl.value = ""; postImageEl.value = ""; });

  // POST submit
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = (postContentEl.value || "").trim();
    const image = (postImageEl.value || "").trim();
    if (!content) return alert("Write something to post");
    submitPostBtn.disabled = true;
    const ok = await createPost(content, image);
    submitPostBtn.disabled = false;
    if (ok) {
      postContentEl.value = "";
      postImageEl.value = "";
      await fetchPosts();
    }
  });

  // ADMIN manage users placeholder
  manageUsersBtn?.addEventListener("click", () => {
    alert("Admin user management is not implemented in frontend. Open admin panel on backend or build /admin-dashboard.html.");
  });

  // initialize
  (async function init() {
    await fetchProfile();
    renderProfileUI();
    await fetchPosts();
    setAuto(true);
  })();

  // expose for debugging (optional)
  window.SOCIALBLOG = { fetchPosts, createPost, toggleLike, openCommentsModal };

})();
