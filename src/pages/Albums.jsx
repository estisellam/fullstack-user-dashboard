import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";
const PHOTOS_PER_PAGE = 3;

function Albums() {
  const navigate = useNavigate();

  const [currentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loadedPhotosCount, setLoadedPhotosCount] = useState(0);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("title");

  const [newAlbumTitle, setNewAlbumTitle] = useState("");

  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editingAlbumTitle, setEditingAlbumTitle] = useState("");

  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editingPhotoTitle, setEditingPhotoTitle] = useState("");
  const [editingPhotoUrl, setEditingPhotoUrl] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      getAlbums(currentUser.id);
    }
  }, [currentUser]);

  async function getAlbums(userId) {
    try {
      const res = await fetch(`${API_URL}/albums`);

      if (!res.ok) {
        throw new Error("Failed to load albums");
      }

      const data = await res.json();

      const userAlbums = data.filter(
        (album) => String(album.userId) === String(userId)
      );

      setAlbums(userAlbums);
      setError("");
    } catch (err) {
      setError("Could not load albums from server");
    }
  }

  async function addAlbum() {
    if (newAlbumTitle.trim() === "") {
      setError("Please enter album title");
      return;
    }

    try {
      const newAlbum = {
        userId: currentUser.id,
        title: newAlbumTitle,
      };

      const res = await fetch(`${API_URL}/albums`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAlbum),
      });

      if (!res.ok) {
        throw new Error("Failed to add album");
      }

      const savedAlbum = await res.json();

      setAlbums([...albums, savedAlbum]);
      setNewAlbumTitle("");
      setError("");
    } catch (err) {
      setError("Could not add album");
    }
  }

  function startEditAlbum(album) {
    setEditingAlbumId(album.id);
    setEditingAlbumTitle(album.title);
  }

  function cancelEditAlbum() {
    setEditingAlbumId(null);
    setEditingAlbumTitle("");
    setError("");
  }

  async function saveEditAlbum(album) {
    if (editingAlbumTitle.trim() === "") {
      setError("Album title cannot be empty");
      return;
    }

    try {
      const updatedAlbum = {
        ...album,
        title: editingAlbumTitle,
      };

      const res = await fetch(`${API_URL}/albums/${album.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAlbum),
      });

      if (!res.ok) {
        throw new Error("Failed to update album");
      }

      const data = await res.json();

      setAlbums(albums.map((item) => (item.id === album.id ? data : item)));

      if (selectedAlbum && selectedAlbum.id === album.id) {
        setSelectedAlbum(data);
      }

      setEditingAlbumId(null);
      setEditingAlbumTitle("");
      setError("");
    } catch (err) {
      setError("Could not update album");
    }
  }

  async function deleteAlbum(albumId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this album and all its photos?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const photosRes = await fetch(`${API_URL}/photos?albumId=${albumId}`);

      if (!photosRes.ok) {
        throw new Error("Failed to load album photos");
      }

      const albumPhotos = await photosRes.json();

      for (const photo of albumPhotos) {
        const deletePhotoRes = await fetch(`${API_URL}/photos/${photo.id}`, {
          method: "DELETE",
        });

        if (!deletePhotoRes.ok) {
          throw new Error("Failed to delete album photo");
        }
      }

      const albumRes = await fetch(`${API_URL}/albums/${albumId}`, {
        method: "DELETE",
      });

      if (!albumRes.ok) {
        throw new Error("Failed to delete album");
      }

      setAlbums(albums.filter((album) => album.id !== albumId));

      if (selectedAlbum && selectedAlbum.id === albumId) {
        setSelectedAlbum(null);
        setPhotos([]);
        setLoadedPhotosCount(0);
        setHasMorePhotos(false);
      }

      setEditingAlbumId(null);
      setEditingAlbumTitle("");
      setError("");
    } catch (err) {
      setError("Could not delete album");
    }
  }

  async function selectAlbum(album) {
    setSelectedAlbum(album);
    setPhotos([]);
    setLoadedPhotosCount(0);
    setHasMorePhotos(false);

    await getPhotosPart(album.id, 0);
  }

  async function getPhotosPart(albumId, startIndex) {
    try {
      const res = await fetch(
        `${API_URL}/photos?albumId=${albumId}&_sort=id&_start=${startIndex}&_limit=${PHOTOS_PER_PAGE}`
      );

      if (!res.ok) {
        throw new Error("Failed to load photos");
      }

      const data = await res.json();

      if (startIndex === 0) {
        setPhotos(data);
      } else {
        setPhotos((prevPhotos) => [...prevPhotos, ...data]);
      }

      setLoadedPhotosCount(startIndex + data.length);
      setHasMorePhotos(data.length === PHOTOS_PER_PAGE);
      setError("");
    } catch (err) {
      setError("Could not load photos");
    }
  }

  async function getNextPhotoId() {
    const res = await fetch(`${API_URL}/photos`);

    if (!res.ok) {
      throw new Error("Failed to get photos");
    }

    const data = await res.json();

    const numericIds = data
      .map((photo) => Number(photo.id))
      .filter((id) => !isNaN(id));

    if (numericIds.length === 0) {
      return 1;
    }

    return Math.max(...numericIds) + 1;
  }

  async function addPhoto() {
    if (!selectedAlbum) {
      setError("Please select an album first");
      return;
    }

    if (newPhotoTitle.trim() === "" || newPhotoUrl.trim() === "") {
      setError("Please enter photo title and url");
      return;
    }

    try {
      const nextId = await getNextPhotoId();

      const newPhoto = {
        id: nextId,
        albumId: selectedAlbum.id,
        title: newPhotoTitle,
        url: newPhotoUrl,
        thumbnailUrl: newPhotoUrl,
      };

      const res = await fetch(`${API_URL}/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPhoto),
      });

      if (!res.ok) {
        throw new Error("Failed to add photo");
      }

      const savedPhoto = await res.json();

      setPhotos([...photos, savedPhoto]);
      setLoadedPhotosCount((prevCount) => prevCount + 1);

      setNewPhotoTitle("");
      setNewPhotoUrl("");
      setError("");
    } catch (err) {
      setError("Could not add photo");
    }
  }

  async function deletePhoto(id) {
    try {
      const res = await fetch(`${API_URL}/photos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotos(photos.filter((photo) => photo.id !== id));
      setLoadedPhotosCount((prevCount) =>
        prevCount > 0 ? prevCount - 1 : 0
      );
      setError("");
    } catch (err) {
      setError("Could not delete photo");
    }
  }

  function startEditPhoto(photo) {
    setEditingPhotoId(photo.id);
    setEditingPhotoTitle(photo.title);
    setEditingPhotoUrl(photo.url);
  }

  async function saveEditPhoto(photo) {
    if (editingPhotoTitle.trim() === "" || editingPhotoUrl.trim() === "") {
      setError("Photo title and url cannot be empty");
      return;
    }

    try {
      const updatedPhoto = {
        ...photo,
        title: editingPhotoTitle,
        url: editingPhotoUrl,
        thumbnailUrl: editingPhotoUrl,
      };

      const res = await fetch(`${API_URL}/photos/${photo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPhoto),
      });

      if (!res.ok) {
        throw new Error("Failed to update photo");
      }

      const data = await res.json();

      setPhotos(photos.map((item) => (item.id === photo.id ? data : item)));
      setEditingPhotoId(null);
      setEditingPhotoTitle("");
      setEditingPhotoUrl("");
      setError("");
    } catch (err) {
      setError("Could not update photo");
    }
  }

  function cancelEditPhoto() {
    setEditingPhotoId(null);
    setEditingPhotoTitle("");
    setEditingPhotoUrl("");
    setError("");
  }

  function getFilteredAlbums() {
    let filtered = [...albums];

    if (searchText.trim() !== "") {
      filtered = filtered.filter((album) => {
        if (searchBy === "id") {
          return String(album.id).includes(searchText);
        }

        if (searchBy === "title") {
          return album.title.toLowerCase().includes(searchText.toLowerCase());
        }

        return false;
      });
    }

    return filtered;
  }

  async function loadMorePhotos() {
    if (!selectedAlbum) {
      return;
    }

    await getPhotosPart(selectedAlbum.id, loadedPhotosCount);
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const filteredAlbums = getFilteredAlbums();
  const visiblePhotos = photos;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate("/home")}>
        Back Home
      </button>

      <h2>Albums</h2>

      <p>
        Albums of: <strong>{currentUser.name}</strong>
      </p>

      {error && <p className="error">{error}</p>}

      <div className="page-section">
        <h3>Add Album</h3>

        <div className="form-row">
          <input
            type="text"
            placeholder="Album title"
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
          />

          <button onClick={addAlbum}>Add Album</button>
        </div>
      </div>

      <div className="page-section">
        <h3>Search Albums</h3>

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
        <h3>Albums List</h3>

        {filteredAlbums.length === 0 ? (
          <p className="empty-message">No albums found.</p>
        ) : (
          <ul className="items-list">
            {filteredAlbums.map((album) => (
              <li
                key={album.id}
                className={
                  selectedAlbum && selectedAlbum.id === album.id
                    ? "item-card selected"
                    : "item-card"
                }
                onClick={() => selectAlbum(album)}
                style={{ cursor: "pointer" }}
              >
                {editingAlbumId === album.id ? (
                  <>
                    <p className="photo-id">
                      <strong>ID:</strong> {album.id}
                    </p>

                    <input
                      type="text"
                      value={editingAlbumTitle}
                      onChange={(e) => setEditingAlbumTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="item-actions">
                      <button
                        className="small-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEditAlbum(album);
                        }}
                      >
                        Save
                      </button>

                      <button
                        className="small-btn secondary-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditAlbum();
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="item-header">
                    <div>
                      <p>
                        <strong>Title:</strong> {album.title}
                      </p>

                      <p className="photo-id">
                        <strong>ID:</strong> {album.id}
                      </p>
                    </div>

                    <div className="item-actions">
                      <button
                        className="small-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAlbum(album);
                        }}
                      >
                        Open Album
                      </button>

                      <button
                        className="small-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditAlbum(album);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="small-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAlbum(album.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedAlbum && (
        <div className="page-section">
          <h3>Photos of Album: {selectedAlbum.title}</h3>

          <div className="item-card add-photo-card">
            <h3>Add Photo</h3>

            <input
              type="text"
              placeholder="Photo title"
              value={newPhotoTitle}
              onChange={(e) => setNewPhotoTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="Photo URL"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
            />

            <button onClick={addPhoto}>Add Photo</button>
          </div>

          {photos.length === 0 ? (
            <p className="empty-message">No photos in this album.</p>
          ) : (
            <>
              <div className="photo-grid">
                {visiblePhotos.map((photo) => (
                  <div key={photo.id} className="item-card photo-card">
                    {editingPhotoId === photo.id ? (
                      <>
                        <input
                          type="text"
                          value={editingPhotoTitle}
                          onChange={(e) => setEditingPhotoTitle(e.target.value)}
                        />

                        <input
                          type="text"
                          value={editingPhotoUrl}
                          onChange={(e) => setEditingPhotoUrl(e.target.value)}
                        />

                        <div className="item-actions">
                          <button
                            className="small-btn"
                            onClick={() => saveEditPhoto(photo)}
                          >
                            Save
                          </button>

                          <button
                            className="small-btn secondary-btn"
                            onClick={cancelEditPhoto}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="photo-title">{photo.title}</p>

                        <p className="photo-id">Photo ID: {photo.id}</p>

                        <img
                          src={photo.url}
                          alt={photo.title}
                          onError={(e) => {
                            e.target.src = "https://picsum.photos/260/170";
                          }}
                        />

                        <div className="item-actions">
                          <button
                            className="small-btn"
                            onClick={() => startEditPhoto(photo)}
                          >
                            Edit
                          </button>

                          <button
                            className="small-btn delete-btn"
                            onClick={() => deletePhoto(photo.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {hasMorePhotos && (
                <button onClick={loadMorePhotos}>Load More Photos</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Albums;