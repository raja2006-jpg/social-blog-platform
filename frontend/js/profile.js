// frontend/js/profile.js

const profileForm = document.getElementById('profileForm');
const token = localStorage.getItem('token');

// ⚡ Replace with your deployed backend URL for current user
const API_URL = "https://social-blog-backend.onrender.com/api/users/me";

// Redirect if not logged in
if (!token) {
    alert("You must be logged in to view this page.");
    window.location.href = "index.html";
}

// Load user profile
const loadProfile = async () => {
    try {
        const res = await fetch(API_URL, { 
            headers: { Authorization: `Bearer ${token}` } 
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const user = await res.json();
        if (profileForm) {
            profileForm.username.value = user.username;
            profileForm.email.value = user.email;
        }
    } catch (err) {
        console.error(err);
        alert("Failed to load profile. Please try again later.");
    }
};

// Update profile
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = profileForm.username.value.trim();
        const email = profileForm.email.value.trim();
        const password = profileForm.password.value.trim();

        if (!username || !email) {
            alert("Username and email cannot be empty.");
            return;
        }

        try {
            const res = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                alert('Profile updated successfully!');
            } else {
                alert(data.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update profile. Please try again later.");
        }
    });
}

// Initial load
loadProfile();
