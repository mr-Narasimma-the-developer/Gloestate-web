import { useState, useEffect } from "react";
import { getFavorites } from "../api/userApi";
import PropertyCard from "../components/PropertyCard";
import "./Home.css";

const Favorites = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then((res) => setProperties(res.data))
      .catch((err) => console.error("Failed to load favorites:", err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mt-lg" style={{ paddingBottom: "64px" }}>
      <h1 style={{ marginBottom: "8px" }}>Your Saved Properties</h1>
      <p className="text-muted mb-lg">Properties you've shortlisted for later.</p>

      {loading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any properties yet. Browse listings and tap the heart icon to save one.</p>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;