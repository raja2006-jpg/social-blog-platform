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

  const BACKEND_URL = "https://social-blog-platform.onrender.com";
  const POSTS_URL = `${BACKEND_URL}/api/posts`;
  const PROFILE_URL = `${BACKEND_URL}/api/users`;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    alert("You must log in first!");
    window.location.href = "/index.html";
  }

  profileName.innerText = user.username;
  profilePic.src = user.profilePic || "https://via.placeholder.com/40";

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  });

  openModalBtn.addEventListener("click", () => (postModal.style.display = "flex"));
  closeModalBtn.addEventListener("click", () => (postModal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === postModal) postModal.style.display = "none";
  });

  // ---------------- AUTH FETCH ----------------
  const authFetch = async (url, options = {}) => {
    try {
      options.headers = options.headers || {};
      if (!(options.body instanceof FormData)) {
        options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
      }
      options.headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, options);

      let data = null;
      try { data = await res.json(); } catch (e) {}

      if (!res.ok) {
        throw new Error(data?.message || res.statusText || "Server error");
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  // ---------------- POSTS ----------------
  const fetchPosts = async () => {
    try {
      const posts = await authFetch(POSTS_URL);
      renderPosts(posts);
    } catch (err) {
      feedContainer.innerHTML = `<p style="color:red;">Failed to load posts: ${err.message}</p>`;
      console.error(err);
    }
  };

  const renderPosts = (posts) => {
    feedContainer.innerHTML = "";
    posts.reverse().forEach((post) => {
      const isOwner = (post.user?._id === user.id) || (post.user === user.id);
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");

      let fileHTML = "";
      if (post.fileUrl && post.fileType) {
        const tag = getFileTag(post.fileType);
        fileHTML = tag === "a"
          ? `<a href="${post.fileUrl}" target="_blank">View File</a>`
          : `<${tag} controls src="${post.fileUrl}"></${tag}>`;
      }

      postDiv.innerHTML = `
        <h4>${post.user?.username || post.username || "Unknown"}</h4>
        <p>${post.content || ""}</p>
        ${fileHTML}
        <small>${new Date(post.createdAt).toLocaleString()}</small>
        ${isOwner ? `<div class="btn-group">
          <button class="editBtn" data-id="${post._id}">Edit</button>
          <button class="deleteBtn" data-id="${post._id}">Delete</button>
        </div>` : ""}
      `;
      feedContainer.appendChild(postDiv);
    });

    document.querySelectorAll(".deleteBtn").forEach(btn =>
      btn.addEventListener("click", async (e) => {
        if (confirm("Are you sure you want to delete this post?")) {
          await deletePost(e.target.dataset.id);
        }
      })
    );

    document.querySelectorAll(".editBtn").forEach(btn =>
      btn.addEventListener("click", async (e) => {
        const newContent = prompt("Edit your post:", "");
        if (newContent) await updatePost(e.target.dataset.id, newContent);
      })
    );
  };

  const getFileTag = (type) => {
    if (type.startsWith("image")) return "img";
    if (type.startsWith("video")) return "video";
    if (type.startsWith("audio")) return "audio";
    return "a";
  };

  submitPostBtn.addEventListener("click", async () => {
    const content = postContent.value.trim();
    const file = postFile.files[0];

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
      console.error(err);
      alert("Failed to create post: " + err.message);
    }
  });

  const deletePost = async (id) => {
    try {
      await authFetch(`${POSTS_URL}/${id}`, { method: "DELETE" });
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post: " + err.message);
    }
  };

  const updatePost = async (id, content) => {
    try {
      await authFetch(`${POSTS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to update post: " + err.message);
    }
  };

  // ---------------- PROFILE ----------------
  editProfileBtn.addEventListener("click", async () => {
    const newUsername = prompt("Enter new username:", user.username);
    if (!newUsername) return;

    try {
      await authFetch(`${PROFILE_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });

      user.username = newUsername;
      localStorage.setItem("user", JSON.stringify(user));
      profileName.innerText = newUsername;
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile: " + err.message);
    }
  });

  setInterval(fetchPosts, 15000);
  fetchPosts();
})();
