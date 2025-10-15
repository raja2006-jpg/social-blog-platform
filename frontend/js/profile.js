// frontend/js/profile.js

const profileForm = document.getElementById('profileForm');
const token = localStorage.getItem('token');

// ⚡ Replace with your deployed backend URL
const API_URL = "https://social-blog-platform.onrender.com/api";


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
        alert("Failed to load profile.");
    }
};

// Update profile
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = profileForm.username.value;
        const email = profileForm.email.value;
        const password = profileForm.password.value;

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
            alert("Failed to update profile.");
        }
    });
}

// Initial load
loadProfile();
