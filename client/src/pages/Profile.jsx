import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateProfile } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePicture?.url || "");
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  const isSeller = user?.role === "seller";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      if (avatarFile) formData.append("profilePicture", avatarFile);

      const res = await updateProfile(formData);
      updateUser(res.data);
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <div className="container mt-lg profile-page" style={{ paddingBottom: "64px" }}>
      <h1>Your Profile</h1>
      <p className="text-muted mb-lg">
        Update your name, phone number{isSeller ? " (required for buyers to reach you)" : ""}, and photo.
      </p>

      {serverError && <div className="alert alert-error">{serverError}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="avatar-upload-row">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Profile" className="avatar-preview" />
        ) : (
          <div className="avatar-preview">{user?.name?.charAt(0).toUpperCase()}</div>
        )}
        <div className="avatar-upload-controls">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <p className="field-hint">JPG or PNG, square photos look best</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" {...register("name", { required: "Name is required" })} />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Phone Number {isSeller && <span style={{ color: "var(--color-error)" }}>*</span>}
          </label>
          <input
            className="form-input"
            {...register("phone", {
              validate: (value) =>
                !isSeller || !!value || "Phone number is required for sellers so buyers can reach you",
            })}
          />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          {!isSeller && <p className="field-hint">Optional -- sellers will still reach you by email.</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input field-locked" value={user?.email || ""} disabled />
          <p className="field-hint">Email can't be changed here.</p>
        </div>

        <button className="btn btn-primary mt-lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;