import "./Footer.css";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Company */}

        <div className="footer-column">
          <h2 className="footer-logo">GloEstate</h2>

          <p>
            Helping buyers, sellers and investors discover trusted
            properties across India with confidence.
          </p>
        </div>

        {/* Quick Links */}

        <div className="footer-column">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>

          <Link to="/browse">Browse</Link>

          {/* <Link to="/about">About</Link>

          <Link to="/contact">Contact</Link> */}

        </div>

        {/* Property */}

        <div className="footer-column">

          <h3>Property Types</h3>

          <Link to="/browse">Apartments</Link>

          <Link to="/browse">Villas</Link>

          <Link to="/browse">Plots</Link>

          <Link to="/browse">Commercial</Link>

        </div>

        {/* Contact */}

        <div className="footer-column">

          <h3>Contact</h3>

          <p><FaMapMarkerAlt /> Chennai, Tamil Nadu</p>

          <p><FaPhoneAlt /> +91 8015409798</p>

          <p><FaEnvelope /> support@gloestate.com</p>

        </div>

      </div>

      {/* Social */}

      <div className="footer-social">

        <a href="#"><FaFacebookF />https://www.facebook.com/search/top?q=real%20estate</a>

        <a href="#"><FaInstagram />https://www.instagram.com/explore/</a>

        {/* <a href="#"><FaLinkedinIn /></a> */}

        <a href="#"><FaYoutube />https://www.youtube.com/results?search_query=real+estate</a>

      </div>

      {/* Bottom */}

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} GloEstate. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
};

export default Footer;