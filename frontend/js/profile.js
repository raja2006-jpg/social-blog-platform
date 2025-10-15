const profileForm = document.getElementById('profileForm');
const API_URL = "http://localhost:5000/api/users/me";
const token = localStorage.getItem('token');

const loadProfile = async () => {
    try {
        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        const user = await res.json();
        if (profileForm) {
            profileForm.username.value = user.username;
            profileForm.email.value = user.email;
        }
    } catch (err) {
        console.error(err);
    }
};

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
                alert('Profile updated!');
            } else alert(data.message);
        } catch (err) {
            console.error(err);
        }
    });
}

loadProfile();
