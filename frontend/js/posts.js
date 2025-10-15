// frontend/js/posts.js

const postForm = document.getElementById("postForm");
const token = localStorage.getItem("token");

// ⚡ Update this URL to your deployed backend URL
const API_URL = "https://social-blog-platform.onrender.com/api";
const POSTS_URL = "https://social-blog-backend.onrender.com/api/posts";

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = postForm.content.value;
    const image = postForm.image.value;

    try {
      const res = await fetch(POSTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, image }),
      });

      if (res.ok) {
        postForm.reset();
        alert("Post added successfully!");
        window.location.reload(); // refresh feed
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add post.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add post.");
    }
  });
}
