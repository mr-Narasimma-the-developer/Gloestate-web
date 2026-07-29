import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createProperty, updateProperty, getPropertyById } from "../api/propertyApi";
import "./Dashboard.css";

const PropertyForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [serverError, setServerError] = useState("");
  const [loadingProperty, setLoadingProperty] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!isEditMode) return;

    getPropertyById(id)
      .then((res) => {
        const p = res.data;
        reset({
          title: p.title,
          description: p.description,
          price: p.price,
          propertyType: p.propertyType,
          address: p.address,
          city: p.city,
          district: p.district,
          state: p.state,
          areaSqft: p.areaSqft,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          parking: p.parking,
          facing: p.facing || "",
          furnishing: p.furnishing || "unfurnished",
          possessionStatus: p.possessionStatus || "ready-to-move",
          floorNumber: p.floorNumber ?? "",
          totalFloors: p.totalFloors ?? "",
          amenities: p.amenities?.join(", ") || "",
        });
        setExistingImages(p.images || []);
      })
      .catch((err) => setServerError("Failed to load property: " + err.message))
      .finally(() => setLoadingProperty(false));
  }, [id, isEditMode, reset]);

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "amenities") {
          value
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
            .forEach((a) => formData.append("amenities", a));
        } else {
          formData.append(key, value);
        }
      });
      imageFiles.forEach((file) => formData.append("images", file));

      if (isEditMode) {
        await updateProperty(id, formData);
      } else {
        await createProperty(formData);
      }

      navigate("/seller/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to save property. Please try again.");
    }
  };

  if (loadingProperty) return <p className="text-center mt-lg">Loading...</p>;

  return (
    <div className="container mt-lg" style={{ maxWidth: "800px", paddingBottom: "64px" }}>
      <h1>{isEditMode ? "Edit Property" : "Add New Property"}</h1>
      <p className="text-muted mb-lg">
        {isEditMode ? "Update your listing details below." : "Fill in the details to list a new property."}
      </p>

      {serverError && <div className="alert alert-error">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="property-form-grid">
          <div className="form-group full-width">
            <label className="form-label">Title</label>
            <input className="form-input" {...register("title", { required: "Title is required" })} />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" {...register("description", { required: "Description is required" })} />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input type="number" className="form-input" {...register("price", { required: "Price is required" })} />
            {errors.price && <p className="form-error">{errors.price.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Property Type</label>
            <select className="form-select" {...register("propertyType", { required: true })}>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot / Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Address</label>
            <input className="form-input" {...register("address", { required: "Address is required" })} />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-input" {...register("city", { required: "City is required" })} />
            {errors.city && <p className="form-error">{errors.city.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">District</label>
            <input className="form-input" {...register("district", { required: "District is required" })} />
            {errors.district && <p className="form-error">{errors.district.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <input className="form-input" {...register("state", { required: "State is required" })} />
            {errors.state && <p className="form-error">{errors.state.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Area (sqft)</label>
            <input type="number" className="form-input" {...register("areaSqft", { required: "Area is required" })} />
            {errors.areaSqft && <p className="form-error">{errors.areaSqft.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <input type="number" className="form-input" defaultValue={0} {...register("bedrooms")} />
          </div>

          <div className="form-group">
            <label className="form-label">Bathrooms</label>
            <input type="number" className="form-input" defaultValue={0} {...register("bathrooms")} />
          </div>

         <div className="form-group">
            <label className="form-label">
              <input type="checkbox" {...register("parking")} style={{ width: "auto", marginRight: "8px" }} />
              Parking Available
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Facing</label>
            <select className="form-select" {...register("facing")}>
              <option value="">Not specified</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="north-east">North-East</option>
              <option value="north-west">North-West</option>
              <option value="south-east">South-East</option>
              <option value="south-west">South-West</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Furnishing</label>
            <select className="form-select" {...register("furnishing")}>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="furnished">Furnished</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Possession Status</label>
            <select className="form-select" {...register("possessionStatus")}>
              <option value="ready-to-move">Ready to Move</option>
              <option value="under-construction">Under Construction</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Floor Number (optional)</label>
            <input type="number" className="form-input" placeholder="e.g. 3" {...register("floorNumber")} />
          </div>

          <div className="form-group">
            <label className="form-label">Total Floors in Building (optional)</label>
            <input type="number" className="form-input" placeholder="e.g. 8" {...register("totalFloors")} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Amenities (comma-separated)</label>
            <input className="form-input" placeholder="lift, power backup, garden" {...register("amenities")} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              {isEditMode ? "Add More Images (optional)" : "Property Images"}
            </label>
            <div className="file-input-wrap">
              <input type="file" multiple accept="image/*" onChange={handleFileChange} />
              <p className="text-muted" style={{ fontSize: "0.8rem", marginTop: "8px" }}>
                Up to 8 images, 5MB each
              </p>
            </div>

            {existingImages.length > 0 && (
              <>
                <p className="text-muted mt-lg" style={{ fontSize: "0.8rem" }}>Current images:</p>
                <div className="image-preview-row">
                  {existingImages.map((img) => (
                    <img key={img.publicId} src={img.url} alt="" />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button className="btn btn-primary mt-lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditMode ? "Update Property" : "Create Property"}
        </button>
      </form>
    </div>
  );
};

export default PropertyForm;