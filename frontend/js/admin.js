// frontend/js/admin.js

const token = localStorage.getItem('token');
if (!token) {
    alert("You must be logged in as admin.");
    window.location.href = "index.html";
}

const API_USERS = "https://social-blog-backend.onrender.com/api/users";
const API_POSTS = "https://social-blog-backend.onrender.com/api/posts";

const usersContainer = document.getElementById('adminUsersContainer');
const postsContainer = document.getElementById('adminPostsContainer');

// Fetch all users
const fetchUsers = async () => {
    try {
        const res = await fetch(API_USERS, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch users");
        const users = await res.json();
        if (usersContainer) {
            usersContainer.innerHTML = users.map(u => `
                <div class="admin-item">
                    ${u.username} (${u.email})
                    <button onclick="deleteUser('${u._id}')">Delete</button>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error(err);
        if (usersContainer) usersContainer.innerHTML = "<p>Failed to load users.</p>";
    }
};

// Delete a user
const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
        const res = await fetch(`${API_USERS}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to delete user");
        fetchUsers();
    } catch (err) {
        console.error(err);
        alert("Failed to delete user.");
    }
};

// Fetch all posts
const fetchPosts = async () => {
    try {
        const res = await fetch(API_POSTS, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const posts = await res.json();
        if (postsContainer) {
            postsContainer.innerHTML = posts.map(p => `
                <div class="admin-item">
                    <strong>${p.username}:</strong> ${p.content}
                    <button onclick="deletePost('${p._id}')">Delete</button>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error(err);
        if (postsContainer) postsContainer.innerHTML = "<p>Failed to load posts.</p>";
    }
};

// Delete a post
const deletePost = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
        const res = await fetch(`${API_POSTS}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to delete post");
        fetchPosts();
    } catch (err) {
        console.error(err);
        alert("Failed to delete post.");
    }
};

// Initial load
fetchUsers();
fetchPosts();
