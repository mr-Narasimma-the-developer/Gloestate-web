import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyProperties, deleteProperty, markPropertySold } from "../api/propertyApi";
import "./Dashboard.css";

const SellerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProperties = () => {
    setLoading(true);
    getMyProperties()
      .then((res) => setProperties(res.data))
      .catch((err) => console.error("Failed to load your properties:", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete property");
    }
  };

  const handleMarkSold = async (id) => {
    try {
      const res = await markPropertySold(id);
      setProperties((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="container mt-lg" style={{ paddingBottom: "64px" }}>
      <div className="dashboard-header">
        <div>
          <h1>Your Listings</h1>
          <p className="text-muted">Manage the properties you've posted.</p>
        </div>
        <Link to="/seller/property/new" className="btn btn-primary">+ Add Property</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <p>You haven't listed any properties yet.</p>
        </div>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>City</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property._id}>
                  <td>
                    {property.images?.[0]?.url ? (
                      <img src={property.images[0].url} alt="" className="dashboard-thumb" />
                    ) : (
                      <div className="dashboard-thumb" style={{ background: "var(--color-bg-alt)" }} />
                    )}
                  </td>
                  <td>{property.title}</td>
                  <td>{property.city}</td>
                  <td>₹{property.price.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`status-pill ${property.status === "sold" ? "status-sold" : "status-available"}`}>
                      {property.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/seller/property/edit/${property._id}`} className="btn btn-outline">Edit</Link>
                      {property.status !== "sold" && (
                        <button className="btn btn-accent" onClick={() => handleMarkSold(property._id)}>
                          Mark Sold
                        </button>
                      )}
                      <button
                        className="btn"
                        style={{ background: "var(--color-error)", color: "#fff" }}
                        onClick={() => handleDelete(property._id, property.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;