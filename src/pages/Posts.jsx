import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

function Posts() {
  const navigate = useNavigate();

  const [currentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [allComments, setAllComments] = useState([]);

  const [postsFilter, setPostsFilter] = useState("all");

  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("title");

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");

  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostTitle, setEditingPostTitle] = useState("");
  const [editingPostBody, setEditingPostBody] = useState("");

  const [newCommentBody, setNewCommentBody] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      getPosts();
      getAllComments();
    }
  }, [currentUser]);

  async function getPosts() {
    try {
      const res = await fetch(`${API_URL}/posts`);

      if (!res.ok) {
        throw new Error("Failed to load posts");
      }

      const data = await res.json();
      setPosts(data);
      setError("");
    } catch (err) {
      setError("Could not load posts from server");
    }
  }

  async function getAllComments() {
    try {
      const res = await fetch(`${API_URL}/comments`);

      if (!res.ok) {
        throw new Error("Failed to load comments");
      }

      const data = await res.json();
      setAllComments(data);
      setError("");
    } catch (err) {
      setError("Could not load comments from server");
    }
  }

  async function addPost() {
    if (newPostTitle.trim() === "" || newPostBody.trim() === "") {
      setError("Please enter post title and body");
      return;
    }

    try {
      const newPost = {
        userId: currentUser.id,
        title: newPostTitle,
        body: newPostBody,
      };

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) {
        throw new Error("Failed to add post");
      }

      const savedPost = await res.json();

      setPosts([...posts, savedPost]);
      setNewPostTitle("");
      setNewPostBody("");
      setError("");
    } catch (err) {
      setError("Could not add post");
    }
  }

  async function deletePost(id) {
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts(posts.filter((post) => post.id !== id));

      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null);
        setShowComments(false);
        setComments([]);
      }

      setError("");
    } catch (err) {
      setError("Could not delete post");
    }
  }

  function startEditPost(post) {
    setEditingPostId(post.id);
    setEditingPostTitle(post.title);
    setEditingPostBody(post.body);
  }

  async function saveEditPost(post) {
    if (editingPostTitle.trim() === "" || editingPostBody.trim() === "") {
      setError("Post title and body cannot be empty");
      return;
    }

    try {
      const updatedPost = {
        ...post,
        title: editingPostTitle,
        body: editingPostBody,
      };

      const res = await fetch(`${API_URL}/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      });

      if (!res.ok) {
        throw new Error("Failed to update post");
      }

      const data = await res.json();

      setPosts(posts.map((item) => (item.id === post.id ? data : item)));

      if (selectedPost && selectedPost.id === post.id) {
        setSelectedPost(data);
      }

      setEditingPostId(null);
      setEditingPostTitle("");
      setEditingPostBody("");
      setError("");
    } catch (err) {
      setError("Could not update post");
    }
  }

  function cancelEditPost() {
    setEditingPostId(null);
    setEditingPostTitle("");
    setEditingPostBody("");
  }

  function selectPost(post) {
    setSelectedPost(post);
    setShowComments(false);
    setComments([]);
  }

  async function getComments(postId) {
    try {
      const res = await fetch(`${API_URL}/comments?postId=${postId}`);

      if (!res.ok) {
        throw new Error("Failed to load comments");
      }

      const data = await res.json();

      setComments(data);
      setShowComments(true);
      setError("");
    } catch (err) {
      setError("Could not load comments");
    }
  }

  async function addComment() {
    if (!selectedPost) {
      setError("Please select a post first");
      return;
    }

    if (newCommentBody.trim() === "") {
      setError("Please enter comment text");
      return;
    }

    try {
      const newComment = {
        postId: selectedPost.id,
        userId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email || "",
        body: newCommentBody,
      };

      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComment),
      });

      if (!res.ok) {
        throw new Error("Failed to add comment");
      }

      const savedComment = await res.json();

      setComments([...comments, savedComment]);
      setAllComments([...allComments, savedComment]);

      setNewCommentBody("");
      setError("");
    } catch (err) {
      setError("Could not add comment");
    }
  }

  function startEditComment(comment) {
    setEditingCommentId(comment.id);
    setEditingCommentBody(comment.body);
  }

  async function saveEditComment(comment) {
    if (editingCommentBody.trim() === "") {
      setError("Comment cannot be empty");
      return;
    }

    try {
      const updatedComment = {
        ...comment,
        body: editingCommentBody,
      };

      const res = await fetch(`${API_URL}/comments/${comment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedComment),
      });

      if (!res.ok) {
        throw new Error("Failed to update comment");
      }

      const data = await res.json();

      setComments(
        comments.map((item) => (item.id === comment.id ? data : item))
      );

      setAllComments(
        allComments.map((item) => (item.id === comment.id ? data : item))
      );

      setEditingCommentId(null);
      setEditingCommentBody("");
      setError("");
    } catch (err) {
      setError("Could not update comment");
    }
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentBody("");
  }

  async function deleteComment(id) {
    try {
      const res = await fetch(`${API_URL}/comments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments(comments.filter((comment) => comment.id !== id));
      setAllComments(allComments.filter((comment) => comment.id !== id));

      setError("");
    } catch (err) {
      setError("Could not delete comment");
    }
  }

  function getFilteredPosts() {
    let filtered = [...posts];

    if (postsFilter === "mine") {
      filtered = filtered.filter(
        (post) => String(post.userId) === String(currentUser.id)
      );
    }

    if (postsFilter === "commented") {
      const commentedPostIds = allComments
        .filter((comment) => String(comment.userId) === String(currentUser.id))
        .map((comment) => String(comment.postId));

      filtered = filtered.filter((post) =>
        commentedPostIds.includes(String(post.id))
      );
    }

    if (searchText.trim() !== "") {
      filtered = filtered.filter((post) => {
        if (searchBy === "id") {
          return String(post.id).includes(searchText);
        }

        if (searchBy === "title") {
          return post.title.toLowerCase().includes(searchText.toLowerCase());
        }

        return true;
      });
    }

    return filtered;
  }

  function getPostsTitle() {
    if (postsFilter === "mine") {
      return "My Posts";
    }

    if (postsFilter === "commented") {
      return "Posts I Commented On";
    }

    return "All Posts";
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate("/home")}>
        Back Home
      </button>

      <h2>Posts</h2>

      <p>
        Logged in as: <strong>{currentUser.name}</strong>
      </p>

      {error && <p className="error">{error}</p>}

      <div className="page-section">
        <h3>Filter Posts</h3>

        <div className="item-actions">
          <button
            className={
              postsFilter === "all"
                ? "small-btn active-btn"
                : "small-btn secondary-btn"
            }
            onClick={() => setPostsFilter("all")}
          >
            All Posts
          </button>

          <button
            className={
              postsFilter === "mine"
                ? "small-btn active-btn"
                : "small-btn secondary-btn"
            }
            onClick={() => setPostsFilter("mine")}
          >
            My Posts
          </button>

          <button
            className={
              postsFilter === "commented"
                ? "small-btn active-btn"
                : "small-btn secondary-btn"
            }
            onClick={() => setPostsFilter("commented")}
          >
            Posts I Commented On
          </button>
        </div>
      </div>

      <div className="page-section">
        <h3>Add Post</h3>

        <input
          type="text"
          placeholder="Post title"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
        />

        <textarea
          placeholder="Post body"
          value={newPostBody}
          onChange={(e) => setNewPostBody(e.target.value)}
        />

        <button onClick={addPost}>Add Post</button>
      </div>

      <div className="page-section">
        <h3>Search Posts</h3>

        <div className="form-row">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
            <option value="id">Search by id</option>
            <option value="title">Search by title</option>
          </select>
        </div>
      </div>

      <div className="page-section">
        <h3>{getPostsTitle()}</h3>

        {filteredPosts.length === 0 ? (
          <p className="empty-message">No posts found.</p>
        ) : (
          <ul className="items-list">
            {filteredPosts.map((post) => (
              <li
                key={post.id}
                className={
                  selectedPost && selectedPost.id === post.id
                    ? "item-card selected"
                    : "item-card"
                }
              >
                {editingPostId === post.id ? (
                  <>
                    <input
                      type="text"
                      value={editingPostTitle}
                      onChange={(e) => setEditingPostTitle(e.target.value)}
                    />

                    <textarea
                      value={editingPostBody}
                      onChange={(e) => setEditingPostBody(e.target.value)}
                    />

                    <div className="item-actions">
                      <button
                        className="small-btn"
                        onClick={() => saveEditPost(post)}
                      >
                        Save
                      </button>

                      <button
                        className="small-btn secondary-btn"
                        onClick={cancelEditPost}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="item-header">
                      <div>
                        <p className="photo-title">{post.title}</p>

                        <p className="photo-id">Post ID: {post.id}</p>

                        <p>
                          <strong>Owner:</strong>{" "}
                          {String(post.userId) === String(currentUser.id)
                            ? "Me"
                            : `User ${post.userId}`}
                        </p>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className="small-btn"
                        onClick={() => selectPost(post)}
                      >
                        Select
                      </button>

                      {String(post.userId) === String(currentUser.id) && (
                        <>
                          <button
                            className="small-btn"
                            onClick={() => startEditPost(post)}
                          >
                            Edit
                          </button>

                          <button
                            className="small-btn delete-btn"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPost && (
        <div className="page-section">
          <h3>Selected Post</h3>

          <div className="item-card selected">
            <p className="photo-title">{selectedPost.title}</p>

            <p className="photo-id">Post ID: {selectedPost.id}</p>

            <p>
              <strong>Body:</strong> {selectedPost.body}
            </p>

            <div className="item-actions">
              <button onClick={() => getComments(selectedPost.id)}>
                Show Comments
              </button>
            </div>
          </div>
        </div>
      )}

      {showComments && selectedPost && (
        <div className="page-section">
          <h3>Comments for Post {selectedPost.id}</h3>

          <div className="item-card">
            <h3>Add Comment</h3>

            <textarea
              placeholder="Write comment..."
              value={newCommentBody}
              onChange={(e) => setNewCommentBody(e.target.value)}
            />

            <button onClick={addComment}>Add Comment</button>
          </div>

          {comments.length === 0 ? (
            <p className="empty-message">No comments for this post.</p>
          ) : (
            <ul className="items-list">
              {comments.map((comment) => (
                <li key={comment.id} className="item-card">
                  <p className="photo-title">{comment.name}</p>

                  <p className="photo-id">Comment ID: {comment.id}</p>

                  <p>
                    <strong>Email:</strong> {comment.email || "-"}
                  </p>

                  {editingCommentId === comment.id ? (
                    <>
                      <textarea
                        value={editingCommentBody}
                        onChange={(e) => setEditingCommentBody(e.target.value)}
                      />

                      <div className="item-actions">
                        <button
                          className="small-btn"
                          onClick={() => saveEditComment(comment)}
                        >
                          Save
                        </button>

                        <button
                          className="small-btn secondary-btn"
                          onClick={cancelEditComment}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{comment.body}</p>

                      {String(comment.userId) === String(currentUser.id) && (
                        <div className="item-actions">
                          <button
                            className="small-btn"
                            onClick={() => startEditComment(comment)}
                          >
                            Edit
                          </button>

                          <button
                            className="small-btn delete-btn"
                            onClick={() => deleteComment(comment.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Posts;