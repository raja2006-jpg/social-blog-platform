const token = localStorage.getItem('token');
const API_USERS = "http://localhost:5000/api/admin/users";
const API_POSTS = "http://localhost:5000/api/admin/posts";

const usersContainer = document.getElementById('usersContainer');
const postsContainer = document.getElementById('adminPostsContainer');

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
    } catch (err) { console.error(err); }
};

const deleteUser = async (id) => {
    try {
        const res = await fetch(`${API_USERS}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) fetchUsers();
    } catch (err) { console.error(err); }
};

const fetchPosts = async () => {
    try {
        const res = await fetch(API_POSTS, { headers: { Authorization: `Bearer ${token}` } });
        const posts = await res.json();
        postsContainer.innerHTML = posts.map(p => `
            <div>
                ${p.username}: ${p.content}
                <button onclick="deletePost('${p._id}')">Delete</button>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
};

const deletePost = async (id) => {
    try {
        const res = await fetch(`${API_POSTS}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) fetchPosts();
    } catch (err) { console.error(err); }
};

// Load admin data
fetchUsers();
fetchPosts();
