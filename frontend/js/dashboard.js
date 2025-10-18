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
  if (!token || !user) window.location.href = "/index.html";

  profileName.innerText = user.username;
  profilePic.src = user.profilePic || "https://via.placeholder.com/40";

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  });

  openModalBtn.addEventListener("click", () => postModal.style.display = "flex");
  closeModalBtn.addEventListener("click", () => postModal.style.display = "none");
  window.addEventListener("click", e => { if(e.target === postModal) postModal.style.display = "none"; });

  const fetchPosts = async () => {
    try {
      const res = await fetch(POSTS_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const posts = await res.json();
      renderPosts(posts);
    } catch (err) {
      console.error(err);
      feedContainer.innerHTML = "<p>Failed to load posts.</p>";
    }
  };

  const renderPosts = (posts) => {
    feedContainer.innerHTML = "";
    posts.reverse().forEach(post => {
      const isOwner = post.user?._id === user.id;
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");
      postDiv.innerHTML = `
        <h4>${post.user?.username || "Unknown"}</h4>
        <p>${post.content}</p>
        ${post.fileUrl ? `<${getFileTag(post.fileType)} controls src="${post.fileUrl}"></${getFileTag(post.fileType)}>` : ""}
        <small>${new Date(post.createdAt).toLocaleString()}</small>
        ${isOwner ? `<div class="btn-group">
          <button class="editBtn" data-id="${post._id}">Edit</button>
          <button class="deleteBtn" data-id="${post._id}">Delete</button>
        </div>` : ""}
      `;
      feedContainer.appendChild(postDiv);
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", async e => {
        if(confirm("Are you sure to delete this post?")) await deletePost(e.target.dataset.id);
      });
    });

    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const newContent = prompt("Edit your post:", "");
        if(newContent) await updatePost(e.target.dataset.id, newContent);
      });
    });
  };

  const getFileTag = (type) => {
    if(type.startsWith("image")) return "img";
    if(type.startsWith("video")) return "video";
    if(type.startsWith("audio")) return "audio";
    return "a";
  }

  submitPostBtn.addEventListener("click", async () => {
    const content = postContent.value.trim();
    const file = postFile.files[0];
    if(!content && !file) return alert("Post cannot be empty");

    const formData = new FormData();
    formData.append("content", content);
    if(file) formData.append("file", file);

    try {
      const res = await fetch(POSTS_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if(!res.ok) throw new Error("Failed to create post");

      postContent.value = "";
      postFile.value = "";
      postModal.style.display = "none";
      fetchPosts();
    } catch(err) {
      console.error(err);
      alert("Failed to create post");
    }
  });

  const deletePost = async (id) => {
    try {
      const res = await fetch(`${POSTS_URL}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if(!res.ok) throw new Error("Delete failed");
      fetchPosts();
    } catch(err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const updatePost = async (id, content) => {
    try {
      const res = await fetch(`${POSTS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content })
      });
      if(!res.ok) throw new Error("Update failed");
      fetchPosts();
    } catch(err) {
      console.error(err);
      alert("Failed to update post");
    }
  };

  editProfileBtn.addEventListener("click", async () => {
    const newUsername = prompt("Enter new username:", user.username);
    if(!newUsername) return;
    try {
      const res = await fetch(`${PROFILE_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername })
      });
      if(!res.ok) throw new Error("Profile update failed");
      user.username = newUsername;
      localStorage.setItem("user", JSON.stringify(user));
      profileName.innerText = newUsername;
      alert("Profile updated successfully!");
    } catch(err) {
      console.error(err);
      alert("Failed to update profile");
    }
  });

  setInterval(fetchPosts, 15000);
  fetchPosts();
})();
