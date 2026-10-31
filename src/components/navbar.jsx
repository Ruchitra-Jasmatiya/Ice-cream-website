import React, { useState } from "react";
import {
  Heart,
  Search,
  Menu,
  X,
  ShoppingCart,
  User,
  Info,
  Tag
} from "lucide-react";
import { Link } from "react-router-dom";
import './navbar.css'; // Import the CSS file
import { useStore } from '../context/StoreContext.jsx';

// Import logo correctly
import Logo from "../assets/images/logo.png";

const Navbar = () => {
  const { cartCount, openCart } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  // Pages (with routes)
  const pages = [
    { name: "Shop", icon: <ShoppingCart size={18} />, link: "/shop" },
    { name: "About", icon: <Info size={18} />, link: "/about" },
    { name: "Contact", icon: <User size={18} />, link: "/contact" },
    { name: "Franchise", icon: <Tag size={18} />, link: "/franchise" } // <-- Link to franchise.jsx
  ];

  // Smaller, more compact navbar styles
  const styles = {
    navbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#ffffff",
      padding: "8px 30px", // smaller padding
      borderBottom: "2px solid #ffc6e6",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      flexWrap: "wrap",
      height: "60px" // smaller height
    },
    logoSection: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
    logoImg: { width: "45px", height: "45px", borderRadius: "50%", objectFit: "contain" }, // smaller logo
    brandName: { fontSize: "18px", fontWeight: "bold", color: "#ff4fa5" }, // slightly smaller
    navLinks: { display: "flex", gap: "20px", listStyle: "none", alignItems: "center" }, // smaller gap
    link: { display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontSize: "15px", fontWeight: 500, color: "#ff6bb9", padding: "4px 10px", borderRadius: "6px", transition: "all 0.3s ease" },
    linkHover: { color: "#ffffff", backgroundColor: "#ff6bb9", transform: "scale(1.1)" },
    navIcons: { display: "flex", gap: "15px", alignItems: "center" }, // smaller gap
    icon: { width: "20px", height: "20px", color: "#ff6bb9", cursor: "pointer", transition: "transform 0.2s ease, color 0.2s ease" }, // smaller icons
    menuIcon: { display: "none", cursor: "pointer", color: "#ff6bb9" },
    mobileMenu: { display: isOpen ? "flex" : "none", flexDirection: "column", gap: "10px", position: "absolute", top: "60px", left: 0, right: 0, backgroundColor: "#fff0f7", padding: "15px", borderTop: "2px solid #ff6bb9", zIndex: 900 }
  };

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="logo-section">
        <Link to="/">
          <img src={Logo} alt="FreshnFreeze Logo" className="logo-img" />
        </Link>
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="brand-name">FreshnFreeze</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <ul className="nav-links">
        {pages.map((page, index) => (
          <li key={index}>
            <Link
              to={page.link}
              className={`link ${hoveredLink === index ? 'link-hover' : ''}`}
              onMouseEnter={() => setHoveredLink(index)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {page.icon}
              {page.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Icons */}
      <div className="nav-icons">
        <Search className="icon" onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
        <Heart className="icon" onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
        <button
          type="button"
          aria-label="Open cart"
          onClick={openCart}
          style={{ position: "relative", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
        >
          <ShoppingCart className="icon" />
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: -8, right: -10, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: "#ec407a", color: "#fff", fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>{cartCount}</span>
          )}
        </button>
        <Link to="/login">
          <User className="icon" onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        {pages.map((page, index) => (
          <Link
            key={index}
            to={page.link}
            className={`link ${hoveredLink === index ? 'link-hover' : ''}`}
            onMouseEnter={() => setHoveredLink(index)}
            onMouseLeave={() => setHoveredLink(null)}
            onClick={() => setIsOpen(false)}
          >
            {page.icon}
            {page.name}
          </Link>
        ))}
        {/* Login icon for mobile menu */}
        <Link to="/login" className="link">
          <User size={18} /> Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;