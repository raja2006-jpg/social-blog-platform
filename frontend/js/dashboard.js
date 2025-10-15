// frontend/js/dashboard.js

const feedContainer = document.getElementById("feedContainer");
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// ⚡ Update this URL to your deployed backend URL
const POSTS_URL = "https://social-blog-backend.onrender.com/api/posts";

// Fetch all posts and display
const fetchPosts = async () => {
  if (!token) {
    feedContainer.innerHTML = "<p>Please login to view posts.</p>";
    return;
  }

  try {
    const res = await fetch(POSTS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch posts");

    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    console.error(err);
    feedContainer.innerHTML = "<p>Failed to load posts. Try again later.</p>";
  }
};

// Render posts in feed
const renderPosts = (posts) => {
  feedContainer.innerHTML = "";
  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    postDiv.innerHTML = `
      <h4>${post.username}</h4>
      <p>${post.content}</p>
      ${post.image ? `<img src="${post.image}" alt="Post image" />` : ""}
      <small>${new Date(post.createdAt).toLocaleString()}</small>
      ${
        post.user === user.id
          ? `
        <button class="editBtn" data-id="${post._id}">Edit</button>
        <button class="deleteBtn" data-id="${post._id}">Delete</button>
      `
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

// Delete post
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

// Update post
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

// Initial fetch
if (feedContainer) fetchPosts();
