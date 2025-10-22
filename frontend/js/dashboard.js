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

  const BACKEND_URL = "https://social-blog-platform.onrender.com";
  const POSTS_URL = `${BACKEND_URL}/api/posts`;
  const PROFILE_URL = `${BACKEND_URL}/api/users`;

  // Get user info and token
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect if not logged in
  if (!token || !user) {
    alert("You must log in first!");
    window.location.href = "/index.html";
  }

  // Display user info
  profileName.innerText = user.username;
  profilePic.src = user.profilePic || "https://via.placeholder.com/40";

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  });

  // Open/Close Post Modal
  openModalBtn.addEventListener("click", () => (postModal.style.display = "flex"));
  closeModalBtn.addEventListener("click", () => (postModal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === postModal) postModal.style.display = "none";
  });

  // Common fetch wrapper to handle token and errors
  const authFetch = async (url, options = {}) => {
    try {
      // 1. Initialize headers safely
      options.headers = {
        ...options.headers, // Merge existing headers
        "Authorization": `Bearer ${token}` // Ensure Authorization is set (and potentially overrides a prior one)
      };

      const res = await fetch(url, options);

      // Attempt to parse JSON, falling back to null on failure
      // We read the body only once, regardless of res.ok
      let data = null;
      try {
          data = await res.json();
      } catch (e) {
          // If JSON parsing fails (e.g., a 500 error returns a non-JSON HTML page),
          // data remains null, and we'll check res.ok below.
      }

      if (!res.ok) {
        // Use the error message from the JSON data if available, otherwise a default status text.
        // For a 500 error, data is often null or has no message, so the default is used.
        const errorMessage = data?.message || res.statusText || "Server error";
        throw new Error(errorMessage);
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const posts = await authFetch(POSTS_URL);
      renderPosts(posts);
    } catch (err) {
      console.error(err);
      // Display the specific error message from authFetch
      feedContainer.innerHTML = `<p style="color:red;">Failed to load posts: ${err.message}</p>`;
    }
  };

  // Render posts
  const renderPosts = (posts) => {
    feedContainer.innerHTML = "";
    posts.reverse().forEach((post) => {
      // Corrected: Check for user property for both object and string ID. 
      // Assuming user.id is the current logged-in user's ID string
      const isOwner = (post.user && post.user._id === user.id) || (post.user === user.id); 
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");

      let fileHTML = "";
      if (post.fileUrl && post.fileType) {
        const tag = getFileTag(post.fileType);
        fileHTML =
          tag === "a"
            ? `<a href="${post.fileUrl}" target="_blank">View File</a>`
            : `<${tag} controls src="${post.fileUrl}"></${tag}>`;
      }

      postDiv.innerHTML = `
        <h4>${post.user?.username || post.username || "Unknown"}</h4>
        <p>${post.content || ""}</p>
        ${fileHTML}
        <small>${new Date(post.createdAt).toLocaleString()}</small>
        ${
          isOwner
            ? `<div class="btn-group">
                <button class="editBtn" data-id="${post._id}">Edit</button>
                <button class="deleteBtn" data-id="${post._id}">Delete</button>
              </div>`
            : ""
        }
      `;
      feedContainer.appendChild(postDiv);
    });

    // Add listeners
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this post?")) await deletePost(id);
      });
    });

    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const newContent = prompt("Edit your post:", "");
        if (newContent) await updatePost(id, newContent);
      });
    });
  };

  const getFileTag = (type) => {
    if (type.startsWith("image")) return "img";
    if (type.startsWith("video")) return "video";
    if (type.startsWith("audio")) return "audio";
    return "a";
  };

  // Submit post
  submitPostBtn.addEventListener("click", async () => {
    const content = postContent.value.trim();
    const file = postFile.files[0];

    if (!content && !file) return alert("Post cannot be empty");

    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      // Note: Do NOT set Content-Type header for FormData, fetch handles it automatically.
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
      // Corrected: The options object needs to be constructed completely for authFetch to merge the headers correctly.
      await authFetch(`${POSTS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, // This content type is mandatory for JSON body.
        body: JSON.stringify({ content }),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to update post: " + err.message);
    }
  };

  // Edit profile
  editProfileBtn.addEventListener("click", async () => {
    const newUsername = prompt("Enter new username:", user.username);
    if (!newUsername) return;

    try {
      await authFetch(`${PROFILE_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      
      // Update local storage and UI only after successful API call
      user.username = newUsername;
      localStorage.setItem("user", JSON.stringify(user));
      profileName.innerText = newUsername;
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile: " + err.message);
    }
  });

  // Auto-refresh
  setInterval(fetchPosts, 15000);
  fetchPosts();
})();