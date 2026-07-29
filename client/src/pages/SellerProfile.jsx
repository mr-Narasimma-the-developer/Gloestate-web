import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";
import { getSellerProfile } from "../api/userApi";
import PropertyCard from "../components/PropertyCard";
import "./SellerProfile.css";
import "./Home.css";

const SellerProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getSellerProfile(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load seller profile"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-lg">Loading...</p>;
  if (error) return <p className="text-center mt-lg">{error}</p>;

  const { seller, listings } = data;
  const memberSince = new Date(seller.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mt-lg" style={{ paddingBottom: "64px" }}>
     <div className="seller-profile-header">
        {seller.profilePicture?.url ? (
          <img src={seller.profilePicture.url} alt={seller.name} className="seller-avatar-img" />
        ) : (
          <div className="seller-avatar">{seller.name.charAt(0).toUpperCase()}</div>
        )}

        <div>
          <div className="seller-profile-name">{seller.name}</div>
          <div className="seller-profile-meta"><FaEnvelope /> {seller.email}</div>
          {seller.phone ? (
            <div className="seller-profile-meta"><FaPhone /> {seller.phone}</div>
          ) : (
            <div className="seller-profile-meta text-muted">Phone not provided</div>
          )}
          <div className="seller-profile-meta"><FaCalendarAlt /> Member since {memberSince}</div>

          <div className="seller-profile-stats">
            <div>
              <div className="seller-stat-value">{listings.length}</div>
              <div className="seller-stat-label">Active Listings</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="detail-section-title" style={{ marginTop: 0 }}>Listings by {seller.name}</h2>

      {listings.length === 0 ? (
        <div className="empty-state">
          <p>This seller has no active listings right now.</p>
        </div>
      ) : (
        <div className="property-grid">
          {listings.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProfile;