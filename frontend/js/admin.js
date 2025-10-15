// frontend/js/admin.js
const token = localStorage.getItem('token');
const API_USERS = "https://social-blog-backend.onrender.com/api/users";
const API_POSTS = "https://social-blog-backend.onrender.com/api/posts";

const usersContainer = document.getElementById('usersContainer');
const postsContainer = document.getElementById('adminPostsContainer');

// Fetch all users
const fetchUsers = async () => {
    try {
        const res = await fetch(API_USERS, { headers: { Authorization: `Bearer ${token}` } });
        const users = await res.json();
        usersContainer.innerHTML = users.map(u => `
            <div>
                ${u.username} (${u.email})
                <button onclick="deleteUser('${u._id}')">Delete</button>
            </div>
        `).join('');
    } catch (err) { console.error(err); usersContainer.innerHTML = "<p>Failed to load users</p>"; }
};

// Delete a user
const deleteUser = async (id) => {
    try {
        const res = await fetch(`${API_USERS}/${id}`, { 
            method: 'DELETE', 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) fetchUsers();
        else alert("Failed to delete user");
    } catch (err) { console.error(err); alert("Error deleting user"); }
};

// Fetch all posts
const fetchPosts = async () => {
    try {
        const res = await fetch(API_POSTS, { headers: { Authorization: `Bearer ${token}` } });
        const posts = await res.json();
        postsContainer.innerHTML = posts.map(p => `
            <div>
                <strong>${p.username}</strong>: ${p.content}
                <button onclick="deletePost('${p._id}')">Delete</button>
            </div>
        `).join('');
    } catch (err) { console.error(err); postsContainer.innerHTML = "<p>Failed to load posts</p>"; }
};

// Delete a post
const deletePost = async (id) => {
    try {
        const res = await fetch(`${API_POSTS}/${id}`, { 
            method: 'DELETE', 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) fetchPosts();
        else alert("Failed to delete post");
    } catch (err) { console.error(err); alert("Error deleting post"); }
};

// Initialize admin dashboard
fetchUsers();
fetchPosts();
