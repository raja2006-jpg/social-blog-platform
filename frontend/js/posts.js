// frontend/js/posts.js

const postForm = document.getElementById("postForm");
const token = localStorage.getItem("token");

// ⚡ Update this URL to your deployed backend URL
const POSTS_URL = "https://social-blog-backend.onrender.com/api/posts";

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    const content = postForm.content.value.trim();
    const image = postForm.image.value.trim();

    if (!content) {
      alert("Post content cannot be empty.");
      return;
    }

    try {
      const res = await fetch(POSTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, image }),
      });

      const data = await res.json();

      if (res.ok) {
        postForm.reset();
        alert("Post added successfully!");
        window.location.reload(); // refresh feed
      } else {
        alert(data.message || "Failed to add post.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add post. Please try again later.");
    }
  });
}
