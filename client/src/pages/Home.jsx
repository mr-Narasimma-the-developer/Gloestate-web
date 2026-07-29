import { useState, useEffect } from "react";
import { getProperties } from "../api/propertyApi";
import PropertyCard from "../components/PropertyCard";
import "./Home.css";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    bedrooms: "",
    sort: "newest",
  });

  const fetchProperties = async (activeFilters) => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== "")
      );
      const res = await getProperties(cleanParams);
      setProperties(res.data);
    } catch (err) {
      console.error("Failed to fetch properties:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties(filters);
  };

  return (
    <div>
      <section className="home-hero">
        <video className="home-hero-video" autoPlay muted loop playsInline poster="/hero-poster.jpg">
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="home-hero-overlay" />

        <div className="container home-hero-content">
          <h1>Find land, homes, and commercial spaces</h1>
          <p>Apartments, houses, agricultural land, plots, and warehouses -- all in one place.</p>

          <form className="filter-bar" onSubmit={handleSearch}>
            <input
              className="form-input"
              name="city"
              placeholder="City"
              value={filters.city}
              onChange={handleChange}
            />
            <select className="form-select" name="propertyType" value={filters.propertyType} onChange={handleChange}>
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot / Land</option>
              <option value="commercial">Commercial</option>
            </select>
            <input
              className="form-input"
              name="minPrice"
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleChange}
            />
            <input
              className="form-input"
              name="maxPrice"
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleChange}
            />
            <select className="form-select" name="sort" value={filters.sort} onChange={handleChange}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>
      </section>

      <div className="container">
        {loading ? (
          <p className="text-center mt-lg">Loading properties...</p>
        ) : (
          <>
            <p className="results-count mt-lg">{properties.length} properties found</p>
            {properties.length === 0 ? (
              <div className="empty-state">
                <p>No properties match your search. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="property-grid">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;