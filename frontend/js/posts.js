const postForm = document.getElementById("postForm");
const token = localStorage.getItem("token");

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = postForm.content.value;
    const image = postForm.image.value;

    try {
      const res = await fetch("http://localhost:5000/api/posts", {
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
