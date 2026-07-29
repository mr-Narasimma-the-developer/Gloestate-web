import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import Favorites from "./pages/Favorites";
import SellerDashboard from "./pages/SellerDashboard";
import PropertyForm from "./pages/PropertyForm";
import Inbox from "./pages/Inbox";
import SellerProfile from "./pages/SellerProfile";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Footer from "./components/Footer/Footer";



function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/seller/:id" element={<SellerProfile />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <Favorites />
            </PrivateRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/dashboard"
          element={
            <PrivateRoute role="seller">
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/property/new"
          element={
            <PrivateRoute role="seller">
              <PropertyForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/property/edit/:id"
          element={
            <PrivateRoute role="seller">
              <PropertyForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* routes */}
      </Routes>

      <Footer />
    </>
  );
}

export default App;