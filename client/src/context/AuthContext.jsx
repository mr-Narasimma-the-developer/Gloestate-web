import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../api/authApi";
import { getFavorites, toggleFavorite as toggleFavoriteApi } from "../api/userApi";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const loadFavorites = async () => {
    try {
      const res = await getFavorites();
      setFavoriteIds(res.data.map((p) => p._id));
    } catch {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((res) => {
        setUser(res.data);
        loadFavorites();
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    setUser(userData);
    loadFavorites();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setFavoriteIds([]);
  };

  const toggleFavorite = async (propertyId) => {
    try {
      const res = await toggleFavoriteApi(propertyId);
      setFavoriteIds(res.data.favorites.map((id) => id.toString()));
    } catch (err) {
      console.error("Failed to toggle favorite:", err.message);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, favoriteIds, toggleFavorite, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};