import { Link } from "react-router-dom";
import { FaBed, FaBath, FaRulerCombined, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./PropertyCard.css";

const PropertyCard = ({ property }) => {
  const { user, favoriteIds, toggleFavorite } = useAuth();
  const firstImage = property.images?.[0]?.url;
  const isFavorited = favoriteIds.includes(property._id);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) toggleFavorite(property._id);
  };

  return (
    <Link to={`/property/${property._id}`} className="property-card">
      <div className="property-card-image-wrap">
        {firstImage ? (
          <img src={firstImage} alt={property.title} className="property-card-image" />
        ) : (
          <div className="property-card-image" />
        )}
        <span className="property-type-tag">{property.propertyType}</span>
        {property.status === "sold" && <span className="property-status">Sold</span>}

        {user && (
          <button className="favorite-btn" onClick={handleHeartClick} aria-label="Toggle favorite">
            {isFavorited ? <FaHeart color="#a0522d" /> : <FaRegHeart color="#3b2e1f" />}
          </button>
        )}
      </div>

      <div className="property-card-body">
        <div className="property-card-price">₹{property.price.toLocaleString("en-IN")}</div>
        <div className="property-card-title">{property.title}</div>
        <div className="property-card-location">{property.city}, {property.state}</div>

        <div className="property-card-meta">
          {property.bedrooms > 0 && (
            <span><FaBed /> {property.bedrooms}</span>
          )}
          {property.bathrooms > 0 && (
            <span><FaBath /> {property.bathrooms}</span>
          )}
          <span><FaRulerCombined /> {property.areaSqft} sqft</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;