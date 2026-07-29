import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Register = () => {
  const [role, setRole] = useState("buyer");
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await registerUser({ ...data, role });
      login(res.data);
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join Gloaro Estate as a buyer or seller</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <div className="role-toggle">
          <div
            className={`role-option ${role === "buyer" ? "active" : ""}`}
            onClick={() => setRole("buyer")}
          >
            I'm a Buyer
          </div>
          <div
            className={`role-option ${role === "seller" ? "active" : ""}`}
            onClick={() => setRole("seller")}
          >
            I'm a Seller
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Phone {role === "seller" && <span style={{ color: "var(--color-error)" }}>*</span>}
            </label>
            <input
              className="form-input"
              {...register("phone", {
                validate: (value) =>
                  role !== "seller" || !!value || "Phone number is required for sellers",
              })}
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            {role !== "seller" && <p className="text-muted" style={{ fontSize: "0.8rem" }}>Optional for buyers.</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;