// frontend/js/dashboard.js

const feedContainer = document.getElementById("feedContainer");
const postForm = document.getElementById("postForm");
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const POSTS_URL = "https://social-blog-platform.onrender.com/api/posts";

// Redirect to login if not logged in
if (!token || !user) {
  window.location.href = "/index.html";
}

// ---------------- FETCH POSTS ----------------
const fetchPosts = async () => {
  if (!feedContainer) return;

  try {
    const res = await fetch(POSTS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch posts");

    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    console.error(err);
    feedContainer.innerHTML = "<p>Failed to load posts. Try again.</p>";
  }
};

// ---------------- RENDER POSTS ----------------
const renderPosts = (posts) => {
  if (!feedContainer) return;
  feedContainer.innerHTML = "";

  posts.forEach((post) => {
    const isOwner = post.user?._id === user.id;

    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    postDiv.innerHTML = `
      <h4>${post.user?.username || "Unknown"}</h4>
      <p>${post.content}</p>
      ${post.image ? `<img src="${post.image}" alt="Post image" />` : ""}
      <small>${new Date(post.createdAt).toLocaleString()}</small>
      ${
        isOwner
          ? `<button class="editBtn" data-id="${post._id}">Edit</button>
             <button class="deleteBtn" data-id="${post._id}">Delete</button>`
          : ""
      }
    `;

    feedContainer.appendChild(postDiv);
  });

  // Attach delete events
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const postId = e.target.dataset.id;
      await deletePost(postId);
    });
  });

  // Attach edit events
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const postId = e.target.dataset.id;
      const content = prompt("Edit your post:");
      if (content) updatePost(postId, content);
    });
  });
};

// ---------------- DELETE POST ----------------
const deletePost = async (id) => {
  try {
    const res = await fetch(`${POSTS_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Delete failed");

    fetchPosts();
  } catch (err) {
    console.error(err);
    alert("Failed to delete post.");
  }
};

// ---------------- UPDATE POST ----------------
const updatePost = async (id, content) => {
  try {
    const res = await fetch(`${POSTS_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) throw new Error("Update failed");

    fetchPosts();
  } catch (err) {
    console.error(err);
    alert("Failed to update post.");
  }
};

// ---------------- CREATE POST ----------------
if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = e.target.content.value.trim();
    const image = e.target.image.value.trim();

    if (!content) return alert("Post content cannot be empty");

    try {
      const res = await fetch(POSTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, image }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      e.target.reset();
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    }
  });
}

// Initial fetch
fetchPosts();
