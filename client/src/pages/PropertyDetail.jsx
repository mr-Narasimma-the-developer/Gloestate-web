import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaBed, FaBath, FaRulerCombined, FaCar, FaMapMarkerAlt,
  FaCompass, FaCouch, FaBuilding, FaClipboardCheck, FaExpand,
} from "react-icons/fa";
import { getPropertyById, getProperties } from "../api/propertyApi";
import { sendMessage } from "../api/messageApi";
import { useAuth } from "../context/AuthContext";
import PropertyCard from "../components/PropertyCard";
import Lightbox from "../components/Lightbox";
import "./PropertyDetail.css";
import "./Home.css";

const FACING_LABELS = {
  north: "North", south: "South", east: "East", west: "West",
  "north-east": "North-East", "north-west": "North-West",
  "south-east": "South-East", "south-west": "South-West",
};
const FURNISHING_LABELS = {
  unfurnished: "Unfurnished", "semi-furnished": "Semi-Furnished", furnished: "Furnished",
};
const POSSESSION_LABELS = {
  "ready-to-move": "Ready to Move", "under-construction": "Under Construction",
};

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [similarProperties, setSimilarProperties] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    setLoading(true);
    getPropertyById(id)
      .then((res) => setProperty(res.data))
      .catch((err) => console.error("Failed to load property:", err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!property) return;

    getProperties({ city: property.city, propertyType: property.propertyType })
      .then((res) => {
        const filtered = res.data.filter((p) => p._id !== property._id).slice(0, 3);
        setSimilarProperties(filtered);
      })
      .catch((err) => console.error("Failed to load similar properties:", err.message));
  }, [property]);

  const onSubmitInquiry = async (data) => {
    setInquiryError("");
    try {
      await sendMessage({ propertyId: id, content: data.content });
      setInquirySent(true);
      reset();
    } catch (err) {
      setInquiryError(err.response?.data?.message || "Failed to send message. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-lg">Loading...</p>;
  if (!property) return <p className="text-center mt-lg">Property not found.</p>;

  const images = property.images || [];
  const isOwnListing = user && user._id === property.seller._id;

  const mapQuery = encodeURIComponent(
    `${property.address}, ${property.city}, ${property.district}, ${property.state}`
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="container detail-page">
      {images.length > 0 ? (
        <>
          <div className="gallery-main-wrap" onClick={() => setLightboxOpen(true)}>
            <img src={images[activeImage].url} alt={property.title} className="detail-gallery-main" />
            <div className="gallery-expand-hint"><FaExpand /> View fullscreen</div>
          </div>
          {images.length > 1 && (
            <div className="detail-gallery-thumbs">
              {images.map((img, i) => (
                <img
                  key={img.publicId}
                  src={img.url}
                  alt=""
                  className={i === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="detail-gallery-main" />
      )}

      {lightboxOpen && (
        <Lightbox
          images={images.map((img) => img.url)}
          startIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="detail-layout">
        <div>
          <div className="detail-price">₹{property.price.toLocaleString("en-IN")}</div>
          <h1 className="detail-title">{property.title}</h1>
          <p className="detail-location">
            <FaMapMarkerAlt /> {property.address}, {property.city}, {property.district}, {property.state}
          </p>

          <div className="detail-specs">
            {property.bedrooms > 0 && (
              <div className="detail-spec-item">
                <div className="detail-spec-value"><FaBed /> {property.bedrooms}</div>
                <div className="detail-spec-label">Bedrooms</div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="detail-spec-item">
                <div className="detail-spec-value"><FaBath /> {property.bathrooms}</div>
                <div className="detail-spec-label">Bathrooms</div>
              </div>
            )}
            <div className="detail-spec-item">
              <div className="detail-spec-value"><FaRulerCombined /> {property.areaSqft}</div>
              <div className="detail-spec-label">Sqft</div>
            </div>
            <div className="detail-spec-item">
              <div className="detail-spec-value"><FaCar /> {property.parking ? "Yes" : "No"}</div>
              <div className="detail-spec-label">Parking</div>
            </div>
            {property.facing && (
              <div className="detail-spec-item">
                <div className="detail-spec-value"><FaCompass /> {FACING_LABELS[property.facing] || property.facing}</div>
                <div className="detail-spec-label">Facing</div>
              </div>
            )}
            {property.furnishing && (
              <div className="detail-spec-item">
                <div className="detail-spec-value"><FaCouch /> {FURNISHING_LABELS[property.furnishing]}</div>
                <div className="detail-spec-label">Furnishing</div>
              </div>
            )}
            {property.possessionStatus && (
              <div className="detail-spec-item">
                <div className="detail-spec-value"><FaClipboardCheck /> {POSSESSION_LABELS[property.possessionStatus]}</div>
                <div className="detail-spec-label">Possession</div>
              </div>
            )}
            {property.floorNumber != null && property.totalFloors != null && (
              <div className="detail-spec-item">
                <div className="detail-spec-value"><FaBuilding /> {property.floorNumber} / {property.totalFloors}</div>
                <div className="detail-spec-label">Floor</div>
              </div>
            )}
          </div>

          <h2 className="detail-section-title">Description</h2>
          <p>{property.description}</p>

          {property.amenities?.length > 0 && (
            <>
              <h2 className="detail-section-title">Amenities</h2>
              <p>{property.amenities.join(", ")}</p>
            </>
          )}

          <h2 className="detail-section-title">Location</h2>
          <div className="map-embed-wrap">
            <iframe
              title="Property location"
              src={mapEmbedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </div>

       <div>
          <div className="card seller-card">
            <div className="seller-label">Listed by</div>
            <Link to={`/seller/${property.seller._id}`} className="seller-card-top">
              {property.seller.profilePicture?.url ? (
                <img src={property.seller.profilePicture.url} alt="" className="seller-card-avatar" />
              ) : (
                <div className="seller-card-avatar-fallback">{property.seller.name.charAt(0).toUpperCase()}</div>
              )}
              <span className="seller-name seller-name-link">{property.seller.name}</span>
            </Link>
            <p className="text-muted" style={{ fontSize: "0.875rem", margin: "4px 0" }}>{property.seller.email}</p>
            {property.seller.phone && (
              <p className="text-muted mb-lg" style={{ fontSize: "0.875rem" }}>📞 {property.seller.phone}</p>
            )}

            {!user ? (
              <p className="text-muted">
                <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Log in</Link> to contact the seller.
              </p>
            ) : isOwnListing ? (
              <p className="text-muted">This is your own listing.</p>
            ) : inquirySent ? (
              <div className="alert alert-success">Your message was sent! The seller has been notified by email.</div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitInquiry)}>
                {inquiryError && <div className="alert alert-error">{inquiryError}</div>}
                <div className="form-group">
                  <label className="form-label">Message to seller</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Hi, I'm interested in this property. Is it still available?"
                    {...register("content", { required: "Please write a message" })}
                  />
                  {errors.content && <p className="form-error">{errors.content.message}</p>}
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Contact Seller"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {similarProperties.length > 0 && (
        <div className="mt-lg">
          <h2 className="detail-section-title">Similar Properties</h2>
          <div className="property-grid">
            {similarProperties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;