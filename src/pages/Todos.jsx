import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

function Todos() {
  const navigate = useNavigate();

  const [currentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

  const [todos, setTodos] = useState([]);

  const [newTitle, setNewTitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("title");
  const [sortBy, setSortBy] = useState("id");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      getTodos(currentUser.id);
    }
  }, [currentUser]);

  async function getTodos(userId) {
    try {
      const res = await fetch(`${API_URL}/todos?userId=${userId}`);

      if (!res.ok) {
        throw new Error("Failed to load todos");
      }

      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError("Could not load todos from server");
    }
  }

  async function addTodo() {
    if (newTitle.trim() === "") {
      setError("Please enter todo title");
      return;
    }

    try {
      const newTodo = {
        userId: currentUser.id,
        title: newTitle,
        completed: false,
      };

      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      if (!res.ok) {
        throw new Error("Failed to add todo");
      }

      const savedTodo = await res.json();

      setTodos([...todos, savedTodo]);
      setNewTitle("");
      setError("");
    } catch (err) {
      setError("Could not add todo");
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos(todos.filter((todo) => todo.id !== id));
      setError("");
    } catch (err) {
      setError("Could not delete todo");
    }
  }

  async function toggleCompleted(todo) {
    try {
      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
      };

      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!res.ok) {
        throw new Error("Failed to update todo status");
      }

      const data = await res.json();

      setTodos(todos.map((item) => (item.id === todo.id ? data : item)));
      setError("");
    } catch (err) {
      setError("Could not update todo status");
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  async function saveEdit(todo) {
    if (editingTitle.trim() === "") {
      setError("Todo title cannot be empty");
      return;
    }

    try {
      const updatedTodo = {
        ...todo,
        title: editingTitle,
      };

      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!res.ok) {
        throw new Error("Failed to update todo");
      }

      const data = await res.json();

      setTodos(todos.map((item) => (item.id === todo.id ? data : item)));
      setEditingId(null);
      setEditingTitle("");
      setError("");
    } catch (err) {
      setError("Could not update todo");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  function getFilteredTodos() {
    let filtered = [...todos];

    if (searchText.trim() !== "") {
      filtered = filtered.filter((todo) => {
        if (searchBy === "id") {
          return String(todo.id).includes(searchText);
        }

        if (searchBy === "title") {
          return todo.title.toLowerCase().includes(searchText.toLowerCase());
        }

        if (searchBy === "completed") {
          const text = searchText.toLowerCase();

          if (text === "true" || text === "yes" || text === "done") {
            return todo.completed === true;
          }

          if (text === "false" || text === "no" || text === "not done") {
            return todo.completed === false;
          }

          return false;
        }

        return true;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "id") {
        return Number(a.id) - Number(b.id);
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "completed") {
        return Number(a.completed) - Number(b.completed);
      }

      return 0;
    });

    return filtered;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const filteredTodos = getFilteredTodos();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate("/home")}>
        Back Home
      </button>

      <h2>Todos</h2>

      <p>
        Todos of: <strong>{currentUser.name}</strong>
      </p>

      {error && <p className="error">{error}</p>}

      <div className="page-section">
        <h3>Add Todo</h3>

        <div className="form-row">
          <input
            type="text"
            placeholder="Enter todo title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <button onClick={addTodo}>Add</button>
        </div>
      </div>

      <div className="page-section">
        <h3>Search and Sort</h3>

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
            <option value="completed">Search by completed</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id">Sort by id</option>
            <option value="title">Sort by title</option>
            <option value="completed">Sort by completed</option>
          </select>
        </div>
      </div>

      <div className="page-section">
        <h3>Todos List</h3>

        {filteredTodos.length === 0 ? (
          <p className="empty-message">No todos found.</p>
        ) : (
          <ul className="items-list">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className="item-card">
                {editingId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                    />

                    <p className="photo-id">Todo ID: {todo.id}</p>

                    <div className="item-actions">
                      <button
                        className="small-btn"
                        onClick={() => saveEdit(todo)}
                      >
                        Save
                      </button>

                      <button
                        className="small-btn secondary-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="item-header">
                      <div>
                        <p
                          className="photo-title"
                          style={{
                            textDecoration: todo.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {todo.title}
                        </p>

                        <p className="photo-id">Todo ID: {todo.id}</p>
                      </div>

                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleCompleted(todo)}
                        />
                        <span>{todo.completed ? "Done" : "Not done"}</span>
                      </label>
                    </div>

                    <div className="item-actions">
                      <button
                        className="small-btn"
                        onClick={() => startEdit(todo)}
                      >
                        Edit
                      </button>

                      <button
                        className="small-btn delete-btn"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Todos;